"""
scripts/blender/flyer.py
─────────────────────────────────────────────────────────────────────────────
HM Global Agence — Mockup flyer A4 premium v1
Blender 5.x headless

Scène : 2 flyers A4 en pile légèrement décalée
Format : 210×297mm (×5 → 1.05×1.485 en unités Blender)
Fond clair premium, ombre douce, perspective légère
─────────────────────────────────────────────────────────────────────────────
"""

import bpy, bmesh, math, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT       = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_PNG    = os.path.join(ROOT, "public", "mockups", "print", "flyer", "flyer-premium.png")

def lin(r, g, b):
    def c(v): return ((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92
    return (c(r), c(g), c(b), 1.0)

HM_ROSE   = lin(0.694, 0.247, 0.455)   # #b13f74
HM_PURPLE = lin(0.247, 0.176, 0.345)   # #3f2d58
HM_WHITE  = lin(0.975, 0.970, 0.982)
HM_BG     = lin(0.940, 0.935, 0.950)
HM_FLOOR  = lin(0.910, 0.905, 0.920)

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

# World
world = bpy.data.worlds.new("W")
scene.world = world
world.use_nodes = True
wnt = world.node_tree; wnt.nodes.clear()
wbg = wnt.nodes.new('ShaderNodeBackground')
wbg.inputs['Color'].default_value    = HM_BG
wbg.inputs['Strength'].default_value = 0.8
wout = wnt.nodes.new('ShaderNodeOutputWorld')
wnt.links.new(wbg.outputs['Background'], wout.inputs['Surface'])

# ── Matériaux ──────────────────────────────────────────────────────────────────
def mat(name, color, rough=0.18, specular=0.5, coat=0.0):
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    ns = m.node_tree.nodes; ls = m.node_tree.links; ns.clear()
    b = ns.new('ShaderNodeBsdfPrincipled')
    b.inputs['Base Color'].default_value = color
    b.inputs['Roughness'].default_value  = rough
    try:    b.inputs['Specular IOR Level'].default_value = specular
    except: b.inputs['Specular'].default_value           = specular
    if coat > 0:
        try:
            b.inputs['Coat Weight'].default_value    = coat
            b.inputs['Coat Roughness'].default_value = 0.05
        except: pass
    o = ns.new('ShaderNodeOutputMaterial')
    ls.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

mat_white  = mat("White",  HM_WHITE,  rough=0.14, specular=0.55, coat=0.12)
mat_rose   = mat("Rose",   HM_ROSE,   rough=0.12, specular=0.65, coat=0.25)
mat_purple = mat("Purple", HM_PURPLE, rough=0.22, specular=0.45)
mat_floor  = mat("Floor",  HM_FLOOR,  rough=0.92, specular=0.02)

# ── Sol ───────────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=8.0, location=(0, 0, 0))
bpy.context.active_object.name = "Floor"
bpy.context.active_object.data.materials.append(mat_floor)

# ── Flyer BMesh : A4 210×297mm → ×5 = 1.05 × 1.485 ─────────────────────────
FW, FH, FD  = 1.05, 1.485, 0.003    # largeur, hauteur, épaisseur
BAND_W      = 0.18                   # bande colorée gauche (≈17%)

def make_flyer(name, cx, cy, cz, angle_z, mat_body, mat_band=None):
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj

    bm = bmesh.new()

    def box(x0, x1, y0, y1, z0, z1, mi=0):
        v = [bm.verts.new(p) for p in [
            (x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
            (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)
        ]]
        bm.verts.ensure_lookup_table()
        for idx in [(0,1,2,3),(4,7,6,5),(0,4,5,1),(2,6,7,3),(0,3,7,4),(1,5,6,2)]:
            f = bm.faces.new([v[i] for i in idx])
            f.material_index = mi

    has_b = mat_band is not None
    bx    = -FW/2 + BAND_W  # limite bande/corps

    # Corps
    if has_b:
        box(-FW/2, bx,   -FH/2, FH/2, 0, FD, 0)
        box(bx,    FW/2, -FH/2, FH/2, 0, FD, 0)
    else:
        box(-FW/2, FW/2, -FH/2, FH/2, 0, FD, 0)

    # Bande (légèrement au-dessus)
    if has_b:
        box(-FW/2, bx, -FH/2, FH/2, FD, FD + 0.001, 1)

    bm.to_mesh(mesh)
    bm.free()

    mesh.materials.append(mat_body)
    if has_b:
        mesh.materials.append(mat_band)

    # Bevel coins arrondis
    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width        = 0.003
    bev.segments     = 8
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(70)

    obj.location       = (cx, cy, cz)
    obj.rotation_euler = (0, 0, angle_z)
    return obj

# Flyer 2 — arrière (violet)
make_flyer("Flyer2", -0.05, -0.03, 0.000, math.radians(-8), mat_purple)
# Flyer 1 — avant (blanc + bande rose)
make_flyer("Flyer1",  0.00,  0.00, 0.006, math.radians(-4),
           mat_white, mat_band=mat_rose)

# ── Éclairage ─────────────────────────────────────────────────────────────────
def light(name, loc, rot_deg, energy, sx, sy=None, color=(1,1,1)):
    bpy.ops.object.light_add(type='AREA', location=loc)
    l = bpy.context.active_object
    l.name = name; l.data.energy = energy
    l.data.size = sx; l.data.size_y = sy or sx
    l.data.color = color
    l.rotation_euler = [math.radians(r) for r in rot_deg]

light("Key",  (-1.40, -1.00, 2.20), (45,-30, 0), 500, 1.2, 1.0, (1.00, 0.97, 0.92))
light("Fill", ( 1.50, -0.80, 1.60), (50, 28, 0), 120, 1.8, 1.8, (0.86, 0.91, 1.00))
light("Rim",  ( 0.05,  1.60, 1.40), (-38, 4, 0), 180, 0.6, 0.4, (0.96, 0.90, 1.00))
light("Kick", ( 0.10, -0.40,-0.20), (-90, 0, 0),  30, 1.0, 1.0, (1.00, 0.96, 0.96))

# ── Caméra portrait ───────────────────────────────────────────────────────────
bpy.ops.object.camera_add(location=(0.04, -3.20, 2.00))
cam = bpy.context.active_object
cam.name = "Camera"
cam.data.lens       = 85
cam.data.dof.use_dof = False
scene.camera = cam

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(-0.02, 0.0, 0.006))
tgt = bpy.context.active_object; tgt.name = "T"
ctr = cam.constraints.new('TRACK_TO')
ctr.target = tgt; ctr.track_axis = 'TRACK_NEGATIVE_Z'; ctr.up_axis = 'UP_Y'
bpy.context.view_layer.update()

print(f"\n  HM Global — flyer A4 premium  v1")
print(f"  → {OUT_PNG}\n")

bpy.ops.render.render(write_still=True)
print("✅  Terminé.")
