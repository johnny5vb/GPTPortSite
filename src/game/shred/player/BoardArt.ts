/**
 * Procedural topsheet graphics. No image assets — every deck is painted onto a
 * canvas at load time, which keeps the whole game a single JS bundle and lets
 * board colours come straight from the data file.
 */

import * as THREE from "three";
import type { Board } from "../data/boards";
import { makeRng } from "../core/rng";

const W = 128;
const H = 512;

/**
 * Surface finish per topsheet. A sintered race base and a hand-painted art
 * deck should not catch the light the same way, and the chrome wrap only
 * works at all if it actually takes the environment map.
 */
export function boardFinish(art: Board["art"]): {
  roughness: number;
  metalness: number;
  envMapIntensity: number;
} {
  switch (art) {
    case "chrome":
      return { roughness: 0.08, metalness: 0.95, envMapIntensity: 1.8 };
    case "carbon":
      return { roughness: 0.22, metalness: 0.5, envMapIntensity: 1.3 };
    case "matte":
      return { roughness: 0.62, metalness: 0.04, envMapIntensity: 0.7 };
    case "wood":
    case "painted":
      return { roughness: 0.44, metalness: 0.02, envMapIntensity: 0.85 };
    case "camo":
      return { roughness: 0.55, metalness: 0.03, envMapIntensity: 0.75 };
    default:
      return { roughness: 0.28, metalness: 0.12, envMapIntensity: 1.1 };
  }
}

