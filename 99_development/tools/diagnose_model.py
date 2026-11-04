"""Read-only GLB diagnosis and transient-scene previews; never exports a model."""
import bpy
import collections
import hashlib
import json
import math
import struct
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
MODEL = ROOT / '90_shared/models/sawara-building.glb'
OUT = ROOT / '99_development/diagnostics'
OUT.mkdir(exist_ok=True)
SOURCES = [MODEL, Path(r'C:\sawara_building\sawara-building.obj'), Path(r'C:\sawara_building\sawara-building.mtl')]
def sha(path):
    with path.open('rb') as f:
        return hashlib.file_digest(f, 'sha256').hexdigest()
hashes = {str(p): sha(p) for p in SOURCES}
with MODEL.open('rb') as f:
    f.seek(12)
    size, kind = struct.unpack('<II', f.read(8))
    gltf = json.loads(f.read(size))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(MODEL), loglevel=40)
objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
records = []
def bounds(items):
    points = [o.matrix_world @ Vector(c) for o in items for c in o.bound_box]
    lo = Vector([min(p[i] for p in points) for i in range(3)])
    hi = Vector([max(p[i] for p in points) for i in range(3)])
    return lo, hi
for o in objects:
    lo, hi = bounds([o])
    o.data.calc_loop_triangles()
    records.append(dict(name=o.name, minimum=list(lo), maximum=list(hi),
        center=list((lo+hi)/2), triangles=len(o.data.loop_triangles),
        materials=[s.material.name if s.material else None for s in o.material_slots]))
bins = collections.Counter((math.floor(r['center'][0]/30), math.floor(r['center'][1]/30)) for r in records)
# Diagnose spatial groups without deleting or hiding any geometry.
groups = []
for cell, count in bins.most_common():
    members = [r for r in records if (math.floor(r['center'][0]/30), math.floor(r['center'][1]/30)) == cell]
    groups.append(dict(cell=list(cell), objects=count, triangles=sum(r['triangles'] for r in members), examples=[r['name'] for r in members[:8]]))
focus_cell = bins.most_common(1)[0][0]
focus_objects = [o for o,r in zip(objects,records) if (math.floor(r['center'][0]/30),math.floor(r['center'][1]/30)) == focus_cell]
all_lo, all_hi = bounds(objects)
focus_lo, focus_hi = bounds(focus_objects)
material_usage = collections.Counter()
for o in objects:
    for p in o.data.polygons:
        if p.material_index < len(o.material_slots):
            m = o.material_slots[p.material_index].material
            if m: material_usage[m.name] += 1
materials = []
for m in bpy.data.materials:
    if not m.users: continue
    nodes = []
    if m.use_nodes:
        for n in m.node_tree.nodes:
            if n.type == 'BSDF_PRINCIPLED':
                nodes.append({k: list(n.inputs[k].default_value) if k == 'Base Color' else n.inputs[k].default_value
                    for k in ('Base Color','Alpha','Metallic','Roughness','Transmission Weight','IOR')})
    materials.append(dict(name=m.name, faces=material_usage[m.name], principled=nodes,
        surface_render_method=getattr(m,'surface_render_method',None)))
report = dict(blender=bpy.app.version_string, meshes=len(objects), triangles=sum(r['triangles'] for r in records),
    overall=dict(minimum=list(all_lo),maximum=list(all_hi),dimensions=list(all_hi-all_lo)),
    focus=dict(cell=list(focus_cell),minimum=list(focus_lo),maximum=list(focus_hi),dimensions=list(focus_hi-focus_lo)),
    spatial_groups=groups, materials=materials, gltf_materials=gltf.get('materials'), objects=records,
    source_hashes=hashes)
(OUT/'model-diagnosis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('DIAGNOSIS_READY '+json.dumps({k:report[k] for k in ('overall','focus','spatial_groups','materials')},ensure_ascii=False),flush=True)
scene=bpy.context.scene
scene.render.resolution_x=1400
scene.render.resolution_y=1100
scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG'
scene.render.film_transparent=False
scene.world.color=(0.65,0.65,0.65)
scene.view_settings.view_transform='Standard'
bpy.ops.object.camera_add()
camera=bpy.context.object
scene.camera=camera
camera.data.type='ORTHO'
camera.data.clip_end=3000
def frame(lo, hi):
    center=(lo+hi)/2
    direction=Vector((1,-1,0.8)).normalized()
    camera.location=center+direction*max((hi-lo).length*2,50)
    camera.rotation_euler=(center-camera.location).to_track_quat('-Z','Y').to_euler()
    inv=camera.rotation_euler.to_matrix().transposed()
    corners=[inv @ (Vector((x,y,z))-center) for x in (lo.x,hi.x) for y in (lo.y,hi.y) for z in (lo.z,hi.z)]
    width=max(p.x for p in corners)-min(p.x for p in corners)
    height=max(p.y for p in corners)-min(p.y for p in corners)
    camera.data.ortho_scale=max(width,height*(1400/1100))*1.35
    bpy.context.view_layer.update()
def render(name):
    scene.render.filepath=str(OUT/name)
    bpy.ops.render.render(write_still=True)
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='STUDIO'
scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(0.68,0.68,0.68)
scene.display.shading.show_shadows=True
scene.display.shading.show_cavity=True
scene.display.shading.background_type='WORLD'
frame(all_lo,all_hi)
render('01-all-geometry.png')
frame(focus_lo,focus_hi)
render('02-building-shape.png')
# Original GLB materials, unchanged. Lighting/camera exist only in this process.
scene.render.engine='CYCLES'
scene.cycles.samples=24
scene.cycles.use_denoising=True
scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(0.7,0.7,0.7,1)
scene.world.node_tree.nodes.get('Background').inputs['Strength'].default_value=0.8
bpy.ops.object.light_add(type='SUN',location=(0,0,40))
sun=bpy.context.object
sun.rotation_euler=(math.radians(25),math.radians(-25),math.radians(-30))
sun.data.energy=3
sun.data.angle=math.radians(12)
render('03-building-original-materials.png')
assert all(sha(Path(p))==h for p,h in hashes.items()),'Source hash changed'
report['source_hashes_unchanged']=True
(OUT/'model-diagnosis.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('DIAGNOSIS_COMPLETE',flush=True)
