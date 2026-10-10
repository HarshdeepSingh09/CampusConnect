// Shared functions used by all pages

const TOKEN_KEY = "cc_token";
const STATUSES = ["Open", "In Progress", "Resolved"];


// Get the login token
function getToken() {
    return localStorage.getItem(TOKEN_KEY);
}


// Log out the user
function clearSession() {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = "index.html";
}

async function logout() {
    try {
        await api("/logout", "POST");
    } catch (error) {
        // Clear the session even if the logout request fails
    }

    clearSession();
}


// Send requests to the backend
async function api(path, method = "GET", body) {
    const headers = {
        "Content-Type": "application/json"
    };

    const token = getToken();

    if (token) {
        headers.Authorization = "Bearer " + token;
    }

    const response = await fetch("/api" + path, {
        method: method,
        headers: headers,
        body: body ? JSON.stringify(body) : undefined
    });

    const data = await response.json().catch(() => null);

    // Redirect to login if the session has expired
    if (response.status === 401 && getToken()) {
        clearSession();
    }

    if (!response.ok) {
        const detail = data && data.detail;

        if (Array.isArray(detail)) {
            const message = detail.map(error => {
                const field = error.loc[error.loc.length - 1];
                return `${field}: ${error.msg}`;
            }).join(". ");

            throw new Error(message);
        }

        throw new Error(
            detail || "Something went wrong. Try again."
        );
    }

    return data;
}


// Escape text before displaying it in HTML
function esc(text) {
    const element = document.createElement("div");
    element.textContent = text;

    return element.innerHTML;
}


// Convert a status into a CSS-friendly name
function slug(status) {
    return status.toLowerCase().replace(" ", "-");
}


// Create a status badge
function badge(status) {
    return `
        <span class="badge ${slug(status)}">
            ${esc(status)}
        </span>
    `;
}


// Format the date and time
function fmtDate(date) {
    return new Date(date).toLocaleString([], {
        dateStyle: "medium",
        timeStyle: "short"
    });
}


// Create an issue card for the dashboard
function ticketHTML(issue) {
    return `
        <a class="ticket ${slug(issue.status)}"
           href="issue.html?id=${issue.id}">

            <div class="ticket-top">
                <h3>${esc(issue.title)}</h3>
                ${badge(issue.status)}
            </div>

            <div class="ticket-category">
                ${esc(issue.category)}
            </div>

            <div class="ticket-meta">
                <span>Reported by ${esc(issue.reporter)}</span>
                <span>${fmtDate(issue.created_at)}</span>
            </div>

        </a>
    `;
}


// Initialize a page and display the navigation bar
async function startPage(active) {
    if (!getToken()) {
        window.location.href = "index.html";
        return null;
    }

    const user = await api("/me");

    const link = (href, label, key) => {
        const current = active === key
            ? 'aria-current="page"'
            : "";

        return `
            <a href="${href}" ${current}>
                ${label}
            </a>
        `;
    };

    document.getElementById("nav").innerHTML = `
        <div class="topbar-in">

            <a class="brand" href="dashboard.html">
                <span>CampusConnect</span>
            </a>

            <nav>
                ${link("dashboard.html", "Dashboard", "dashboard")}
                ${link("create-issue.html", "Report issue", "create")}
                ${link("profile.html", "Profile", "profile")}

                <button class="btn ghost" id="logout">
                    Log out
                </button>
            </nav>

        </div>
    `;

    document.getElementById("logout").onclick = logout;

    return user;
}