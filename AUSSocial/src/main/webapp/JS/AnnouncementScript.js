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

function timeAgoFromIso(raw) {
  if (raw === null || raw === undefined || raw === "") return "";

  let ts; // timestamp in ms
  const now = Date.now();

  if (typeof raw === "number") {
    // If it's small (10 digits-ish), assume seconds; otherwise ms
    ts = raw < 1e12 ? raw * 1000 : raw;
  } else {
    const s = String(raw).trim();

    // Pure digits in string → epoch
    if (/^\d+$/.test(s)) {
      const n = Number(s);
      ts = n < 1e12 ? n * 1000 : n;
    } else {
      // MySQL style: "YYYY-MM-DD HH:MM:SS.0" or without .0, or with T
      const m = s.match(
        /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/
      );
      if (m) {
        const year  = Number(m[1]);
        const month = Number(m[2]) - 1; // 0-based
        const day   = Number(m[3]);
        const hour  = Number(m[4]);
        const min   = Number(m[5]);
        const sec   = Number(m[6]);

        // First, interpret as *local* time
        ts = new Date(year, month, day, hour, min, sec).getTime();

        // If this appears several hours *ahead* of now, treat that as
        // a timezone offset and correct it (e.g. DB is UTC+8, browser UTC+4)
        const aheadMs = ts - now;
        if (aheadMs > 5 * 60 * 1000 && aheadMs < 12 * 60 * 60 * 1000) {
          const offsetHours = Math.round(aheadMs / (60 * 60 * 1000));
          ts -= offsetHours * 60 * 60 * 1000;
        }
      } else {
        // Generic ISO string fallback
        const normalized = s.replace(" ", "T");
        ts = new Date(normalized).getTime();
      }
    }
  }

  if (!Number.isFinite(ts)) return "";

  let diffSec = Math.floor((now - ts) / 1000);

  // Final safety clamp: never show negative
  if (diffSec < 0) diffSec = 0;

  if (diffSec < 60) return diffSec + "s ago";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
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
          ${timeAgoFromIso(p.createdAt)} - ${escapeHtml(p.category || "Announcement")}
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


