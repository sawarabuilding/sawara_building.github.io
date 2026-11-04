"""Transient-scene rendering only; never writes a GLB or a .blend."""
import bpy, bmesh, hashlib
from pathlib import Path
from mathutils import Vector, Matrix
root=Path(__file__).resolve().parents[2]
model=root/'90_shared/models/sawara-building-web-wood.glb'
out=root/'99_development/diagnostics/wood-preview'
def sha():
    with model.open('rb') as f:return hashlib.file_digest(f,'sha256').hexdigest()
before=sha()
bpy.ops.object.select_all(action='SELECT');bpy.ops.object.delete(use_global=False)
bpy.ops.import_scene.gltf(filepath=str(model))
scene=bpy.context.scene;scene.render.engine='CYCLES'
scene.cycles.samples=24;scene.cycles.use_denoising=True
scene.render.resolution_x=1400;scene.render.resolution_y=1100;scene.render.resolution_percentage=100
scene.render.image_settings.file_format='PNG';scene.view_settings.view_transform='AgX'
world=scene.world;world.use_nodes=True
nodes=world.node_tree.nodes;nodes.clear()
lightpath=nodes.new('ShaderNodeLightPath')
ambient=nodes.new('ShaderNodeBackground');ambient.inputs['Color'].default_value=(0.65,0.62,0.56,1);ambient.inputs['Strength'].default_value=.5
black=nodes.new('ShaderNodeBackground');black.inputs['Color'].default_value=(0,0,0,1)
mix=nodes.new('ShaderNodeMixShader');output=nodes.new('ShaderNodeOutputWorld')
for a,b in [(lightpath.outputs['Is Camera Ray'],mix.inputs[0]),(ambient.outputs[0],mix.inputs[1]),(black.outputs[0],mix.inputs[2]),(mix.outputs[0],output.inputs['Surface'])]:world.node_tree.links.new(a,b)
for pos,power,size in [((-18,-12,28),6500,13),((15,15,22),4500,12),((-15,0,10),5000,12)]:
    bpy.ops.object.light_add(type='AREA',location=pos);l=bpy.context.object
    l.data.energy=power;l.data.shape='DISK';l.data.size=size
    l.rotation_euler=(Vector((0,0,8))-l.location).to_track_quat('-Z','Y').to_euler()
bpy.ops.object.camera_add(location=(-34,-34,24));camera=bpy.context.object;scene.camera=camera;camera.data.lens=45
camera.rotation_euler=(Vector((0,0,8))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(out/'exterior-materials.png');bpy.ops.render.render(write_still=True)
# Open the temporary render scene to light. Source and web models stay untouched.
for o in [o for o in scene.objects if o.type=='MESH']:
    bm=bmesh.new();bm.from_mesh(o.data);bmesh.ops.transform(bm,matrix=o.matrix_world,verts=list(bm.verts))
    bmesh.ops.bisect_plane(bm,geom=list(bm.verts)+list(bm.edges)+list(bm.faces),dist=.000001,
        plane_co=Vector((-.8,0,0)),plane_no=Vector((1,0,0)),clear_inner=True,clear_outer=False)
    bm.to_mesh(o.data);bm.free();o.matrix_world=Matrix.Identity(4);o.data.update()
camera.location=(-48,0,8.1)
camera.rotation_euler=(Vector((0,0,8.1))-camera.location).to_track_quat('-Z','Y').to_euler()
scene.render.filepath=str(out/'section-long-side.png');bpy.ops.render.render(write_still=True)
assert sha()==before
print('WOOD_PREVIEW_COMPLETE: model unchanged',flush=True)
