import { readProducts } from "@/lib/products-server";
import {
  PRICE_SOURCES,
  isSourceUsable,
} from "@/lib/price-sources";
import { getSchedulerConfig } from "@/lib/scheduler";
import { readExecutionLog } from "@/lib/execution-log";
import SchedulerControl from "@/components/admin/SchedulerControl";

export default function AdminDashboard() {
  const products = readProducts();
  const schedulerConfig = getSchedulerConfig();
  const executionLogs = readExecutionLog();

  const sources = PRICE_SOURCES.map((s) => ({
    id: s.id,
    name: s.name,
    type: s.type,
    isActive: s.isActive,
    requiresCredentials: s.requiresCredentials,
    credentialsConfigured: s.credentialsEnvVar
      ? Boolean(process.env[s.credentialsEnvVar])
      : null,
    usable: isSourceUsable(s.id),
    lastChecked: s.lastChecked,
    lastStatus: s.lastStatus,
    lastError: s.lastError,
    observationsCount: s.observationsCount,
  }));

  const totalProducts = products.length;
  const inStock = products.filter((p) => p.inStock).length;
  const outOfStock = products.filter((p) => !p.inStock).length;
  const withDiscount = products.filter((p) => p.oldPrice && p.oldPrice > p.price).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Tableau de bord</h1>
        <p className="text-gray-400">Gestion des produits 10-JITAL</p>
      </div>

      {/* Cartes résumé */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
            Total produits
          </div>
          <div className="text-3xl font-bold text-white">{totalProducts}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
            En stock
          </div>
          <div className="text-3xl font-bold text-green-400">{inStock}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
            Rupture de stock
          </div>
          <div className="text-3xl font-bold text-red-400">{outOfStock}</div>
        </div>
        <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
          <div className="text-gray-400 text-sm font-medium uppercase tracking-wider mb-2">
            Avec réduction
          </div>
          <div className="text-3xl font-bold text-violet-400">{withDiscount}</div>
        </div>
      </div>

      {/* Liste récente */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Produits récents</h2>
        {products.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucun produit pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-gray-700">
                  <th className="pb-3 text-gray-400 font-medium">Produit</th>
                  <th className="pb-3 text-gray-400 font-medium">Catégorie</th>
                  <th className="pb-3 text-gray-400 font-medium">Prix</th>
                  <th className="pb-3 text-gray-400 font-medium">Stock</th>
                  <th className="pb-3 text-gray-400 font-medium">Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {products.slice(0, 10).map((p) => (
                  <tr key={p.id}>
                    <td className="py-3 text-white">{p.name}</td>
                    <td className="py-3 text-gray-400">{p.category}</td>
                    <td className="py-3 text-white font-mono">
                      {p.price} {p.currency}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          p.inStock
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {p.inStock ? "Disponible" : "Rupture"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-500 text-xs">{p.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Actions rapides</h2>
        <div className="flex gap-3">
          <a
            href="/admin/products/new"
            className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white rounded-lg font-medium transition-colors"
          >
            Ajouter un produit
          </a>
          <a
            href="/admin/products"
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors"
          >
            Voir tous les produits
          </a>
        </div>
      </div>

      {/* Suivi des prix : connecteurs, planificateur, journal */}
      <SchedulerControl
        initialSources={sources}
        initialScheduler={{
          enabled: schedulerConfig.enabled,
          intervalMinutes: schedulerConfig.intervalMinutes,
          lastRun: schedulerConfig.lastRun,
          nextRun: schedulerConfig.nextRun,
          isRunning: false,
          intervalActive: false,
        }}
        initialLogs={executionLogs}
      />
    </div>
  );
}