export function makeBoardTexture(board: Board): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const rng = makeRng(
    board.id.split("").reduce((a, ch) => a + ch.charCodeAt(0) * 31, 7),
  );
  const { base, accent, accent2 } = board.colors;

  g.fillStyle = base;
  g.fillRect(0, 0, W, H);

  switch (board.art) {
    case "wood": {
      for (let i = 0; i < 90; i++) {
        g.strokeStyle = i % 3 === 0 ? accent : accent2;
        g.globalAlpha = 0.12 + rng() * 0.18;
        g.lineWidth = 1 + rng() * 2.6;
        g.beginPath();
        const x = rng() * W;
        g.moveTo(x, 0);
        for (let y = 0; y <= H; y += 24) {
          g.lineTo(x + Math.sin(y * 0.02 + i) * 7, y);
        }
        g.stroke();
      }
      g.globalAlpha = 1;
      g.strokeStyle = accent;
      g.lineWidth = 3;
      g.strokeRect(9, 9, W - 18, H - 18);
      break;
    }
    case "nineties": {
      // Confetti, zigzags and a lot of unearned confidence.
      g.fillStyle = accent;
      for (let i = 0; i < 5; i++) {
        g.beginPath();
        const y = (i / 5) * H;
        g.moveTo(0, y);
        for (let x = 0; x <= W; x += 16)
          g.lineTo(x, y + (x % 32 === 0 ? 22 : -22));
        g.lineTo(W, y + 46);
        for (let x = W; x >= 0; x -= 16)
          g.lineTo(x, y + 46 + (x % 32 === 0 ? 22 : -22));
        g.closePath();
        g.fill();
      }
      for (let i = 0; i < 160; i++) {
        g.fillStyle = rng() < 0.5 ? accent2 : "#ffffff";
        g.save();
        g.translate(rng() * W, rng() * H);
        g.rotate(rng() * 6.28);
        g.fillRect(-4, -1.5, 8, 3);
        g.restore();
      }
      break;
    }
    case "matte": {
      g.fillStyle = accent;
      g.globalAlpha = 0.5;
      g.fillRect(0, H * 0.42, W, H * 0.16);
      g.globalAlpha = 1;
      g.fillStyle = accent2;
      g.fillRect(W * 0.5 - 1, H * 0.1, 2, H * 0.8);
      break;
    }
    case "neon": {
      const grad = g.createLinearGradient(0, 0, 0, H);
      grad.addColorStop(0, "#0b0620");
      grad.addColorStop(0.5, accent);
      grad.addColorStop(1, "#0b0620");
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      g.strokeStyle = accent2;
      g.lineWidth = 2;
      for (let i = 0; i < 22; i++) {
        const y = H * 0.5 + Math.pow(i / 22, 2) * H * 0.5;
        g.globalAlpha = 0.85 - i * 0.03;
        g.beginPath();
        g.moveTo(0, y);
        g.lineTo(W, y);
        g.stroke();
      }
      for (let i = -6; i <= 6; i++) {
        g.globalAlpha = 0.5;
        g.beginPath();
        g.moveTo(W / 2, H * 0.5);
        g.lineTo(W / 2 + i * 60, H);
        g.stroke();
      }
      g.globalAlpha = 1;
      g.fillStyle = "#ffe9a8";
      g.beginPath();
      g.arc(W / 2, H * 0.42, 26, 0, 6.28);
      g.fill();
      break;
    }
    case "painted": {
      for (let i = 0; i < 34; i++) {
        g.fillStyle = rng() < 0.5 ? accent : accent2;
        g.globalAlpha = 0.35 + rng() * 0.5;
        g.save();
        g.translate(rng() * W, rng() * H);
        g.rotate(rng() * 6.28);
        g.beginPath();
        g.ellipse(0, 0, 8 + rng() * 30, 4 + rng() * 12, 0, 0, 6.28);
        g.fill();
        g.restore();
      }
      g.globalAlpha = 1;
      break;
    }
    case "carbon": {
      for (let y = 0; y < H; y += 8) {
        for (let x = 0; x < W; x += 8) {
          const odd = ((x / 8 + y / 8) | 0) % 2 === 0;
          g.fillStyle = odd ? accent : base;
          g.fillRect(x, y, 8, 8);
          g.fillStyle = "rgba(255,255,255,0.05)";
          g.fillRect(x, y, 8, 2);
        }
      }
      g.fillStyle = accent2;
      g.fillRect(0, H * 0.46, W, 4);
      break;
    }
    case "stickers": {
      const palette = [accent, accent2, "#ff4d6d", "#4dd4ff", "#ffffff", "#111111"];
      for (let i = 0; i < 46; i++) {
        g.save();
        g.translate(rng() * W, rng() * H);
        g.rotate((rng() - 0.5) * 1.6);
        g.fillStyle = palette[(rng() * palette.length) | 0];
        const w = 14 + rng() * 34;
        const h = 8 + rng() * 18;
        if (rng() < 0.4) {
          g.beginPath();
          g.arc(0, 0, w * 0.4, 0, 6.28);
          g.fill();
        } else {
          g.fillRect(-w / 2, -h / 2, w, h);
        }
        g.restore();
      }
      break;
    }
    case "checker": {
      const sq = 16;
      for (let y = 0; y < H; y += sq) {
        for (let x = 0; x < W; x += sq) {
          if (((x / sq + y / sq) | 0) % 2 === 0) continue;
          g.fillStyle = accent;
          g.fillRect(x, y, sq, sq);
        }
      }
      // A single stripe down the middle so the nose still reads at speed.
      g.fillStyle = accent2;
      g.fillRect(W * 0.5 - 7, 0, 14, H);
      break;
    }
    case "topo": {
      // Contour rings around a couple of summits, drawn as level sets of a
      // sum of two gaussians — cheap, and it actually looks surveyed.
      const peaks = [
        { x: W * 0.42, y: H * 0.3, s: 62 },
        { x: W * 0.6, y: H * 0.68, s: 84 },
      ];
      const field = (x: number, y: number) =>
        peaks.reduce((a, p) => {
          const dx = (x - p.x) / p.s;
          const dy = (y - p.y) / p.s;
          return a + Math.exp(-(dx * dx + dy * dy));
        }, 0);
      const step = 3;
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const band = (field(x, y) * 9) % 1;
          if (band < 0.16) {
            g.fillStyle = band < 0.05 ? accent2 : accent;
            g.fillRect(x, y, step, step);
          }
        }
      }
      break;
    }
    case "flame": {
      // Licks rising from the tail. Each tongue is two cubics sharing a tip,
      // with a sideways lean so they curl instead of reading as triangles.
      for (let i = 0; i < 30; i++) {
        const t = i / 30;
        const x = W * 0.5 + Math.sin(i * 2.4) * W * 0.36;
        const y = H - t * H * 0.9 + rng() * 40;
        const len = 70 + rng() * 150;
        const w = 8 + rng() * 16;
        const lean = (rng() - 0.5) * w * 3.2;
        const tipX = x + lean;
        const tipY = y - len;
        g.fillStyle = i % 3 === 0 ? accent2 : accent;
        g.globalAlpha = 0.7 + rng() * 0.3;
        g.beginPath();
        g.moveTo(x - w, y);
        g.bezierCurveTo(x - w * 1.1, y - len * 0.42, tipX - w * 0.8, y - len * 0.7, tipX, tipY);
        g.bezierCurveTo(tipX + w * 0.15, y - len * 0.66, x + w * 0.5, y - len * 0.3, x + w, y);
        g.closePath();
        g.fill();
      }
      g.globalAlpha = 1;
      break;
    }
    case "camo": {
      // Overlapping blobs at three scales — the classic disruptive pattern.
      const layers = [
        { c: accent, n: 26, r: 26 },
        { c: accent2, n: 18, r: 17 },
      ];
      for (const l of layers) {
        g.fillStyle = l.c;
        for (let i = 0; i < l.n; i++) {
          const cx = rng() * W;
          const cy = rng() * H;
          g.beginPath();
          for (let a = 0; a <= 12; a++) {
            const ang = (a / 12) * Math.PI * 2;
            const r = l.r * (0.55 + rng() * 0.75);
            const px = cx + Math.cos(ang) * r;
            const py = cy + Math.sin(ang) * r * 1.6;
            if (a === 0) g.moveTo(px, py);
            else g.lineTo(px, py);
          }
          g.closePath();
          g.fill();
        }
      }
      break;
    }
    case "chrome": {
      // A vertical anisotropic sweep plus a horizon band — reads as polished
      // metal once the environment map lands on top of it.
      const grad = g.createLinearGradient(0, 0, W, 0);
      grad.addColorStop(0, accent2);
      grad.addColorStop(0.3, accent);
      grad.addColorStop(0.48, base);
      grad.addColorStop(0.66, accent);
      grad.addColorStop(1, accent2);
      g.fillStyle = grad;
      g.fillRect(0, 0, W, H);
      for (let i = 0; i < 220; i++) {
        g.globalAlpha = 0.03 + rng() * 0.06;
        g.fillStyle = rng() < 0.5 ? "#ffffff" : "#2b3542";
        g.fillRect(rng() * W, 0, 1 + rng() * 2, H);
      }
      g.globalAlpha = 0.4;
      g.fillStyle = "#ffffff";
      g.fillRect(0, H * 0.46, W, 6);
      g.globalAlpha = 1;
      break;
    }
  }

  // Edges.
  g.globalAlpha = 1;
  g.fillStyle = board.colors.edge;
  g.fillRect(0, 0, 4, H);
  g.fillRect(W - 4, 0, 4, H);

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}

