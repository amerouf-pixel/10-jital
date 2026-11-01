import os
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

url = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip()
key = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()

print("=== Test de chargement des variables d'environnement ===")
print(f"Fichier .env.local lu : {(ROOT_DIR / '.env.local').exists()}")
print(f"NEXT_PUBLIC_SUPABASE_URL : {'DÉFINIE' if url else 'ABSENTE OU VIDE'} -> {url[:60]}{'...' if len(url) > 60 else ''}")
print(f"SUPABASE_SERVICE_ROLE_KEY : {'DÉFINIE' if key else 'ABSENTE OU VIDE'} -> {'*' * len(key) if key else ''}")

if not url:
    print("\n❌ ERREUR : NEXT_PUBLIC_SUPABASE_URL est manquante ou vide.")
elif not url.startswith("https://"):
    print("\n❌ ERREUR : NEXT_PUBLIC_SUPABASE_URL ne commence pas par https://")
elif not key:
    print("\n❌ ERREUR : SUPABASE_SERVICE_ROLE_KEY est manquante ou vide.")
else:
    print("\n✅ Les deux variables sont présentes et correctement chargées.")
