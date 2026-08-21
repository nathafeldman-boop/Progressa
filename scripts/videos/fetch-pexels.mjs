#!/usr/bin/env node
/**
 * Télécharge automatiquement une vidéo de démonstration par exercice depuis Pexels.
 *
 *   PEXELS_API_KEY=xxxx node fetch-pexels.mjs              # tous les exercices
 *   PEXELS_API_KEY=xxxx node fetch-pexels.mjs gainage-lateral pompes-genoux-pieds
 *   PEXELS_API_KEY=xxxx node fetch-pexels.mjs --dry        # cherche sans télécharger
 *
 * Sortie :
 *   sources/<slug>.mp4     -> à passer ensuite dans prepare-videos.sh
 *   credits.csv            -> auteur + lien, nécessaire pour l'attribution API
 *
 * Aucune dépendance : Node 18+ suffit (fetch intégré).
 *
 * ⚠️ L'utilisation de l'API oblige à créditer Pexels et les auteurs dans l'app.
 *    Un téléchargement à la main depuis le site n'impose pas cette obligation.
 */

import fs from "node:fs";
import path from "node:path";

const KEY = process.env.PEXELS_API_KEY;
if (!KEY) {
  console.error("PEXELS_API_KEY manquante. Crée une clé sur pexels.com/api (gratuit, instantané) puis :");
  console.error("  PEXELS_API_KEY=ta_cle node fetch-pexels.mjs");
  process.exit(1);
}

const DRY = process.argv.includes("--dry");
const only = process.argv.slice(2).filter((a) => !a.startsWith("--"));

const QUERIES = JSON.parse(fs.readFileSync(new URL("./queries.json", import.meta.url), "utf8"));
delete QUERIES._comment;

const OUT = "sources";
const CREDITS = "credits.csv";
const MIN_DUR = 4;      // secondes : en dessous, le mouvement n'est pas lisible
const MAX_DUR = 40;     // au dessus, c'est un montage, pas une démonstration
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(query, orientation) {
  const url = new URL("https://api.pexels.com/videos/search");
  url.searchParams.set("query", query);
  url.searchParams.set("per_page", "15");
  url.searchParams.set("size", "medium");           // Full HD : assez, et léger
  if (orientation) url.searchParams.set("orientation", orientation);

  const res = await fetch(url, { headers: { Authorization: KEY } });

  if (res.status === 429) {
    console.log("   quota atteint (200 requêtes/heure) — pause de 60 s");
    await sleep(60000);
    return search(query, orientation);
  }
  if (!res.ok) throw new Error(`Pexels a répondu ${res.status} sur « ${query} »`);
  return res.json();
}

const MIN_FILE_HEIGHT = 480; // en dessous, visiblement pixelisé une fois recadré/affiché

/** Meilleur fichier : ~1080p de haut, sinon le plus grand en dessous — jamais sous MIN_FILE_HEIGHT. */
function pickFile(video) {
  const files = (video.video_files || []).filter(
    (f) => f.file_type === "video/mp4" && f.link && (f.height || 0) >= MIN_FILE_HEIGHT
  );
  if (!files.length) return null;
  const sorted = files.sort((a, b) => (b.height || 0) - (a.height || 0));
  return sorted.find((f) => (f.height || 0) <= 1200) || sorted[sorted.length - 1];
}

function pickVideo(json) {
  const ok = (json.videos || []).filter(
    (v) => v.duration >= MIN_DUR && v.duration <= MAX_DUR && pickFile(v) !== null
  );
  if (!ok.length) return null;
  // Le portrait passe mieux dans un lecteur vertical ; sinon on prend le premier.
  return ok.find((v) => v.height > v.width) || ok[0];
}

async function download(url, dest) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`téléchargement ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(dest, buf);
  return buf.length;
}

const slugs = only.length ? only : Object.keys(QUERIES);
fs.mkdirSync(OUT, { recursive: true });
if (!fs.existsSync(CREDITS)) fs.writeFileSync(CREDITS, "slug,requete,auteur,page_pexels,duree_s\n");

let found = 0, missing = [];

for (const slug of slugs) {
  const queries = QUERIES[slug];
  if (!queries) { console.log(`?  ${slug} : aucune requête définie`); continue; }

  const dest = path.join(OUT, `${slug}.mp4`);
  if (fs.existsSync(dest)) { console.log(`=  ${slug} : déjà téléchargé`); found++; continue; }

  let video = null, used = null;
  for (const q of queries) {
    for (const orientation of ["portrait", null]) {
      try {
        const json = await search(q, orientation);
        video = pickVideo(json);
      } catch (e) {
        console.log(`!  ${slug} : ${e.message}`);
      }
      await sleep(400);                       // on reste loin des 200 req/h
      if (video) { used = q; break; }
    }
    if (video) break;
  }

  if (!video) {
    console.log(`✗  ${slug} : rien d'exploitable — garde tes images pour celui-là`);
    missing.push(slug);
    continue;
  }

  const file = pickFile(video);
  if (!file) { console.log(`✗  ${slug} : aucun mp4 dans la réponse`); missing.push(slug); continue; }

  if (DRY) {
    console.log(`·  ${slug} : « ${used} » → ${video.url} (${video.duration}s, ${file.width}x${file.height})`);
    found++;
    continue;
  }

  try {
    const bytes = await download(file.link, dest);
    fs.appendFileSync(
      CREDITS,
      `${slug},"${used}","${(video.user?.name || "").replace(/"/g, "")}",${video.url},${video.duration}\n`
    );
    console.log(`✓  ${slug} : ${(bytes / 1e6).toFixed(1)} Mo — ${video.user?.name || "auteur inconnu"}`);
    found++;
  } catch (e) {
    console.log(`✗  ${slug} : ${e.message}`);
    missing.push(slug);
  }
}

console.log(`\n${found} vidéo(s) sur ${slugs.length}.`);
if (missing.length) console.log(`Sans résultat : ${missing.join(", ")}`);
console.log(`\nEnsuite :  bash prepare-videos.sh`);
console.log(`Crédits à reprendre dans l'app : ${CREDITS}`);
