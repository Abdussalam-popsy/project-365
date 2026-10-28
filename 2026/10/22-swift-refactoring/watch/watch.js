// Watch It Run: each button runs a small script of steps. A step lights a line in the code pane,
// writes a sentence to the log, and maybe changes the live state, then waits so you can follow it.
// Code for each scene is in scenes.js.

const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const wait = ms => new Promise(r => setTimeout(r, reduceMotion ? 0 : ms));
const STEP = 700;   // ms between steps; lower it to make everything run faster

// Draws Swift into a <pre>, giving each line a data-n number so mark() can find it.
function renderCode(id, code){
  $(id).innerHTML = code.split("\n").map((l, n) =>
    '<span class="ln" data-n="'+n+'">'+(highlightSwift(l, TYPES)||" ")+'</span>').join("");
}

// Lights one or more lines in a scene's code pane. cls: "run" (default), "err" or "ok". null clears.
function mark(scene, n, cls){
  document.querySelectorAll("#code-"+scene+" .ln").forEach(el => el.classList.remove("run","err","ok"));
  if(n === null) return;
  [].concat(n).forEach(i => {
    const el = document.querySelector("#code-"+scene+' .ln[data-n="'+i+'"]');
    if(el) el.classList.add(cls || "run");
  });
}

// Adds one sentence to a scene's "What just happened" list. cls: "call", "yes", "no" or "err".
function log(scene, html, cls){
  const li = document.createElement("li");
  li.className = cls || "";
  li.innerHTML = html;
  const ol = $("log-"+scene);
  ol.appendChild(li);
  while(ol.children.length > 60) ol.removeChild(ol.firstChild);
  ol.scrollTop = ol.scrollHeight;
}

// Stops you pressing a second button while a script is still playing.
let busy = false;
async function play(script){
  if(busy) return;
  busy = true;
  document.querySelectorAll(".scene .btn").forEach(b => b.disabled = true);
  try { await script(); }
  finally {
    busy = false;
    document.querySelectorAll(".scene .btn").forEach(b => b.disabled = false);
  }
}

function flash(el){ el.classList.remove("flash"); void el.offsetWidth; el.classList.add("flash"); }

/* ── Wallet: Encapsulate field ─────────────────────────────── */

const W = SCENES.wallet.lines;
renderCode("code-wallet", SCENES.wallet.swift);
renderCode("js-wallet", SCENES.wallet.twin);
let balance = 1500;

$("w-pay").onclick = () => play(async () => {
  const a = parseInt($("w-amt").value, 10);
  if(isNaN(a)){ log("wallet", "Type a whole number first.", "no"); return; }
  log("wallet", "player.pay("+a+")", "call");
  mark("wallet", W.pay);
  log("wallet", "The func starts. Inside it, <b>amount</b> is now <b>"+a+"</b>.");
  await wait(STEP);

  const rule1 = a > 0, rule2 = a <= balance;
  mark("wallet", W.guard);
  log("wallet", "Bouncer rule 1: is "+a+" &gt; 0? <b>"+(rule1 ? "yes ✓" : "no ✗")+"</b>", rule1 ? "yes" : "no");
  await wait(STEP/1.5);
  log("wallet", "Bouncer rule 2: is "+a+" &lt;= "+balance+"? <b>"+(rule2 ? "yes ✓" : "no ✗")+"</b>", rule2 ? "yes" : "no");
  await wait(STEP);

  if(!(rule1 && rule2)){
    mark("wallet", W.guard, "err");
    log("wallet", "A rule failed, so <b>return</b>: the func stops here. The next line never runs. Balance stays <b>"+balance+"</b>.", "no");
    await wait(STEP); mark("wallet", null); return;
  }
  mark("wallet", W.subtract);
  const old = balance;
  balance -= a;
  $("w-bal").textContent = balance; flash($("w-bal"));
  log("wallet", "Both rules passed. balance = "+old+" − "+a+" = <b>"+balance+"</b>", "yes");
  await wait(STEP); mark("wallet", null);
});

