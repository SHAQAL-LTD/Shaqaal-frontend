"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/lib/api";
import type { ConfigEntry, CountryProfileRow } from "@/lib/types";
import { Globe, Plus, RefreshCw, Settings2 } from "lucide-react";
import {
  Card, ErrorNote, FlashNote, Modal, Spinner, fmtTs, inputCls, titleize, useAction,
} from "./ui";

/** Edit one platform config entry — the value must be valid JSON. */
function ConfigEditModal({
  entry,
  onClose,
  onDone,
}: {
  entry: ConfigEntry;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { busy, error, setError, run } = useAction();
  const [configKey, setConfigKey] = useState(entry.key || "");
  const [value, setValue] = useState(() => JSON.stringify(entry.value ?? null, null, 2));
  const [description, setDescription] = useState(entry.description || "");

  async function confirm() {
    if (!configKey.trim()) {
      setError("Config key is required.");
      return;
    }
    try {
      JSON.parse(value);
    } catch {
      setError("Value must be valid JSON — e.g. true, false, \"open\", 30.");
      return;
    }
    const ok = await run(() =>
      api.admin.updateConfig(configKey.trim(), value, description),
    );
    if (ok) onDone(`${configKey.trim()} updated`);
  }

  return (
    <Modal
      title={entry.key ? `Edit ${entry.key}` : "New config entry"}
      subtitle="Stored in platform_config — no redeploy needed. Change is audited."
      onClose={onClose}
      onConfirm={confirm}
      confirmLabel="Save"
      busy={busy}
      error={error}
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Key
          </span>
          <input
            value={configKey}
            onChange={(e) => setConfigKey(e.target.value)}
            disabled={!!entry.key}
            placeholder="feature.some_flag"
            className={inputCls + " font-mono disabled:opacity-60"}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Value (JSON)
          </span>
          <textarea
            rows={4}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            className={inputCls + " font-mono"}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Description
          </span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What does this control?"
            className={inputCls}
          />
        </div>
      </div>
    </Modal>
  );
}

/** Edit one country compliance profile (form schema + required documents). */
function CountryEditModal({
  profile,
  onClose,
  onDone,
}: {
  profile: CountryProfileRow;
  onClose: () => void;
  onDone: (msg: string) => void;
}) {
  const { busy, error, setError, run } = useAction();
  const [displayName, setDisplayName] = useState(profile.displayName || "");
  const [docs, setDocs] = useState((profile.requiredDocTypes || []).join(", "));
  const [fields, setFields] = useState(() => JSON.stringify(profile.fields ?? [], null, 2));

  async function confirm() {
    if (!displayName.trim()) {
      setError("Display name is required.");
      return;
    }
    let parsedFields: unknown[];
    try {
      const parsed: unknown = JSON.parse(fields);
      if (!Array.isArray(parsed)) throw new Error("not an array");
      parsedFields = parsed;
    } catch {
      setError("Fields must be a JSON array — e.g. [] or [{\"name\": \"tin\", ...}].");
      return;
    }
    const ok = await run(() =>
      api.admin.upsertCountryProfile(profile.country, {
        displayName: displayName.trim(),
        fields: parsedFields,
        requiredDocTypes: docs.split(",").map((d: string) => d.trim()).filter(Boolean),
      }),
    );
    if (ok) onDone(`${profile.country} profile saved`);
  }

  return (
    <Modal
      title={`Country profile — ${titleize(profile.country)}`}
      subtitle={`Schema v${profile.schemaVersion} · audited, bumps schemaVersion when the schema changes`}
      onClose={onClose}
      onConfirm={confirm}
      confirmLabel="Save profile"
      size="lg"
      busy={busy}
      error={error}
    >
      <div className="space-y-4">
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Display name
          </span>
          <input value={displayName} onChange={(e) => setDisplayName(e.target.value)} className={inputCls} />
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Required document types (comma-separated)
          </span>
          <input
            value={docs}
            onChange={(e) => setDocs(e.target.value)}
            placeholder="PASSPORT, PROOF_OF_FUNDS, ..."
            className={inputCls}
          />
        </div>
        <div>
          <span className="mb-1.5 block text-[11px] font-medium uppercase tracking-wider text-gray-muted">
            Form fields (JSON array)
          </span>
          <textarea
            rows={8}
            value={fields}
            onChange={(e) => setFields(e.target.value)}
            className={inputCls + " font-mono"}
          />
        </div>
      </div>
    </Modal>
  );
}

/** Settings/Config — feature flags, platform config and country compliance profiles. */
export default function ConfigSection() {
  const [entries, setEntries] = useState<ConfigEntry[]>([]);
  const [countries, setCountries] = useState<CountryProfileRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);
  const [editEntry, setEditEntry] = useState<ConfigEntry | null>(null);
  const [newEntry, setNewEntry] = useState<ConfigEntry | null>(null);
  const [editCountry, setEditCountry] = useState<CountryProfileRow | null>(null);
  const { busy: toggling, run: runToggle } = useAction();

  useEffect(() => {
    let alive = true;
    Promise.all([api.admin.config(), api.admin.countryProfiles()])
      .then(([cfg, ctry]) => {
        if (!alive) return;
        setEntries(cfg);
        setCountries(ctry);
        setError(null);
      })
      .catch((e) => {
        if (alive) setError(e instanceof Error ? e.message : "Failed to load configuration");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [reloadKey]);

  useEffect(() => {
    if (!flash) return;
    const t = setTimeout(() => setFlash(null), 6000);
    return () => clearTimeout(t);
  }, [flash]);

  const isBool = (v: unknown) => typeof v === "boolean";

  const toggleFlag = async (entry: ConfigEntry) => {
    const next = !(entry.value === true);
    const ok = await runToggle(() => api.admin.updateConfig(entry.key, String(next), entry.description || ""));
    if (ok) {
      setFlash(`${entry.key} → ${next}`);
      setReloadKey((k) => k + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Settings / Config</h2>
          <p className="text-[13px] text-gray-muted">
            Feature flags, platform config and country profiles — previously DB edits or redeploys.
          </p>
        </div>
        <button
          onClick={() => setReloadKey((k) => k + 1)}
          className="flex items-center gap-2 rounded-xl border border-border px-3 py-2 text-[12px] text-muted-foreground transition hover:bg-secondary/60 hover:text-foreground"
        >
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <FlashNote message={flash} />
      <ErrorNote message={error} />

      {loading ? (
        <Spinner label="Loading configuration…" />
      ) : (
        <>
          <Card
            title="Feature flags & platform config"
            subtitle="Boolean flags flip instantly; everything else opens the JSON editor"
            actions={
              <button
                onClick={() =>
                  setNewEntry({ key: "", value: true, description: "", updatedAt: null, updatedBy: null })
                }
                className="flex items-center gap-1.5 rounded-lg border border-gold/40 bg-gold/10 px-3 py-1.5 text-[12px] font-semibold text-gold transition hover:bg-gold/20"
              >
                <Plus size={13} /> New setting
              </button>
            }
          >
            <div className="space-y-2">
              {entries.length === 0 && (
                <p className="py-6 text-center text-[13px] text-gray-muted">
                  No config entries found — run the V16 migration seeds.
                </p>
              )}
              {entries.map((e) => (
                <div
                  key={e.key}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-dark-800/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-mono text-[13px] font-semibold text-foreground">{e.key}</p>
                      {e.key.startsWith("feature.") && <span className="text-[10px] text-gold">feature flag</span>}
                    </div>
                    {e.description && <p className="text-[11px] text-gray-muted">{e.description}</p>}
                    <p className="mt-0.5 text-[10px] text-dark-500">
                      {e.updatedBy ? `by ${e.updatedBy} · ` : ""}
                      {fmtTs(e.updatedAt)}
                    </p>
                  </div>

                  {isBool(e.value) ? (
                    <button
                      onClick={() => toggleFlag(e)}
                      disabled={toggling}
                      className={
                        "relative h-6 w-11 shrink-0 rounded-full transition disabled:opacity-50 " +
                        (e.value ? "bg-success" : "bg-dark-700")
                      }
                      aria-label={`Toggle ${e.key}`}
                    >
                      <span
                        className={
                          "absolute top-0.5 h-5 w-5 rounded-full bg-white transition-all " +
                          (e.value ? "left-[22px]" : "left-0.5")
                        }
                      />
                    </button>
                  ) : (
                    <code className="max-w-[220px] truncate rounded-lg bg-dark-900/70 px-2 py-1 text-[11px] text-muted-foreground">
                      {JSON.stringify(e.value)}
                    </code>
                  )}

                  <button
                    onClick={() => setEditEntry(e)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                  >
                    <Settings2 size={13} /> Edit
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <Card
            title="Country compliance profiles"
            subtitle="KYC form schema and required documents per country"
            actions={<Globe size={15} className="text-gold" />}
          >
            <div className="space-y-2">
              {countries.length === 0 && (
                <p className="py-6 text-center text-[13px] text-gray-muted">No country profiles configured.</p>
              )}
              {countries.map((c) => (
                <div
                  key={c.country}
                  className="flex flex-wrap items-center gap-3 rounded-xl border border-border/60 bg-dark-800/40 p-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-[13px] font-semibold text-foreground">{c.displayName || titleize(c.country)}</p>
                      <span className="rounded-full border border-border px-2 py-0.5 text-[10px] text-muted-foreground">
                        {c.country}
                      </span>
                      <span className="rounded-full border border-gold/40 bg-gold/10 px-2 py-0.5 text-[10px] font-semibold text-gold">
                        schema v{c.schemaVersion}
                      </span>
                    </div>
                    <p className="mt-0.5 text-[11px] text-gray-muted">
                      {(c.fields || []).length} field(s) · {(c.requiredDocTypes || []).length} required doc type(s)
                      {c.updatedAt ? ` · updated ${fmtTs(c.updatedAt)}` : ""}
                    </p>
                    {(c.requiredDocTypes || []).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {(c.requiredDocTypes || []).map((d: string) => (
                          <span key={d} className="rounded bg-dark-700/70 px-1.5 py-0.5 text-[10px] text-muted-foreground">
                            {d}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setEditCountry(c)}
                    className="flex shrink-0 items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-[12px] font-medium text-muted-foreground transition hover:border-gold/40 hover:text-gold"
                  >
                    <Settings2 size={13} /> Edit
                  </button>
                </div>
              ))}
            </div>
          </Card>

          <p className="flex items-center gap-2 text-[12px] text-gray-muted">
            <Plus size={13} className="text-gold" />
            New config keys can be created from the Edit dialog — keys that don&apos;t exist yet are inserted on save.
          </p>
        </>
      )}

      {editEntry && (
        <ConfigEditModal
          entry={editEntry}
          onClose={() => setEditEntry(null)}
          onDone={(msg) => {
            setEditEntry(null);
            setFlash(msg);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
      {newEntry && (
        <ConfigEditModal
          entry={newEntry}
          onClose={() => setNewEntry(null)}
          onDone={(msg) => {
            setNewEntry(null);
            setFlash(msg);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
      {editCountry && (
        <CountryEditModal
          profile={editCountry}
          onClose={() => setEditCountry(null)}
          onDone={(msg) => {
            setEditCountry(null);
            setFlash(msg);
            setReloadKey((k) => k + 1);
          }}
        />
      )}
    </div>
  );
}
