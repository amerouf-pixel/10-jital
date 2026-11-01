import os
import re
import json
import urllib.parse
import urllib.request

SUPABASE_URL = "https://vuinybayqnnloaqewnsk.supabase.co"
SUPABASE_KEY = os.environ.get("SUPABASE_SECRET_KEY")
AMAZON_TAG = "10jital-21"

def supa_headers():
    return {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal,resolution=merge-duplicates"
    }

CATEGORIES = {
    "Cosmetiques & Soins": [
        ("Sérum Visage Hydratant Vitamine C & Acide Hyaluronique", "serum visage vitamine c", 24.99, "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"),
        ("Palette de Fards à Paupières Nude Pro", "palette maquillage yeux nude", 19.99, "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"),
        ("Rouge à Lèvres Mat Velours Longue Tenue", "rouge a levres mat longue tenue", 14.99, "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80"),
        ("Kit de Pinceaux Maquillage Professionnel", "kit pinceaux maquillage pro", 22.99, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"),
        ("Masque Purifiant Visage au Charbon Actif", "masque visage charbon actif", 17.99, "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"),
        ("Huile Sèche Nourrissante Corps & Cheveux", "huile seche pailletee corps cheveux", 29.99, "https://images.unsplash.com/photo-1608248597359-f5383a151b72?w=800&q=80")
    ],
    "Tech & Setup Gaming": [
        ("Mini Projecteur Portable 4K WiFi 6", "mini projecteur portable 4k wifi", 69.99, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"),
        ("Clavier Mécanique Gaming Sans Fil RGB 75%", "clavier mecanique gaming sans fil", 54.90, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"),
        ("Barre Lumineuse Écran PC Anti-Reflet LED", "barre lumineuse ecran pc led", 34.99, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80")
    ]
}

def slugify(text):
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text.lower()).strip()
    return re.sub(r"[\s_-]+", "-", text)[:50]

def main():
    print("[IA AGENT] Lancement de l'injection massive...")
    total_injected = 0
    
    for category, items in CATEGORIES.items():
        for base_title, kw, price, img in items:
            for variant_id in range(1, 4):
                suffix = f"Pro v{variant_id}" if variant_id > 1 else ""
                title = f"{base_title} {suffix}".strip()
                score = 90 + (variant_id * 3) % 10
                slug = slugify(title) + f"-{variant_id}-{score}"
                affiliate_link = f"https://www.amazon.fr/s?k={urllib.parse.quote_plus(kw)}&tag={AMAZON_TAG}"
                
                payload = {
                    "slug": slug,
                    "title": title,
                    "description": f"Produit tendance sélectionné par l'agent IA 10JITAL dans la catégorie {category}.",
                    "category": category,
                    "image_url": img,
                    "price_amount": price * (1 + (variant_id * 0.05)),
                    "currency_origin": "EUR",
                    "affiliate_url": affiliate_link,
                    "affiliate_network": "Amazon",
                    "commission_rate": 8.5,
                    "viral_score": score,
                    "hooks": [f"Tendance virale : {title} !"],
                    "target_countries": ["FR", "MA"],
                    "in_stock": True,
                    "status": "active"
                }
                
                req = urllib.request.Request(
                    f"{SUPABASE_URL}/rest/v1/products",
                    data=json.dumps(payload).encode("utf-8"),
                    headers=supa_headers(),
                    method="POST"
                )
                try:
                    urllib.request.urlopen(req, timeout=10)
                    total_injected += 1
                    print(f"  [SUCCES] ({total_injected}) {title}")
                except Exception:
                    pass

    print(f"\n[TERMINE] {total_injected} produits injectés dans Supabase.")

if __name__ == "__main__":
    main()
