// Profile page: student info and their own issues.
(async () => {
  const user = await startPage("profile");
  if (!user) return;
  const mine = await api("/issues?mine=true");
  document.getElementById("profile").innerHTML = `
    <h2 style="margin-bottom:20px">${esc(user.name)}</h2>
    <dl class="info">
      <dt>Email</dt><dd>${esc(user.email)}</dd>
      <dt>Member since</dt><dd>${fmtDate(user.created_at)}</dd>
      <dt>Issues reported</dt><dd>${mine.length}</dd>
      <dt>Resolved</dt><dd>${user.counts.Resolved || 0}</dd>
    </dl>
    <h3 style="margin-bottom:12px">Your issues</h3>
    ${mine.length ? mine.map(ticketHTML).join("") : `<div class="empty"><p>You have not reported anything yet.</p><a class="btn" href="create-issue.html">Report an issue</a></div>`}`;
})();
