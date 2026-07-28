"use client";

/**
 * The character creator.
 *
 * Two columns: a live turntable on the left, the options on the right. Every
 * control writes straight into one `Appearance` object and the preview rebuilds
 * from it, so there is no separate "apply" step and nothing to keep in sync.
 *
 * The option set is deliberately gear-first. You cannot sculpt a face here and
 * you never will be able to — what you can do is choose a helmet, pull a gaiter
 * up, put mirrored lenses in, and pick a jacket cut. That is both the honest
 * limit of the rig and, as it happens, how snowboarders actually look.
 */

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ACCESSORIES,
  BUILDS,
  EYEWEAR,
  BEARDS,
  FACE,
  GEAR_COLORS,
  HAIR,
  HAIR_COLORS,
  HANDS,
  HEADWEAR,
  JACKETS,
  LENS_COLORS,
  PANTS,
  SKIN_TONES,
  randomAppearance,
  type Appearance,
  type Option,
} from "../data/appearance";
import { ARCHETYPES, RIDERS, type CustomRider } from "../data/riders";
import type { SaveData } from "../core/save";
import { Sheet } from "./Menus";
import { RiderPreview } from "./RiderPreview";

/** A row of mutually exclusive chips. */
function Choice<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: Option<T>[];
  value: T;
  onChange: (v: T) => void;
}) {
  const active = options.find((o) => o.id === value);
  return (
    <div className="sh-field">
      <div className="sh-field__head">
        <span className="sh-eyebrow">{label}</span>
        {active?.note && <span className="sh-field__note">{active.note}</span>}
      </div>
      <div className="sh-field__row">
        {options.map((o) => (
          <button
            key={o.id}
            type="button"
            className="sh-chip"
            data-active={o.id === value}
            onClick={() => onChange(o.id)}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** A row of colour swatches. */
function Swatches({
  label,
  colors,
  value,
  onChange,
}: {
  label: string;
  colors: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="sh-field">
      <div className="sh-field__head">
        <span className="sh-eyebrow">{label}</span>
      </div>
      <div className="sh-field__row">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            className="sh-swatch-btn"
            data-active={c.toLowerCase() === value.toLowerCase()}
            style={{ background: c }}
            aria-label={`${label}: ${c}`}
            onClick={() => onChange(c)}
          />
        ))}
      </div>
    </div>
  );
}

type Tab = "body" | "head" | "kit";

export function Creator({
  save,
  editing,
  onSave,
  onBack,
}: {
  save: SaveData;
  /** The rider being edited, or null for a new one. */
  editing: CustomRider | null;
  onSave: (rider: CustomRider) => void;
  onBack: () => void;
}) {
  const [name, setName] = useState(editing?.name ?? "");
  const [archetype, setArchetype] = useState(editing?.archetype ?? "allround");
  const [look, setLook] = useState<Appearance>(
    () => editing?.appearance ?? randomAppearance(),
  );
  const [tab, setTab] = useState<Tab>("head");

  const set = useCallback(
    <K extends keyof Appearance>(key: K, value: Appearance[K]) =>
      setLook((prev) => ({ ...prev, [key]: value })),
    [],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      // The name field owns Escape while it has focus, or you can't get out of
      // a typo without losing the whole rider.
      if (e.code === "Escape") {
        const el = document.activeElement as HTMLElement | null;
        if (el?.tagName === "INPUT") {
          el.blur();
          return;
        }
        onBack();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onBack]);

  const arch = ARCHETYPES.find((a) => a.id === archetype) ?? ARCHETYPES[0];

  const commit = () => {
    const id = editing?.id ?? `custom-${Date.now().toString(36)}`;
    onSave({ id, name: name.trim() || "Untitled Rider", archetype, appearance: look });
  };

  const slots = useMemo(
    () => save.customRiders.length + (editing ? 0 : 1),
    [save.customRiders.length, editing],
  );

  const tabs: { id: Tab; label: string }[] = [
    { id: "head", label: "Head" },
    { id: "body", label: "Outfit" },
    { id: "kit", label: "Rider" },
  ];

  return (
    <div className="sh-overlay">
      <Sheet eyebrow={editing ? "Edit rider" : "Create a rider"} title="Build somebody" wide>
        <div className="sh-creator">
          <div className="sh-creator__preview">
            <RiderPreview
              appearance={look}
              board={save.selected.board}
              height={360}
              framing={tab === "head" ? "head" : "full"}
            />
            <button
              type="button"
              className="sh-btn"
              style={{ width: "100%" }}
              onClick={() => setLook(randomAppearance())}
            >
              <span className="sh-btn__label">Surprise me</span>
              <span className="sh-btn__meta">Random</span>
            </button>
          </div>

          <div className="sh-creator__options">
            <div className="sh-field">
              <div className="sh-field__head">
                <span className="sh-eyebrow">Name</span>
                <span className="sh-field__note">Rider {slots} of yours</span>
              </div>
              <input
                className="sh-input"
                value={name}
                maxLength={22}
                placeholder="Untitled Rider"
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="sh-field__row" style={{ marginBottom: "1rem" }}>
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className="sh-chip"
                  data-active={tab === t.id}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="sh-creator__scroll">
              {tab === "head" && (
                <>
                  <Choice
                    label="Headwear"
                    options={HEADWEAR}
                    value={look.headwear}
                    onChange={(v) => set("headwear", v)}
                  />
                  <Swatches
                    label="Headwear colour"
                    colors={GEAR_COLORS}
                    value={look.headwearColor}
                    onChange={(v) => set("headwearColor", v)}
                  />
                  <Choice
                    label="Hair"
                    options={HAIR}
                    value={look.hair}
                    onChange={(v) => set("hair", v)}
                  />
                  <Swatches
                    label="Hair colour"
                    colors={HAIR_COLORS}
                    value={look.hairColor}
                    onChange={(v) => set("hairColor", v)}
                  />
                  <Choice
                    label="Beard"
                    options={BEARDS}
                    value={look.beard}
                    onChange={(v) => set("beard", v)}
                  />
                  <Choice
                    label="Face"
                    options={FACE}
                    value={look.face}
                    onChange={(v) => set("face", v)}
                  />
                  <Swatches
                    label="Face colour"
                    colors={GEAR_COLORS}
                    value={look.faceColor}
                    onChange={(v) => set("faceColor", v)}
                  />
                  <Choice
                    label="Eyes"
                    options={EYEWEAR}
                    value={look.eyewear}
                    onChange={(v) => set("eyewear", v)}
                  />
                  <Swatches
                    label="Lens"
                    colors={LENS_COLORS}
                    value={look.lensColor}
                    onChange={(v) => set("lensColor", v)}
                  />
                  <Swatches
                    label="Frame + strap"
                    colors={GEAR_COLORS}
                    value={look.frameColor}
                    onChange={(v) => set("frameColor", v)}
                  />
                  <Swatches
                    label="Skin"
                    colors={SKIN_TONES}
                    value={look.skin}
                    onChange={(v) => set("skin", v)}
                  />
                </>
              )}

              {tab === "body" && (
                <>
                  <Choice
                    label="Build"
                    options={BUILDS}
                    value={look.build}
                    onChange={(v) => set("build", v)}
                  />
                  <Choice
                    label="Jacket"
                    options={JACKETS}
                    value={look.jacket}
                    onChange={(v) => set("jacket", v)}
                  />
                  <Swatches
                    label="Jacket"
                    colors={GEAR_COLORS}
                    value={look.jacketColor}
                    onChange={(v) => set("jacketColor", v)}
                  />
                  <Swatches
                    label="Jacket trim"
                    colors={GEAR_COLORS}
                    value={look.jacketAlt}
                    onChange={(v) => set("jacketAlt", v)}
                  />
                  <Choice
                    label="Pants"
                    options={PANTS}
                    value={look.pants}
                    onChange={(v) => set("pants", v)}
                  />
                  <Swatches
                    label="Pants"
                    colors={GEAR_COLORS}
                    value={look.pantsColor}
                    onChange={(v) => set("pantsColor", v)}
                  />
                  <Choice
                    label="Hands"
                    options={HANDS}
                    value={look.hands}
                    onChange={(v) => set("hands", v)}
                  />
                  <Swatches
                    label="Gloves"
                    colors={GEAR_COLORS}
                    value={look.handsColor}
                    onChange={(v) => set("handsColor", v)}
                  />
                  <Swatches
                    label="Accent"
                    colors={GEAR_COLORS}
                    value={look.accent}
                    onChange={(v) => set("accent", v)}
                  />
                  <Choice
                    label="Carrying"
                    options={ACCESSORIES}
                    value={look.accessory}
                    onChange={(v) => set("accessory", v)}
                  />
                </>
              )}

              {tab === "kit" && (
                <div className="sh-field">
                  <div className="sh-field__head">
                    <span className="sh-eyebrow">How they ride</span>
                  </div>
                  <div
                    className="sh-grid"
                    style={{ gridTemplateColumns: "repeat(auto-fill,minmax(200px,1fr))" }}
                  >
                    {ARCHETYPES.map((a) => (
                      <button
                        key={a.id}
                        type="button"
                        className="sh-card"
                        data-selected={a.id === archetype}
                        onClick={() => setArchetype(a.id)}
                      >
                        <div style={{ fontSize: "1rem" }}>{a.name}</div>
                        <p
                          style={{
                            marginTop: "0.5rem",
                            fontSize: "0.78rem",
                            color: "var(--sh-dim)",
                            lineHeight: 1.5,
                          }}
                        >
                          {a.blurb}
                        </p>
                      </button>
                    ))}
                  </div>
                  <p
                    style={{
                      marginTop: "1rem",
                      fontSize: "0.78rem",
                      color: "var(--sh-dim)",
                      lineHeight: 1.6,
                    }}
                  >
                    Signature grab: {arch.style.signature}. Every style sits inside the
                    same balance envelope as the {RIDERS.length} riders you can unlock —
                    building your own is a way to look like yourself, not a way to win.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="sh-field__row" style={{ marginTop: "1.4rem" }}>
          <button className="sh-btn" style={{ width: "auto" }} onClick={commit}>
            <span className="sh-btn__label">{editing ? "Save changes" : "Add to garage"}</span>
            <span className="sh-btn__meta">Enter</span>
          </button>
          <button className="sh-btn" style={{ width: "auto" }} onClick={onBack}>
            <span className="sh-btn__label">Cancel</span>
            <span className="sh-btn__meta">Esc</span>
          </button>
        </div>
      </Sheet>
    </div>
  );
}
