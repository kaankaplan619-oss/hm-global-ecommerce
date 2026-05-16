"""
scripts/blender/canvas.py v6
Toile canvas debout — BMesh direct en XZ plane, fond clair
"""

import bpy, bmesh, math, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT       = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_PNG    = os.path.join(ROOT, "public", "mockups", "print", "canvas", "canvas-premium.png")

def lin(r, g, b):
    def c(v): return ((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92
    return (c(r), c(g), c(b), 1.0)

HM_ROSE   = lin(0.694, 0.247, 0.455)
HM_WHITE  = lin(0.975, 0.970, 0.982)
HM_CREAM  = lin(0.940, 0.928, 0.912)
HM_BG     = lin(0.940, 0.935, 0.950)
HM_FLOOR  = lin(0.910, 0.905, 0.920)
HM_WOOD   = lin(0.520, 0.375, 0.245)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

scene.render.engine                      = 'CYCLES'
scene.cycles.samples                     = 128
scene.cycles.use_denoising               = True
scene.cycles.denoiser                    = 'OPENIMAGEDENOISE'
scene.render.resolution_x                = 1200
scene.render.resolution_y                = 1600
scene.render.resolution_percentage       = 100
scene.render.image_settings.file_format  = 'PNG'
scene.render.image_settings.compression  = 10
scene.render.filepath                    = OUT_PNG
try:
    scene.view_settings.view_transform   = 'AgX'
    scene.view_settings.look             = 'None'
except:
    scene.view_settings.view_transform   = 'Filmic'
    scene.view_settings.look             = 'None'
scene.view_settings.exposure             = 0.0

world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
wnt = world.node_tree; wnt.nodes.clear()
wbg = wnt.nodes.new('ShaderNodeBackground')
wbg.inputs['Color'].default_value    = HM_BG
wbg.inputs['Strength'].default_value = 0.8
wout = wnt.nodes.new('ShaderNodeOutputWorld')
wnt.links.new(wbg.outputs['Background'], wout.inputs['Surface'])

def mat(name, color, rough=0.5, specular=0.1):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    ns = m.node_tree.nodes; ls = m.node_tree.links; ns.clear()
    b = ns.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value  = rough
    try:    b.inputs['Specular IOR Level'].default_value = specular
    except: b.inputs['Specular'].default_value           = specular
    o = ns.new('ShaderNodeOutputMaterial')
    ls.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

mat_rose  = mat("Rose",  HM_ROSE,  rough=0.80, specular=0.04)
mat_white = mat("White", HM_WHITE, rough=0.82, specular=0.04)
mat_cream = mat("Cream", HM_CREAM, rough=0.86, specular=0.03)
mat_wood  = mat("Wood",  HM_WOOD,  rough=0.90, specular=0.02)
mat_floor = mat("Floor", HM_FLOOR, rough=0.92, specular=0.02)

# Sol
bpy.ops.mesh.primitive_plane_add(size=6.0, location=(0, 0, 0))
bpy.context.active_object.name = "Floor"
bpy.context.active_object.data.materials.append(mat_floor)

# ── Toile canvas 40×60cm debout ───────────────────────────────────────────────
CW   = 0.40
CH   = 0.60
CT   = 0.016
BAND = 0.10   # bande rose en bas
AZ   = math.radians(-12)

def make_quad(name, verts_xz, y_pos, material, az=0):
    """Crée un quad dans le plan XZ à y=y_pos, tourné de az autour de Z."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bm   = bmesh.new()
    # verts_xz = [(x0,z0),(x1,z1),(x2,z2),(x3,z3)] en ordre CCW vu de -Y
    v = [bm.verts.new((x, y_pos, z)) for x, z in verts_xz]
    bm.faces.new(v)
    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)
    obj.rotation_euler = (0, 0, az)
    return obj

PAD = 0.003   # léger retrait par rapport aux bords

# Châssis (cube pour les tranches et le dos)
bpy.ops.mesh.primitive_cube_add(size=1, location=(0, CT/2, CH/2))
chassis = bpy.context.active_object
chassis.name = "Chassis"
chassis.scale = (CW/2, CT/2, CH/2)
bpy.ops.object.transform_apply(scale=True)
chassis.data.materials.append(mat_cream)
chassis.rotation_euler = (0, 0, AZ)
bev = chassis.modifiers.new("Bevel", 'BEVEL')
bev.width = 0.005; bev.segments = 3; bev.limit_method = 'ANGLE'
bev.angle_limit = math.radians(75)

# Face imprimée : zone rose (bas) — vertices CCW depuis -Y
make_quad("FaceRose",
    [(-CW/2+PAD, PAD), (CW/2-PAD, PAD), (CW/2-PAD, BAND), (-CW/2+PAD, BAND)],
    y_pos=-0.002, material=mat_rose, az=AZ)

# Face imprimée : zone blanche (haut)
make_quad("FaceWhite",
    [(-CW/2+PAD, BAND+0.001), (CW/2-PAD, BAND+0.001), (CW/2-PAD, CH-PAD), (-CW/2+PAD, CH-PAD)],
    y_pos=-0.002, material=mat_white, az=AZ)

# ── Éclairage ─────────────────────────────────────────────────────────────────
def light(name, loc, rot_deg, energy, sx, sy=None, color=(1,1,1)):
    bpy.ops.object.light_add(type='AREA', location=loc)
    l = bpy.context.active_object
    l.name = name; l.data.energy = energy
    l.data.size = sx; l.data.size_y = sy or sx
    l.data.color = color
    l.rotation_euler = [math.radians(r) for r in rot_deg]

light("Key",  (-0.60, -0.70, 0.90), (40,-28, 0), 100, 0.7, 0.5, (1.00, 0.97, 0.92))
light("Fill", ( 0.60, -0.55, 0.70), (46, 28, 0),  30, 0.9, 0.9, (0.86, 0.91, 1.00))
light("Rim",  ( 0.05,  0.80, 0.80), (-36, 4, 0),  50, 0.4, 0.3, (0.96, 0.90, 1.00))
light("Kick", ( 0.05, -0.20,-0.08), (-90, 0, 0),  10, 0.5, 0.5, (1.00, 0.96, 0.96))

# ── Caméra portrait, légèrement en oblique ────────────────────────────────────
bpy.ops.object.camera_add(location=(0.15, -1.80, 0.30))
cam = bpy.context.active_object
cam.name = "Camera"
cam.data.lens       = 50
cam.data.dof.use_dof = False
scene.camera = cam

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0.0, 0.0, CH/2))
tgt = bpy.context.active_object; tgt.name = "T"
ctr = cam.constraints.new('TRACK_TO')
ctr.target = tgt; ctr.track_axis = 'TRACK_NEGATIVE_Z'; ctr.up_axis = 'UP_Y'
bpy.context.view_layer.update()

print(f"\n  HM Global — canvas premium  v6")
print(f"  → {OUT_PNG}\n")
bpy.ops.render.render(write_still=True)
print("✅  Terminé.")
