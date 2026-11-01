"use client";

import { useState, useEffect, useCallback } from "react";

interface SourceRow {
  id: string;
  name: string;
  type: string;
  isActive: boolean;
  requiresCredentials: boolean;
  credentialsConfigured: boolean | null;
  usable: boolean;
  lastChecked: string | null;
  lastStatus: "ok" | "error" | "pending" | null;
  lastError: string | null;
  observationsCount: number;
}

interface SchedulerState {
  enabled: boolean;
  intervalMinutes: number;
  lastRun: string | null;
  nextRun: string | null;
  isRunning: boolean;
  intervalActive: boolean;
}

interface LogEntry {
  id: string;
  triggeredAt: string;
  trigger: "manual" | "scheduled";
  sourcesChecked: number;
  observationsRecorded: number;
  errors: string[];
  status: "completed" | "failed";
  durationMs: number;
}

export default function SchedulerControl({
  initialSources,
  initialScheduler,
  initialLogs,
}: {
  initialSources: SourceRow[];
  initialScheduler: SchedulerState;
  initialLogs: LogEntry[];
}) {
  const [sources, setSources] = useState<SourceRow[]>(initialSources);
  const [scheduler, setScheduler] = useState<SchedulerState>(initialScheduler);
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs);
  const [message, setMessage] = useState<{ text: string; kind: "ok" | "error" } | null>(null);

  const fetchStatus = useCallback(async () => {
    try {
      const [sRes, schRes, logRes] = await Promise.all([
        fetch("/api/sources"),
        fetch("/api/scheduler"),
        fetch("/api/execution-log?limit=20"),
      ]);
      const sJson = await sRes.json();
      const schJson = await schRes.json();
      const logJson = await logRes.json();
      setSources(sJson.data ?? []);
      setScheduler(schJson.data ?? {});
      setLogs(logJson.data ?? []);
    } catch {
      setMessage({ text: "Impossible de rafraîchir l'état.", kind: "error" });
    }
  }, []);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const notify = (text: string, kind: "ok" | "error") => {
    setMessage({ text, kind });
    setTimeout(() => setMessage(null), 5000);
  };

  const toggleSource = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch("/api/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sourceId: id, isActive }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec");
      setSources((prev) =>
        prev.map((s) => (s.id === id ? { ...s, isActive: json.data.isActive } : s))
      );
      notify(`Source "${id}" ${isActive ? "activée" : "désactivée"}.`, "ok");
      fetchStatus();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "error");
    }
  };

  const schedulerAction = async (action: "start" | "stop" | "check") => {
    try {
      const res = await fetch("/api/scheduler", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Échec");
      if (action === "check") {
        notify(
          `Vérification terminée : ${json.data.observationsRecorded} observation(s), ${json.data.errors.length} erreur(s).`,
          json.data.status === "failed" ? "error" : "ok"
        );
      } else {
        notify(`Planificateur ${action === "start" ? "démarré" : "arrêté"}.`, "ok");
      }
      fetchStatus();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Erreur", "error");
    }
  };

  const fmtDate = (iso: string | null) => {
    if (!iso) return "—";
    return new Date(iso).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-8">
      {/* Message temporaire */}
      {message && (
        <div
          className={`p-4 rounded-lg text-sm font-medium ${
            message.kind === "ok"
              ? "bg-green-900/30 border border-green-700/50 text-green-400"
              : "bg-red-900/30 border border-red-700/50 text-red-400"
          }`}
        >
          {message.text}
        </div>
      )}

      {/* État des connecteurs */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Connecteurs de prix</h2>
        <p className="text-gray-400 text-sm mb-4">
          Aucune source n'est active par défaut. Une source nécessitant des
          identifiants ne peut être activée que si sa variable d'environnement
          est définie.
        </p>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-700">
              <tr>
                <th className="pb-3 text-gray-400 font-medium">Source</th>
                <th className="pb-3 text-gray-400 font-medium">Type</th>
                <th className="pb-3 text-gray-400 font-medium text-center">Actif</th>
                <th className="pb-3 text-gray-400 font-medium text-center">Utilisable</th>
                <th className="pb-3 text-gray-400 font-medium text-center">Identifiants</th>
                <th className="pb-3 text-gray-400 font-medium">Dernière vérif.</th>
                <th className="pb-3 text-gray-400 font-medium">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sources.map((s) => (
                <tr key={s.id}>
                  <td className="py-3 text-white">{s.name}</td>
                  <td className="py-3 text-gray-400">{s.type}</td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => toggleSource(s.id, !s.isActive)}
                      className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                        s.isActive
                          ? "bg-green-900/30 text-green-400 border border-green-700/40"
                          : "bg-gray-800 text-gray-400 border border-gray-600"
                      }`}
                    >
                      {s.isActive ? "Oui" : "Non"}
                    </button>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.usable
                          ? "bg-green-900/30 text-green-400"
                          : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      {s.usable ? "Oui" : "Non"}
                    </span>
                  </td>
                  <td className="py-3 text-center">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.credentialsConfigured
                          ? "bg-green-900/30 text-green-400"
                          : s.requiresCredentials
                          ? "bg-red-900/30 text-red-400"
                          : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      {s.requiresCredentials
                        ? s.credentialsConfigured
                          ? "Configuré"
                          : "Manquant"
                        : "—"}
                    </span>
                  </td>
                  <td className="py-3 text-gray-400">{fmtDate(s.lastChecked)}</td>
                  <td className="py-3">
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-medium ${
                        s.lastStatus === "ok"
                          ? "bg-green-900/30 text-green-400"
                          : s.lastStatus === "error"
                          ? "bg-red-900/30 text-red-400"
                          : "bg-gray-700 text-gray-500"
                      }`}
                    >
                      {s.lastStatus === "ok"
                        ? "OK"
                        : s.lastStatus === "error"
                        ? "Erreur"
                        : "En attente"}
                    </span>
                    {s.lastError && (
                      <span className="text-xs text-red-400 ml-2 block mt-1">
                        {s.lastError}
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Planificateur */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Planificateur de vérification</h2>
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center mb-4">
          <div className="flex items-center gap-3">
            <span className="text-gray-400 text-sm">Vérification automatique :</span>
            <button
              onClick={() => schedulerAction(scheduler.enabled ? "stop" : "start")}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                scheduler.enabled
                  ? "bg-red-900/30 text-red-400 border border-red-700/40 hover:bg-red-900/50"
                  : "bg-violet-600 text-white hover:bg-violet-500"
              }`}
            >
              {scheduler.enabled ? "Arrêter" : "Démarrer"}
            </button>
            <span className="text-xs text-gray-500">
              {scheduler.intervalMinutes} min
            </span>
          </div>
          <button
            onClick={() => schedulerAction("check")}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg font-medium transition-colors flex items-center gap-2"
          >
            ⟳ Vérifier maintenant
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">État</div>
            <div className={`font-medium ${
              scheduler.isRunning ? "text-yellow-400" : "text-gray-400"
            }`}>
              {scheduler.isRunning ? "En cours" : scheduler.enabled ? "Actif" : "Arrêté"}
            </div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Dernière exécution</div>
            <div className="font-medium text-gray-300">{fmtDate(scheduler.lastRun)}</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Intervalle</div>
            <div className="font-medium text-gray-300">{scheduler.intervalMinutes} min</div>
          </div>
          <div className="bg-gray-900/50 p-3 rounded-lg border border-gray-800">
            <div className="text-gray-400 text-xs uppercase tracking-wider mb-1">Processus</div>
            <div className={`font-medium text-xs ${
              scheduler.intervalActive ? "text-green-400" : "text-gray-500"
            }`}>
              {scheduler.intervalActive ? "Actif" : "Inactif"}
            </div>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">
          ⚠️ Le planificateur s'exécute tant que le serveur est en cours. En
          production, utiliser un cron externe appelant l'action "check".
        </p>
      </div>

      {/* Journal d'exécution */}
      <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
        <h2 className="text-lg font-bold text-white mb-4">Journal d'exécution</h2>
        {logs.length === 0 ? (
          <p className="text-gray-400 text-sm">Aucune exécution pour le moment.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-gray-700">
                <tr>
                  <th className="pb-3 text-gray-400 font-medium">Heure</th>
                  <th className="pb-3 text-gray-400 font-medium">Déclencheur</th>
                  <th className="pb-3 text-gray-400 font-medium text-center">Sources</th>
                  <th className="pb-3 text-gray-400 font-medium text-center">Obs.</th>
                  <th className="pb-3 text-gray-400 font-medium text-center">Statut</th>
                  <th className="pb-3 text-gray-400 font-medium">Durée</th>
                  <th className="pb-3 text-gray-400 font-medium">Erreurs</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {logs.map((l) => (
                  <tr key={l.id}>
                    <td className="py-3 text-gray-300">{fmtDate(l.triggeredAt)}</td>
                    <td className="py-3 text-gray-400">
                      {l.trigger === "scheduled" ? "Planifié" : "Manuel"}
                    </td>
                    <td className="py-3 text-center text-gray-300">{l.sourcesChecked}</td>
                    <td className="py-3 text-center text-gray-300">{l.observationsRecorded}</td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          l.status === "completed"
                            ? "bg-green-900/30 text-green-400"
                            : "bg-red-900/30 text-red-400"
                        }`}
                      >
                        {l.status === "completed" ? "Terminé" : "Échec"}
                      </span>
                    </td>
                    <td className="py-3 text-gray-400">{l.durationMs} ms</td>
                    <td className="py-3 text-gray-400">
                      {l.errors.length === 0 ? "—" : l.errors.join("; ")}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
