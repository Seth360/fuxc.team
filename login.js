const {
  ADMIN_PASSWORD,
  ADMIN_SESSION_KEY,
} = window.FUXCSite;

if (sessionStorage.getItem(ADMIN_SESSION_KEY) === "1") {
  window.location.replace("./admin.html");
}

const loginForm = document.getElementById("login-form");
const loginPasswordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (loginPasswordInput.value === ADMIN_PASSWORD) {
    sessionStorage.setItem(ADMIN_SESSION_KEY, "1");
    loginError.hidden = true;
    window.location.href = "./admin.html";
    return;
  }

  loginError.hidden = false;
});
