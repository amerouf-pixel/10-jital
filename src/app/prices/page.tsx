import Link from "next/link";
import { DEMO_PRODUCTS } from "@/lib/demo-data";
import {
  formatAmount,
  DEFAULT_CURRENCY,
  convertAmount,
  type CurrencyCode,
} from "@/lib/currency";
import { getPriceStatus } from "@/lib/price-observation";

/**
 * 10-JITAL — Page Suivi des prix
 *
 * Affiche les produits (référence démo) ainsi que, quand disponible, la
 * dernière observation de prix réelle et son état de vérification.
 * Distingue clairement les données de démonstration des observations réelles.
 * Aucun faux prix ni fausse promotion n'est affiché.
 */

function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RealPriceLine({
  status,
}: {
  status: {
    currentPrice: number | null;
    currentCurrency: string | null;
    lastChecked: string | null;
    isVerified: boolean;
    sourceName: string | null;
    message: string;
  };
}) {
  const realPrice =
    status.currentPrice !== null && status.currentCurrency
      ? convertAmount(
          status.currentPrice,
          status.currentCurrency as CurrencyCode,
          DEFAULT_CURRENCY
        )
      : null;

  if (status.currentPrice === null) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-gray-500">
          Prix non vérifié
        </span>
        <span className="text-xs text-gray-400 italic">{status.message}</span>
      </div>
    );
  }

  return (
    <div className="pt-3 border-t border-gray-100">
      <div className="flex items-end gap-2 mb-1">
        <span className="text-2xl font-bold text-gray-900">
          {formatAmount(realPrice!, DEFAULT_CURRENCY)}
        </span>
        <span className="text-xs text-gray-400">/ unité</span>
        <span
          className={`px-2 py-0.5 rounded text-xs font-medium ${
            status.isVerified
              ? "bg-green-900/30 text-green-400 border border-green-700/40"
              : "bg-amber-900/30 text-amber-400 border border-amber-700/40"
          }`}
        >
          {status.isVerified ? "Vérifié" : "Non vérifié"}
        </span>
      </div>
      <p className="text-xs text-gray-500 mt-1">
        {fmtDate(status.lastChecked)}
        {status.sourceName ? ` · ${status.sourceName}` : ""}
      </p>
    </div>
  );
}

export default function Prices() {
  return (
    <div className="bg-gray-50 min-h-screen py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Suivi des prix</h1>
        <p className="text-gray-600 mb-8">
          Suivez les prix de vos produits favoris. Les prix « Réel » proviennent
          d'observations enregistrées ; les prix « Démo » sont des données de
          référence à titre illustratif uniquement.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {DEMO_PRODUCTS.map((product) => {
            const status = getPriceStatus(product.id, product.name);
            const demoPrice = convertAmount(
              product.price,
              product.currency,
              DEFAULT_CURRENCY
            );

            return (
              <Link
                key={product.id}
                href={`/products/${product.id}`}
                className="block bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-xl transition-all group"
              >
                <div className="h-48 bg-gray-100 flex items-center justify-center">
                  <span className="text-gray-400 text-sm">
                    💰 {product.name}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    <span className="px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600 border border-gray-300">
                      Démo
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mb-4">
                    {product.category}
                  </p>

                  {/* Prix de référence démo */}
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Prix de référence (démo)
                    </span>
                    <div className="flex items-end gap-1">
                      <span className="text-2xl font-bold text-gray-900">
                        {formatAmount(demoPrice, DEFAULT_CURRENCY)}
                      </span>
                      <span className="text-sm text-gray-400">/ unité</span>
                    </div>
                  </div>

                  {/* Prix observé réel */}
                  <div>
                    <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1 block">
                      Dernier prix observé (réel)
                    </span>
                    <RealPriceLine status={status} />
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
                    <span
                      className={`text-xs font-semibold ${
                        product.inStock ? "text-green-600" : "text-red-500"
                      }`}
                    >
                      {product.inStock ? "Disponible" : "Indisponible"}
                    </span>
                    <button className="text-sm font-medium text-blue-600 hover:underline">
                      Créer une alerte
                    </button>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-12 text-center text-gray-500 text-sm">
          <p>
            ⚠️ Les prix « Démo » sont des données de référence. Aucun suivi de
            prix réel n'est effectué tant qu'aucune source n'est connectée et
            activée dans l'administration.
          </p>
        </div>
      </div>
    </div>
  );
}
