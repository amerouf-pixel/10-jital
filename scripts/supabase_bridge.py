import os
import re
import json
from pathlib import Path
from typing import Dict, Any
from dotenv import load_dotenv

ROOT_DIR = Path(__file__).resolve().parent.parent
load_dotenv(ROOT_DIR / ".env.local")

SUPABASE_URL = os.getenv("NEXT_PUBLIC_SUPABASE_URL", "").strip().rstrip("/")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "").strip()
LOCAL_DB_PATH = ROOT_DIR / "data" / "viral_products.json"

def slugify(text: str) -> str:
    slug = text.lower().strip()
    slug = re.sub(r"[^a-z0-9\s-]", "", slug)
    slug = re.sub(r"[\s-]+", "-", slug)
    return slug

def _save_local(record: Dict[str, Any]) -> Dict[str, Any]:
    LOCAL_DB_PATH.parent.mkdir(parents=True, exist_ok=True)
    items = []
    if LOCAL_DB_PATH.exists():
        try:
            items = json.loads(LOCAL_DB_PATH.read_text(encoding="utf-8"))
        except Exception:
            items = []
    items = [x for x in items if x.get("slug") != record.get("slug")]
    items.append(record)
    items.sort(key=lambda x: x.get("viral_score", 0), reverse=True)
    LOCAL_DB_PATH.write_text(json.dumps(items, indent=2, ensure_ascii=False), encoding="utf-8")
    return record

def upsert_viral_product(data: Dict[str, Any]) -> Dict[str, Any]:
    slug = slugify(data.get("slug") or data.get("title", "product"))
    local_record = {
        **data,
        "id": f"local-{slug}",
        "slug": slug,
        "bridge_url": f"/go/{slug}",
    }
    _save_local(local_record)

    if not SUPABASE_URL.startswith("http") or not SUPABASE_SERVICE_KEY:
        return local_record

    try:
        from supabase import create_client
        supabase = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        resp = supabase.table("products").upsert(data, on_conflict="slug").execute()
        return {**resp.data[0], "bridge_url": f"/go/{slug}"} if resp.data else local_record
    except Exception as exc:
        print(f"[WARN] Erreur Supabase upsert ({exc}) -> sauvegarde dans data/viral_products.json")
        return local_record

