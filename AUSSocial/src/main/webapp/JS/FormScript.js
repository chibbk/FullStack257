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

  function setMode(newMode) {
    mode = newMode;

    if (mode === "login") {
      authTitle.textContent = "Log In";
      authSubtitle.textContent = "Welcome back! Log in with your AUS email and password.";
      authToggleText.textContent = "Don't have an account?";
      switchAuthModeBtn.textContent = "Sign up";
      authSubmitBtn.textContent = "Log In";
      nameGroup.style.display = "none";

      // Disable name in login mode so browser validation doesn’t complain
      nameInput.required = false;
      nameInput.disabled = true;

      form.action = "login";
    } else {
      authTitle.textContent = "Sign Up";
      authSubtitle.textContent = "Create an AUS Social account to get started.";
      authToggleText.textContent = "Already have an account?";
      switchAuthModeBtn.textContent = "Log in";
      authSubmitBtn.textContent = "Sign Up";
      nameGroup.style.display = "block";

      // Enable + require in signup mode
      nameInput.disabled = false;
      nameInput.required = true;

      form.action = "signup";
    }

    email.setCustomValidity("");
    passwordInput.setCustomValidity("");
  }



  setMode("login");

  if (modal) {
    modal.style.display = "none";

    fetch("whoami")
      .then((res) => (res.ok ? res.json() : { authenticated: false }))
      .then((data) => {
        if (data.authenticated) {
          modal.style.display = "none";
        } else {
          modal.style.display = "flex";
        }
      })
      .catch((err) => {
        console.error("whoami check failed", err);
        modal.style.display = "flex";
      });
  }


  // Toggle between login / signup
  switchAuthModeBtn.addEventListener("click", () => {
    setMode(mode === "login" ? "signup" : "login");
  });

  function validateAusEmail(value) {
    if (!value.endsWith("@aus.edu")) {
      email.setCustomValidity("Please enter a valid AUS email ending with @aus.edu.");
      email.reportValidity();
      return false;
    }
    email.setCustomValidity("");
    return true;
  }

  email.addEventListener("input", () => email.setCustomValidity(""));
  passwordInput.addEventListener("input", () => passwordInput.setCustomValidity(""));

  form.addEventListener("submit", (event) => {
    const emailVal = (email.value || "").trim();
    const pwdVal = (passwordInput.value || "").trim();

    if (!validateAusEmail(emailVal)) {
      event.preventDefault();
      return;
    }
    if (pwdVal.length < 4) {
      passwordInput.setCustomValidity("Password should be at least 4 characters.");
      passwordInput.reportValidity();
      event.preventDefault();
      return;
    }

    // For signup, require name
    if (mode === "signup") {
      const nameVal = (nameInput.value || "").trim();
      if (!nameVal) {
        nameInput.setCustomValidity("Please enter your name.");
        nameInput.reportValidity();
        event.preventDefault();
        return;
      }
      nameInput.setCustomValidity("");
    }
  });

  const logoutButtons = document.querySelectorAll(".logout-link");
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", (event) => {
      event.preventDefault();
      window.location.href = "logout"; // servlet mapping
    });
  });
});


