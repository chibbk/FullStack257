// Chihab Ben Khadra - b00099008
document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("modal");
  const form = document.getElementById("popupForm");
  const email = document.getElementById("email");
  const nameInput = document.getElementById("name");
  const passwordInput = document.getElementById("password");

  const authTitle = document.getElementById("authTitle");
  const authSubtitle = document.getElementById("authSubtitle");
  const nameGroup = document.getElementById("nameGroup");
  const authToggleText = document.getElementById("authToggleText");
  const switchAuthModeBtn = document.getElementById("switchAuthMode");
  const authSubmitBtn = document.getElementById("authSubmitBtn");

  // mode: "login" or "signup"
  let mode = "login";

    // Using JSON to save User data locally
  function getSavedAccount() {
    return JSON.parse(sessionStorage.getItem("aus_account") || "null");
  }


  if (!getSavedAccount()) {
    mode = "signup";
  }

  function setMode(newMode) {
    mode = newMode;

    if (mode === "login") {
      authTitle.textContent = "Log In";
      authSubtitle.textContent = "Welcome back! Log in with your AUS email and password.";
      authToggleText.textContent = "Don’t have an account?";
      switchAuthModeBtn.textContent = "Sign up";
      authSubmitBtn.textContent = "Log In";
    } else {
      authTitle.textContent = "Sign Up";
      authSubtitle.textContent = "Create an AUS Social account to get started.";
      authToggleText.textContent = "Already have an account?";
      switchAuthModeBtn.textContent = "Log in";
      authSubmitBtn.textContent = "Sign Up";
    }

    // Clear validation errors when switching
    email.setCustomValidity("");
    passwordInput.setCustomValidity("");
  }

  setMode(mode);

  // Show modal if not submitted before this tab session

  // https://www.w3schools.com/howto/howto_css_modals.asp
  if (!sessionStorage.getItem("isLoggedIn")) {
    modal.style.display = "flex";
  }

  // Toggle between login <-> signup
  switchAuthModeBtn.addEventListener("click", () => {
    setMode(mode === "login" ? "signup" : "login");
  });

  email.addEventListener("input", () => email.setCustomValidity(""));
  passwordInput.addEventListener("input", () => passwordInput.setCustomValidity(""));

// Clear email validation warning
  function validateAusEmail(value) {
    if (!value.endsWith("@aus.edu")) {
      email.setCustomValidity("Please enter a valid AUS email ending with @aus.edu.");
      email.reportValidity();
      return false;
    }
    return true;
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const emailVal = (email.value || "").trim();
    const pwdVal = (passwordInput.value || "").trim();
    const nameVal = (nameInput.value || "AUS User").trim();

    // enforce AUS email
    if (!validateAusEmail(emailVal)) return;

    if (pwdVal.length < 4) {
      passwordInput.setCustomValidity("Password should be at least 4 characters.");
      passwordInput.reportValidity();
      return;
    }

    let account = getSavedAccount();

    if (mode === "signup") {
      // prevent signing up twice in this browser
      if (account && account.email === emailVal) {
        email.setCustomValidity("An account with this email already exists. Please log in instead.");
        email.reportValidity();
        setMode("login");
        return;
      }

      account = {
        name: nameVal,
        email: emailVal,
        password: pwdVal
      };
      sessionStorage.setItem("aus_account", JSON.stringify(account));

      // mark user as logged in for this tab
      sessionStorage.setItem(
        "aus_user",
        JSON.stringify({ name: account.name, email: account.email })
      );
      sessionStorage.setItem("isLoggedIn", "true");

      modal.style.display = "none";
    } else {
      // LOGIN MODE
      if (!account) {
        email.setCustomValidity("No account found. Please sign up first.");
        email.reportValidity();
        setMode("signup");
        return;
      }

      if (account.email !== emailVal || account.password !== pwdVal) {
        passwordInput.setCustomValidity("Incorrect email or password.");
        passwordInput.reportValidity();
        return;
      }

      // success: store session user
      sessionStorage.setItem(
        "aus_user",
        JSON.stringify({ name: account.name, email: account.email })
      );
      sessionStorage.setItem("isLoggedIn", "true");

      modal.style.display = "none";
    }
  });
});
