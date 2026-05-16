"""
scripts/blender/business-card.py
─────────────────────────────────────────────────────────────────────────────
HM Global Agence — Mockup carte de visite premium v9
Blender 5.x headless

v9 :
  - Pillow génère une face imprimée (texte + stripe + branding HM Global)
  - UV mapping de la face +Z de Card1 sur cette image
  - Caméra repositionnée pour voir clairement la face de la carte
  - Contraste renforcé, fond plus gris chaud
─────────────────────────────────────────────────────────────────────────────
"""

import bpy, bmesh, math, os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT       = os.path.abspath(os.path.join(SCRIPT_DIR, "..", ".."))
OUT_PNG    = os.path.join(ROOT, "public", "mockups", "print", "business-card", "carte-visite-premium.png")
FACE_PNG   = "/tmp/hm_card_face_v9.png"

if not os.path.exists(FACE_PNG):
    raise FileNotFoundError(f"Card face image not found: {FACE_PNG}\nRun generate_card_face.py first.")

# ═══════════════════════════════════════════════════════════════════════════
# ÉTAPE 2 — Blender : scène 3D avec UV texture sur Card1
# ═══════════════════════════════════════════════════════════════════════════

def lin(r, g, b):
    def c(v): return ((v + 0.055) / 1.055) ** 2.4 if v > 0.04045 else v / 12.92
    return (c(r), c(g), c(b), 1.0)

HM_ROSE    = lin(0.694, 0.247, 0.455)
HM_PURPLE  = lin(0.247, 0.176, 0.345)
HM_BG      = lin(0.910, 0.905, 0.920)   # fond gris chaud légèrement plus foncé
HM_FLOOR   = lin(0.885, 0.880, 0.895)   # sol encore un peu plus sombre → contraste

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

scene.render.engine                      = 'CYCLES'
scene.cycles.samples                     = 160
scene.cycles.use_denoising               = True
scene.cycles.denoiser                    = 'OPENIMAGEDENOISE'
scene.render.resolution_x                = 1600
scene.render.resolution_y                = 1000
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

# ── Matériaux ──────────────────────────────────────────────────────────────────
def solid_mat(name, color, rough=0.22, specular=0.40, coat=0.0):
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
            b.inputs['Coat Roughness'].default_value = 0.06
        except: pass
    o = ns.new('ShaderNodeOutputMaterial')
    ls.new(b.outputs['BSDF'], o.inputs['Surface'])
    return m

def textured_mat(name, img_path, rough=0.10, specular=0.55, coat=0.30):
    """Matériau avec image texture sur la face UV-mappée."""
    m = bpy.data.materials.new(name)
    m.use_nodes = True
    ns = m.node_tree.nodes; ls = m.node_tree.links; ns.clear()

    b   = ns.new('ShaderNodeBsdfPrincipled')
    b.inputs['Roughness'].default_value  = rough
    try:    b.inputs['Specular IOR Level'].default_value = specular
    except: b.inputs['Specular'].default_value           = specular
    if coat > 0:
        try:
            b.inputs['Coat Weight'].default_value    = coat
            b.inputs['Coat Roughness'].default_value = 0.06
        except: pass

    tex = ns.new('ShaderNodeTexImage')
    tex.image = bpy.data.images.load(img_path)
    tex.image.colorspace_settings.name = 'sRGB'

    uv  = ns.new('ShaderNodeUVMap')
    uv.uv_map = "UVMap"

    o   = ns.new('ShaderNodeOutputMaterial')
    ls.new(uv.outputs['UV'],      tex.inputs['Vector'])
    ls.new(tex.outputs['Color'],  b.inputs['Base Color'])
    ls.new(b.outputs['BSDF'],     o.inputs['Surface'])
    return m

mat_card1   = textured_mat("Card1Mat", FACE_PNG)
mat_rose    = solid_mat("Rose",   HM_ROSE,   rough=0.18, specular=0.55, coat=0.20)
mat_purple  = solid_mat("Purple", HM_PURPLE, rough=0.28, specular=0.38)
mat_floor   = solid_mat("Floor",  HM_FLOOR,  rough=0.94, specular=0.02)

# ── Sol ───────────────────────────────────────────────────────────────────────
bpy.ops.mesh.primitive_plane_add(size=6.0, location=(0, 0, 0))
bpy.context.active_object.name = "Floor"
bpy.context.active_object.data.materials.append(mat_floor)

# ── Dimensions carte de visite 85×55mm → ×10 ─────────────────────────────────
CW, CH, CD = 0.85, 0.55, 0.004

