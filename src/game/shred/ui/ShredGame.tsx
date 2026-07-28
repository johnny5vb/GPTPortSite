"use client";

/**
 * SHRED // 1999 — React shell.
 *
 * Owns the canvas, the save file and which screen is up. The engine runs
 * continuously behind the menus (the title screen is a live run on autopilot),
 * so there is never a loading gap between deciding to ride and riding.
 */

import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import "./shred.css";
import { Game, type GameEvent, type HudSnapshot, type RunSummary } from "../core/Game";
import type { ModeId } from "../data/modes";
import { modeById } from "../data/modes";
import {
  evaluateUnlocks,
  load,
  resetSave,
  save as persist,
  type SaveData,
  type UnlockDef,
} from "../core/save";
import Hud, { type Popup } from "./Hud";
import {
  Garage,
  HowTo,
  ModeSelect,
  PauseMenu,
  PhotoBar,
  Results,
  SettingsScreen,
  TitleScreen,
  Unlocks,
  UnlockToasts,
} from "./Menus";
import { FILTERS, type FilterId } from "../fx/PostFX";

type Screen =
  | "title"
  | "modes"
  | "garage"
  | "unlocks"
  | "settings"
  | "howto"
  | "run";

const EMPTY_HUD: HudSnapshot = {
  status: "loading",
  speedKmh: 0,
  speed01: 0,
  score: 0,
  chain: 0,
  chainFraction: 0,
  pendingScore: 0,
  trickName: "",
  airTime: 0,
  airHeight: 0,
  bigAir: 0,
  time: 0,
  timeLeft: 0,
  distance: 0,
  distanceLeft: 0,
  crashes: 0,
  gatesPassed: 0,
  gatesMissed: 0,
  airsLeft: 0,
  grounded: true,
  charge: 0,
  boost: 0,
  surface: "groom",
  mountainName: "",
  modeName: "",
  hud: "full",
  fps: 60,
};

