// Get the element where issue details will be displayed
const detail = document.getElementById("detail");


// Display issue details
function renderIssue(issue) {
    document.title = issue.title + " | CampusConnect";

    detail.innerHTML = `
        <a href="dashboard.html" class="muted">
            Back to dashboard
        </a>

        <h1>${esc(issue.title)}</h1>

        ${badge(issue.status)}

        <div class="body">
            ${esc(issue.description)}
        </div>

        <dl class="info">
            <dt>Category</dt>
            <dd>${esc(issue.category)}</dd>

            <dt>Reported by</dt>
            <dd>${esc(issue.reporter)}</dd>

            <dt>Submitted</dt>
            <dd>${fmtDate(issue.created_at)}</dd>

            <dt>Last updated</dt>
            <dd>${fmtDate(issue.updated_at)}</dd>
        </dl>

        <h3>Update status</h3>

        <div class="steps">
            ${STATUSES.map(status => `
                <button
                    data-status="${status}"
                    aria-pressed="${status === issue.status}"
                >
                    ${status}
                </button>
            `).join("")}
        </div>

        <p class="error" id="msg" role="alert"></p>
    `;


    // Handle status button clicks
    const statusButtons = detail.querySelector(".steps");

    statusButtons.onclick = async function (event) {
        const newStatus = event.target.dataset.status;

        // Do nothing if no button was clicked or the status is unchanged
        if (!newStatus || newStatus === issue.status) {
            return;
        }

        try {
            const updatedIssue = await api(
                `/issues/${issue.id}/status`,
                "PATCH",
                { status: newStatus }
            );

            // Display the updated issue
            renderIssue(updatedIssue);

        } catch (error) {
            document.getElementById("msg").textContent = error.message;
        }
    };
}


// Initialize the issue details page
async function startIssuePage() {
    const user = await startPage("");

    if (!user) {
        return;
    }

    // Get the issue ID from the URL
    const params = new URLSearchParams(window.location.search);
    const issueId = params.get("id");

    try {
        const issue = await api("/issues/" + issueId);

        renderIssue(issue);

    } catch (error) {
        detail.innerHTML = `
            <p class="error">${esc(error.message)}</p>

            <a class="btn" href="dashboard.html">
                Back to dashboard
            </a>
        `;
    }
}


// Run the page
startIssuePage();