def make_card_textured(name, cx, cy, cz, angle_z):
    """Carte avec UV mapping sur la face supérieure (+Z)."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj

    bm = bmesh.new()
    uv_layer = bm.loops.layers.uv.new("UVMap")

    # Boîte simple
    x0, x1 = -CW/2, CW/2
    y0, y1 = -CH/2, CH/2
    z0, z1 = 0.0,   CD

    verts = [
        bm.verts.new((x0, y0, z0)),  # 0 BLbot
        bm.verts.new((x1, y0, z0)),  # 1 BRbot
        bm.verts.new((x1, y1, z0)),  # 2 FRbot
        bm.verts.new((x0, y1, z0)),  # 3 FLbot
        bm.verts.new((x0, y0, z1)),  # 4 BLtop
        bm.verts.new((x1, y0, z1)),  # 5 BRtop
        bm.verts.new((x1, y1, z1)),  # 6 FRtop
        bm.verts.new((x0, y1, z1)),  # 7 FLtop
    ]
    bm.verts.ensure_lookup_table()

    # Faces : (indices des verts, uvs correspondants)
    # UV convention : U=0 gauche (−X), U=1 droite (+X), V=0 bas (−Y), V=1 haut (+Y)
    face_defs = [
        # bottom
        ([0,1,2,3], [(0,1),(1,1),(1,0),(0,0)]),
        # top (+Z) — FACE PRINCIPALE avec texture
        ([4,7,6,5], [(0,0),(0,1),(1,1),(1,0)]),
        # front (−Y, near camera)
        ([0,4,5,1], [(0,0),(0,1),(1,1),(1,0)]),
        # back (+Y)
        ([2,6,7,3], [(1,0),(1,1),(0,1),(0,0)]),
        # left (−X)
        ([0,3,7,4], [(1,0),(0,0),(0,1),(1,1)]),
        # right (+X)
        ([1,5,6,2], [(0,0),(1,0),(1,1),(0,1)]),
    ]

    for v_idx, uvs in face_defs:
        f = bm.faces.new([verts[i] for i in v_idx])
        for loop, uv in zip(f.loops, uvs):
            loop[uv_layer].uv = uv

    bm.normal_update()
    bm.to_mesh(mesh)
    bm.free()

    mesh.materials.append(mat_card1)

    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width        = 0.003
    bev.segments     = 8
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(70)

    obj.location       = (cx, cy, cz)
    obj.rotation_euler = (0, 0, angle_z)
    return obj

def make_card_solid(name, cx, cy, cz, angle_z, material):
    """Carte simple sans texture."""
    mesh = bpy.data.meshes.new(name + "_mesh")
    obj  = bpy.data.objects.new(name, mesh)
    bpy.context.collection.objects.link(obj)
    bpy.context.view_layer.objects.active = obj

    bm = bmesh.new()
    x0, x1 = -CW/2, CW/2
    y0, y1 = -CH/2, CH/2
    z0, z1 = 0.0, CD

    verts = [bm.verts.new(p) for p in [
        (x0,y0,z0),(x1,y0,z0),(x1,y1,z0),(x0,y1,z0),
        (x0,y0,z1),(x1,y0,z1),(x1,y1,z1),(x0,y1,z1)
    ]]
    bm.verts.ensure_lookup_table()
    for idx in [(0,1,2,3),(4,7,6,5),(0,4,5,1),(2,6,7,3),(0,3,7,4),(1,5,6,2)]:
        bm.faces.new([verts[i] for i in idx])

    bm.to_mesh(mesh)
    bm.free()
    mesh.materials.append(material)

    bev = obj.modifiers.new("Bevel", 'BEVEL')
    bev.width        = 0.003
    bev.segments     = 8
    bev.limit_method = 'ANGLE'
    bev.angle_limit  = math.radians(70)

    obj.location       = (cx, cy, cz)
    obj.rotation_euler = (0, 0, angle_z)
    return obj

# Pile de 3 cartes
make_card_solid   ("Card3", -0.09, -0.05, 0.000, math.radians(-18), mat_purple)
make_card_solid   ("Card2", -0.045,-0.025, 0.006, math.radians(-11), mat_rose)
make_card_textured("Card1",  0.00,  0.00,  0.012, math.radians(-3))

# ── Éclairage ─────────────────────────────────────────────────────────────────
def light(name, loc, rot_deg, energy, sx, sy=None, color=(1,1,1)):
    bpy.ops.object.light_add(type='AREA', location=loc)
    l = bpy.context.active_object
    l.name = name; l.data.energy = energy
    l.data.size = sx; l.data.size_y = sy or sx
    l.data.color = color
    l.rotation_euler = [math.radians(r) for r in rot_deg]

# Éclairage plus contrasté : Key plus puissante, fond moins illuminé
light("Key",  (-1.20, -0.90, 1.80), (50,-30, 0), 450, 1.0, 0.8, (1.00, 0.97, 0.92))
light("Fill", ( 1.30, -0.70, 1.20), (54, 28, 0), 110, 1.4, 1.4, (0.86, 0.91, 1.00))
light("Rim",  ( 0.05,  1.30, 1.00), (-40, 4, 0), 140, 0.5, 0.3, (0.96, 0.90, 1.00))
light("Kick", ( 0.10, -0.35,-0.15), (-90, 0, 0),  22, 0.8, 0.8, (1.00, 0.96, 0.96))

# ── Caméra repositionnée pour voir clairement la face +Z ─────────────────────
# Angle ~45° de la verticale → la face de la carte bien visible
bpy.ops.object.camera_add(location=(0.0, -0.80, 2.60))
cam = bpy.context.active_object
cam.name = "Camera"
cam.data.lens        = 65
cam.data.dof.use_dof = False
scene.camera = cam

bpy.ops.object.empty_add(type='PLAIN_AXES', location=(0.0, 0.10, 0.010))
tgt = bpy.context.active_object; tgt.name = "T"
ctr = cam.constraints.new('TRACK_TO')
ctr.target = tgt; ctr.track_axis = 'TRACK_NEGATIVE_Z'; ctr.up_axis = 'UP_Y'
bpy.context.view_layer.update()

print(f"\n  HM Global — carte de visite premium v9")
print(f"  → {OUT_PNG}\n")

bpy.ops.render.render(write_still=True)
print("✅  Terminé.")
