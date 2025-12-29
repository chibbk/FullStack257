function timeAgoFromIso(raw) {
  if (raw === null || raw === undefined || raw === "") return "";

  let ts; // timestamp in ms
  const now = Date.now();

  if (typeof raw === "number") {
    ts = raw < 1e12 ? raw * 1000 : raw;
  } else {
    const s = String(raw).trim();

    if (/^\d+$/.test(s)) {
      const n = Number(s);
      ts = n < 1e12 ? n * 1000 : n;
    } else {
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

        ts = new Date(year, month, day, hour, min, sec).getTime();


        const aheadMs = ts - now;
        if (aheadMs > 5 * 60 * 1000 && aheadMs < 12 * 60 * 60 * 1000) {
          const offsetHours = Math.round(aheadMs / (60 * 60 * 1000));
          ts -= offsetHours * 60 * 60 * 1000;
        }
      } else {
        const normalized = s.replace(" ", "T");
        ts = new Date(normalized).getTime();
      }
    }
  }

  if (!Number.isFinite(ts)) return "";

  let diffSec = Math.floor((now - ts) / 1000);

  if (diffSec < 0) diffSec = 0;

  if (diffSec < 60) return diffSec + "s ago";
  const mins = Math.floor(diffSec / 60);
  if (mins < 60) return mins + "m ago";
  const hours = Math.floor(mins / 60);
  if (hours < 24) return hours + "h ago";
  const days = Math.floor(hours / 24);
  return days + "d ago";
}

let allPosts = [];
let eventsLoaded = false;
let lastSelectedBuilding = null;

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

    allPosts = Array.isArray(data) ? data : [];
    eventsLoaded = true;
  } catch (err) {
    console.error("Error loading events from backend:", err);
  }
}

document.getElementById("quickCreateEvent").addEventListener("click", () => {
  if (lastSelectedBuilding) {
    sessionStorage.setItem("prefill_building", lastSelectedBuilding);
  }
  window.location.href = "create.html";
});

document.querySelectorAll(".map-spot").forEach(spot => {
  spot.addEventListener("click", async () => {
    const building = spot.dataset.label;

    lastSelectedBuilding = building;
    document.getElementById("buildingTitle").textContent = building;

    await loadEventsFromBackend();

    renderBuildingEvents(building);
    document.getElementById("buildingModal").style.display = "flex";
  });
});

document.getElementById("closeBuilding").addEventListener("click", () => {
  document.getElementById("buildingModal").style.display = "none";
});

window.addEventListener("click", (e) => {
  if (e.target.id === "buildingModal") {
    document.getElementById("buildingModal").style.display = "none";
  }
});

function renderBuildingEvents(building) {
  const container = document.getElementById("mapEventsList");
  container.innerHTML = "";

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

    let datePart = ev.eventDate || "";
    let timePart = ev.eventTime || "";

    if (timePart && timePart.length >= 5) {
      timePart = timePart.substring(0, 5); // "HH:MM"
    }

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