export default function ShredGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameRef = useRef<Game | null>(null);
  const hudRef = useRef<HudSnapshot>({ ...EMPTY_HUD });
  const popupId = useRef(0);
  const bannerTimer = useRef<number | null>(null);
  const audioStarted = useRef(false);
  const garageDirty = useRef(false);

  const [saveData, setSaveData] = useState<SaveData | null>(() => {
    if (typeof window === "undefined") return null;
    const d = load();
    // Totals are the only gate, so reconcile them with the unlock table on
    // boot rather than only at the end of a run.
    if (evaluateUnlocks(d).length) persist(d);
    return d;
  });
  const [screen, setScreen] = useState<Screen>("title");
  const [paused, setPaused] = useState(false);
  const [photo, setPhoto] = useState(false);
  const [loading, setLoading] = useState(true);
  const [popups, setPopups] = useState<Popup[]>([]);
  const [banner, setBanner] = useState<string | null>(null);
  const [summary, setSummary] = useState<RunSummary | null>(null);
  const [isBest, setIsBest] = useState(false);
  const [toasts, setToasts] = useState<UnlockDef[]>([]);
  const [filterName, setFilterName] = useState("Clean");

  const saveRef = useRef<SaveData | null>(saveData);
  useEffect(() => {
    saveRef.current = saveData;
  }, [saveData]);

  const getSnapshot = useCallback(() => hudRef.current, []);

  // ─────────────────────────────────────────────────────────── lifecycle ────

  const showBanner = useCallback((text: string, ms = 1100) => {
    setBanner(text);
    if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    bannerTimer.current = window.setTimeout(() => setBanner(null), ms);
  }, []);

  const handleEvent = useCallback(
    (e: GameEvent) => {
      switch (e.type) {
        case "trick": {
          const id = popupId.current++;
          const p: Popup = {
            id,
            name: e.result.name,
            total: e.result.total,
            chain: e.result.chain,
            quality: e.result.quality,
            stomped: e.result.stomped,
          };
          setPopups((prev) => [...prev.slice(-4), p]);
          window.setTimeout(
            () => setPopups((prev) => prev.filter((x) => x.id !== id)),
            1500,
          );
          if (e.result.chain >= 5) showBanner(`${e.result.chain}× COMBO`, 900);
          break;
        }
        case "landing":
          if (e.quality === "perfect") showBanner("PERFECT", 620);
          break;
        case "crash":
          showBanner("WIPEOUT", 900);
          break;
        case "finish":
          setSummary(e.summary);
          break;
        case "photo": {
          const a = document.createElement("a");
          a.href = e.dataUrl;
          a.download = `shred-1999-${Date.now()}.png`;
          a.click();
          break;
        }
        default:
          break;
      }
    },
    [showBanner],
  );

  /** Tear down the running game and build a fresh one for `mode`. */
  const rebuild = useCallback(
    (mode: ModeId, autoStart: boolean) => {
      const canvas = canvasRef.current;
      const data = saveRef.current;
      if (!canvas || !data) return;

      setLoading(true);
      // Let the loading overlay paint before we block on terrain generation.
      requestAnimationFrame(() => {
        gameRef.current?.dispose();
        const g = new Game({
          canvas,
          save: data,
          mode,
          onHud: (s) => {
            hudRef.current = s;
          },
          onEvent: handleEvent,
        });
        gameRef.current = g;
        g.resize();
        g.run();
        if (audioStarted.current) {
          void g.audio.start();
        }
        if (autoStart) g.start();
        setFilterName(
          FILTERS.find((f) => f.id === (data.selected.filter as FilterId))?.name ??
            "Clean",
        );
        setLoading(false);
      });
    },
    [handleEvent],
  );

  // Boot the background run once the save file is in.
  useEffect(() => {
    if (!saveData || gameRef.current) return;
    rebuild("freeride", false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [saveData]);

  useEffect(() => {
    return () => {
      gameRef.current?.dispose();
      gameRef.current = null;
      if (bannerTimer.current) window.clearTimeout(bannerTimer.current);
    };
  }, []);

  // Resize.
  useEffect(() => {
    const onResize = () => gameRef.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Audio needs a gesture. Any key or click will do.
  useEffect(() => {
    const unlock = () => {
      if (audioStarted.current) return;
      audioStarted.current = true;
      void gameRef.current?.audio.start();
    };
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("pointerdown", unlock, { once: true });
    return () => {
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("pointerdown", unlock);
    };
  }, []);

  // ───────────────────────────────────────────────────── run-state mirror ────

  useEffect(() => {
    if (screen !== "run") return;
    let raf = 0;
    const tick = () => {
      raf = requestAnimationFrame(tick);
      const g = gameRef.current;
      if (!g) return;
      const s = hudRef.current.status;
      setPaused(s === "paused");
      setPhoto(s === "photo");
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [screen]);

  // R restarts a live run.
  useEffect(() => {
    if (screen !== "run" || summary) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "KeyR") {
        e.preventDefault();
        const g = gameRef.current;
        if (!g) return;
        g.resetRun();
        g.start();
        setPopups([]);
        showBanner("DROPPING IN", 800);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [screen, summary, showBanner]);

  // ────────────────────────────────────────────────────────────── saving ────

  const commitRun = useCallback((s: RunSummary) => {
    const data = saveRef.current;
    if (!data) return;
    const t = data.totals;
    t.runs += 1;
    t.distance += s.distance;
    t.tricks += s.tricks;
    t.perfects += s.perfects;
    t.crashes += s.crashes;
    t.lifetimeScore += s.score;
    t.bestScore = Math.max(t.bestScore, s.score);
    t.bestAir = Math.max(t.bestAir, s.longestAir);
    t.bestTrick = Math.max(t.bestTrick, s.bestTrick);
    t.topSpeed = Math.max(t.topSpeed, s.topSpeed);

    const key = `${s.mode}:${s.mountain}`;
    const mode = modeById(s.mode);
    let best = false;
    if (mode.metric === "time") {
      const prev = data.bestTime[key];
      if (s.time > 0 && (prev === undefined || s.time < prev)) {
        data.bestTime[key] = s.time;
        best = true;
      }
    } else if (mode.metric === "distance") {
      const prev = data.best[key] ?? 0;
      if (s.distance > prev) {
        data.best[key] = s.distance;
        best = true;
      }
    } else {
      const prev = data.best[key] ?? 0;
      if (s.score > prev) {
        data.best[key] = s.score;
        best = true;
      }
    }
    if (s.mode === "daily") {
      data.dailySeed = new Date().toISOString().slice(0, 10);
      data.dailyBest = Math.max(data.dailyBest, s.score);
    }

    const fresh = evaluateUnlocks(data);
    persist(data);
    setSaveData({ ...data });
    setIsBest(best);

    if (fresh.length) {
      setToasts(fresh);
      gameRef.current?.audio.ui("unlock");
      window.setTimeout(() => setToasts([]), 5200);
    }
  }, []);

  useEffect(() => {
    if (summary) commitRun(summary);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [summary]);

  // ───────────────────────────────────────────────────────────── actions ────

  const startMode = useCallback(
    (id: ModeId) => {
      gameRef.current?.audio.ui("select");
      setSummary(null);
      setPopups([]);
      setScreen("run");
      rebuild(id, true);
      showBanner("DROPPING IN", 900);
    },
    [rebuild, showBanner],
  );

  const again = useCallback(() => {
    const g = gameRef.current;
    if (!g) return;
    setSummary(null);
    setPopups([]);
    setIsBest(false);
    g.resetRun();
    g.start();
    showBanner("DROPPING IN", 800);
  }, [showBanner]);

  // Enter on the results screen goes again.
  useEffect(() => {
    if (!summary) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.code === "Enter") {
        e.preventDefault();
        again();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [summary, again]);

  const quitToMenu = useCallback(() => {
    setSummary(null);
    setPopups([]);
    setScreen("title");
    rebuild("freeride", false);
  }, [rebuild]);

  const patchSelected = useCallback(
    (patch: Partial<SaveData["selected"]>) => {
      const data = saveRef.current;
      if (!data) return;
      Object.assign(data.selected, patch);
      persist(data);
      setSaveData({ ...data });
      gameRef.current?.audio.ui("move");

      const g = gameRef.current;
      if (!g) return;
      // Cheap changes apply live; the rest waits until we leave the garage.
      if (patch.sky) g.setSky(patch.sky);
      if (patch.filter) {
        g.setFilter(patch.filter as FilterId);
        setFilterName(FILTERS.find((f) => f.id === patch.filter)?.name ?? "Clean");
      }
      if (patch.track) g.audio.setTrack(patch.track);
      if (patch.rider || patch.board || patch.mountain) garageDirty.current = true;
    },
    [],
  );

  const patchSettings = useCallback((patch: Partial<SaveData["settings"]>) => {
    const data = saveRef.current;
    if (!data) return;
    Object.assign(data.settings, patch);
    persist(data);
    setSaveData({ ...data });

    const g = gameRef.current;
    if (!g) return;
    if (patch.music !== undefined) g.audio.setMusicVolume(patch.music);
    if (patch.sfx !== undefined) g.audio.setSfxVolume(patch.sfx);
    if (patch.shake !== undefined) g.setShake(patch.shake);
    if (patch.retro !== undefined) g.setRetro(patch.retro);
    if (patch.crt !== undefined) g.setCrt(patch.crt);
    if (patch.quality !== undefined) {
      g.applyQuality();
      g.resize();
    }
  }, []);

  const leaveGarage = useCallback(() => {
    setScreen("title");
    if (garageDirty.current) {
      garageDirty.current = false;
      rebuild("freeride", false);
    }
  }, [rebuild]);

  if (!saveData) {
    return (
      <div className="shred-root">
        <div className="sh-overlay">
          <div className="sh-eyebrow">Loading</div>
        </div>
      </div>
    );
  }

  const riding = screen === "run" && !paused && !summary && !photo;

  return (
    <div className="shred-root" data-riding={riding}>
      <canvas ref={canvasRef} className="shred-canvas" />
      <div className="sh-scanline" />

      {screen === "run" && (
        <Hud
          getSnapshot={getSnapshot}
          popups={popups}
          banner={banner}
          showHints={saveData.settings.showHints && !photo}
        />
      )}

      <>
        {screen === "title" && (
          <div className="shred-layer">
            <TitleScreen
              save={saveData}
              onPlay={() => setScreen("modes")}
              onGarage={() => setScreen("garage")}
              onUnlocks={() => setScreen("unlocks")}
              onSettings={() => setScreen("settings")}
              onHowTo={() => setScreen("howto")}
            />
          </div>
        )}

        {screen === "modes" && (
          <div className="shred-layer">
            <ModeSelect
              save={saveData}
              onPick={startMode}
              onBack={() => setScreen("title")}
            />
          </div>
        )}

        {screen === "garage" && (
          <div className="shred-layer">
            <Garage save={saveData} onChange={patchSelected} onBack={leaveGarage} />
          </div>
        )}

        {screen === "unlocks" && (
          <div className="shred-layer">
            <Unlocks save={saveData} onBack={() => setScreen("title")} />
          </div>
        )}

        {screen === "settings" && (
          <div className="shred-layer">
            <SettingsScreen
              save={saveData}
              onChange={patchSettings}
              onReset={() => {
                const d = resetSave();
                setSaveData(d);
                gameRef.current?.audio.ui("back");
              }}
              onBack={() => setScreen("title")}
            />
          </div>
        )}

        {screen === "howto" && (
          <div className="shred-layer">
            <HowTo onBack={() => setScreen("title")} />
          </div>
        )}
      </>

      {screen === "run" && photo && (
        <PhotoBar
          filterName={filterName}
          onShoot={() => gameRef.current?.capturePhoto()}
          onExit={() => gameRef.current?.togglePhoto()}
        />
      )}

      {screen === "run" && paused && !summary && (
        <div className="shred-layer">
          <PauseMenu
            photoUnlocked={saveData.unlocked.includes("feature:photo")}
            onResume={() => gameRef.current?.resume()}
            onRestart={again}
            onPhoto={() => gameRef.current?.togglePhoto()}
            onQuit={quitToMenu}
          />
        </div>
      )}

      {summary && (
        <div className="shred-layer">
          <Results
            summary={summary}
            metric={modeById(summary.mode).metric}
            isBest={isBest}
            onAgain={again}
            onMenu={quitToMenu}
          />
        </div>
      )}

      {toasts.length > 0 && (
        <div className="shred-layer">
          <UnlockToasts items={toasts} />
        </div>
      )}

      <AnimatePresence>
        {loading && (
          <motion.div
            key="loading"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.12 } }}
            transition={{ duration: 0.5 }}
            className="shred-layer"
            style={{
              display: "grid",
              placeItems: "center",
              background: "#05070c",
            }}
          >
            <div style={{ textAlign: "center" }}>
              <div
                className="sh-title"
                style={{ fontSize: "clamp(2rem,6vw,3.6rem)", letterSpacing: "-0.03em" }}
              >
                SHRED <span style={{ opacity: 0.35 }}>{"//"}</span> 1999
              </div>
              <div className="sh-eyebrow" style={{ marginTop: "0.8rem" }}>
                Building the mountain…
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
