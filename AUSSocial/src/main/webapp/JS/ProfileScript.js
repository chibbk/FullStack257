// Chihab - b00099008
// Elements
const editProfileModal = document.getElementById("editProfileModal");
const editBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEdit");
const editForm = document.getElementById("editForm");
const pfpImg = document.getElementById("pfp");
const bioTxt = document.getElementById("bioText");
const editBioInput = document.getElementById("editBio");
const uploadInput = document.getElementById("uploadPfp");
const resetPfpBtn = document.getElementById("resetPfpBtn");
const defaultPfp = "images/DefaultPfp.jpg";
const pfpPreview = document.getElementById("pfpPreview");
const user = JSON.parse(sessionStorage.getItem("aus_user"));
document.getElementById("profileName").textContent = user?.name || "Your Name";

//handling reset to default
let useDefaultPfp = false;

//restoring saved data
const savedPfp = sessionStorage.getItem("pfpImage");
if (savedPfp) pfpImg.src = savedPfp;

const savedBio = sessionStorage.getItem("profileBio");
bioTxt.textContent = savedBio ? savedBio : "No bio added yet.";

// Open modal
editBtn?.addEventListener("click", () => {
  editProfileModal.style.display = "flex";
  editBioInput.value = (bioTxt.textContent === "No bio added yet.") ? "" : bioTxt.textContent;
  editBioInput.focus();
  useDefaultPfp = false;

  //sync preview with REAL pfp when modal opens
  pfpPreview.src = pfpImg.src;
});


function closeEditModal() {
  editProfileModal.style.display = "none";
}

cancelEditBtn?.addEventListener("click", closeEditModal);

window.addEventListener("click", (e) => {
  if (e.target === editProfileModal) closeEditModal();
});

uploadInput?.addEventListener("change", () => {
  const file = uploadInput.files?.[0];
  if (file) {
    useDefaultPfp = false;
    const reader = new FileReader();
    reader.onload = () => pfpPreview.src = reader.result;
    reader.readAsDataURL(file);
  }
});




// =============================
// Load posts from backend
// =============================

const profilePostsEl = document.getElementById("profilePosts");

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m] || m));
}

async function loadProfilePosts() {
  if (!profilePostsEl) return;

  profilePostsEl.innerHTML = `<p class="text-muted">Loading your posts…</p>`;

  try {
    const res = await fetch('myPosts');
    if (!res.ok) {
      profilePostsEl.innerHTML = `<p class="text-danger">Error loading posts.</p>`;
      return;
    }

    const posts = await res.json();

    if (!posts.length) {
      profilePostsEl.innerHTML = `<p class="text-muted">No posts yet.</p>`;
      return;
    }

    let html = "";
    posts.forEach(p => {
      html += `
        <div class="card mb-3 shadow-sm" data-id="${p.id}">
          <div class="card-body">
            <h5 class="card-title">${escapeHtml(p.title)}</h5>
            <p class="card-text">${escapeHtml(p.body)}</p>
            <span class="text-muted small d-block mb-2">${escapeHtml(p.category)}</span>
            <button class="btn btn-sm btn-outline-danger delete-post-btn" data-id="${p.id}">
              Delete
            </button>
          </div>
        </div>
      `;
    });

    profilePostsEl.innerHTML = html;

  } catch (err) {
    console.error(err);
    profilePostsEl.innerHTML = `<p class="text-danger">Error loading posts.</p>`;
  }
}

// =============================
// Delete posts using backend
// =============================
profilePostsEl.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-post-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!confirm("Delete this post?")) return;

  try {
    const res = await fetch('deletePost?id=' + encodeURIComponent(id), {
      method: 'POST'
    });

    if (res.ok) {
      loadProfilePosts();
    }

  } catch (err) {
    console.error(err);
  }
});

// load posts on page load
document.addEventListener("DOMContentLoaded", loadProfilePosts);








resetPfpBtn?.addEventListener("click", () => {
  useDefaultPfp = true;
  uploadInput.value = "";
  pfpPreview.src = defaultPfp; //Trying to make it so that changes won't be final until the user saves their progress
});



// Save handler
editForm?.addEventListener("submit", (e) => {
  e.preventDefault();

  
if (useDefaultPfp) {
    pfpImg.src = defaultPfp;
    sessionStorage.setItem("pfpImage", defaultPfp);
} else if (uploadInput.files?.[0]) {
    // if user chose a new file
    const reader = new FileReader();
    reader.onload = () => {
      pfpImg.src = reader.result;
      sessionStorage.setItem("pfpImage", reader.result);
    };
    reader.readAsDataURL(uploadInput.files[0]);
} else {
    // no change → keep the preview src
    if (pfpPreview.src !== pfpImg.src) sessionStorage.setItem("pfpImage", pfpPreview.src);
    pfpImg.src = pfpPreview.src;
}

  const newBio = editBioInput.value.trim();
  const finalBio = newBio === "" ? "No bio added yet." : newBio;
  bioTxt.textContent = finalBio;
  sessionStorage.setItem("profileBio", finalBio);

  closeEditModal();
});
