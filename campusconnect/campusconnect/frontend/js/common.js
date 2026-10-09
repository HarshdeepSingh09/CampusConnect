// Shared helpers used by every page.
const TOKEN_KEY = "cc_token";
const STATUSES = ["Open", "In Progress", "Resolved"];
const getToken = () => localStorage.getItem(TOKEN_KEY);

function clearSession() {
  localStorage.removeItem(TOKEN_KEY);
  location.href = "index.html";
}

async function logout() {
  try { await api("/logout", "POST"); } catch (e) {}
  clearSession();
}

// Talks to the FastAPI backend. Throws an Error with a readable message.
async function api(path, method = "GET", body) {
  const headers = { "Content-Type": "application/json" };
  if (getToken()) headers.Authorization = "Bearer " + getToken();
  const res = await fetch("/api" + path, { method, headers, body: body ? JSON.stringify(body) : undefined });
  const data = await res.json().catch(() => null);
  if (res.status === 401 && getToken()) clearSession();
  if (!res.ok) {
    const d = data && data.detail;
    throw new Error(Array.isArray(d) ? d.map(e => `${e.loc[e.loc.length - 1]}: ${e.msg}`).join(". ") : d || "Something went wrong. Try again.");
  }
  return data;
}

// Escapes user text before putting it into HTML.
function esc(text) {
  const el = document.createElement("div");
  el.textContent = text;
  return el.innerHTML;
}

const slug = status => status.toLowerCase().replace(" ", "-");
const badge = status => `<span class="badge ${slug(status)}">${esc(status)}</span>`;
const fmtDate = iso => new Date(iso).toLocaleString([], { dateStyle: "medium", timeStyle: "short" });

function ticketHTML(i) {
  return `<a class="ticket ${slug(i.status)}" href="issue.html?id=${i.id}">
    <div><h3>${esc(i.title)}</h3>
    <p class="meta"><span>${esc(i.category)}</span><span>by ${esc(i.reporter)}</span><span>${fmtDate(i.created_at)}</span></p></div>
    ${badge(i.status)}</a>`;
}

// Call at the top of every page except login. Redirects if not logged in.
async function startPage(active) {
  if (!getToken()) { location.href = "index.html"; return null; }
  const user = await api("/me");
  const link = (href, label, key) => `<a href="${href}" ${active === key ? 'aria-current="page"' : ""}>${label}</a>`;
  document.getElementById("nav").innerHTML = `<div class="topbar-in">
    <a class="brand" href="dashboard.html"><span>CampusConnect</span></a>
    <nav>${link("dashboard.html", "Dashboard", "dashboard")}${link("create-issue.html", "Report issue", "create")}${link("profile.html", "Profile", "profile")}
    <button class="btn ghost" id="logout">Log out</button></nav></div>`;
  document.getElementById("logout").onclick = logout;
  return user;
}
