// Karim Hamdan- B00100281

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
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

// load saved posts and shows only the ones meant for Announcement
const anncList = document.getElementById('anncList');
const saved = JSON.parse(sessionStorage.getItem('aus_posts') || '[]');
const onlyAnnouncements = saved
  .filter(p => p.category === 'Announcement')
  .sort((a, b) => b.createdAt - a.createdAt);

if (onlyAnnouncements.length > 0) {
  anncList.innerHTML = '';
  onlyAnnouncements.forEach(post => {
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
} else {
  anncList.innerHTML = `
    <div class="card border-0">
      <div class="card-body text-center text-muted">
        No announcements yet.
      </div>
    </div>`;
}