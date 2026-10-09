// Create issue page.
const EXAMPLES = {
  "Classroom": "Fan not working, light not working, projector problem",
  "Campus": "Wi-Fi not working, cleanliness issue, water cooler not working",
  "Lost & Found": "Lost ID card, found a water bottle, lost a notebook",
  "General": "Library-related issue, lab equipment issue, other campus problem",
};

(async () => {
  if (!await startPage("create")) return;
  const cats = await api("/categories");
  const box = document.getElementById("cats");
  box.innerHTML = cats.map((c, i) =>
    `<label><input type="radio" name="category" value="${esc(c)}" ${i === 0 ? "checked" : ""}><span>${esc(c)}</span></label>`).join("");

  const hint = document.getElementById("cat-hint");
  const showHint = () => hint.textContent = "Examples: " + EXAMPLES[document.querySelector("[name=category]:checked").value];
  box.onchange = showHint;
  showHint();

  document.getElementById("issue-form").onsubmit = async e => {
    e.preventDefault();
    try {
      const issue = await api("/issues", "POST", Object.fromEntries(new FormData(e.target)));
      location.href = "issue.html?id=" + issue.id;
    } catch (err) {
      document.getElementById("msg").textContent = err.message;
    }
  };
})();