$("w-read").onclick = () => play(async () => {
  log("wallet", "print(player.balance)", "call");
  mark("wallet", W.balance, "ok");
  log("wallet", "Reading from outside is allowed (that's the <b>private(set)</b> part: only <i>setting</i> is private). Prints <b>"+balance+"</b>.", "yes");
  await wait(STEP*1.4); mark("wallet", null);
});

$("w-cheat").onclick = () => play(async () => {
  log("wallet", "player.balance = 99999", "call");
  mark("wallet", W.balance, "err");
  log("wallet", "error: cannot assign to property: 'balance' setter is inaccessible", "err");
  log("wallet", "Swift refuses before the app even runs. You have to go through pay().", "no");
  await wait(STEP*1.6); mark("wallet", null);
});

$("w-reset").onclick = () => { balance = 1500; $("w-bal").textContent = balance; $("log-wallet").innerHTML = ""; };

/* ── Cart: Encapsulate collection ──────────────────────────── */

const C = SCENES.cart.lines;
renderCode("code-cart", SCENES.cart.swift);
renderCode("js-cart", SCENES.cart.twin);
let items = [];
let nextId = 1;   // every item gets a fresh number, so two milks still have different ids

function seedCart(){
  items = [{ name: "milk", id: "M1" }, { name: "eggs", id: "E2" }, { name: "bread", id: "B3" }];
  nextId = 4;
}

// marks: optional array, one class per item ("check" while removeAll looks at it, "gone" when it matches)
function renderCart(marks){
  $("c-chips").innerHTML = items.length
    ? items.map((it, i) => '<span class="chip'+(marks && marks[i] ? " "+marks[i] : "")+'">'+esc(it.name)+' <code>id #'+it.id+'</code></span>').join("")
    : '<span class="empty">empty</span>';
  $("c-lit").textContent = "[" + items.map(i => i.name + "(#" + i.id + ")").join(", ") + "]";

  const rm = $("c-rm");
  rm.innerHTML = items.length ? "" : '<span class="empty">Add an item and a removeItem button for it appears here.</span>';
  items.forEach(it => {
    const b = document.createElement("button");
    b.className = "btn remove";
    b.textContent = "removeItem(withId: #" + it.id + ")";
    b.title = "Remove " + it.name;
    b.disabled = busy;
    b.onclick = () => removeItem(it.id);
    rm.appendChild(b);
  });
}

["milk", "eggs", "bread", "apple"].forEach(name => {
  const b = document.createElement("button");
  b.className = "btn primary";
  b.textContent = "addItem(" + name + ")";
  b.onclick = () => play(async () => {
    const it = { name, id: name[0].toUpperCase() + (nextId++) };
    log("cart", "cart.addItem("+name+")", "call");
    mark("cart", C.addItem);
    log("cart", "The func starts. Inside it, <b>item</b> is <b>"+name+"</b> (id #"+it.id+").");
    await wait(STEP);
    mark("cart", C.append);
    items.push(it); renderCart();
    log("cart", "<b>append</b> puts it on the end of the list. Cart now has <b>"+items.length+"</b> item"+(items.length === 1 ? "" : "s")+".", "yes");
    await wait(STEP); mark("cart", null);
  });
  $("c-add").appendChild(b);
});

function removeItem(id){
  play(async () => {
    log("cart", "cart.removeItem(withId: #"+id+")", "call");
    mark("cart", C.removeItem);
    log("cart", "The func starts. Inside it, <b>id</b> is <b>#"+id+"</b>.");
    await wait(STEP);
    mark("cart", C.removeAll);
    log("cart", "<b>removeAll</b> checks every item, one at a time: does this item's id match?");
    const marks = [];
    for(let k = 0; k < items.length; k++){
      const match = items[k].id === id;
      marks[k] = match ? "gone" : "check";
      renderCart(marks);
      log("cart", items[k].name+": #"+items[k].id+" == #"+id+"? <b>"+(match ? "yes, remove it" : "no, keep it")+"</b>", match ? "no" : "yes");
      await wait(STEP/1.3);
    }
    items = items.filter(i => i.id !== id);
    renderCart();
    log("cart", "Done. Cart now has <b>"+items.length+"</b> item"+(items.length === 1 ? "" : "s")+".", "yes");
    await wait(STEP/2); mark("cart", null);
  });
}

