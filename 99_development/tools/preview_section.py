import bpy, math
from pathlib import Path
from mathutils import Vector
ROOT=Path(__file__).resolve().parents[2]
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(ROOT/'90_shared/models/sawara-building-web.glb'))
scene=bpy.context.scene
scene.render.engine='BLENDER_WORKBENCH'
scene.display.shading.light='STUDIO';scene.display.shading.color_type='SINGLE'
scene.display.shading.single_color=(0.55,0.53,0.49)
scene.display.shading.show_cavity=True;scene.display.shading.show_shadows=True
scene.display.shading.background_type='WORLD';scene.world.color=(0,0,0)
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
bpy.ops.object.camera_add(location=(-48,0,8.1));cam=bpy.context.object;scene.camera=cam
cam.rotation_euler=(Vector((0,0,8.1))-cam.location).to_track_quat('-Z','Y').to_euler()
cam.data.lens=45;cam.data.clip_start=47.2;cam.data.clip_end=150
scene.render.filepath=str(ROOT/'99_development/diagnostics/web-preview/section-shape.png')
bpy.ops.render.render(write_still=True)
