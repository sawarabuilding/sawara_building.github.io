"""Stage 1 only: source-plane evidence and uncommitted section candidates."""
import bpy, json, hashlib
from pathlib import Path
from mathutils import Vector
from bpy_extras.object_utils import world_to_camera_view
ROOT=Path(__file__).resolve().parents[1]
OUT=ROOT/'diagnostics/section-review';OUT.mkdir(exist_ok=True)
source=ROOT/'assets/models/sawara-building-web-wood.glb'
def sha():
    with source.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
before=sha()
audit=json.loads((ROOT/'.local-cache/rhino-layer-audit.json').read_text(encoding='utf-8'))
planes=[o for o in audit['objects'] if o['layer']['name']=='断面' and o['type']=='Surface']
assert len(planes)==1
plane=planes[0]
assert abs(plane['minimum'][0]-plane['maximum'][0])<1e-6
cx,cy=19.772438526153564,11.89262580871582
section_x=plane['minimum'][0]/1000-cx
# Y symmetry axis derived from the matching north/south bounding extents of the four central walls.
original=json.loads((ROOT/'diagnostics/model-diagnosis.json').read_text(encoding='utf-8'))
walls=[o for o in original['objects'] if o['name'] in ('object_47','object_48','object_49','object_50')]
assert len(walls)==4
y_center=(min(o['minimum'][1] for o in walls)+max(o['maximum'][1] for o in walls))/2
section_y=y_center-cy
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(source))
scene=bpy.context.scene;scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='STUDIO';scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(.64,.62,.58)
scene.display.shading.show_cavity=True;scene.display.shading.show_shadows=False
scene.display.shading.background_type='WORLD';scene.world.color=(.87,.88,.87)
scene.view_settings.view_transform='Standard'
scene.render.resolution_x=1600;scene.render.resolution_y=1400;scene.render.resolution_percentage=100
bpy.ops.object.camera_add(location=(0,0,60));camera=bpy.context.object;scene.camera=camera
camera.rotation_euler=(Vector((0,0,0))-camera.location).to_track_quat('-Z','Y').to_euler()
camera.data.type='ORTHO';camera.data.ortho_scale=26;camera.data.clip_start=52.4;camera.data.clip_end=100
bpy.context.view_layer.update()
scene.render.filepath=str(OUT/'plan-base.png');bpy.ops.render.render(write_still=True)
def project(x,y,z=7.5):
    p=world_to_camera_view(scene,camera,Vector((x,y,z)))
    return [p.x*1600,(1-p.y)*1400]
report=dict(status='AWAITING_SECTION_CONFIRMATION',reference_image_available=False,
    source_plane=dict(layer='断面',object_id=plane['id'],axis='X',original_mm=plane['minimum'][0],centered_m=section_x),
    candidates=dict(A=dict(axis='X',position_m=section_x,basis='existing source section surface',screen_line=[project(section_x,-11),project(section_x,11)]),
                    B=dict(axis='Y',position_m=section_y,basis='alternative symmetry-axis candidate; not an existing source section plane',screen_line=[project(-10,section_y),project(10,section_y)])),
    old_web_section=dict(original_x_mm=(cx-.8)*1000,centered_x_m=-.8,offset_to_A_m=section_x+.8),
    plan_slice_z_m=7.6,axes='Blender Z-up; +X right, +Y up',source_model_sha256=before,
    center_projection=project(section_x,section_y),
    views=dict(A1='view from -X towards +X',A2='view from +X towards -X',B1='view from -Y towards +Y',B2='view from +Y towards -Y'))
(OUT/'section-candidates.json').write_text(json.dumps(report,ensure_ascii=False,indent=2),encoding='utf-8')
# Candidate previews use camera clipping only. No geometry or material changes and no export.
scene.world.color=(.14,.15,.16)
scene.render.resolution_x=1200;scene.render.resolution_y=1100
camera.data.type='PERSP';camera.data.lens=55
for name,loc,target,near in [
    ('A1',(-55,0,8.1),(0,0,8.1),55+section_x),
    ('A2',(55,0,8.1),(0,0,8.1),55-section_x),
    ('B1',(0,-55,8.1),(0,0,8.1),55+section_y),
    ('B2',(0,55,8.1),(0,0,8.1),55-section_y)]:
    camera.location=loc;camera.rotation_euler=(Vector(target)-camera.location).to_track_quat('-Z','Y').to_euler()
    camera.data.clip_start=near;camera.data.clip_end=150
    scene.render.filepath=str(OUT/f'{name}-candidate.png');bpy.ops.render.render(write_still=True)
assert sha()==before
print('SECTION_REVIEW_READY: source unchanged; no section committed',flush=True)
