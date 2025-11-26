// Karim Hamdan- B00100281

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (!Number.isFinite(diff)) return 'just now';
  if (diff < 60) return diff + 's ago';
  const m = Math.floor(diff / 60);
  if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60);
  if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24);
  return d + 'd ago';
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({
    '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;'
  }[m]));
}

const anncList = document.getElementById('anncList');

function renderAnnouncements(posts) {
  if (posts.length === 0) {
    anncList.innerHTML = `
      <div class="card border-0">
        <div class="card-body text-center text-muted">
          No announcements yet.
        </div>
      </div>`;
    return;
  }

  anncList.innerHTML = '';
  posts.forEach(post => {
    const div = document.createElement('div');
    div.className = 'card shadow-sm';
    const tags = (post.tags || [])
      .map(t => `<span class="badge text-bg-light">#${escapeHtml(t)}</span>`)
      .join(' ');
    const img = post.imageData
      ? `<img src="${post.imageData}" class="img-fluid" alt="announcement image" />`
      : '';
    div.innerHTML = `
      ${img}
      <div class="card-body">
        <h5 class="card-title mb-1">${escapeHtml(post.title)}</h5>
        <p class="card-text mt-2">${escapeHtml(post.body)}</p>
        <div class="d-flex justify-content-between align-items-center mt-2">
          <small class="text-muted">${timeAgo(post.createdAt)}</small>
          <div>${tags}</div>
        </div>
      </div>
    `;
    anncList.appendChild(div);
  });
}

function normalizeAnnouncements(raw) {
  return (Array.isArray(raw) ? raw : []).map(p => ({
    ...p,
    createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
    tags: p.tags ? String(p.tags).split(',').map(t => t.trim()).filter(Boolean) : []
  }));
}

async function loadAnnouncements() {
  try {
    const res = await fetch('/announcementsFeed', { credentials: 'include' });
    const data = await res.json();
    renderAnnouncements(normalizeAnnouncements(data));
  } catch (err) {
    console.error('Failed to load announcements', err);
    renderAnnouncements([]);
  }
}

loadAnnouncements();
