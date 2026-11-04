"""Run with Blender --background --factory-startup --python this_file.

Preserves sources; refuses to overwrite the final GLB.
"""
import bpy
import hashlib
import json
import math
import struct
from pathlib import Path
from mathutils import Vector

ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(r'C:\sawara_building\sawara-building.obj')
OUTPUT = ROOT / '90_shared/models/sawara-building.glb'
REPORT = ROOT / '90_shared/models/sawara-building-conversion.json'


def digest(path):
    return hashlib.file_digest(path.open('rb'), 'sha256').hexdigest()


def stats():
    objects = [o for o in bpy.context.scene.objects if o.type == 'MESH']
    points = [o.matrix_world @ Vector(corner) for o in objects for corner in o.bound_box]
    assert points, 'No mesh geometry found'
    low = [min(p[i] for p in points) for i in range(3)]
    high = [max(p[i] for p in points) for i in range(3)]
    triangles = 0
    for obj in objects:
        obj.data.calc_loop_triangles()
        triangles += len(obj.data.loop_triangles)
    return dict(objects=len(objects), triangles=triangles,
                bounds_min=low, bounds_max=high,
                dimensions_m=[high[i] - low[i] for i in range(3)])


if OUTPUT.exists():
    raise FileExistsError(f'Overwrite requires user confirmation: {OUTPUT}')
sources = [SOURCE]
for line in SOURCE.read_text(encoding='utf-8').splitlines():
    if line.startswith('mtllib '):
        sources.append(SOURCE.parent / line[7:].strip())
before = {str(p): dict(bytes=p.stat().st_size, sha256=digest(p)) for p in sources}
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.context.scene.unit_settings.system = 'METRIC'
bpy.context.scene.unit_settings.scale_length = 1.0
bpy.ops.wm.obj_import(filepath=str(SOURCE), global_scale=0.001,
                      forward_axis='Y', up_axis='Z',
                      use_split_objects=True, use_split_groups=False)
for image in bpy.data.images:
    if image.source == 'FILE':
        path = Path(bpy.path.abspath(image.filepath))
        if not path.is_file():
            raise FileNotFoundError(f'Missing texture: {path}')
        before[str(path)] = dict(bytes=path.stat().st_size, sha256=digest(path))
original = stats()
materials = [dict(name=m.name, diffuse=list(m.diffuse_color)) for m in bpy.data.materials if m.users]
OUTPUT.parent.mkdir(parents=True, exist_ok=True)
# Stage the file; only publish its final name after successful reimport.
staged = OUTPUT.with_name('sawara-building.validating.glb')
if staged.exists():
    raise FileExistsError(staged)
bpy.ops.export_scene.gltf(filepath=str(staged), export_format='GLB',
    export_yup=True, export_cameras=False, export_lights=False,
    export_animations=False, export_extras=False, export_texcoords=True,
    export_normals=True, export_materials='EXPORT',
    export_draco_mesh_compression_enable=False)
with staged.open('rb') as handle:
    magic, version, length = struct.unpack('<4sII', handle.read(12))
    assert magic == b'glTF' and version == 2 and length == staged.stat().st_size
    chunk_length, chunk_type = struct.unpack('<II', handle.read(8))
    assert chunk_type == 0x4E4F534A
    gltf = json.loads(handle.read(chunk_length))
assert not gltf.get('cameras')
assert 'KHR_lights_punctual' not in gltf.get('extensions', {})
assert all('uri' not in buffer for buffer in gltf.get('buffers', []))
assert all('uri' not in image for image in gltf.get('images', []))
bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(staged))
verified = stats()
assert original['triangles'] == verified['triangles'], 'Triangle count changed'
for key in ('bounds_min', 'bounds_max'):
    assert all(math.isclose(a, b, abs_tol=0.0001) for a, b in zip(original[key], verified[key])), 'Bounds changed'
for path, info in before.items():
    assert digest(Path(path)) == info['sha256'], f'Source modified: {path}'
assert not OUTPUT.exists(), 'Output appeared during conversion'
staged.rename(OUTPUT)
report = dict(blender=bpy.app.version_string, sources=before,
    warnings=['OBJ importer reported invalid parm numbers for two B-spline curves; non-mesh curves were omitted. Mesh validation does not cover these curves.',
              'Source MTL defines black diffuse colors and glass opacity 0; visual appearance has not been rendered for comparison.'],
    source_axis='Rhino Z-up assumed; no rotation on import; glTF Y-up on export',
    scale=0.001, lossy_mesh_reduction=False, materials=materials,
    imported=original, reimported=verified, output_bytes=OUTPUT.stat().st_size,
    output_sha256=digest(OUTPUT), validation='PASS')
REPORT.write_text(json.dumps(report, ensure_ascii=False, indent=2), encoding='utf-8')
print('CONVERSION_RESULT ' + json.dumps(report, ensure_ascii=False), flush=True)
