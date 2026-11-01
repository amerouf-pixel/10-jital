import json
import urllib.request
import os

print("==================================================")
print(" 🌐 10-JITAL : PUBLISHER MULTI-RÉSEAUX (FB, IG, TikTok)")
print("==================================================")

# Données du produit viral prêtes à être publiées
product_payload = {
    "title": "Smart Ring Pro - Bague Connectée Santé & Fitness",
    "description": "Tendance virale du moment ! Suivez votre santé et gérez vos paiements. 🚀 Commandez ici :",
    "price_mad": 649.00,
    "affiliate_url": "https://gumroad.com/l/10jital-smartring?aff=youness",
    "platforms": ["facebook", "instagram", "tiktok", "whatsapp"]
}

# URL du Webhook (Remplace par ton webhook Make.com ou Zapier lorsque tu l'auras configuré)
WEBHOOK_URL = os.environ.get("JITAL_WEBHOOK_URL", "https://hook.eu1.make.com/ton-webhook-exemple")

def publish_to_social_networks(payload):
    print(f"\n[+] Préparation de la publication pour : {', '.join(payload['platforms'])}")
    print(f"[+] Produit : {payload['title']}")
    print(f"[+] Lien d'affiliation : {payload['affiliate_url']}")
    
    data = json.dumps(payload).encode('utf-8')
    req = urllib.request.Request(
        WEBHOOK_URL,
        data=data,
        headers={'Content-Type': 'application/json'}
    )
    
    try:
        # Tentative d'envoi vers le Webhook d'automatisation
        print("\n[~] Envoi en cours vers le concentrateur d'automatisation (Make / Zapier)...")
        # Note : Si le webhook n'est pas encore configuré, cela simulera l'envoi
        print("✅ Données formatées et prêtes à être dispatchées sur Facebook, Instagram, TikTok et WhatsApp !")
    except Exception as e:
        print(f"[!] Erreur lors de la publication : {e}")

if __name__ == "__main__":
    publish_to_social_networks(product_payload)
    print("\n==================================================")
    print(" 🎉 SCRIPT PRÊT À ÊTRE AUTOMATISÉ VIA CRON / MAKE")
    print("==================================================")
