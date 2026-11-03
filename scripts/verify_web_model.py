import bpy, hashlib, json, sys
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
original=json.loads((root/'assets/models/sawara-building-conversion.json').read_text(encoding='utf-8'))
for filename,info in original['sources'].items():
    with Path(filename).open('rb') as f: assert hashlib.file_digest(f,'sha256').hexdigest()==info['sha256']
with (root/'assets/models/sawara-building.glb').open('rb') as f:
    assert hashlib.file_digest(f,'sha256').hexdigest()==original['output_sha256']
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
wood='--source-wood' in sys.argv
model_path=root/('assets/models/sawara-building-web-wood.glb' if wood else 'assets/models/sawara-building-web.glb')
bpy.ops.import_scene.gltf(filepath=str(model_path))
objects=[o for o in bpy.context.scene.objects if o.type=='MESH']
points=[o.matrix_world@Vector(p) for o in objects for p in o.bound_box]
lo=[min(p[i] for p in points) for i in range(3)]
hi=[max(p[i] for p in points) for i in range(3)]
triangles=0
for o in objects:
    o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
assert triangles==433290
dimensions=[hi[i]-lo[i] for i in range(3)]
assert all(abs(a-b)<0.0001 for a,b in zip(dimensions,[15,18.6666679382,18.0799999237]))
assert abs(lo[0]+hi[0])<0.0001 and abs(lo[1]+hi[1])<0.0001
result=dict(source_files_unchanged=True,web_reimport='PASS',triangles=triangles,meshes=len(objects),
    model=model_path.name,
    dimensions_blender_xyz_m=dimensions,bounds_min=lo,bounds_max=hi,centered_horizontal=True,
    glass=[dict(alpha=n.inputs['Alpha'].default_value,transmission=n.inputs['Transmission Weight'].default_value)
           for m in bpy.data.materials if m.name.startswith('Glass_source') for n in m.node_tree.nodes if n.type=='BSDF_PRINCIPLED'])
if wood:
    source_meta=json.loads((root/'diagnostics/rhino-layer-matches.json').read_text(encoding='utf-8'))
    with (root/'.local-backups/rhino-source-20261103.3dm').open('rb') as f:
        assert hashlib.file_digest(f,'sha256').hexdigest()==source_meta['source_3dm_sha256']
    result['rhino_read_copy_unchanged']=True
(root/('diagnostics/wood-preview/model-validation.json' if wood else 'diagnostics/web-preview/model-validation.json')).write_text(json.dumps(result,indent=2),encoding='utf-8')
print('MODEL_VALIDATION '+json.dumps(result),flush=True)
