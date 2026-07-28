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
