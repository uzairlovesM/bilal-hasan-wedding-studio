import bpy
import math
from mathutils import Vector

bpy.ops.object.select_all(action='SELECT')
bpy.ops.object.delete(use_global=False)

def material(name, base, metallic, roughness):
    mat = bpy.data.materials.new(name)
    mat.diffuse_color = (*base, 1)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get('Principled BSDF')
    bsdf.inputs['Base Color'].default_value = (*base, 1)
    bsdf.inputs['Metallic'].default_value = metallic
    bsdf.inputs['Roughness'].default_value = roughness
    return mat

ivory = material('Ivory handmade paper', (.88, .79, .62), .05, .43)
card_mat = material('Warm invitation stock', (.98, .92, .78), .0, .62)
green = material('Emerald wax seal', (.035, .12, .07), .28, .24)
gold = material('Antique gold foil', (.72, .48, .16), .82, .23)

bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 0))
body = bpy.context.object
body.name = 'EnvelopeBody'
body.dimensions = (2.75, .12, 1.88)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
body.data.materials.append(ivory)
bevel = body.modifiers.new('Soft paper edge', 'BEVEL')
bevel.width = .035
bevel.segments = 4
body.modifiers.new('Weighted paper normals', 'WEIGHTED_NORMAL')

bpy.ops.mesh.primitive_cube_add(size=1, location=(0, .09, .02))
card = bpy.context.object
card.name = 'InvitationCard'
card.dimensions = (2.36, .035, 1.5)
bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
card.data.materials.append(card_mat)

mesh = bpy.data.meshes.new('HingedFlapMesh')
mesh.from_pydata([(-1.36, .075, 0), (1.36, .075, 0), (0, .075, .98)], [], [(0, 2, 1)])
mesh.materials.append(ivory)
flap = bpy.data.objects.new('EnvelopeFlap', mesh)
bpy.context.collection.objects.link(flap)
flap.location = (0, 0, -.94)

bpy.ops.mesh.primitive_cylinder_add(vertices=64, radius=.29, depth=.09, location=(0, .17, -.45))
seal = bpy.context.object
seal.name = 'WaxSeal'
seal.data.materials.append(green)
bevel = seal.modifiers.new('Wax softened rim', 'BEVEL')
bevel.width = .035
bevel.segments = 4
seal.modifiers.new('Wax normals', 'WEIGHTED_NORMAL')

bpy.ops.mesh.primitive_torus_add(major_radius=.235, minor_radius=.018, major_segments=64, minor_segments=10, location=(0, .225, -.45), rotation=(math.pi / 2, 0, 0))
ring = bpy.context.object
ring.name = 'SealGoldRing'
ring.data.materials.append(gold)

bpy.ops.object.select_all(action='DESELECT')
body.select_set(True)
bpy.context.view_layer.objects.active = body
bpy.ops.wm.save_as_mainfile(filepath='public/models/envelope-source.blend')
bpy.ops.export_scene.gltf(filepath='public/models/envelope-from-blender.glb', export_format='GLB', export_apply=True, export_image_format='AUTO')
