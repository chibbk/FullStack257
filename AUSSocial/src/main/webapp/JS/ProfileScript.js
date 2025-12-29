// Chihab - b00099008
const editProfileModal = document.getElementById("editProfileModal");
const editBtn = document.getElementById("editProfileBtn");
const cancelEditBtn = document.getElementById("cancelEdit");
const editForm = document.getElementById("editForm");
const pfpImg = document.getElementById("pfp");
const bioTxt = document.getElementById("bioText");
const editBioInput = document.getElementById("editBio");
const uploadInput = document.getElementById("uploadPfp");
const resetPfpBtn = document.getElementById("resetPfpBtn");
const pfpPreview = document.getElementById("pfpPreview");
const profileNameEl = document.getElementById("profileName");

const defaultPfp = "images/DefaultPfp.jpg";

let useDefaultPfp = false;


async function loadProfileFromServer() {
  try {
    const res = await fetch("whoami", {
      method: "GET",
      credentials: "include"
    });

    const data = await res.json();
    console.log("whoami data:", data);

    if (!data.authenticated) {
      profileNameEl.textContent = "Guest";
      bioTxt.textContent = "No bio added yet.";
      pfpImg.src = defaultPfp;
      pfpPreview.src = defaultPfp;
      return;
    }

    profileNameEl.textContent = data.username || "Your Name";

    if (typeof data.bio === "string" && data.bio.trim() !== "") {
      bioTxt.textContent = data.bio;
    } else {
      bioTxt.textContent = "No bio added yet.";
    }

    if (typeof data.profilePicture === "string" && data.profilePicture.trim() !== "") {
      pfpImg.src = data.profilePicture;
      pfpPreview.src = data.profilePicture;
    } else {
      pfpImg.src = defaultPfp;
      pfpPreview.src = defaultPfp;
    }

  } catch (err) {
    console.error("Error loading profile:", err);
    profileNameEl.textContent = "Your Name";
    bioTxt.textContent = "No bio added yet.";
    pfpImg.src = defaultPfp;
    pfpPreview.src = defaultPfp;
  }
}


editBtn?.addEventListener("click", () => {
  editProfileModal.style.display = "flex";
  editBioInput.value =
    bioTxt.textContent === "No bio added yet." ? "" : bioTxt.textContent;
  editBioInput.focus();
  useDefaultPfp = false;

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
    reader.onload = () => (pfpPreview.src = reader.result);
    reader.readAsDataURL(file);
  }
});

resetPfpBtn?.addEventListener("click", () => {
  useDefaultPfp = true;
  if (uploadInput) uploadInput.value = "";
  pfpPreview.src = defaultPfp; // changes applied on Save
});


const profilePostsEl = document.getElementById("profilePosts");

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (m) => (
    {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[m] || m
  ));
}

async function loadProfilePosts() {
  if (!profilePostsEl) return;

  profilePostsEl.innerHTML = `<p class="text-muted">Loading your posts…</p>`;

  try {
    const res = await fetch("myPosts", { credentials: "include" });
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
    posts.forEach((p) => {
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


profilePostsEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest(".delete-post-btn");
  if (!btn) return;

  const id = btn.dataset.id;
  if (!confirm("Delete this post?")) return;

  try {
    const res = await fetch("deletePost?id=" + encodeURIComponent(id), {
      method: "POST",
      credentials: "include"
    });

    if (res.ok) {
      loadProfilePosts();
    }

  } catch (err) {
    console.error(err);
  }
});


async function saveBioToServer(newBio) {
  try {
    const res = await fetch("updateBio", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded;charset=UTF-8"
      },
      credentials: "include",
      body: "bio=" + encodeURIComponent(newBio)
    });

    if (!res.ok) {
      throw new Error("Failed to save bio, status " + res.status);
    }

    const data = await res.json().catch(() => null);
    console.log("updateBio response:", data); // debug

    if (data && data.ok === false) {
      throw new Error(data.error || "Server returned ok=false");
    }
  } catch (err) {
    console.error("Error saving bio:", err);
    alert("Couldn't save your bio. Please try again.");
  }
}

editForm?.addEventListener("submit", async (e) => {
  e.preventDefault();

  if (useDefaultPfp) {
    pfpImg.src = defaultPfp;
  } else if (uploadInput.files?.[0]) {
    const file = uploadInput.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      pfpImg.src = reader.result;
    };
    reader.readAsDataURL(file);
  } else {
    pfpImg.src = pfpPreview.src;
  }

  const newBio = editBioInput.value.trim();
  const finalBio = newBio === "" ? "No bio added yet." : newBio;
  bioTxt.textContent = finalBio;

  await saveBioToServer(newBio);

  closeEditModal();
});


document.addEventListener("DOMContentLoaded", () => {
  loadProfileFromServer();
  loadProfilePosts();
});