/**
 * The underside.
 *
 * Worth painting properly: every grab, every tweak and every crash turns the
 * board over, so the base is on screen nearly as often as the topsheet — and
 * a black rectangle down there undoes whatever the deck graphic earned.
 *
 * A real sintered base is near-black with the graphic *sublimated* into it, so
 * everything here is low-contrast on purpose. The maker's name runs the length
 * of it, big, the way it does on a real board.
 */
export function makeBaseTexture(board: Board): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const g = c.getContext("2d")!;
  const rng = makeRng(
    board.id.split("").reduce((a, ch) => a + ch.charCodeAt(0) * 17, 3),
  );

  // Sintered graphite, slightly warmer down the middle where it's waxed most.
  const ground = g.createLinearGradient(0, 0, W, 0);
  ground.addColorStop(0, "#101318");
  ground.addColorStop(0.5, "#1b1f26");
  ground.addColorStop(1, "#101318");
  g.fillStyle = ground;
  g.fillRect(0, 0, W, H);

  // Structure: the fine longitudinal grind that makes a base shed water.
  for (let i = 0; i < 150; i++) {
    g.globalAlpha = 0.05 + rng() * 0.07;
    g.fillStyle = rng() < 0.5 ? "#ffffff" : "#05070a";
    g.fillRect(rng() * W, 0, 0.6 + rng() * 1.4, H);
  }
  g.globalAlpha = 1;

  // A single stripe in the board's own edge colour, running tip to tail.
  g.fillStyle = board.colors.edge;
  g.globalAlpha = 0.5;
  g.fillRect(W * 0.5 - 2.5, H * 0.08, 5, H * 0.84);
  g.globalAlpha = 1;

  // Maker, sublimated: rotated to run along the board, low contrast.
  g.save();
  g.translate(W / 2, H / 2);
  g.rotate(-Math.PI / 2);
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.fillStyle = board.colors.accent;
  g.globalAlpha = 0.32;
  g.font = `700 34px ui-sans-serif, system-ui, sans-serif`;
  g.fillText(board.maker, 0, -2);
  g.globalAlpha = 0.5;
  g.font = `600 13px ui-monospace, monospace`;
  g.fillText(board.name.toUpperCase(), 0, 26);
  g.restore();

  // Contact points: the two darker patches under the bindings, where the base
  // sits hardest on the snow.
  for (const t of [0.32, 0.68]) {
    const shade = g.createRadialGradient(W / 2, H * t, 2, W / 2, H * t, W * 0.7);
    shade.addColorStop(0, "rgba(0,0,0,0.34)");
    shade.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = shade;
    g.fillRect(0, H * t - W * 0.7, W, W * 1.4);
  }

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return tex;
}
