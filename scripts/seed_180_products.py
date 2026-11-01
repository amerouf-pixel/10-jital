import os
import re
import json
import urllib.parse
import urllib.request

SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://vuinybayqnnloaqewnsk.supabase.co")
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY") or os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
AMAZON_TAG = "10jital-21"

if not SUPABASE_KEY:
    raise SystemExit("[ERREUR] Variable SUPABASE_SECRET_KEY manquante.")

BASES = [
    ("Cosmetiques & Soins", "Sérum Vitamine C & Acide Hyaluronique", "serum vitamine c acide hyaluronique", 19.90, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"),
    ("Cosmetiques & Soins", "Essence Mucine d'Escargot Réparatrice", "mucine escargot essence visage", 21.50, "https://images.unsplash.com/photo-1608248597359-f5383a151b72?w=800&q=80"),
    ("Cosmetiques & Soins", "Masque Visage LED Luminothérapie 7 Couleurs", "masque led visage luminotherapie", 59.90, "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80"),
    ("Cosmetiques & Soins", "Brosse Nettoyante Visage Silicone Sonique", "brosse nettoyante visage sonique", 29.90, "https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80"),
    ("Cosmetiques & Soins", "Palette Maquillage Nude & Paillettes Pro", "palette fard a paupieres nude", 18.90, "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"),
    ("Cosmetiques & Soins", "Coffret Rouge à Lèvres Mat Velours", "rouge a levres mat longue tenue", 15.90, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80"),
    ("Cosmetiques & Soins", "Set Pinceaux Maquillage Professionnels", "kit pinceaux maquillage professionnel", 22.90, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"),
    ("Cosmetiques & Soins", "Rouleau Jade & Gua Sha Quartz Rose", "gua sha quartz rose visage", 14.90, "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=800&q=80"),
    ("Cosmetiques & Soins", "Crème Solaire Coréenne Invisible SPF50+", "creme solaire coreenne spf 50", 17.90, "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=800&q=80"),
    ("Cosmetiques & Soins", "Masque Purifiant Argile Rose & Charbon", "masque visage charbon argile", 16.50, "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"),
    ("Tech & Gaming", "Mini Projecteur Portable 4K WiFi Bluetooth", "mini projecteur portable 4k wifi", 69.99, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"),
    ("Tech & Gaming", "Clavier Mécanique Gaming RGB Sans Fil 75%", "clavier mecanique gaming sans fil rgb", 54.99, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"),
    ("Tech & Gaming", "Barre LED Écran PC Anti-Lumière Bleue", "barre lumineuse ecran pc", 34.90, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"),
    ("Tech & Gaming", "Station Charge Magnétique 3-en-1 Rapide", "station charge sans fil 3 en 1", 29.99, "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&q=80"),
    ("Tech & Gaming", "Casque Gaming Sans Fil Surround 7.1", "casque gaming sans fil micro", 49.90, "https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=800&q=80"),
    ("Tech & Gaming", "Souris Gaming Ultra-Légère Sans Fil 26K DPI", "souris gaming sans fil ultra legere", 44.90, "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=800&q=80"),
    ("Tech & Gaming", "Webcam Streaming Full HD 60FPS Anneau LED", "webcam 1080p 60fps streaming", 39.90, "https://images.unsplash.com/photo-1587826080692-f439cd0b70da?w=800&q=80"),
    ("Tech & Gaming", "Microphone USB Podcast Studio Condensateur", "microphone usb streaming podcast", 45.90, "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?w=800&q=80"),
    ("Maison & Cuisine", "Air Fryer Friteuse Sans Huile Double Zone 8L", "air fryer double compartiment 8l", 119.00, "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80"),
    ("Maison & Cuisine", "Mini Blender Portable Smoothies USB-C", "mini blender portable rechargeable", 24.90, "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80"),
    ("Maison & Cuisine", "Mandoline Cuisine Multifonction 14-en-1", "mandoline cuisine multifonction", 25.90, "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80"),
    ("Maison & Cuisine", "Mousseur à Lait Électrique Barista Inox", "mousseur a lait electrique", 14.90, "https://images.unsplash.com/photo-1517701604599-bb29b565090c?w=800&q=80"),
    ("Maison & Cuisine", "Humidificateur Diffuseur Huiles Essentielles Flamme", "diffuseur huiles essentielles effet flamme", 27.90, "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80"),
    ("Maison & Cuisine", "Aspirateur à Main Sans Fil Voiture & Bureau", "aspirateur a main sans fil puissant", 36.90, "https://images.unsplash.com/photo-1558317374-067fb5f30001?w=800&q=80"),
    ("Sport & Bien-être", "Pistolet de Massage Musculaire Percussion Pro", "pistolet de massage musculaire", 42.90, "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=800&q=80"),
    ("Sport & Bien-être", "Gourde Isotherme Inox 1L avec Paille Sport", "gourde isotherme inox 1l", 21.90, "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=800&q=80"),
    ("Sport & Bien-être", "Tapis Yoga Antidérapant Épais Alignement", "tapis yoga antiderapant epais", 28.90, "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=800&q=80"),
    ("Sport & Bien-être", "Montre Connectée Sport GPS Cardio Étanche", "montre connectee sport cardio", 49.90, "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&q=80"),
    ("Sport & Bien-être", "Kit Bandes Élastiques Musculation 5 Niveaux", "bandes elastiques fitness musculation", 16.90, "https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=800&q=80"),
    ("Auto & Nomade", "Support Téléphone Voiture Magnétique MagSafe", "support telephone voiture magsafe", 18.90, "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&q=80")
]

EDITIONS = [
    ("Édition Originale", "", 1.00, 99),
    ("Pack Duo Économique", "lot de 2", 1.65, 97),
    ("Version Pro Studio", "professionnel", 1.25, 96),
    ("Coffret Premium", "coffret cadeau", 1.40, 95),
    ("Format Voyage Compact", "voyage mini", 0.80, 93),
    ("Édition Intense 2026", "nouvelle generation", 1.15, 98),
]

def slugify(text):
    t = text.lower().replace("é", "e").replace("è", "e").replace("ê", "e").replace("à", "a").replace("â", "a")
    t = re.sub(r"[^a-z0-9\s-]", "", t).strip()
    return re.sub(r"[\s_-]+", "-", t)[:48]

batch = []
idx = 0
for cat, base_title, base_kw, base_price, img in BASES:
    for ed_name, ed_kw, mult, score in EDITIONS:
        idx += 1
        full_title = f"{base_title} — {ed_name}"
        full_kw = f"{base_kw} {ed_kw}".strip()
        slug = f"{slugify(base_title)}-{idx}"
        aff_url = f"https://www.amazon.fr/s?k={urllib.parse.quote_plus(full_kw)}&tag={AMAZON_TAG}"
        batch.append({
            "slug": slug,
            "title": full_title,
            "description": f"Sélection virale 10JITAL ({cat}) : {full_title}. Tendance vérifiée avec lien direct partenaire Amazon.",
            "category": cat,
            "image_url": img,
            "price_amount": round(base_price * mult, 2),
            "currency_origin": "EUR",
            "affiliate_url": aff_url,
            "affiliate_network": "Amazon",
            "commission_rate": 8.5,
            "viral_score": score,
            "hooks": [f"Pépite virale #{idx} : {full_title}"],
            "target_countries": ["FR", "BE", "MA"],
            "in_stock": True,
            "status": "active"
        })

headers = {
    "apikey": SUPABASE_KEY,
    "Authorization": f"Bearer {SUPABASE_KEY}",
    "Content-Type": "application/json",
    "Prefer": "return=minimal,resolution=merge-duplicates"
}

print(f"Envoi de {len(batch)} produits en lots vers Supabase...")
inserted = 0
for i in range(0, len(batch), 50):
    chunk = batch[i:i+50]
    req = urllib.request.Request(
        f"{SUPABASE_URL}/rest/v1/products?on_conflict=slug",
        data=json.dumps(chunk).encode("utf-8"),
        headers=headers,
        method="POST"
    )
    try:
        urllib.request.urlopen(req, timeout=20)
        inserted += len(chunk)
        print(f"  [OK] Lot injecté ({inserted}/{len(batch)})")
    except Exception as e:
        body = e.read().decode("utf-8", errors="ignore") if hasattr(e, "read") else str(e)
        print(f"  [ERREUR SUPABASE] {body}")
        raise SystemExit(1)

print(f"[SUCCES TOTAL] {inserted} produits actifs dans Supabase !")