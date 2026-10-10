// Redirect to the dashboard if the user is already logged in
if (getToken()) {
    window.location.href = "dashboard.html";
}

const msg = document.getElementById("msg");

// Get both forms
const loginForm = document.getElementById("login-form");
const registerForm = document.getElementById("register-form");


// Switch between login and registration forms
function showForm(selectedForm) {
    loginForm.hidden = selectedForm !== "login";
    registerForm.hidden = selectedForm !== "register";

    document.getElementById("tab-login").setAttribute(
        "aria-selected",
        selectedForm === "login"
    );

    document.getElementById("tab-register").setAttribute(
        "aria-selected",
        selectedForm === "register"
    );

    // Clear previous error messages
    msg.textContent = "";
}


// Login tab
document.getElementById("tab-login").onclick = function () {
    showForm("login");
};

// Registration tab
document.getElementById("tab-register").onclick = function () {
    showForm("register");
};


// Handle login and registration
async function submitForm(event, endpoint) {
    event.preventDefault();

    try {
        const formData = new FormData(event.target);
        const userData = Object.fromEntries(formData);

        const result = await api(endpoint, "POST", userData);

        // Save the login token
        localStorage.setItem(TOKEN_KEY, result.token);

        // Open the dashboard
        window.location.href = "dashboard.html";

    } catch (error) {
        msg.textContent = error.message;
    }
}


// Handle login form submission
loginForm.onsubmit = function (event) {
    submitForm(event, "/login");
};

// Handle registration form submission
registerForm.onsubmit = function (event) {
    submitForm(event, "/register");
};