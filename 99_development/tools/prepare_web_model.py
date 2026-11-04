"""Create a separate web copy and pre-implementation section/material previews."""
import bpy, json, hashlib, math, random, sys
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
WOOD_MODE='--source-wood' in sys.argv
OUT=ROOT/('99_development/diagnostics/wood-preview' if WOOD_MODE else '99_development/diagnostics/web-preview')
OUT.mkdir(parents=True,exist_ok=True)
SOURCE=ROOT/'90_shared/models/sawara-building.glb'
TARGET=ROOT/('90_shared/models/sawara-building-web-wood.glb' if WOOD_MODE else '90_shared/models/sawara-building-web.glb')
def digest(p):
    with p.open('rb') as f: return hashlib.file_digest(f,'sha256').hexdigest()
original_hash=digest(SOURCE)
assert not TARGET.exists(), 'Web copy already exists; do not overwrite silently'
mapping=json.loads((ROOT/'99_development/diagnostics/obj-object-map.json').read_text(encoding='utf-8'))
source_matches=json.loads((ROOT/'99_development/diagnostics/rhino-layer-matches.json').read_text(encoding='utf-8'))['matches'] if WOOD_MODE else {}
bpy.ops.object.select_all(action='SELECT'); bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
remote=bpy.data.objects.get('object_332')
assert remote is not None
bpy.data.objects.remove(remote,do_unlink=True)
objects.remove(remote)
def color(hex):
    def linear(v): return v/12.92 if v<=0.04045 else ((v+0.055)/1.055)**2.4
    return tuple(linear(int(hex[i:i+2],16)/255) for i in (0,2,4))+(1,)
def material(name,hex,rough):
    m=bpy.data.materials.new(name);m.use_nodes=True
    bs=m.node_tree.nodes.get('Principled BSDF')
    bs.inputs['Base Color'].default_value=color(hex)
    bs.inputs['Roughness'].default_value=rough
    m.diffuse_color=color(hex)
    return m
concrete=material('Concrete_RC_confirmed_by_group','73716C',0.95)
wood=material('Wood_Rhino_layers' if WOOD_MODE else 'Wood_SAMPLE_ONLY_NOT_ASSIGNED','A58A68',0.9)
glass=material('Glass_source_material','DAE8E4',0.28)
bs=glass.node_tree.nodes.get('Principled BSDF')
bs.inputs['Alpha'].default_value=0.2
bs.inputs['Transmission Weight'].default_value=0.15
bs.inputs['IOR'].default_value=1.45
glass.surface_render_method='DITHERED'
# Small normal texture; a shader-supported normal-map node survives glTF export.
random.seed(41)
size=128
noise=[random.random() for _ in range(size*size)]
img=bpy.data.images.new('model-concrete-normal',width=size,height=size)
pixels=[]
for y in range(size):
    for x in range(size):
        dx=(noise[y*size+(x+1)%size]-noise[y*size+(x-1)%size])*0.12
        dy=(noise[((y+1)%size)*size+x]-noise[((y-1)%size)*size+x])*0.12
        n=Vector((-dx,-dy,1)).normalized()
        pixels.extend(((n.x+1)/2,(n.y+1)/2,(n.z+1)/2,1))
img.pixels=pixels
img.colorspace_settings.name='Non-Color'
img.filepath_raw=str(OUT/'concrete-normal.png');img.file_format='PNG';img.save()
nodes=concrete.node_tree.nodes
tex=nodes.new('ShaderNodeTexImage');tex.image=img
normal=nodes.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=0.22
concrete.node_tree.links.new(tex.outputs['Color'],normal.inputs['Color'])
concrete.node_tree.links.new(normal.outputs['Normal'],nodes.get('Principled BSDF').inputs['Normal'])
# A small, restrained grain normal map, embedded in the GLB.
if WOOD_MODE:
    grain=bpy.data.images.new('model-wood-grain-normal',width=128,height=128)
    values=[]
    for y in range(128):
        for x in range(128):
            dx=0.035*math.sin(x*0.8+0.35*math.sin(y*0.08))+0.012*math.sin(x*2.3)
            dy=0.003*math.cos(y*0.1+x*0.15)
            n=Vector((dx,dy,1)).normalized()
            values.extend(((n.x+1)/2,(n.y+1)/2,(n.z+1)/2,1))
    grain.pixels=values;grain.colorspace_settings.name='Non-Color'
    grain.filepath_raw=str(OUT/'wood-grain-normal.png');grain.file_format='PNG';grain.save()
    wn=wood.node_tree.nodes
    wt=wn.new('ShaderNodeTexImage');wt.image=grain
    normal=wn.new('ShaderNodeNormalMap');normal.inputs['Strength'].default_value=0.3
    wood.node_tree.links.new(wt.outputs['Color'],normal.inputs['Color'])
    wood.node_tree.links.new(normal.outputs['Normal'],wn.get('Principled BSDF').inputs['Normal'])
