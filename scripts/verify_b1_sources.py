import bpy,json,hashlib
from pathlib import Path
from mathutils import Vector
root=Path(__file__).resolve().parents[1]
meta=json.loads((root/'diagnostics/b1-revision/model-build.json').read_text(encoding='utf-8'))
old=json.loads((root/'assets/models/sawara-building-conversion.json').read_text(encoding='utf-8'))
def sha(p):
    with Path(p).open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
for p,info in old['sources'].items():assert sha(p)==info['sha256']
assert sha(root/'assets/models/sawara-building.glb')==old['output_sha256']
assert sha(root/'assets/models/sawara-building-web-wood.glb')==meta['source_sha256']
rhino=json.loads((root/'diagnostics/rhino-layer-matches.json').read_text(encoding='utf-8'))
assert sha(root/'.local-backups/rhino-source-20261103.3dm')==rhino['source_3dm_sha256']
results=[]
for name,expected in [('sawara-building-exterior-v2.glb',meta['exterior']),('sawara-building-section-b1.glb',meta['section'])]:
    bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
    bpy.ops.import_scene.gltf(filepath=str(root/'assets/models'/name))
    meshes=[o for o in bpy.context.scene.objects if o.type=='MESH'];triangles=0
    for o in meshes:o.data.calc_loop_triangles();triangles+=len(o.data.loop_triangles)
    points=[o.matrix_world@v.co for o in meshes for v in o.data.vertices]
    low=[min(p[i] for p in points) for i in range(3)];high=[max(p[i] for p in points) for i in range(3)]
    assert triangles==expected['triangles']
    assert all(abs(a-b)<.0001 for a,b in zip(low,expected['minimum']))
    assert all(abs(a-b)<.0001 for a,b in zip(high,expected['maximum']))
    if 'section' in name:assert all(p.y>=meta['plane_blender_y_m']-.0001 for p in points)
    results.append(dict(file=name,triangles=triangles,minimum=low,maximum=high,sha256=sha(root/'assets/models'/name)))
report=dict(source_hashes_unchanged=True,model_reimport='PASS',models=results,
    cap_faces=sum(r['cap_faces'] for r in meta['cut_results']),unclosed_cut_edges=sum(r['unclosed_cut_edges'] for r in meta['cut_results']))
(root/'diagnostics/b1-revision/model-validation.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
print('B1_SOURCE_AND_MODEL_VALIDATION_PASS',flush=True)
