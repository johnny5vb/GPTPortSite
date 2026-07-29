import { createRoot } from "react-dom/client";
import ShredGame from "@/game/shred/ui/ShredGame";

const el = document.getElementById("shred-root");
if (el) {
  el.textContent = "";
  createRoot(el).render(<ShredGame />);
}
