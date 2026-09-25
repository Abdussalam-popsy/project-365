#!/usr/bin/env node
/**
 * generate-catalog.js
 *
 * Scans every project.json inside 2026/ and rebuilds catalog.json.
 * Projects that don't have a project.json yet keep their existing catalog entry.
 *
 * Run:  node scripts/generate-catalog.js
 */

const fs = require("fs");
const path = require("path");

const REPO_ROOT = path.join(__dirname, "..");
const CATALOG_PATH = path.join(REPO_ROOT, "catalog.json");
const EXPERIMENTS_ROOT = path.join(REPO_ROOT, "2026");
const BASE_URL = "https://abdussalam-popsy.github.io/project-365";

// ── helpers ──────────────────────────────────────────────────────────────────

function findProjectJsonFiles(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory() && entry !== "node_modules") {
      results.push(...findProjectJsonFiles(full));
    } else if (entry === "project.json") {
      results.push(full);
    }
  }
  return results;
}

/** Derive YYYY-MM-DD from a relative path like  2026/09/24-weather-app */
function dateFromPath(relPath) {
  const parts = relPath.split("/"); // ["2026", "09", "24-weather-app"]
  const year = parts[0];
  const month = parts[1];
  const day = (parts[2] || "01-unknown").split("-")[0];
  return `${year}-${month}-${day}`;
}

// ── load existing catalog ─────────────────────────────────────────────────────

const existing = JSON.parse(fs.readFileSync(CATALOG_PATH, "utf8"));
const existingByPath = {};
for (const entry of existing) {
  existingByPath[entry.path] = entry;
}

// ── scan project.json files ───────────────────────────────────────────────────

const discovered = {};

for (const file of findProjectJsonFiles(EXPERIMENTS_ROOT)) {
  const projectDir = path.dirname(file);
  const relPath = path.relative(REPO_ROOT, projectDir); // "2026/09/24-weather-app"
  const meta = JSON.parse(fs.readFileSync(file, "utf8"));

  const status = meta.status || "local";
  const autoUrl = `${BASE_URL}/${relPath}/`;

  discovered[relPath] = {
    date: dateFromPath(relPath),
    name: meta.name,
    path: relPath,
    url: meta.url || (status === "live" ? autoUrl : existingByPath[relPath]?.url || ""),
    tags: meta.tags || [],
    template: meta.template || "vanilla",
    language: meta.language || "javascript",
    description: meta.description || "",
    status,
  };
}

// ── merge: project.json entries win; existing-only entries are kept ───────────

const merged = {};

for (const entry of existing) {
  merged[entry.path] = entry;
}

for (const [p, entry] of Object.entries(discovered)) {
  merged[p] = entry;
}

// ── sort by date ascending ────────────────────────────────────────────────────

const sorted = Object.values(merged).sort((a, b) =>
  a.date.localeCompare(b.date)
);

fs.writeFileSync(CATALOG_PATH, JSON.stringify(sorted, null, 2) + "\n");
console.log(`catalog.json updated — ${sorted.length} entries`);
