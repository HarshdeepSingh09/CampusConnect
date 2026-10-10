// Dashboard filters
const filters = {
    status: "",
    category: "",
    q: "",
    mine: ""
};

const list = document.getElementById("list");
const chips = document.getElementById("chips");
const categorySelect = document.getElementById("category");


// Load issues and dashboard statistics
async function load() {
    try {
        const params = new URLSearchParams();

        if (filters.status) {
            params.set("status", filters.status);
        }

        if (filters.category) {
            params.set("category", filters.category);
        }

        if (filters.q) {
            params.set("q", filters.q);
        }

        if (filters.mine) {
            params.set("mine", filters.mine);
        }

        const [stats, issues] = await Promise.all([
            api("/stats"),
            api("/issues?" + params.toString())
        ]);

        // Create status filter buttons
        const statusOptions = [
            ["", `All ${stats.total}`],
            ...STATUSES.map(status => [
                status,
                `${status} ${stats[status]}`
            ])
        ];

        chips.innerHTML = statusOptions.map(([status, label]) => `
            <button
                type="button"
                data-status="${status}"
                aria-pressed="${filters.status === status}"
                class="${filters.status === status ? "active" : ""}"
            >
                ${label}
            </button>
        `).join("");

        // Display issue cards
        if (issues.length > 0) {
            list.innerHTML = issues.map(ticketHTML).join("");
        } else {
            list.innerHTML = `
                <div class="empty">
                    <p>No issues match these filters.</p>
                    <a class="btn" href="create-issue.html">
                        Report an issue
                    </a>
                </div>
            `;
        }

    } catch (err) {
        list.innerHTML = `
            <p class="error">${esc(err.message)}</p>
        `;
    }
}


// Initialize the dashboard
async function startDashboard() {
    const ready = await startPage("dashboard");

    if (!ready) {
        return;
    }

    // Load categories
    const categories = await api("/categories");

    categories.forEach(category => {
        categorySelect.add(new Option(category, category));
    });

    // Handle status filter clicks
    chips.addEventListener("click", event => {
        const button = event.target.closest("button[data-status]");

        if (!button) {
            return;
        }

        filters.status = button.dataset.status;
        load();
    });

    // Handle category selection
    categorySelect.addEventListener("change", () => {
        filters.category = categorySelect.value;
        load();
    });

    // Handle search
    document.getElementById("q").addEventListener("input", event => {
        filters.q = event.target.value.trim();
        load();
    });

    // Show only the logged-in user's issues
    document.getElementById("mine").addEventListener("change", event => {
        filters.mine = event.target.checked ? "true" : "";
        load();
    });

    load();
}

startDashboard();