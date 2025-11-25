// Collect all search buttons (desktop, bottom-nav, offcanvas, etc.)
const searchButtons = document.querySelectorAll(".openSearch");
const searchModal   = document.getElementById("searchModal");
const searchInput   = document.getElementById("searchInput");
const searchResults = document.getElementById("searchResults");

const dummyUsers = [
  {name:"Chihab"},
  {name:"Karim"},
  {name:"Ahmed"}
];

// Open search modal on ANY search button click
searchButtons.forEach(btn => {
  btn.addEventListener("click", (e) => {
    e.preventDefault(); // Prevent anchor behavior

    searchModal.style.display = "flex";
    searchInput.value = "";
    searchResults.innerHTML = "";
    searchInput.focus();
  });
});

// Close when clicking outside modal content
window.addEventListener("click", (e) => {
  if (e.target === searchModal) {
    searchModal.style.display = "none";
  }
});

// Handle typing in search input
searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();
  searchResults.innerHTML = "";

  if (!q) return;

  const results = dummyUsers.filter(u => 
    u.name.toLowerCase().includes(q)
  );

  if (results.length === 0) {
    searchResults.innerHTML =
      `<p class="text-muted small mb-0">No results</p>`;
    return;
  }

  results.forEach(u => {
    searchResults.innerHTML += `
      <div class="border rounded p-2 mb-2 search-user-result"
           data-name="${u.name}" style="cursor:pointer;">
        <strong>${u.name}</strong>
      </div>`;
  });
});

// When clicking on a search result
searchResults.addEventListener("click", (e) => {
  const box = e.target.closest(".search-user-result");
  if (!box) return;

  const name = box.dataset.name;
  alert("Loading profile for " + name);

  searchModal.style.display = "none";
});
