import os
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
        "Prefer": "return=representation,resolution=merge-duplicates"
    }

# Catalogue complet multi-niches (Cosmétiques, Tech, Gaming, Maison)
PRODUCTS = [
    ("Sérum Visage Hydratant Vitamine C", "serum visage vitamine c", 24.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"),
    ("Palette de Fards à Paupières Nude Pro", "palette maquillage yeux nude", 19.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"),
    ("Rouge à Lèvres Mat Velours Longue Tenue", "rouge a levres mat", 14.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80"),
    ("Kit Pinceaux Maquillage Professionnel 14 PCS", "kit pinceaux maquillage pro", 22.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"),
    ("Masque Purifiant Visage au Charbon Actif", "masque visage charbon actif", 17.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1571781926291-c477ebfd024b?w=800&q=80"),
    ("Huile Sèche Nourrissante Corps & Cheveux Pailletée", "huile seche pailletee corps", 29.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1608248597359-f5383a151b72?w=800&q=80"),
    ("Mini Projecteur Portable 4K WiFi 6", "mini projecteur portable 4k", 69.99, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"),
    ("Clavier Mécanique Gaming Sans Fil RGB 75%", "clavier mecanique gaming sans fil", 54.90, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80"),
    ("Barre Lumineuse Écran PC Anti-Reflet LED", "barre lumineuse ecran pc led", 34.99, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80"),
    ("Station de Charge Sans Fil 3-en-1 Magnétique", "station de charge sans fil 3 en 1", 29.99, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&q=80"),
    ("Friteuse Sans Huile Air Fryer XXL 8L Double Zone", "air fryer double compartiment 8l", 119.99, "Cuisine & Maison", "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80"),
    ("Mini Blender Portable Rechargeable USB-C", "mini blender portable usb", 22.99, "Cuisine & Maison", "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80")
]

def main():
    print("Début de l'injection complète dans Supabase...")
    success_count = 0
    
    for title, kw, price, cat, img in PRODUCTS:
        slug = title.lower().replace(" ", "-").replace("&", "et").replace("é", "e").replace("è", "e").replace("ê", "e")[:40] + f"-{success_count}"
        affiliate_url = f"https://www.amazon.fr/s?k={urllib.parse.quote_plus(kw)}&tag={AMAZON_TAG}"
        
        payload = {
            "slug": slug,
            "title": title,
            "description": f"Produit phare sélectionné par le détecteur de niches 10JITAL dans la catégorie {cat}.",
            "category": cat,
            "image_url": img,
            "price_amount": price,
            "currency_origin": "EUR",
            "affiliate_url": affiliate_url,
            "affiliate_network": "Amazon",
            "commission_rate": 8.5,
            "viral_score": 96,
            "hooks": [f"Découvrez la tendance : {title} !"],
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
            success_count += 1
            print(f"  [SUCCES] Ajouté : {title}")
        except Exception as e:
            print(f"  [ERREUR] {title} : {e}")

    print(f"\n[SYNCHRO TERMINEE] {success_count} produits en ligne dans Supabase !")

if __name__ == "__main__":
    main()

