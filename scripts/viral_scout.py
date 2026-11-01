import os
import re
import json
import urllib.parse
import urllib.request
from pathlib import Path

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

CATALOG = [
    ("Mini Projecteur Portable 4K WiFi 6 Bluetooth", "mini projecteur portable 4k wifi bluetooth", "Transformez votre mur en ecran cinema 130 pouces.", 69.99, 97, "https://images.unsplash.com/photo-1593305841991-05c297ba4575?w=800&q=80", "Tech & Setup Gaming"),
    ("Clavier Mecanique Gaming Sans Fil RGB 75%", "clavier mecanique gaming sans fil rgb", "Switches reactifs silencieux et retroeclairage RGB.", 54.90, 95, "https://images.unsplash.com/photo-1595225476474-87563907a212?w=800&q=80", "Tech & Setup Gaming"),
    ("Barre Lumineuse Ecran PC Anti-Reflet LED", "barre lumineuse ecran pc led usb", "Eclaire votre setup sans reflet sur l'ecran.", 34.99, 92, "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&q=80", "Tech & Setup Gaming"),
    ("Station de Charge Sans Fil 3-en-1 Magnetique", "station de charge sans fil 3 en 1 magnetique", "Recharge rapide simultanee pour smartphone et accessoires.", 29.99, 94, "https://images.unsplash.com/photo-1586816879360-004f5b0c51e3?w=800&q=80", "Tech & Setup Gaming"),
    ("Ruban LED RGBIC 10m Synchronisation Musicale", "ruban led rgbic 10m wifi musique", "Effets multicolores dynamiques pilotables par application.", 24.99, 96, "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80", "Maison Intelligente & LED"),
    ("Lampe Coucher de Soleil Projection HD 16 Couleurs", "lampe coucher de soleil led telecommande", "Cree une ambiance chaleureuse instantanee.", 16.99, 91, "https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?w=800&q=80", "Maison Intelligente & LED"),
    ("Diffuseur Huiles Essentielles Effet Flamme Volcan", "diffuseur huiles essentielles effet flamme", "Brume relaxante combinee a un jeu de lumiere.", 27.99, 98, "https://images.unsplash.com/photo-1602928321679-560bb453f190?w=800&q=80", "Maison Intelligente & LED"),
    ("Friteuse Sans Huile Air Fryer XXL 8L Double Zone", "air fryer double compartiment 8l", "Cuisson croustillante avec 85% de matiere grasse en moins.", 119.99, 99, "https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?w=800&q=80", "Cuisine & Gadgets Viraux"),
    ("Mini Blender Portable Rechargeable USB-C Smoothies", "mini blender portable usb rechargeable", "Preparez vos smoothies frais en 30 secondes.", 22.99, 93, "https://images.unsplash.com/photo-1570197788417-0e82375c9371?w=800&q=80", "Cuisine & Gadgets Viraux"),
    ("Decoupe-Legumes Multifonction Mandoline 14-en-1", "mandoline cuisine multifonction coupe legumes", "Gagnez un temps record en cuisine.", 25.99, 96, "https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=800&q=80", "Cuisine & Gadgets Viraux"),
    ("Aspirateur Voiture Sans Fil Haute Puissance", "aspirateur voiture sans fil puissant", "Aspire poussieres et miettes dans les moindres recoins.", 35.99, 95, "https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?w=800&q=80", "Auto & Accessoires Moto"),
    ("Adaptateur CarPlay & Android Auto Sans Fil", "adaptateur carplay sans fil usb", "Convertit votre CarPlay filaire en 100% sans fil.", 39.99, 98, "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800&q=80", "Auto & Accessoires Moto"),
    ("Brosse Soufflante Chauffante 5-en-1 Coiffure Salon", "brosse soufflante rotative 5 en 1 cheveux", "Seche, boucle et lisse simultanement.", 49.99, 97, "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80", "Beaute & Bien-etre"),
    ("Masque Visage Luminotherapie LED 7 Couleurs", "masque led visage luminotherapie", "Soin complet a domicile pour eclat du teint.", 59.99, 93, "https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=800&q=80", "Beaute & Bien-etre"),
    ("Pistolet de Massage Musculaire Percussion", "pistolet de massage musculaire pro", "Recuperation sportive rapide avec 30 vitesses.", 39.99, 96, "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&q=80", "Sport & Fitness Maison"),
    ("Tapis de Marche Pliable Sous Bureau Compact", "tapis de marche pliable bureau plat", "Restez actif en travaillant chez vous.", 179.99, 95, "https://images.unsplash.com/photo-1576678927484-cc907957088c?w=800&q=80", "Sport & Fitness Maison")
]

def slugify(text):
    text = re.sub(r"[^a-zA-Z0-9\s-]", "", text.lower()).strip()
    return re.sub(r"[\s_-]+", "-", text)[:50]

def main():
    print("Injection directe dans la table 'products'...")
    ok = 0
    for title, kw, desc, price_eur, score, img, cat in CATALOG:
        slug = slugify(title) + "-" + str(score)
        amz_url = f"https://www.amazon.fr/s?k={urllib.parse.quote_plus(kw)}&tag={AMAZON_TAG}"
        
        payload = {
            "slug": slug,
            "title": title,
            "description": desc,
            "category": cat,
            "image_url": img,
            "price_amount": price_eur,
            "currency_origin": "EUR",
            "affiliate_url": amz_url,
            "affiliate_network": "Amazon",
            "commission_rate": 8.0,
            "viral_score": score,
            "hooks": [f"Decouvrez {title} sur Amazon !"],
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
            ok += 1
            print(f"  [SUCCES] {title}")
        except Exception as e:
            err = e.read().decode('utf-8', errors='ignore') if hasattr(e, 'read') else str(e)
            print(f"  [INFO] {title} : {err[:120]}")
            
    print(f"\nTermine ! {ok} produits injectes avec succes dans 'products'.")

if __name__ == "__main__":
    main()
