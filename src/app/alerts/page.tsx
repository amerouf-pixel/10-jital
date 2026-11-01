import { DEMO_PRICE_ALERTS } from "@/lib/demo-data";
import { formatAmount } from "@/lib/currency";

export default function Alerts() {
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Mes alertes de prix</h1>
            <p className="text-gray-600">
              Recevez une notification quand un produit atteint votre prix cible.
              Données de démonstration uniquement.
            </p>
          </div>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors">
            + Nouvelle alerte
          </button>
        </div>

        <div className="space-y-4">
          {DEMO_PRICE_ALERTS.map((alert) => (
            <div
              key={alert.id}
              className="bg-white rounded-xl border border-gray-100 p-6 flex items-center justify-between"
            >
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 mb-1">{alert.productName}</h3>
                <p className="text-sm text-gray-500 mb-3">
                  Prix cible :{" "}
                  <span className="font-semibold text-gray-900">
                    {formatAmount(alert.targetPrice, alert.currency)}
                  </span>{" "}
                  | Prix actuel :{" "}
                  <span className="font-semibold text-gray-900">
                    {formatAmount(alert.currentPrice, alert.currency)}
                  </span>
                </p>
                <div className="flex items-center gap-2 text-xs">
                  <span className={`px-2 py-0.5 rounded-full ${
                    alert.active ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-600"
                  }`}>
                    {alert.active ? "Active" : "Inactive"}
                  </span>
                  <span className="text-gray-400">{alert.createdAt}</span>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 rounded-lg transition-colors">
                  Modifier
                </button>
                <button className="px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>⚠️ Données de démonstration — aucune alerte réelle n'est envoyée.</p>
        </div>
      </div>
    </div>
  );
}