$("c-clear").onclick = () => play(async () => {
  log("cart", "cart.clear()", "call");
  mark("cart", C.clear); await wait(STEP);
  mark("cart", C.clearAll);
  items = []; renderCart();
  log("cart", "<b>removeAll()</b> with no condition removes everything. Cart is empty.", "yes");
  await wait(STEP); mark("cart", null);
});

$("c-cheat").onclick = () => play(async () => {
  log("cart", "cart.items.append(milk)", "call");
  mark("cart", C.items, "err");
  log("cart", "error: cannot use mutating member on immutable value: 'items' setter is inaccessible", "err");
  log("cart", "You can't reach into the list from outside. Use cart.addItem(milk) instead.", "no");
  await wait(STEP*1.6); mark("cart", null);
});

$("c-reset").onclick = () => { seedCart(); renderCart(); $("log-cart").innerHTML = ""; };
seedCart(); renderCart();

/* ── Team: dictionary (lookup table) ───────────────────────── */

const T = SCENES.team.lines;
renderCode("code-team", SCENES.team.swift);
renderCode("js-team", SCENES.team.twin);
const STARTING_ROLES = { "Aisha": "Designer", "Ben": "Developer" };
let roles = { ...STARTING_ROLES };

// hit: the key to highlight in the table while a func is working on it
function renderTeam(hit){
  const keys = Object.keys(roles);
  $("t-rows").innerHTML = keys.length
    ? keys.map(k => '<tr class="'+(k === hit ? "hit" : "")+'"><td>"'+esc(k)+'"</td><td>"'+esc(roles[k])+'"</td></tr>').join("")
    : '<tr><td colspan="2" class="empty">empty</td></tr>';
  $("t-lit").textContent = "[" + (keys.length ? keys.map(k => '"'+k+'": "'+roles[k]+'"').join(", ") : ":") + "]";
}

$("t-assign").onclick = () => play(async () => {
  const role = $("t-role").value.trim(), member = $("t-member").value.trim();
  if(!role || !member){ log("team", "Fill in both role and member first.", "no"); return; }
  log("team", 'team.assignRole("'+esc(role)+'", to: "'+esc(member)+'")', "call");
  mark("team", T.assignRole);
  log("team", 'The func starts. Inside it, <b>role</b> = "'+esc(role)+'" and <b>member</b> = "'+esc(member)+'". These are the ingredients from the brackets.');
  await wait(STEP);
  mark("team", T.assign);
  log("team", 'memberRoles[member] = role &nbsp;becomes&nbsp; memberRoles["'+esc(member)+'"] = "'+esc(role)+'"');
  await wait(STEP/1.5);
  const had = roles[member];
  roles[member] = role;
  renderTeam(member);
  log("team", had !== undefined
    ? '"'+esc(member)+'" was already in the table as "'+esc(had)+'". Keys are unique, so the old role is <b>replaced</b>.'
    : '"'+esc(member)+'" wasn\'t in the table, so a <b>new row</b> is added.', "yes");
  await wait(STEP); mark("team", null); renderTeam();
});

$("t-remove").onclick = () => play(async () => {
  const member = $("t-member").value.trim();
  if(!member){ log("team", "Type a member name first.", "no"); return; }
  log("team", 'team.removeMember("'+esc(member)+'")', "call");
  mark("team", T.removeMember);
  log("team", 'The func starts. Inside it, <b>member</b> = "'+esc(member)+'".');
  await wait(STEP);
  mark("team", T.remove); renderTeam(member);
  log("team", 'memberRoles["'+esc(member)+'"] = nil &nbsp;(nil means "nothing")');
  await wait(STEP/1.5);
  if(roles[member] === undefined){
    log("team", '"'+esc(member)+'" wasn\'t in the table, so nothing changes.', "no");
  } else {
    delete roles[member];
    log("team", "Setting a key to nothing <b>removes that row</b>.", "yes");
  }
  renderTeam(); await wait(STEP); mark("team", null);
});

