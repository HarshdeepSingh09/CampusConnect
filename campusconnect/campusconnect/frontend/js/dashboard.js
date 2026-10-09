// Dashboard: list of issues with status chips, category filter and search.
const filters = { status: "", category: "", q: "", mine: "" };
const list = document.getElementById("list");

async function load() {
  try {
    const params = new URLSearchParams(Object.entries(filters).filter(([, v]) => v));
    const [stats, issues] = await Promise.all([api("/stats"), api("/issues?" + params)]);

    const chips = [["", `All ${stats.total}`], ...STATUSES.map(s => [s, `${s} ${stats[s]}`])];
    document.getElementById("chips").innerHTML = chips
      .map(([value, label]) => `<button data-status="${value}" aria-pressed="${filters.status === value}">${label}</button>`).join("");

    list.innerHTML = issues.length
      ? issues.map(ticketHTML).join("")
      : `<div class="empty"><p>No issues match these filters.</p><a class="btn" href="create-issue.html">Report an issue</a></div>`;
  } catch (err) {
    list.innerHTML = `<p class="error">${esc(err.message)}</p>`;
  }
}

(async () => {
  if (!await startPage("dashboard")) return;
  const select = document.getElementById("category");
  (await api("/categories")).forEach(c => select.add(new Option(c, c)));

  document.getElementById("chips").onclick = e => {
    if (e.target.dataset.status === undefined) return;
    filters.status = e.target.dataset.status;
    load();
  };
  select.onchange = () => { filters.category = select.value; load(); };
  document.getElementById("q").oninput = e => { filters.q = e.target.value.trim(); load(); };
  document.getElementById("mine").onchange = e => { filters.mine = e.target.checked ? "true" : ""; load(); };
  load();
})();
