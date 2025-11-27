// === Same timeAgoFromIso as HomeScript / AnnouncementScript ===
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

// All posts loaded from backend feed (not from sessionStorage anymore)
let allPosts = [];
let eventsLoaded = false;
let lastSelectedBuilding = null;

// Load all posts once from /feed and cache them
async function loadEventsFromBackend() {
  if (eventsLoaded) return;

  try {
    const res = await fetch("feed", {
      method: "GET",
      headers: {
        "Accept": "application/json"
      }
    });

    if (!res.ok) {
      throw new Error("Failed to load feed: " + res.status);
    }

    const data = await res.json();

    // /feed returns a JSON array: [{ id, userId, title, body, category, location, building, ... }, ...]
    // We store all posts, and later filter to category === "Event".
    allPosts = Array.isArray(data) ? data : [];
    eventsLoaded = true;
  } catch (err) {
    console.error("Error loading events from backend:", err);
  }
}

// Quick create event button – remember last selected building so create.html can prefill it
document.getElementById("quickCreateEvent").addEventListener("click", () => {
  if (lastSelectedBuilding) {
    // Save selected building temporarily for create.html
    sessionStorage.setItem("prefill_building", lastSelectedBuilding);
  }
  window.location.href = "create.html";
});

// When a map spot is clicked, load events (if not already loaded), then show modal
document.querySelectorAll(".map-spot").forEach(spot => {
  spot.addEventListener("click", async () => {
    const building = spot.dataset.label;

    lastSelectedBuilding = building;
    document.getElementById("buildingTitle").textContent = building;

    // Ensure we have the latest data from backend
    await loadEventsFromBackend();

    renderBuildingEvents(building);
    document.getElementById("buildingModal").style.display = "flex";
  });
});

// Close modal button
document.getElementById("closeBuilding").addEventListener("click", () => {
  document.getElementById("buildingModal").style.display = "none";
});

// Close modal when clicking outside content
window.addEventListener("click", (e) => {
  if (e.target.id === "buildingModal") {
    document.getElementById("buildingModal").style.display = "none";
  }
});

function renderBuildingEvents(building) {
  const container = document.getElementById("mapEventsList");
  container.innerHTML = "";

  // Filter posts from backend: only Events, and only this building
  const events = allPosts.filter(p =>
    p.category === "Event" &&
    (p.building || "").toLowerCase() === building.toLowerCase()
  );

  if (!events.length) {
    container.innerHTML = `<div class="text-muted small">No events created here yet.</div>`;
    return;
  }

  events.forEach(ev => {
    const div = document.createElement("div");
    div.className = "mb-3 p-3 glassEventCard";

    let imgMarkup = "";
    if (ev.imagePath) {
      imgMarkup = `
        <div class="mb-2">
          <img src="${ev.imagePath}"
               style="width:100%;border-radius:12px;object-fit:cover;max-height:300px;"/>
        </div>
      `;
    }

    // 1) Prefer explicit event date/time if present
    let datePart = ev.eventDate || "";
    let timePart = ev.eventTime || "";

    if (timePart && timePart.length >= 5) {
      timePart = timePart.substring(0, 5); // "HH:MM"
    }

    // 2) If there is no explicit event date/time, fall back to "x ago"
    let metaLabel;
    if (datePart || timePart) {
      metaLabel = `${datePart ? datePart : ""} ${timePart ? "@ " + timePart : ""}`;
    } else {
      metaLabel = ev.createdAt ? timeAgoFromIso(ev.createdAt) : "";
    }

    div.innerHTML = `
      ${imgMarkup}
      <strong>${ev.title}</strong><br>
      <span class="text-muted small">
        ${metaLabel}
      </span><br>
      <div class="mt-1">${ev.body}</div>
    `;

    container.appendChild(div);
  });
}
