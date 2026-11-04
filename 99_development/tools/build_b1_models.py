"""Create separate exterior and capped B1 section derivatives; preserve every source."""
import bpy,bmesh,json,hashlib,math,random,struct,zlib
from pathlib import Path
from mathutils import Vector,Matrix
ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'99_development/diagnostics/b1-revision';OUT.mkdir(exist_ok=True)
SOURCE=ROOT/'90_shared/models/sawara-building-web-wood.glb'
EXTERIOR=ROOT/'90_shared/models/sawara-building-exterior-v2.glb'
SECTION=ROOT/'90_shared/models/sawara-building-section-b1.glb'
assert not EXTERIOR.exists() and not SECTION.exists(),'Refusing to overwrite a derivative'
def sha(p):
    with p.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
source_hash=sha(SOURCE)
review=json.loads((ROOT/'99_development/diagnostics/section-review/section-candidates.json').read_text(encoding='utf-8'))
plane_y=review['candidates']['B']['position_m']
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SOURCE))
def linear(hex):
    def channel(v):return v/12.92 if v<=.04045 else ((v+.055)/1.055)**2.4
    return tuple(channel(int(hex[i:i+2],16)/255) for i in (0,2,4))+(1,)
# Write PNG bytes directly: changing Blender generated-image color space after
# assigning pixels reset previous maps to black. Loaded PNGs avoid that issue.
texture_dir=ROOT/'90_shared/textures/b1';texture_dir.mkdir(parents=True,exist_ok=True)
def png(name,pixel,noncolor=True):
    size=256
    raw=b''.join(b'\0'+bytes(channel for x in range(size) for channel in pixel(x,y)) for y in range(size))
    def chunk(kind,data):return struct.pack('>I',len(data))+kind+data+struct.pack('>I',zlib.crc32(kind+data)&0xffffffff)
    target=texture_dir/name
    target.write_bytes(b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('>IIBBBBB',size,size,8,2,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b''))
    image=bpy.data.images.load(str(target));image.colorspace_settings.name='Non-Color' if noncolor else 'sRGB'
    return image
random.seed(73);noise=[random.random() for _ in range(256*256)]
def concrete_pixel(x,y):
    dx=(noise[y*256+(x+1)%256]-noise[y*256+(x-1)%256])*.23
    dy=(noise[((y+1)%256)*256+x]-noise[((y-1)%256)*256+x])*.23
    n=Vector((dx,dy,1)).normalized();return tuple(round((v+1)*127.5) for v in n)
def wood_pixel(x,y):
    n=Vector((.08*math.sin(x*.65+.2*math.sin(y*.05)),.003*math.cos(y*.1+x*.15),1)).normalized()
    return tuple(round((v+1)*127.5) for v in n)
def pigment(x,y):
    v=1+.025*math.sin(x*.13)*math.sin(y*.07)+.018*(noise[y*256+x]-.5)
    return tuple(round(c*v) for c in (126,133,144))
