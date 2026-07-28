"use client";

/**
 * Menus: title, mode select, garage, unlocks, settings, how-to, pause, results.
 *
 * Everything is keyboard-first (arrows + Enter + Esc) because the game is, but
 * every control is a real button so a mouse works identically.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { RIDERS, riderById } from "../data/riders";
import { BOARDS, boardById } from "../data/boards";
import { MOUNTAINS } from "../world/TerrainGen";
import { SKY_PRESETS } from "../world/Sky";
import { TRACKS } from "../audio/Audio";
import { FILTERS } from "../fx/PostFX";
import { MODES, type ModeId } from "../data/modes";
import { TRICK_INDEX } from "../player/TrickSystem";
import { unlockTable, type SaveData } from "../core/save";
import { formatScore, formatTime } from "../core/math";
import type { RunSummary } from "../core/Game";

// ─────────────────────────────────────────────────────────────── plumbing ────

export function useMenuKeys(
  count: number,
  onSelect: (i: number) => void,
  onBack?: () => void,
  horizontal = false,
) {
  const [index, setIndex] = useState(0);
  // The live index also lives in a ref. Reading it from a `setState` updater
  // instead would defer the side effect until React next renders, which — on a
  // screen where nothing else re-renders — means the first Enter does nothing.
  const indexRef = useRef(0);
  const selRef = useRef(onSelect);
  const backRef = useRef(onBack);
  const countRef = useRef(count);
  useEffect(() => {
    selRef.current = onSelect;
    backRef.current = onBack;
    countRef.current = count;
  });

  const move = useCallback((delta: number) => {
    const n = Math.max(1, countRef.current);
    const next = (indexRef.current + delta + n) % n;
    indexRef.current = next;
    setIndex(next);
  }, []);

  /**
   * Hover moves the keyboard cursor — but only once the pointer has actually
   * moved. Without this, the mouse position left over from the *previous*
   * screen silently pre-selects whatever now sits under it, so clicking
   * "Drop In" and pressing Enter without touching the mouse could start a
   * different mode than the one at the top of the list.
   */
  const pointerMoved = useRef(false);
  useEffect(() => {
    const onMove = () => {
      pointerMoved.current = true;
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  const hover = useCallback((i: number) => {
    if (!pointerMoved.current) return;
    indexRef.current = i;
    setIndex(i);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const next = horizontal ? "ArrowRight" : "ArrowDown";
      const prev = horizontal ? "ArrowLeft" : "ArrowUp";
      if (e.code === next || (horizontal && e.code === "ArrowDown")) {
        e.preventDefault();
        move(1);
      } else if (e.code === prev || (horizontal && e.code === "ArrowUp")) {
        e.preventDefault();
        move(-1);
      } else if (e.code === "Enter" || e.code === "Space") {
        e.preventDefault();
        selRef.current(indexRef.current);
      } else if (e.code === "Escape" || e.code === "Backspace") {
        e.preventDefault();
        backRef.current?.();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [horizontal, move]);

  return [index, hover] as const;
}

function Sheet({
  children,
  title,
  eyebrow,
  wide,
}: {
  children: React.ReactNode;
  title?: string;
  eyebrow?: string;
  wide?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18, scale: 0.985 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      // Exits are deliberately fast: AnimatePresence waits for them before
      // mounting the next screen, and a slow exit eats the next keypress.
      exit={{ opacity: 0, y: -10, scale: 0.99, transition: { duration: 0.12 } }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      className="sh-panel sh-sheet"
      style={{ width: wide ? "min(1180px, 94vw)" : undefined }}
    >
      {eyebrow && <div className="sh-eyebrow">{eyebrow}</div>}
      {title && (
        <h2
          className="sh-title"
          style={{ fontSize: "clamp(1.8rem,4vw,2.8rem)", margin: "0.35rem 0 1.4rem" }}
        >
          {title}
        </h2>
      )}
      {children}
    </motion.div>
  );
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="sh-stat-row">
      <span style={{ width: 62 }}>{label}</span>
      <span className="sh-bar">
        <i style={{ width: `${Math.max(4, Math.min(100, (value - 0.75) * 200))}%` }} />
      </span>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────── title ────

export function TitleScreen({
  onPlay,
  onGarage,
  onUnlocks,
  onSettings,
  onHowTo,
  save,
}: {
  onPlay: () => void;
  onGarage: () => void;
  onUnlocks: () => void;
  onSettings: () => void;
  onHowTo: () => void;
  save: SaveData;
}) {
  const actions = useMemo(
    () => [
      { label: "Drop In", meta: "Choose a mode", fn: onPlay },
      {
        label: "Garage",
        // The current loadout, so it's obvious this is a thing you change.
        meta: `${riderById(save.selected.rider).name} / ${
          boardById(save.selected.board).name
        }`,
        fn: onGarage,
      },
      { label: "Unlocks", meta: `${save.unlocked.length} earned`, fn: onUnlocks },
      { label: "How to Ride", meta: "Controls & tricks", fn: onHowTo },
      { label: "Settings", meta: "Audio / visuals", fn: onSettings },
    ],
    [
      onPlay,
      onGarage,
      onUnlocks,
      onSettings,
      onHowTo,
      save.unlocked.length,
      save.selected.rider,
      save.selected.board,
    ],
  );
  const [index, setIndex] = useMenuKeys(actions.length, (i) => actions[i].fn());

  return (
    <div className="sh-overlay">
      <div className="sh-title-screen">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="sh-eyebrow">A snowboard game</div>
          <h2
            className="sh-title"
            style={{
              fontSize: "clamp(3.4rem, 12vw, 9rem)",
              margin: "0.4rem 0 0",
              lineHeight: 0.85,
            }}
          >
            SHRED
            <span style={{ opacity: 0.35 }}>{" // "}</span>
            <span
              style={{
                background: "linear-gradient(92deg,#6ee7ff,#ff3d81 60%,#ffc46b)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                color: "transparent",
              }}
            >
              1999
            </span>
          </h2>
          <p className="sh-title-blurb">
            Endless procedural mountains, big stupid airs, and a landing that
            actually feels like something. Late-afternoon light, all the way down.
          </p>
        </motion.div>

        <div className="sh-title-actions">
          {actions.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, x: -14 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.12 + i * 0.055, duration: 0.5 }}
            >
              <button
                type="button"
                className="sh-btn"
                data-focus={i === index}
                onMouseEnter={() => setIndex(i)}
                onClick={a.fn}
              >
                <span className="sh-btn__label">{a.label}</span>
                <span className="sh-btn__meta">{a.meta}</span>
              </button>
            </motion.div>
          ))}
        </div>

        <div className="sh-title-stats">
          <span className="sh-chip">{save.totals.runs} runs</span>
          <span className="sh-chip">
            {(save.totals.distance / 1000).toFixed(1)} km ridden
          </span>
          <span className="sh-chip">{save.totals.tricks} tricks</span>
          <span className="sh-chip">best {formatScore(save.totals.bestScore)}</span>
        </div>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────── mode select ────

export function ModeSelect({
  save,
  onPick,
  onBack,
}: {
  save: SaveData;
  onPick: (id: ModeId) => void;
  onBack: () => void;
}) {
  const available = MODES.filter((m) => save.unlocked.includes(`mode:${m.id}`));
  const locked = MODES.filter((m) => !save.unlocked.includes(`mode:${m.id}`));
  const [index, setIndex] = useMenuKeys(
    available.length,
    (i) => onPick(available[i].id),
    onBack,
  );
  const current = available[Math.min(index, available.length - 1)];

  return (
    <div className="sh-overlay">
      <Sheet eyebrow="Select a mode" title="What kind of run?" wide>
        <div className="sh-split">
          <div className="sh-grid">
            {available.map((m, i) => (
              <button
                key={m.id}
                className="sh-btn"
                data-focus={i === index}
                onMouseEnter={() => setIndex(i)}
                onClick={() => onPick(m.id)}
              >
                <span className="sh-btn__label">{m.name}</span>
                <span className="sh-btn__meta">{m.tagline}</span>
              </button>
            ))}
            {locked.map((m) => {
              const req = unlockTable().find((u) => u.key === `mode:${m.id}`);
              return (
                <button key={m.id} className="sh-btn" disabled>
                  <span className="sh-btn__label">{m.name}</span>
                  <span className="sh-btn__meta">
                    {req?.requirement.label ?? "Locked"}
                  </span>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {current && (
              <motion.div
                key={current.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                style={{
                  border: "1px solid var(--sh-line)",
                  borderRadius: 16,
                  padding: "1.4rem",
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                <div className="sh-eyebrow">{current.tagline}</div>
                <h3
                  className="sh-title"
                  style={{ fontSize: "1.9rem", margin: "0.4rem 0 0.8rem" }}
                >
                  {current.name}
                </h3>
                <p style={{ color: "var(--sh-dim)", lineHeight: 1.6, fontSize: "0.95rem" }}>
                  {current.blurb}
                </p>
                <div style={{ display: "flex", gap: "0.4rem", marginTop: "1.1rem", flexWrap: "wrap" }}>
                  {current.duration > 0 && (
                    <span className="sh-chip">{current.duration}s</span>
                  )}
                  {current.distance > 0 && (
                    <span className="sh-chip">{current.distance} m</span>
                  )}
                  {current.crashLimit > 0 && (
                    <span className="sh-chip">{current.crashLimit} crashes</span>
                  )}
                  {current.gates && <span className="sh-chip">gates</span>}
                  {current.bestAirs > 0 && (
                    <span className="sh-chip">{current.bestAirs} airs</span>
                  )}
                  <span className="sh-chip">
                    best{" "}
                    {current.metric === "time"
                      ? save.bestTime[`${current.id}:${save.selected.mountain}`]
                        ? formatTime(save.bestTime[`${current.id}:${save.selected.mountain}`])
                        : "—"
                      : formatScore(save.best[`${current.id}:${save.selected.mountain}`] ?? 0)}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div style={{ marginTop: "1.6rem", display: "flex", gap: "0.6rem" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Back</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── garage ────

type GarageTab = "riders" | "boards" | "mountains" | "light" | "music" | "look";

export function Garage({
  save,
  onChange,
  onBack,
}: {
  save: SaveData;
  onChange: (patch: Partial<SaveData["selected"]>) => void;
  onBack: () => void;
}) {
  const [tab, setTab] = useState<GarageTab>("riders");
  const has = useCallback((k: string) => save.unlocked.includes(k), [save.unlocked]);
  const table = useMemo(() => unlockTable(), []);
  const req = (key: string) =>
    table.find((u) => u.key === key)?.requirement.label ?? "Locked";

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  /** "4/10" — so it's obvious at a glance that there's more behind the tab. */
  const count = (prefix: string, ids: { id: string }[]) =>
    `${ids.filter((x) => has(`${prefix}:${x.id}`)).length}/${ids.length}`;

  const tabs: { id: GarageTab; label: string; count: string }[] = [
    { id: "riders", label: "Riders", count: count("rider", RIDERS) },
    { id: "boards", label: "Boards", count: count("board", BOARDS) },
    { id: "mountains", label: "Mountains", count: count("mountain", MOUNTAINS) },
    { id: "light", label: "Light", count: count("sky", SKY_PRESETS) },
    { id: "music", label: "Music", count: count("track", TRACKS) },
    { id: "look", label: "Look", count: count("filter", FILTERS) },
  ];

  return (
    <div className="sh-overlay">
      <Sheet eyebrow="Garage" title="Set yourself up" wide>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap", marginBottom: "1.4rem" }}>
          {tabs.map((t) => (
            <button
              key={t.id}
              className="sh-chip"
              data-active={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}{" "}
              <span style={{ opacity: 0.55, fontVariantNumeric: "tabular-nums" }}>
                {t.count}
              </span>
            </button>
          ))}
        </div>

        {tab === "riders" && (
          <div
            className="sh-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}
          >
            {RIDERS.map((r) => {
              const key = `rider:${r.id}`;
              const owned = has(key);
              return (
                <button
                  key={r.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.rider === r.id}
                  onClick={() => onChange({ rider: r.id })}
                >
                  <div className="sh-eyebrow">{r.handle}</div>
                  <div style={{ fontSize: "1.05rem", marginTop: 4 }}>{r.name}</div>
                  <div className="sh-swatches">
                    {[r.colors.jacket, r.colors.pants, r.colors.accent, r.colors.goggles].map(
                      (c, i) => (
                        <span key={i} className="sh-swatch" style={{ background: c }} />
                      ),
                    )}
                  </div>
                  <p
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.8rem",
                      color: "var(--sh-dim)",
                      lineHeight: 1.5,
                    }}
                  >
                    {owned ? r.blurb : req(key)}
                  </p>
                  <StatBar label="Spin" value={r.stats.spin} />
                  <StatBar label="Pop" value={r.stats.pop} />
                  <StatBar label="Balance" value={r.stats.balance} />
                  <StatBar label="Speed" value={r.stats.speed} />
                </button>
              );
            })}
          </div>
        )}

        {tab === "boards" && (
          <div
            className="sh-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}
          >
            {BOARDS.map((b) => {
              const key = `board:${b.id}`;
              const owned = has(key);
              return (
                <button
                  key={b.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.board === b.id}
                  onClick={() => onChange({ board: b.id })}
                >
                  <div className="sh-eyebrow">{b.maker}</div>
                  <div style={{ fontSize: "1.05rem", marginTop: 4 }}>{b.name}</div>
                  <div
                    style={{
                      marginTop: "0.6rem",
                      height: 34,
                      borderRadius: 8,
                      background: `linear-gradient(100deg, ${b.colors.base}, ${b.colors.accent} 55%, ${b.colors.accent2})`,
                      border: `1px solid ${b.colors.edge}55`,
                    }}
                  />
                  <p
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.8rem",
                      color: "var(--sh-dim)",
                      lineHeight: 1.5,
                    }}
                  >
                    {owned ? b.blurb : req(key)}
                  </p>
                  <StatBar label="Speed" value={b.stats.speed} />
                  <StatBar label="Turn" value={b.stats.turn} />
                  <StatBar label="Pop" value={b.stats.pop} />
                  <StatBar label="Stable" value={b.stats.stability} />
                </button>
              );
            })}
          </div>
        )}

        {tab === "mountains" && (
          <div
            className="sh-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))" }}
          >
            {MOUNTAINS.map((m) => {
              const key = `mountain:${m.id}`;
              const owned = has(key);
              return (
                <button
                  key={m.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.mountain === m.id}
                  onClick={() => onChange({ mountain: m.id })}
                >
                  <div className="sh-eyebrow">
                    {Math.round(Math.atan(m.slope) * (180 / Math.PI))}° avg pitch
                  </div>
                  <div style={{ fontSize: "1.05rem", marginTop: 4 }}>{m.name}</div>
                  <p
                    style={{
                      marginTop: "0.6rem",
                      fontSize: "0.8rem",
                      color: "var(--sh-dim)",
                      lineHeight: 1.5,
                    }}
                  >
                    {owned ? m.blurb : req(key)}
                  </p>
                  <StatBar label="Steep" value={0.75 + m.slope} />
                  <StatBar label="Trees" value={0.75 + m.treeDensity * 0.25} />
                  <StatBar label="Ice" value={0.75 + m.iceBias * 0.25} />
                  <StatBar label="Powder" value={0.75 + m.powderBias * 0.25} />
                </button>
              );
            })}
          </div>
        )}

        {tab === "light" && (
          <div
            className="sh-grid"
            style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}
          >
            {SKY_PRESETS.map((s) => {
              const key = `sky:${s.id}`;
              const owned = has(key);
              return (
                <button
                  key={s.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.sky === s.id}
                  onClick={() => onChange({ sky: s.id })}
                >
                  <div
                    style={{
                      height: 62,
                      borderRadius: 10,
                      background: `linear-gradient(180deg, ${s.zenith}, ${s.horizon} 72%, ${s.ground})`,
                      border: "1px solid rgba(255,255,255,.14)",
                      marginBottom: "0.6rem",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        right: "18%",
                        top: "52%",
                        width: 16,
                        height: 16,
                        borderRadius: 999,
                        background: s.sunColor,
                        boxShadow: `0 0 26px 8px ${s.sunColor}88`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.95rem" }}>{s.name}</div>
                  {!owned && <div className="sh-eyebrow" style={{ marginTop: 4 }}>{req(key)}</div>}
                </button>
              );
            })}
          </div>
        )}

        {tab === "music" && (
          <div className="sh-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(230px,1fr))" }}>
            {TRACKS.map((t) => {
              const key = `track:${t.id}`;
              const owned = has(key);
              return (
                <button
                  key={t.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.track === t.id}
                  onClick={() => onChange({ track: t.id })}
                >
                  <div className="sh-eyebrow">{t.bpm} BPM / {t.mood}</div>
                  <div style={{ fontSize: "1.05rem", marginTop: 4 }}>{t.name}</div>
                  {!owned && <div className="sh-eyebrow" style={{ marginTop: 8 }}>{req(key)}</div>}
                </button>
              );
            })}
          </div>
        )}

        {tab === "look" && (
          <div className="sh-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(190px,1fr))" }}>
            {FILTERS.map((f) => {
              const key = `filter:${f.id}`;
              const owned = has(key);
              return (
                <button
                  key={f.id}
                  className="sh-card"
                  disabled={!owned}
                  data-selected={save.selected.filter === f.id}
                  onClick={() => onChange({ filter: f.id })}
                >
                  <div style={{ fontSize: "0.98rem" }}>{f.name}</div>
                  {!owned && <div className="sh-eyebrow" style={{ marginTop: 6 }}>{req(key)}</div>}
                </button>
              );
            })}
          </div>
        )}

        <div style={{ marginTop: "1.6rem" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Back</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── unlocks ────

export function Unlocks({ save, onBack }: { save: SaveData; onBack: () => void }) {
  const table = useMemo(() => unlockTable(), []);
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const groups: { title: string; kind: string }[] = [
    { title: "Riders", kind: "rider" },
    { title: "Boards", kind: "board" },
    { title: "Mountains", kind: "mountain" },
    { title: "Light", kind: "sky" },
    { title: "Music", kind: "track" },
    { title: "Camera filters", kind: "filter" },
    { title: "Modes", kind: "mode" },
    { title: "Extras", kind: "feature" },
  ];

  const owned = table.filter((u) => save.unlocked.includes(u.key)).length;

  return (
    <div className="sh-overlay">
      <Sheet eyebrow={`${owned} / ${table.length} unlocked`} title="Everything unlocks by riding" wide>
        <div className="sh-grid" style={{ gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))" }}>
          {groups.map((g) => (
            <div key={g.kind}>
              <div className="sh-eyebrow" style={{ marginBottom: "0.55rem" }}>
                {g.title}
              </div>
              <div style={{ display: "grid", gap: "0.3rem" }}>
                {table
                  .filter((u) => u.kind === g.kind)
                  .map((u) => {
                    const got = save.unlocked.includes(u.key);
                    return (
                      <div
                        key={u.key}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          gap: "0.8rem",
                          padding: "0.45rem 0.6rem",
                          borderRadius: 9,
                          background: got ? "rgba(46,229,179,0.09)" : "rgba(255,255,255,0.03)",
                          border: `1px solid ${got ? "rgba(46,229,179,0.35)" : "var(--sh-line)"}`,
                        }}
                      >
                        <span style={{ fontSize: "0.85rem" }}>{u.name}</span>
                        <span
                          className="sh-btn__meta"
                          style={{ textAlign: "right", color: got ? "var(--sh-green)" : undefined }}
                        >
                          {got ? "Earned" : u.requirement.label}
                        </span>
                      </div>
                    );
                  })}
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: "1.6rem" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Back</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ───────────────────────────────────────────────────────────── settings ────

export function SettingsScreen({
  save,
  onChange,
  onReset,
  onBack,
}: {
  save: SaveData;
  onChange: (patch: Partial<SaveData["settings"]>) => void;
  onReset: () => void;
  onBack: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const s = save.settings;
  const row = (label: string, control: React.ReactNode) => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "1.4rem",
        padding: "0.7rem 0",
        borderBottom: "1px solid var(--sh-line)",
      }}
    >
      <span style={{ fontSize: "0.92rem" }}>{label}</span>
      {control}
    </div>
  );

  return (
    <div className="sh-overlay">
      <Sheet eyebrow="Settings" title="Tune it">
        {row(
          "Music",
          <input
            className="sh-range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.music}
            onChange={(e) => onChange({ music: Number(e.target.value) })}
          />,
        )}
        {row(
          "Sound effects",
          <input
            className="sh-range"
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={s.sfx}
            onChange={(e) => onChange({ sfx: Number(e.target.value) })}
          />,
        )}
        {row(
          "Camera shake",
          <input
            className="sh-range"
            type="range"
            min={0}
            max={1.5}
            step={0.05}
            value={s.shake}
            onChange={(e) => onChange({ shake: Number(e.target.value) })}
          />,
        )}
        {row(
          "Quality",
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {(["low", "medium", "high", "ultra"] as const).map((q) => (
              <button
                key={q}
                className="sh-chip"
                data-active={s.quality === q}
                onClick={() => onChange({ quality: q })}
              >
                {q}
              </button>
            ))}
          </div>,
        )}
        {row(
          "Invert steering",
          <button
            className="sh-chip"
            data-active={s.invertSteer}
            onClick={() => onChange({ invertSteer: !s.invertSteer })}
          >
            {s.invertSteer ? "On" : "Off"}
          </button>,
        )}
        {row(
          "On-screen controls",
          <div style={{ display: "flex", gap: "0.35rem" }}>
            {(["auto", "on", "off"] as const).map((t) => (
              <button
                key={t}
                className="sh-chip"
                data-active={s.touch === t}
                onClick={() => onChange({ touch: t })}
              >
                {t}
              </button>
            ))}
          </div>,
        )}
        {row(
          "Control hints",
          <button
            className="sh-chip"
            data-active={s.showHints}
            onClick={() => onChange({ showHints: !s.showHints })}
          >
            {s.showHints ? "On" : "Off"}
          </button>,
        )}
        {row(
          "1999 mode",
          <button
            className="sh-chip"
            data-active={s.retro}
            disabled={!save.unlocked.includes("feature:retro")}
            onClick={() => onChange({ retro: !s.retro })}
          >
            {save.unlocked.includes("feature:retro") ? (s.retro ? "On" : "Off") : "Locked"}
          </button>,
        )}
        {row(
          "CRT filter",
          <button
            className="sh-chip"
            data-active={s.crt}
            disabled={!save.unlocked.includes("feature:crt")}
            onClick={() => onChange({ crt: !s.crt })}
          >
            {save.unlocked.includes("feature:crt") ? (s.crt ? "On" : "Off") : "Locked"}
          </button>,
        )}

        <div style={{ marginTop: "1.6rem", display: "flex", gap: "0.6rem", flexWrap: "wrap" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Back</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onReset}>
            <span className="sh-btn__label">Erase progress</span>
            <span className="sh-btn__meta">Cannot be undone</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── how to ────

export function HowTo({ onBack, touch }: { onBack: () => void; touch: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Escape" || e.code === "Enter") onBack();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const touchControls: [string, string][] = [
    ["Left thumb", "Drag anywhere on the left to steer. The stick appears where you put your thumb — the further you push, the harder you carve."],
    ["Thumb up", "Tuck. Less drag, less steering. Free speed on the straights."],
    ["Thumb down", "Brake. Scrubs speed hard and throws a wall of snow."],
    ["JUMP", "Hold to load up, release to ollie. Tap it again just before you land to stomp it."],
    ["Grab diamond", "Indy, Melon, Nose and Tail — hold one while you're in the air."],
    ["TWEAK", "Hold it with a grab for the tweaked variants: Japan, Method, Mute, Stalefish."],
    ["Left thumb, in the air", "Left / right spins. Up and down flip. Both at once gives you a cork."],
    ["‖", "Pause."],
  ];

  const controls: [string, string][] = [
    ["← →", "Steer. Hold it to carve — a held edge builds speed."],
    ["↑", "Tuck. Less drag, less steering. Free speed on the straights."],
    ["↓", "Brake. Scrubs speed hard and throws a wall of snow."],
    ["Space", "Hold to load up, release to ollie. Tap again just before you land to stomp it."],
    ["A S D F", "Grabs: Indy, Melon, Nose, Tail."],
    ["Shift + grab", "Tweaked variants: Japan, Method, Mute, Stalefish."],
    ["← → in the air", "Spin."],
    ["↑ ↓ in the air", "Front flip / back flip. Add spin for corks."],
    ["Esc", "Pause."],
    ["P", "Photo mode (once unlocked)."],
    ["R", "Restart the run."],
  ];

  const rows = touch ? touchControls : controls;

  return (
    <div className="sh-overlay">
      <Sheet eyebrow="How to ride" title="Thirty seconds to feel good" wide>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(310px,1fr))",
            gap: "1.8rem",
          }}
        >
          <div>
            <div className="sh-eyebrow" style={{ marginBottom: "0.7rem" }}>
              Controls
            </div>
            <div style={{ display: "grid", gap: "0.45rem" }}>
              {rows.map(([k, d]) => (
                <div key={k} style={{ display: "flex", gap: "0.8rem", alignItems: "baseline" }}>
                  <span
                    className="hud-key"
                    style={{
                      minWidth: touch ? 132 : 96,
                      justifyContent: "center",
                      flexShrink: 0,
                    }}
                  >
                    <b>{k}</b>
                  </span>
                  <span style={{ fontSize: "0.86rem", color: "var(--sh-dim)", lineHeight: 1.5 }}>
                    {d}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="sh-eyebrow" style={{ marginBottom: "0.7rem" }}>
              The trick list
            </div>
            <div style={{ display: "grid", gap: "0.35rem" }}>
              {TRICK_INDEX.map((t) => (
                <div
                  key={t.name}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: "1rem",
                    padding: "0.4rem 0",
                    borderBottom: "1px solid var(--sh-line)",
                  }}
                >
                  <span style={{ fontSize: "0.86rem" }}>{t.name}</span>
                  <span className="sh-btn__meta">
                    {touch ? touchHow(t.how) : t.how}
                  </span>
                </div>
              ))}
            </div>
            <p
              style={{
                marginTop: "1.1rem",
                fontSize: "0.86rem",
                color: "var(--sh-dim)",
                lineHeight: 1.6,
              }}
            >
              Land square and level for a <b style={{ color: "#fff" }}>perfect</b> — you get a
              speed boost, a freeze frame and a 1.5× multiplier.{" "}
              {touch ? "Tap JUMP again" : "Tap Space"} right before touchdown to
              stomp it, and you keep the combo going into the next hit. Chain
              them and the multiplier climbs fast.
            </p>
          </div>
        </div>

        <div style={{ marginTop: "1.6rem" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Got it</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}

/** Rewrites a keyboard hint as its on-screen-control equivalent. */
function touchHow(how: string) {
  return how
    .replace("Hold ← or → in the air", "Thumb left or right in the air")
    .replace("Hold ↑ in the air", "Thumb up in the air")
    .replace("Hold ↓ in the air", "Thumb down in the air")
    .replace("Tap Space just before you touch down", "Tap JUMP just before you land")
    .replace(/^Shift \+ /, "TWEAK + ");
}

// ──────────────────────────────────────────────────────────────── pause ────

export function PauseMenu({
  onResume,
  onRestart,
  onQuit,
  onPhoto,
  photoUnlocked,
}: {
  onResume: () => void;
  onRestart: () => void;
  onQuit: () => void;
  onPhoto: () => void;
  photoUnlocked: boolean;
}) {
  const actions = useMemo(() => {
    const a = [
      { label: "Resume", meta: "Esc", fn: onResume },
      { label: "Restart run", meta: "R", fn: onRestart },
    ];
    if (photoUnlocked) a.push({ label: "Photo mode", meta: "P", fn: onPhoto });
    a.push({ label: "Quit to menu", meta: "", fn: onQuit });
    return a;
  }, [onResume, onRestart, onQuit, onPhoto, photoUnlocked]);

  const [index, setIndex] = useMenuKeys(actions.length, (i) => actions[i].fn(), onResume);

  return (
    <div className="sh-overlay">
      <Sheet eyebrow="Paused" title="Take a breath">
        <div style={{ display: "grid", gap: "0.5rem", minWidth: 320 }}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              className="sh-btn"
              data-focus={i === index}
              onMouseEnter={() => setIndex(i)}
              onClick={a.fn}
            >
              <span className="sh-btn__label">{a.label}</span>
              <span className="sh-btn__meta">{a.meta}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

// ────────────────────────────────────────────────────────────── results ────

export function Results({
  summary,
  metric,
  isBest,
  onAgain,
  onMenu,
}: {
  summary: RunSummary;
  metric: "score" | "time" | "distance";
  isBest: boolean;
  onAgain: () => void;
  onMenu: () => void;
}) {
  const actions = useMemo(
    () => [
      { label: "One more run", meta: "Enter", fn: onAgain },
      { label: "Back to menu", meta: "Esc", fn: onMenu },
    ],
    [onAgain, onMenu],
  );
  const [index, setIndex] = useMenuKeys(actions.length, (i) => actions[i].fn(), onMenu);

  const headline =
    metric === "time"
      ? formatTime(summary.time)
      : metric === "distance"
        ? `${(summary.distance / 1000).toFixed(2)} km`
        : formatScore(summary.score);

  const stats: [string, string][] = [
    ["Score", formatScore(summary.score)],
    ["Time", formatTime(summary.time)],
    ["Distance", `${(summary.distance / 1000).toFixed(2)} km`],
    ["Tricks", String(summary.tricks)],
    ["Perfect landings", String(summary.perfects)],
    ["Best trick", formatScore(summary.bestTrick)],
    ["Longest air", `${summary.longestAir.toFixed(2)}s`],
    ["Top speed", `${Math.round(summary.topSpeed * 3.6)} km/h`],
    ["Crashes", String(summary.crashes)],
  ];
  if (summary.gatesPassed + summary.gatesMissed > 0) {
    stats.push([
      "Gates",
      `${summary.gatesPassed} / ${summary.gatesPassed + summary.gatesMissed}`,
    ]);
  }

  return (
    <div className="sh-overlay">
      <Sheet eyebrow={isBest ? "New personal best" : "Run complete"} wide>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          className="sh-title"
          style={{
            fontSize: "clamp(3rem,10vw,7rem)",
            marginBottom: "0.4rem",
            color: isBest ? "var(--sh-green)" : "#fff",
          }}
        >
          {headline}
        </motion.div>

        <div
          className="sh-grid"
          style={{
            gridTemplateColumns: "repeat(auto-fill,minmax(180px,1fr))",
            margin: "1.6rem 0",
          }}
        >
          {stats.map(([k, v], i) => (
            <motion.div
              key={k}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 + i * 0.035 }}
              style={{
                padding: "0.7rem 0.85rem",
                borderRadius: 12,
                border: "1px solid var(--sh-line)",
                background: "rgba(255,255,255,0.035)",
              }}
            >
              <div className="sh-eyebrow">{k}</div>
              <div
                className="shred-mono"
                style={{ fontSize: "1.2rem", marginTop: 3, fontWeight: 600 }}
              >
                {v}
              </div>
            </motion.div>
          ))}
        </div>

        <div style={{ display: "grid", gap: "0.5rem", maxWidth: 380 }}>
          {actions.map((a, i) => (
            <button
              key={a.label}
              className="sh-btn"
              data-focus={i === index}
              onMouseEnter={() => setIndex(i)}
              onClick={a.fn}
            >
              <span className="sh-btn__label">{a.label}</span>
              <span className="sh-btn__meta">{a.meta}</span>
            </button>
          ))}
        </div>
      </Sheet>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────── toasts ────

export function UnlockToasts({ items }: { items: { key: string; name: string }[] }) {
  return (
    <div className="sh-toast">
      <AnimatePresence>
        {items.map((u) => (
          <motion.div
            key={u.key}
            initial={{ opacity: 0, x: 40, scale: 0.94 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 40, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 320, damping: 26 }}
            className="sh-toast-item"
          >
            <div className="sh-eyebrow" style={{ color: "var(--sh-green)" }}>
              Unlocked
            </div>
            <div style={{ fontSize: "0.98rem", marginTop: 2 }}>{u.name}</div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

// ────────────────────────────────────────────────────────── photo mode ────

export function PhotoBar({
  onShoot,
  onExit,
  onFilter,
  filterName,
  touch,
}: {
  onShoot: () => void;
  onExit: () => void;
  onFilter: () => void;
  filterName: string;
  touch: boolean;
}) {
  return (
    <div className="shred-layer">
      <div
        className="sh-panel"
        style={{
          position: "absolute",
          left: "50%",
          bottom: `calc(1.4rem + var(--sh-safe-b))`,
          transform: "translateX(-50%)",
          padding: "0.7rem 1rem",
          display: "flex",
          gap: "0.6rem",
          alignItems: "center",
          flexWrap: "wrap",
          justifyContent: "center",
          maxWidth: "94vw",
        }}
      >
        {touch ? (
          <>
            <span className="sh-chip">Drag to orbit</span>
            <span className="sh-chip">Pinch to zoom</span>
          </>
        ) : (
          <>
            <span className="sh-chip">← → orbit</span>
            <span className="sh-chip">↑ ↓ pitch</span>
            <span className="sh-chip">A / D zoom</span>
          </>
        )}
        <button className="sh-chip" data-active onClick={onFilter}>
          {touch ? "" : "C / "}
          {filterName}
        </button>
        <button className="sh-btn" style={{ width: "auto" }} onClick={onShoot}>
          <span className="sh-btn__label">Shoot</span>
          <span className="sh-btn__meta">Space</span>
        </button>
        <button className="sh-btn" style={{ width: "auto" }} onClick={onExit}>
          <span className="sh-btn__label">Exit</span>
          <span className="sh-btn__meta">P</span>
        </button>
      </div>
    </div>
  );
}
