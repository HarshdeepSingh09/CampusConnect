// Examples for each issue category
const EXAMPLES = {
    "Classroom": "Fan not working, light not working, projector problem",
    "Campus": "Wi-Fi not working, cleanliness issue, water cooler not working",
    "Lost & Found": "Lost ID card, found a water bottle, lost a notebook",
    "General": "Library-related issue, lab equipment issue, other campus problem"
};


// Initialize the create-issue page
async function startCreateIssue() {
    const ready = await startPage("create");

    if (!ready) {
        return;
    }

    // Get available categories from the backend
    const categories = await api("/categories");
    const categoryBox = document.getElementById("cats");

    // Display categories as radio buttons
    categoryBox.innerHTML = categories.map((category, index) => `
        <label>
            <input
                type="radio"
                name="category"
                value="${esc(category)}"
                ${index === 0 ? "checked" : ""}
            >
            <span>${esc(category)}</span>
        </label>
    `).join("");


    // Display examples for the selected category
    const hint = document.getElementById("cat-hint");

    function showHint() {
        const selectedCategory = document.querySelector(
            'input[name="category"]:checked'
        ).value;

        hint.textContent = "Examples: " + EXAMPLES[selectedCategory];
    }

    categoryBox.addEventListener("change", showHint);

    showHint();


    // Handle form submission
    const form = document.getElementById("issue-form");

    form.addEventListener("submit", async event => {
        event.preventDefault();

        try {
            const formData = new FormData(form);
            const issueData = Object.fromEntries(formData);

            const issue = await api("/issues", "POST", issueData);

            // Open the newly created issue
            window.location.href = "issue.html?id=" + issue.id;

        } catch (error) {
            document.getElementById("msg").textContent = error.message;
        }
    });
}


// Run the page
startCreateIssue();