concrete_normal=png('concrete-normal.png',concrete_pixel)
wood_normal=png('wood-normal.png',wood_pixel)
concrete_pigment=png('concrete-pigment.png',pigment,False)
changed=[]
for m in bpy.data.materials:
    if not m.use_nodes:continue
    bs=next((n for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'),None)
    if not bs:continue
    if m.name.startswith('Concrete_RC'):
        bs.inputs['Base Color'].default_value=linear('7E8590');bs.inputs['Roughness'].default_value=.96
        for n in m.node_tree.nodes:
            if n.type=='NORMAL_MAP':n.inputs['Strength'].default_value=.55
            if n.type=='TEX_IMAGE':n.image=concrete_normal
        pigment_node=m.node_tree.nodes.new('ShaderNodeTexImage');pigment_node.image=concrete_pigment
        m.node_tree.links.new(pigment_node.outputs['Color'],bs.inputs['Base Color'])
        changed.append(m.name)
    elif m.name.startswith('Wood_Rhino'):
        bs.inputs['Base Color'].default_value=linear('B39D7D');bs.inputs['Roughness'].default_value=.9
        for n in m.node_tree.nodes:
            if n.type=='TEX_IMAGE':n.image=wood_normal
        changed.append(m.name)
    elif m.name.startswith('Glass_source'):
        bs.inputs['Base Color'].default_value=linear('E4F0EC');bs.inputs['Alpha'].default_value=.12
        bs.inputs['Roughness'].default_value=.13;bs.inputs['Transmission Weight'].default_value=0
        bs.inputs['Specular IOR Level'].default_value=.18
        changed.append(m.name)
def export(p):
    bpy.ops.export_scene.gltf(filepath=str(p),export_format='GLB',export_yup=True,
      export_materials='EXPORT',export_normals=True,export_cameras=False,export_lights=False,export_animations=False)
def stats():
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH']
    bpy.context.view_layer.update()
    points=[o.matrix_world@v.co for o in meshes for v in o.data.vertices]
    count=0
    for o in meshes:o.data.calc_loop_triangles();count+=len(o.data.loop_triangles)
    return dict(meshes=len(meshes),triangles=count,minimum=[min(p[i] for p in points) for i in range(3)],maximum=[max(p[i] for p in points) for i in range(3)])
before=stats();export(EXTERIOR)
cap=bpy.data.materials.new('Section_cut_charcoal');cap.use_nodes=True
bs=cap.node_tree.nodes.get('Principled BSDF');bs.inputs['Base Color'].default_value=linear('191B1E');bs.inputs['Roughness'].default_value=1
cut_results=[]
for o in [o for o in bpy.context.scene.objects if o.type=='MESH']:
    bm=bmesh.new();bm.from_mesh(o.data)
    bmesh.ops.transform(bm,matrix=o.matrix_world,verts=list(bm.verts))
    # glTF splits vertices at UV/normal seams. Reconnect coincident positions on
    # this derivative only, so closed source solids yield closed cut loops.
    bmesh.ops.remove_doubles(bm,verts=list(bm.verts),dist=.00000001)
    result=bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,
      plane_co=Vector((0,plane_y,0)),plane_no=Vector((0,1,0)),clear_inner=True,clear_outer=False)
    cut_edges=[e for e in result['geom_cut'] if isinstance(e,bmesh.types.BMEdge) and e.is_boundary and all(abs(v.co.y-plane_y)<.00001 for v in e.verts)]
    cap_index=len(o.data.materials);o.data.materials.append(cap)
    faces=bmesh.ops.holes_fill(bm,edges=cut_edges,sides=0)['faces'] if cut_edges else []
    for face in faces:face.material_index=cap_index;face.smooth=False
    remaining=[e for e in cut_edges if e.is_valid and e.is_boundary]
    cut_results.append(dict(mesh=o.name,cut_edges=len(cut_edges),cap_faces=len(faces),unclosed_cut_edges=len(remaining)))
    bmesh.ops.triangulate(bm,faces=list(bm.faces))
    bm.to_mesh(o.data);bm.free();o.matrix_world=Matrix.Identity(4);o.data.update()
    if not o.data.polygons:bpy.data.objects.remove(o,do_unlink=True)
after=stats();export(SECTION)
assert abs(after['minimum'][1]-plane_y)<.0001
assert before['triangles']==433290
assert sha(SOURCE)==source_hash
# Reimport the actual GLB rather than relying solely on the export call.
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(SECTION));verified=stats()
assert verified['triangles']==after['triangles']
assert all(abs(a-b)<.0001 for a,b in zip(verified['minimum'],after['minimum']))
report=dict(accepted_candidate='B1',view='Blender -Y towards +Y / Three +Z towards -Z',
    plane_blender_y_m=plane_y,plane_original_y_mm=(plane_y+11.89262580871582)*1000,
    plane_three_z_m=-plane_y,keep='Blender Y >= plane; Three Z <= plane',
    source_sha256=source_hash,source_unchanged=True,changed_materials=changed,
    exterior=before,section=after,reimport=verified,cut_results=cut_results,
    exterior_bytes=EXTERIOR.stat().st_size,section_bytes=SECTION.stat().st_size,
    floor_elevations_m=[.10,2.83,5.56,8.29,11.02],roof_floor_m=13.75,
    floor_basis='Source Rhino floor solids: top elevations; source plan cuts confirm 1F..4F ordering',
    cap_note='Caps fill closed cut loops only. Pre-existing open surfaces are recorded, never repaired by guessing.')
(OUT/'model-build.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
print('B1_MODELS_VERIFIED '+json.dumps({k:report[k] for k in ('plane_original_y_mm','exterior_bytes','section_bytes','cut_results')},ensure_ascii=True),flush=True)
