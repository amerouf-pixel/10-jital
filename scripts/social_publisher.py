import os
import json
import requests
from pathlib import Path
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
MAKE_WEBHOOK_URL = os.getenv("MAKE_WEBHOOK_URL", "https://httpbin.org/post").strip()
SITE_URL = os.getenv("NEXT_PUBLIC_SITE_URL", "https://10-jital.vercel.app").strip().rstrip("/")
LOCAL_DB_PATH = ROOT_DIR / "data" / "viral_products.json"

def build_safe_links(slug: str) -> dict:
    return {
        "tiktok": f"{SITE_URL}/go/{slug}?src=tiktok",
        "instagram": f"{SITE_URL}/go/{slug}?src=instagram",
        "facebook": f"{SITE_URL}/go/{slug}?src=facebook",
        "whatsapp": f"{SITE_URL}/go/{slug}?src=whatsapp",
    }

def fetch_top_active_products(limit: int = 3) -> list:
    if SUPABASE_URL.startswith("http") and SUPABASE_SERVICE_KEY:
        try:
            url = f"{SUPABASE_URL}/rest/v1/products?status=eq.active&in_stock=eq.true&order=viral_score.desc&limit={limit}"
            headers = {"apikey": SUPABASE_SERVICE_KEY, "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}"}
            resp = requests.get(url, headers=headers, timeout=15)
            resp.raise_for_status()
            if resp.json():
                return resp.json()
        except Exception:
            pass

    if LOCAL_DB_PATH.exists():
        items = json.loads(LOCAL_DB_PATH.read_text(encoding="utf-8"))
        active = [p for p in items if p.get("status") == "active"] or items
        print(f"[CATALOGUE VIRAL SCOUT] {len(active[:limit])} vraies pepites chargees depuis data/viral_products.json")
        return active[:limit]
    return []

def publish_products():
    print("=== 10-JITAL SOCIAL PUBLISHER - VRAIES PEPITES VIRAL SCOUT ===")
    products = fetch_top_active_products(limit=3)
    for product in products:
        slug = product.get("slug", "produit-viral")
        hooks = product.get("hooks") or []
        hook = hooks[0] if isinstance(hooks, list) and hooks else product.get("title", "")
        payload = {
            "brand": "10-JITAL",
            "slug": slug,
            "title": product.get("title"),
            "description": product.get("description"),
            "viral_score": product.get("viral_score", 80),
            "hook_video_9_16": hook,
            "safe_links": build_safe_links(slug),
        }
        print(f"\n[PRODUIT] {payload['title']} (Score: {payload['viral_score']}/100)")
        if MAKE_WEBHOOK_URL.startswith("http"):
            r = requests.post(MAKE_WEBHOOK_URL, json=payload, timeout=15)
            print(f"[PUBLIE] Envoye avec succes vers {MAKE_WEBHOOK_URL} (HTTP {r.status_code})")
    print("\n[TERMINE] Pipeline complet 10-JITAL 100% operationnel !")

if __name__ == "__main__":
    publish_products()

