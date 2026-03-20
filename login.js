const {
  getAdminSession,
  loginAdmin,
} = window.FUXCSite;

const loginForm = document.getElementById("login-form");
const loginPasswordInput = document.getElementById("login-password");
const loginError = document.getElementById("login-error");

async function init() {
  try {
    const session = await getAdminSession();
    if (session.authenticated) {
      window.location.replace("./admin.html");
    }
  } catch (error) {
    // Ignore auth probe failures and allow manual login.
  }
}

loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();

  try {
    await loginAdmin(loginPasswordInput.value);
    loginError.hidden = true;
    window.location.href = "./admin.html";
  } catch (error) {
    loginError.hidden = false;
  }
});

init();
