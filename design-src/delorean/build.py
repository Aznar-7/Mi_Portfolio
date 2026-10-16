import bpy, math, sys
from mathutils import Vector
SRC=r'C:\MiPortfolio\MiPortfolio_V2\design-src\delorean\delorean-src.glb'
OUT=r'C:\MiPortfolio\MiPortfolio_V2\public\models\delorean.glb'
BLEND=r'C:\MiPortfolio\MiPortfolio_V2\design-src\delorean\delorean.blend'
PNG=sys.argv[-1]
bpy.ops.wm.read_factory_settings(use_empty=True)
bpy.ops.import_scene.gltf(filepath=SRC)

def pbr(name, color, met=0.0, rough=0.5, emit=None, strength=0.0, alpha=1.0):
    m = bpy.data.materials.get(name) or bpy.data.materials.new(name)
    m.use_nodes = True
    b = m.node_tree.nodes.get('Principled BSDF')
    for n in list(m.node_tree.nodes):
        if n.type == 'TEX_IMAGE': m.node_tree.nodes.remove(n)
    b.inputs['Base Color'].default_value = (*color, 1)
    b.inputs['Metallic'].default_value = met
    b.inputs['Roughness'].default_value = rough
    b.inputs['Emission Color'].default_value = (*(emit or (0, 0, 0)), 1)
    b.inputs['Emission Strength'].default_value = strength
    b.inputs['Alpha'].default_value = alpha
    if alpha < 1: m.surface_render_method = 'BLENDED'
    return m

# stainless body, smoked glass, lamps that actually glow
pbr('Chasis', (0.6, 0.62, 0.64), met=1.0, rough=0.3)
pbr('glass', (0.02, 0.025, 0.03), rough=0.04, alpha=0.88)
pbr('black', (0.012, 0.012, 0.014), rough=0.55)
pbr('Yellow_Lights', (1, 0.95, 0.82), emit=(1, 0.93, 0.78), strength=6)
pbr('Red_lights', (0.5, 0.0, 0.0), emit=(1, 0.05, 0.03), strength=4)
pbr('ambar_lights', (0.8, 0.3, 0.0), emit=(1, 0.42, 0.05), strength=2.5)
pbr('None', (0.85, 0.86, 0.88), met=1.0, rough=0.2)
for s in ('', '.001', '.002', '.003'):
    pbr('tire' + s, (0.018, 0.018, 0.02), rough=0.85)
    pbr('trim' + s, (0.75, 0.76, 0.78), met=1.0, rough=0.22)
steel = pbr('fusion', (0.82, 0.83, 0.85), met=1.0, rough=0.18)
dark = pbr('hardware', (0.05, 0.05, 0.06), met=0.6, rough=0.45)
flux = pbr('flux', (0.4, 0.8, 1.0), emit=(0.45, 0.8, 1.0), strength=8)

body = bpy.data.objects['DMC_Plane.001']
body.data.shade_smooth()
bpy.context.view_layer.objects.active = body
body.select_set(True)
bpy.ops.object.shade_auto_smooth(angle=math.radians(40))
body.select_set(False)

# wheels pivot on their own hub so the page can spin them
for o in bpy.data.objects:
    if o.name.startswith('Wheel_'):
        bpy.ops.object.select_all(action='DESELECT'); o.select_set(True); bpy.context.view_layer.objects.active = o
        bpy.ops.object.origin_set(type='ORIGIN_GEOMETRY', center='BOUNDS')
        o.name = o.name.split('_Circle')[0]  # Wheel_fl, Wheel_rr...

parts = []
def add(obj, mat, name):
    obj.name = name; obj.data.materials.clear(); obj.data.materials.append(mat); obj.data.shade_smooth(); parts.append(obj); return obj

# Mr. Fusion on the rear deck
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.14, depth=0.22, location=(0, 1.78, 0.56))
add(bpy.context.object, steel, 'fusion_body')
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.17, depth=0.06, location=(0, 1.78, 0.69))
add(bpy.context.object, steel, 'fusion_cap')
bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=0.16, depth=0.05, location=(0, 1.78, 0.46))
add(bpy.context.object, dark, 'fusion_base')

# the reactor across the tail: a dark housing with a ring of light
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.16, 0.3))
o = add(bpy.context.object, dark, 'reactor'); o.scale = (1.1, 0.18, 0.2)
for x in (-0.36, 0.36):
    bpy.ops.mesh.primitive_torus_add(major_radius=0.11, minor_radius=0.025, location=(x, 2.26, 0.3), rotation=(math.radians(90), 0, 0))
    add(bpy.context.object, flux, 'vent_glow')
# vertical vent slats on the rear deck
for i in range(5):
    bpy.ops.mesh.primitive_cube_add(size=1, location=(-0.5 + i * 0.25, 2.05, 0.43))
    o = add(bpy.context.object, dark, 'vent'); o.scale = (0.05, 0.22, 0.05)

# the time coils: glowing bars along the lower flanks
for x in (-1.25, 1.25):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.025, depth=2.2, location=(x, -0.45, -0.22), rotation=(math.radians(90), 0, 0))
    add(bpy.context.object, flux, 'coil')

# join the extras into one mesh so the GLB stays light
bpy.ops.object.select_all(action='DESELECT')
for p in parts: p.select_set(True)
bpy.context.view_layer.objects.active = parts[0]
bpy.ops.object.transform_apply(location=False, rotation=True, scale=True)
bpy.ops.object.join(); bpy.context.object.name = 'BTTF_Kit'

bpy.ops.wm.save_as_mainfile(filepath=BLEND)
bpy.ops.export_scene.gltf(filepath=OUT, export_format='GLB', export_apply=True, export_yup=True)

# preview render
sc = bpy.context.scene
sc.render.engine = 'BLENDER_EEVEE'; sc.render.resolution_x, sc.render.resolution_y = 1280, 720
w = bpy.data.worlds.new('w'); sc.world = w; w.use_nodes = True
w.node_tree.nodes['Background'].inputs['Color'].default_value = (0.12, 0.14, 0.18, 1)
w.node_tree.nodes['Background'].inputs['Strength'].default_value = 1.0
def light(loc, energy, size, col=(1, 1, 1)):
    d = bpy.data.lights.new('l', 'AREA'); d.energy = energy; d.size = size; d.color = col
    o = bpy.data.objects.new('l', d); o.location = loc; sc.collection.objects.link(o)
    o.rotation_euler = (Vector((0, 0, 0)) - Vector(loc)).to_track_quat('-Z', 'Y').to_euler()
light((-4, -4, 5), 900, 5); light((5, 2, 3), 500, 4, (0.6, 0.75, 1)); light((0, 6, 2), 400, 3, (1, 0.6, 0.4))
bpy.ops.mesh.primitive_plane_add(size=40, location=(0, 0, -0.85))
bpy.context.object.data.materials.append(pbr('floor', (0.03, 0.03, 0.035), rough=0.35))
cam = bpy.data.objects.new('cam', bpy.data.cameras.new('cam')); sc.collection.objects.link(cam); sc.camera = cam
cam.location = (4.6, -6.2, 1.9)
cam.rotation_euler = (Vector((0, -0.3, -0.1)) - cam.location).to_track_quat('-Z', 'Y').to_euler()
cam.data.lens = 40
sc.render.filepath = PNG
bpy.ops.render.render(write_still=True)
print('DONE')
