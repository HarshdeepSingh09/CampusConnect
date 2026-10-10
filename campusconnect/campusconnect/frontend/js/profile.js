// Get the user's profile and their reported issues
async function loadProfile() {
    // Check if the user is logged in
    const user = await startPage("profile");

    if (!user) return;

    // Get issues reported by this user
    const issues = await api("/issues?mine=true");

    // Display profile information and issues
    document.getElementById("profile").innerHTML = `
        <h2 style="margin-bottom: 20px">
            ${esc(user.name)}
        </h2>

        <dl class="info">
            <dt>Email</dt>
            <dd>${esc(user.email)}</dd>

            <dt>Member since</dt>
            <dd>${fmtDate(user.created_at)}</dd>

            <dt>Issues reported</dt>
            <dd>${issues.length}</dd>

            <dt>Resolved</dt>
            <dd>${user.counts.Resolved || 0}</dd>
        </dl>

        <h3 style="margin-bottom: 12px">Your issues</h3>

        ${
            issues.length > 0
                ? issues.map(ticketHTML).join("")
                : `
                    <div class="empty">
                        <p>You have not reported anything yet.</p>
                        <a class="btn" href="create-issue.html">
                            Report an issue
                        </a>
                    </div>
                `
        }
    `;
}

// Load the profile when the page opens
loadProfile();