$("t-cheat").onclick = () => play(async () => {
  log("team", 'team.memberRoles["Zed"] = "Boss"', "call");
  mark("team", T.table, "err");
  log("team", "error: cannot assign through subscript: 'memberRoles' setter is inaccessible", "err");
  log("team", 'No editing the table from outside. Use team.assignRole("Boss", to: "Zed").', "no");
  await wait(STEP*1.6); mark("team", null);
});

$("t-reset").onclick = () => { roles = { ...STARTING_ROLES }; renderTeam(); $("log-team").innerHTML = ""; };
renderTeam();

/* ── Weather: Extract interface ────────────────────────────── */

const WX = SCENES.weather;
renderCode("js-weather", WX.twin);
let version = "after";

function setVersion(v, quiet){
  version = v;
  $("v-before").setAttribute("aria-pressed", v === "before");
  $("v-after").setAttribute("aria-pressed", v === "after");
  renderCode("code-weather", v === "before" ? WX.before : WX.after);
  $("wx-temp").textContent = "--";
  $("wx-src").textContent = "api = (nothing plugged in)";
  if(!quiet) log("weather", v === "before"
    ? "Switched to <b>Before</b>: the widget asks for LiveWeatherService specifically."
    : "Switched to <b>After</b>: the widget asks for anything that does the WeatherService job.", "call");
}
$("v-before").onclick = () => { if(!busy && version !== "before") setVersion("before"); };
$("v-after").onclick = () => { if(!busy && version !== "after") setVersion("after"); };

document.querySelectorAll("[data-svc]").forEach(b => b.onclick = () => play(async () => {
  const svc = b.dataset.svc;
  log("weather", "WeatherDisplayWidget(api: "+svc+"())", "call");

  if(version === "before"){
    const L = WX.beforeLines;
    if(svc === "LiveWeatherService"){
      mark("weather", [L.api, L.init], "ok");
      $("wx-temp").textContent = "21.5°"; $("wx-src").textContent = "api = LiveWeatherService";
      log("weather", "The widget asked for LiveWeatherService, and that's what you gave it. Works.", "yes");
    } else {
      mark("weather", [L.api, L.init], "err");
      log("weather", "error: cannot convert value of type '"+svc+"' to expected argument type 'LiveWeatherService'", "err");
      log("weather", "The widget only accepts <b>one specific class</b>. Anything else is rejected, even if it can fetch a temperature too. Switch to <b>After</b> and try again.", "no");
      $("wx-temp").textContent = "--"; $("wx-src").textContent = "api = (rejected)";
    }
    await wait(STEP*1.6); mark("weather", null); return;
  }

  const L = WX.afterLines;
  mark("weather", L[svc]);
  log("weather", "Does "+svc+" sign up to WeatherService? Look after its colon: <b>yes</b>.", "yes");
  await wait(STEP);
  mark("weather", [L.api, L.init]);
  log("weather", "The widget asks for <b>any WeatherService</b>, so it's accepted.", "yes");
  await wait(STEP);
  mark("weather", [L.protocolFunc, L[svc] + 1], "ok");
  const t = WX.temps[svc];
  $("wx-temp").textContent = t.toFixed(1) + "°";
  $("wx-src").textContent = "api = " + svc;
  log("weather", "The widget calls api.fetchCurrentTemperature() and gets <b>"+t.toFixed(1)+"</b>. Same widget code, different service.", "yes");
  await wait(STEP*1.2); mark("weather", null);
}));
setVersion("after", true);

/* ── Scene tabs ────────────────────────────────────────────── */

document.querySelectorAll(".tabs button").forEach(b => b.onclick = () => {
  if(busy) return;
  document.querySelectorAll(".tabs button").forEach(x => x.setAttribute("aria-pressed", x === b));
  ["wallet", "cart", "team", "weather"].forEach(s => $("scene-"+s).hidden = s !== b.dataset.scene);
});

mountReferencePanel();
