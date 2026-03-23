const {
  getSession,
  login,
  register,
} = window.FUXCSite;

const loginForm = document.getElementById("login-form");
const loginUsernameInput = document.getElementById("login-username");
const loginPasswordInput = document.getElementById("login-password");
const loginPasswordConfirmInput = document.getElementById("login-password-confirm");
const loginConfirmField = document.getElementById("login-confirm-field");
const loginInviteField = document.getElementById("login-invite-field");
const loginInviteCodeInput = document.getElementById("login-invite-code");
const loginPrimaryButton = document.getElementById("login-primary-button");
const authTabs = Array.from(document.querySelectorAll(".admin-auth-tab"));
const loginError = document.getElementById("login-error");

let authMode = "login";

function getErrorMessage(error, fallback) {
  if (error?.payload?.error) {
    return error.payload.error;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}

function nextLocation(session) {
  return session?.isAdmin ? "./admin.html" : "./index.html#catalog";
}

function setAuthMode(nextMode) {
  authMode = nextMode === "register" ? "register" : "login";
  const isRegister = authMode === "register";

  authTabs.forEach((tab) => {
    const isActive = tab.dataset.authTab === authMode;
    tab.classList.toggle("is-active", isActive);
    tab.setAttribute("aria-selected", String(isActive));
  });

  loginConfirmField.hidden = !isRegister;
  loginPasswordConfirmInput.required = isRegister;
  loginPasswordConfirmInput.disabled = !isRegister;
  loginInviteField.hidden = !isRegister;
  loginInviteCodeInput.required = isRegister;
  loginInviteCodeInput.disabled = !isRegister;
  if (!isRegister) {
    loginPasswordConfirmInput.value = "";
    loginInviteCodeInput.value = "";
  }
  loginPrimaryButton.textContent = isRegister ? "注册" : "登录";
  loginPasswordInput.autocomplete = isRegister ? "new-password" : "current-password";
  loginError.hidden = true;
}

async function redirectIfLoggedIn() {
  try {
    const session = await getSession();
    if (session.authenticated) {
      window.location.replace(nextLocation(session));
    }
  } catch (error) {
    // Ignore auth probe failures and allow manual login.
  }
}

async function handleSubmit(event) {
  event.preventDefault();

  if (authMode === "register") {
    if (loginPasswordInput.value !== loginPasswordConfirmInput.value) {
      loginError.textContent = "两次输入的密码不一致。";
      loginError.hidden = false;
      return;
    }

    try {
      const session = await register({
        username: loginUsernameInput.value.trim(),
        password: loginPasswordInput.value,
        inviteCode: loginInviteCodeInput.value.trim(),
      });
      loginError.hidden = true;
      window.location.href = nextLocation(session);
    } catch (error) {
      loginError.textContent = getErrorMessage(error, "注册失败，请稍后再试。");
      loginError.hidden = false;
    }
    return;
  }

  try {
    const session = await login({
      username: loginUsernameInput.value.trim(),
      password: loginPasswordInput.value,
    });
    loginError.hidden = true;
    window.location.href = nextLocation(session);
  } catch (error) {
    loginError.textContent = getErrorMessage(error, "登录失败，请稍后再试。");
    loginError.hidden = false;
  }
}

authTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    setAuthMode(tab.dataset.authTab);
  });
});

loginForm.addEventListener("submit", handleSubmit);

setAuthMode("login");
redirectIfLoggedIn();
