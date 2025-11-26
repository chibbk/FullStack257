// Karim Hamdan- B00100281

const anncListEl = document.getElementById("anncList");

function escapeHtml(s) {
  return (s || "").replace(/[&<>"']/g, (m) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  }[m] || m));
}

function timeAgoFromIso(iso) {
  if (!iso) return "";
  const ts = new Date(iso).getTime();
  const diffSec = Math.floor((Date.now() - ts) / 1000);
  if (diffSec < 60) return diffSec + "s ago";
  const m = Math.floor(diffSec / 60);
  if (m < 60) return m + "m ago";
  const h = Math.floor(m / 60);
  if (h < 24) return h + "h ago";
  const d = Math.floor(h / 24);
  return d + "d ago";
}

async function loadAnnouncements() {
  if (!anncListEl) return;
  anncListEl.innerHTML = `<p class="text-muted">Loading…</p>`;

  try {
    const res = await fetch('announcementsFeed');
    if (!res.ok) {
      anncListEl.innerHTML = `<p class="text-danger">Error loading announcements.</p>`;
      return;
    }
    const posts = await res.json();
    if (!posts.length) {
      anncListEl.innerHTML = `<p class="text-muted">No announcements yet.</p>`;
      return;
    }

    anncListEl.innerHTML = '';
    posts.forEach(p => {
      const item = document.createElement('div');
      item.className = "announcement-item p-3 rounded bg-light shadow-sm mb-3";
      item.innerHTML = `
        <h5 class="mb-1">${escapeHtml(p.title)}</h5>
        <div class="text-muted small mb-2">
          ${timeAgoFromIso(p.createdAt)} • ${escapeHtml(p.category || "Announcement")}
        </div>
        <p class="mb-0">${escapeHtml(p.body)}</p>
      `;
      anncListEl.appendChild(item);
    });
  } catch (err) {
    console.error(err);
    anncListEl.innerHTML = `<p class="text-danger">Error loading announcements.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", loadAnnouncements);


