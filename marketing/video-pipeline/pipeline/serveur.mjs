// Petit serveur statique sur la racine du pipeline : l'animation charge
// script.json, timings.json et moteur.js par fetch / import.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { ROOT } from "./lib.mjs";

const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".mjs": "text/javascript", ".json": "application/json", ".png": "image/png", ".css": "text/css", ".ttf": "font/ttf", ".svg": "image/svg+xml" };

export function serve(port = 0) {
  const server = createServer(async (req, res) => {
    const path = normalize(decodeURIComponent(new URL(req.url, "http://x").pathname));
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { "Content-Type": TYPES[extname(path)] ?? "application/octet-stream", "Cache-Control": "no-store" });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(port, "127.0.0.1", () => resolve(server)));
}

// Lancé directement : aperçu sur http://127.0.0.1:<port>/projets/<projet>/animation/index.html?play
if (import.meta.url === `file://${process.argv[1]}`) {
  const port = Number(process.env.PORT ?? 4317);
  await serve(port);
  console.log(`Aperçu : http://127.0.0.1:${port}/projets/01-declic/animation/index.html?play`);
}
