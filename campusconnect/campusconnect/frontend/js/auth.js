// Login / register page.
if (getToken()) location.href = "dashboard.html";

const msg = document.getElementById("msg");
const forms = { login: document.getElementById("login-form"), register: document.getElementById("register-form") };

function show(which) {
  for (const key in forms) {
    forms[key].hidden = key !== which;
    document.getElementById("tab-" + key).setAttribute("aria-selected", key === which);
  }
  msg.textContent = "";
}

document.getElementById("tab-login").onclick = () => show("login");
document.getElementById("tab-register").onclick = () => show("register");

async function submit(e, path) {
  e.preventDefault();
  try {
    const result = await api(path, "POST", Object.fromEntries(new FormData(e.target)));
    localStorage.setItem(TOKEN_KEY, result.token);
    location.href = "dashboard.html";
  } catch (err) {
    msg.textContent = err.message;
  }
}

forms.login.onsubmit = e => submit(e, "/login");
forms.register.onsubmit = e => submit(e, "/register");
