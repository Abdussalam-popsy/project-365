import "./style.css";

interface Experiment {
  date: string;
  name: string;
  path: string;
  url: string;
  tags: string[];
  template: string;
  language: string;
  description: string;
  status: "local" | "live";
}

const BASE = import.meta.env.BASE_URL;

function liveUrl(exp: Experiment): string {
  if (exp.url) return exp.url;
  return `${BASE}${exp.path}/`;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function languageColor(lang: string): string {
  const map: Record<string, string> = {
    typescript: "#3178c6",
    javascript: "#f7df1e",
    python: "#3776ab",
    go: "#00add8",
    swift: "#f05138",
    rust: "#ce422b",
  };
  return map[lang.toLowerCase()] ?? "#666";
}

function renderFilters(experiments: Experiment[]): string {
  const langs = [...new Set(experiments.map((e) => e.language))];
  const pills = langs
    .map(
      (l) => `
      <button
        class="filter-pill"
        data-filter="${l}"
        style="--dot: ${languageColor(l)}"
      >${l}</button>`,
    )
    .join("");
  return `
    <div class="filters">
      <button class="filter-pill active" data-filter="all">all</button>
      ${pills}
    </div>`;
}

function renderCard(exp: Experiment): string {
  const url = liveUrl(exp);
  const isLive = exp.status === "live" || !exp.url;
  const tags = exp.tags.map((t) => `<span class="tag">${t}</span>`).join("");

  return `
    <a class="card ${!isLive ? "card--local" : ""}" href="${url}" target="_blank" rel="noopener" data-lang="${exp.language}">
      <div class="card-top">
        <span class="card-date">${formatDate(exp.date)}</span>
        <span class="card-lang" style="color: ${languageColor(exp.language)}">
          <span class="lang-dot" style="background: ${languageColor(exp.language)}"></span>
          ${exp.language}
        </span>
      </div>
      <h2 class="card-title">${exp.name.replace(/-/g, " ")}</h2>
      <p class="card-desc">${exp.description}</p>
      <div class="card-tags">${tags}</div>
      <div class="card-footer">
        <span class="card-arrow">↗</span>
      </div>
    </a>`;
}

function renderEmpty(): string {
  return `<div class="empty">No experiments yet for this filter.</div>`;
}

async function init() {
  const app = document.getElementById("app")!;

  let experiments: Experiment[] = [];
  try {
    const res = await fetch(`${BASE}catalog.json`);
    experiments = await res.json();
    experiments.sort((a, b) => b.date.localeCompare(a.date));
  } catch {
    app.innerHTML = `<div class="error">Could not load catalog.json</div>`;
    return;
  }

  let activeFilter = "all";

  function render() {
    const filtered =
      activeFilter === "all"
        ? experiments
        : experiments.filter((e) => e.language === activeFilter);

    const cards = filtered.length
      ? filtered.map(renderCard).join("")
      : renderEmpty();

    app.innerHTML = `
      <header class="header">
        <div class="header-inner">
          <div>
            <h1 class="site-title">Project 365</h1>
            <p class="site-sub">A daily practice in creative coding & interaction design</p>
          </div>
          <span class="count">${experiments.length} experiments</span>
        </div>
        ${renderFilters(experiments)}
      </header>
      <main class="grid">${cards}</main>
    `;

    // Bind filter clicks
    app.querySelectorAll<HTMLButtonElement>(".filter-pill").forEach((btn) => {
      if (btn.dataset.filter === activeFilter) btn.classList.add("active");
      btn.addEventListener("click", () => {
        activeFilter = btn.dataset.filter ?? "all";
        render();
      });
    });
  }

  render();
}

init();
