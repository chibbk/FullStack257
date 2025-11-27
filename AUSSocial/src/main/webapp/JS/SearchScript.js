// --------- Elements ---------
const searchButtons = document.querySelectorAll(".openSearch");
const searchModal   = document.getElementById("searchModal");
const searchInput   = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

// Default profile picture (works in your browser)
const DEFAULT_PFP = "images/DefaultPfp.jpg";

let currentSearchAbort = null;

// --------- Open / Close Search Modal ---------
searchButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault();

    searchModal.style.display = "flex";
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchInput.focus();
  });
});

window.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.style.display = "none";
  }
});

// --------- Searching ---------
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim();
  searchResults.innerHTML = "";

  if (!q) return;

  // cancel previous request if any
  if (currentSearchAbort) {
    currentSearchAbort.abort();
  }
  currentSearchAbort = new AbortController();

  fetch("searchUsers?q=" + encodeURIComponent(q), {
    method: "GET",
    headers: { "Accept": "application/json" },
    signal: currentSearchAbort.signal
  })
    .then(res => {
      if (!res.ok) throw new Error("Search failed: " + res.status);
      return res.json();
    })
    .then(users => {
      if (!Array.isArray(users) || users.length === 0) {
        searchResults.innerHTML =
          `<p class="text-muted small mb-0">No results</p>`;
        return;
      }

      users.forEach(u => {
        const id = u.id;
        const username = u.username || "";
        const profilePicture = DEFAULT_PFP; // always use default

        const html = `
          <div class="border rounded p-2 mb-2 d-flex align-items-center search-user-result"
               data-id="${id}"
               data-username="${username}"
               data-profile-picture="${profilePicture}"
               style="cursor:pointer; gap: 10px;">
            <img src="${profilePicture}"
                 class="rounded-circle me-2"
                 style="width:32px;height:32px;object-fit:cover;">
            <strong>@${username}</strong>
          </div>`;

        searchResults.insertAdjacentHTML("beforeend", html);
      });
    })
    .catch(err => {
      if (err.name === "AbortError") return;
      console.error("Search error:", err);
      searchResults.innerHTML =
        `<p class="text-danger small mb-0">Error loading results</p>`;
    });
});

// --------- Click on Result -> Show Centered Profile Picture ---------
searchResults.addEventListener("click", (e) => {
  const box = e.target.closest(".search-user-result");
  if (!box) return;

  const username = box.dataset.username || "";
  const profilePicture = box.dataset.profilePicture || DEFAULT_PFP;

  showProfilePreview(username, profilePicture);
});

// --------- Overlay helper ---------
function showProfilePreview(username, profilePicture) {
  // remove any existing overlay
  const old = document.querySelector(".profile-preview-overlay");
  if (old) old.remove();

  const overlay = document.createElement("div");
  overlay.className = "profile-preview-overlay";
  overlay.innerHTML = `
    <div class="profile-preview-inner">
      <button type="button" class="profile-preview-close">&times;</button>
      <img src="${profilePicture}"
           class="profile-preview-image">
      <p class="profile-preview-username">@${username}</p>
    </div>
  `;

  document.body.appendChild(overlay);

  // Close events
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay || e.target.classList.contains("profile-preview-close")) {
      overlay.remove();
    }
  });
}
