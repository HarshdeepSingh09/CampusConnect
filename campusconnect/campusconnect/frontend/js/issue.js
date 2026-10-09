// Issue details page with status updates.
const detail = document.getElementById("detail");

function render(i) {
  document.title = i.title + " | CampusConnect";
  detail.innerHTML = `
    <a href="dashboard.html" class="muted">Back to dashboard</a>
    <h1>${esc(i.title)}</h1>
    ${badge(i.status)}
    <div class="body">${esc(i.description)}</div>
    <dl class="info">
      <dt>Category</dt><dd>${esc(i.category)}</dd>
      <dt>Reported by</dt><dd>${esc(i.reporter)}</dd>
      <dt>Submitted</dt><dd>${fmtDate(i.created_at)}</dd>
      <dt>Last updated</dt><dd>${fmtDate(i.updated_at)}</dd>
    </dl>
    <h3>Update status</h3>
    <div class="steps">${STATUSES.map(s => `<button data-status="${s}" aria-pressed="${s === i.status}">${s}</button>`).join("")}</div>
    <p class="error" id="msg" role="alert"></p>`;

  detail.querySelector(".steps").onclick = async e => {
    const status = e.target.dataset.status;
    if (!status || status === i.status) return;
    try {
      render(await api(`/issues/${i.id}/status`, "PATCH", { status }));
    } catch (err) {
      document.getElementById("msg").textContent = err.message;
    }
  };
}

(async () => {
  if (!await startPage("")) return;
  try {
    render(await api("/issues/" + new URLSearchParams(location.search).get("id")));
  } catch (err) {
    detail.innerHTML = `<p class="error">${esc(err.message)}</p><a class="btn" href="dashboard.html">Back to dashboard</a>`;
  }
})();