unknown=[]; assigned=[]; buckets={}
cx,cy=19.772438526153564,11.89262580871582
for o in objects:
    group=mapping.get(o.name,{}).get('group','UNMAPPED')
    classifications=[]
    confirmed_layer=source_matches.get(o.name,{}).get('layer')
    for slot in o.material_slots:
        if confirmed_layer in ('木','木建具','木家具'):
            slot.material=wood; classifications.append('wood')
        elif slot.material and slot.material.name=='ガラス':
            slot.material=glass; classifications.append('glass')
        elif group.startswith('RC'):
            slot.material=concrete; classifications.append('concrete')
        else: classifications.append('unclassified')
    (unknown if 'unclassified' in classifications else assigned).append(dict(name=o.name,group=group,source_layer=confirmed_layer,classification=classifications))
    o.location.x-=cx;o.location.y-=cy
    # Batch by source group and material slots; no decimation or vertex welding.
    key=(group,tuple(s.material.name if s.material else '' for s in o.material_slots))
    buckets.setdefault(key,[]).append(o)
bpy.context.view_layer.update()
triangles_before=sum(len(o.data.polygons) for o in objects)
for index,(key,items) in enumerate(buckets.items()):
    bpy.ops.object.select_all(action='DESELECT')
    for o in items:o.select_set(True)
    bpy.context.view_layer.objects.active=items[0]
    bpy.ops.object.join()
    items[0].name=f'web_{index:02d}_{key[0]}'
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.transform_apply(location=True,rotation=True,scale=True)
bpy.ops.export_scene.gltf(filepath=str(TARGET),export_format='GLB',export_yup=True,
    export_cameras=False,export_lights=False,export_animations=False,export_extras=False,
    export_materials='EXPORT',export_normals=True)
report=dict(source_sha256=original_hash,source_unchanged=digest(SOURCE)==original_hash,
    translation_blender_m=[-cx,-cy,0],excluded=['object_332'],
    concrete_basis='OBJ group prefix RC (reinforced-concrete naming convention); confirm with author',
    assigned=assigned,unclassified=unknown,wood_assigned=WOOD_MODE,
    wood_count=sum('wood' in o['classification'] for o in assigned),
    source_layer_match_file='99_development/diagnostics/rhino-layer-matches.json' if WOOD_MODE else None,
    original_meshes=5228,web_meshes=len([o for o in bpy.context.scene.objects if o.type=='MESH']),
    triangles=triangles_before,web_bytes=TARGET.stat().st_size,
    section=dict(axis='X',keep='X >= -0.8m (centered Blender and Three coordinates)',plane=-0.8),
    floor_alignment='provisional; source slabs approximately every 2.73m; tenant mapping unconfirmed')
(OUT/'preparation.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
scene=bpy.context.scene;scene.render.engine='CYCLES';scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.world.use_nodes=True
scene.world.node_tree.nodes.get('Background').inputs['Color'].default_value=(0,0,0,1)
scene.view_settings.view_transform='AgX'
for loc,power,scale in [((-12,-8,30),4500,15),((15,12,25),3500,12),((-10,20,15),2500,10)]:
    bpy.ops.object.light_add(type='AREA',location=loc)
    light=bpy.context.object;light.data.energy=power;light.data.shape='DISK';light.data.size=scale
    light.rotation_euler=(Vector((0,0,8))-light.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(-48,0,8.1));camera=bpy.context.object;scene.camera=camera
camera.rotation_euler=(Vector((0,0,8.1))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='PERSP';camera.data.lens=45
# Camera near-plane clipping is display-only; the web GLB remains complete.
camera.data.clip_start=47.2;camera.data.clip_end=150
scene.render.filepath=str(OUT/'section-long-side.png');bpy.ops.render.render(write_still=True)
camera.data.clip_start=0.1;camera.location=(-34,-34,24)
camera.rotation_euler=(Vector((0,0,8))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(OUT/'exterior-materials.png');bpy.ops.render.render(write_still=True)
# Separate material swatches; wood is a sample, never assigned to unknown building parts.
for o in list(scene.objects):
    if o.type=='MESH':o.hide_render=True
for x,m in [(-3,concrete),(0,wood),(3,glass)]:
    bpy.ops.mesh.primitive_uv_sphere_add(segments=48,ring_count=24,radius=1.1,location=(x,0,1.2))
    o=bpy.context.object;o.data.materials.append(m)
    for p in o.data.polygons:p.use_smooth=True
camera.location=(0,-13,6);camera.rotation_euler=(Vector((0,0,1.2))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(OUT/'materials-concrete-wood-glass.png');bpy.ops.render.render(write_still=True)
assert digest(SOURCE)==original_hash
print('WEB_PREPARATION_COMPLETE',report['web_meshes'],report['web_bytes'],flush=True)
