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

ITEMS = [
    ("Sérum Visage Hydratant Vitamine C", "serum visage vitamine c", 24.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=800&q=80"),
    ("Palette de Fards à Paupières Nude", "palette maquillage yeux nude", 19.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=800&q=80"),
    ("Rouge à Lèvres Mat Velours", "rouge a levres mat", 14.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=800&q=80"),
    ("Kit Pinceaux Maquillage Pro", "kit pinceaux maquillage pro", 22.99, "Cosmetiques & Soins", "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80"),
    ("Mini Projecteur Portable 4K", "mini projecteur portable 4k", 69.99, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80"),
    ("Clavier Mécanique Gaming RGB", "clavier mecanique gaming sans fil", 54.90, "Tech & Setup Gaming", "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80")
]

def main():
    print("Vérification et insertion directe dans la base Supabase...")
    for title, kw, price, cat, img in ITEMS:
        slug = title.lower().replace(" ", "-").replace("&", "et")[:40]
        url = f"https://www.amazon.fr/s?k={urllib.parse.quote_plus(kw)}&tag={AMAZON_TAG}"
        
        payload = {
            "slug": slug,
            "title": title,
            "description": f"Produit vedette de la catégorie {cat}, sélectionné pour votre boutique 10JITAL.",
            "category": cat,
            "image_url": img,
            "price_amount": price,
            "currency_origin": "EUR",
            "affiliate_url": url,
            "affiliate_network": "Amazon",
            "commission_rate": 8.0,
            "viral_score": 95,
            "hooks": [f"Offre exclusive {title}"],
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
            res = urllib.request.urlopen(req, timeout=10)
            print(f" [OK] Inséré : {title}")
        except Exception as e:
            print(f" [ERREUR] {title} : {e}")

if __name__ == "__main__":
    main()

