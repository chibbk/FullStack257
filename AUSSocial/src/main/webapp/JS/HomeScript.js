// Ahmed Abdelmohsen - B00099927

const FEED_CONTAINER = document.getElementById('feedList');
const LOAD_MORE = document.getElementById('loadMore');
const PAGE_SIZE = 5; let page = 0; let posts = [];

function parseTags(raw) {
  if (!raw) return [];
  if (Array.isArray(raw)) return raw;
  return String(raw)
    .split(',')
    .map(t => t.trim())
    .filter(Boolean);
}

function timeAgo(ts) {
  const diff = Math.floor((Date.now() - ts) / 1000);
  if (!Number.isFinite(diff)) return 'just now';
  if (diff < 60) return diff + 's ago';
  const m = Math.floor(diff / 60); if (m < 60) return m + 'm ago';
  const h = Math.floor(m / 60); if (h < 24) return h + 'h ago';
  const d = Math.floor(h / 24); return d + 'd ago';
}

function persist(updated) {
  const idx = posts.findIndex(x => x.id === updated.id);
  if (idx > -1) posts[idx] = updated;
}

async function deletePostById(id) {
  try {
    await fetch('/deletePost', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: `id=${encodeURIComponent(id)}`,
      credentials: 'include'
    });
  } catch (err) {
    console.error('Failed to delete post', err);
  }
  posts = posts.filter(x => x.id !== id);
}

function escapeHtml(s) {
  return (s || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));
}

function getUser() {
  try { return JSON.parse(sessionStorage.getItem('aus_user') || '{}'); }
  catch { return {}; }
}

function normalizePosts(data) {
  return (Array.isArray(data) ? data : []).map(p => ({
    ...p,
    likes: typeof p.likeCount === 'number' ? p.likeCount : 0,
    liked: false,
    comments: [],
    createdAt: p.createdAt ? new Date(p.createdAt).getTime() : Date.now(),
    tags: parseTags(p.tags)
  })).sort((a, b) => b.createdAt - a.createdAt);
}

async function loadPosts(){
  try {
    const res = await fetch('/feed', { credentials: 'include' });
    const data = await res.json();
    posts = normalizePosts(data);
  } catch (err) {
    console.error('Error loading posts', err);
    posts = [];
  }
}

function renderSlice(){
  const start = page * PAGE_SIZE, end = start + PAGE_SIZE;
  const slice = posts.slice(start, end);
  if (!slice.length && !page) {
    FEED_CONTAINER.innerHTML = `
      <div class="card border-0">
        <div class="card-body text-center text-muted">
          <p class="mb-2">No posts yet.</p>
          <a href="create.html" class="btn btn-dark btn-sm">Create your first post</a>
        </div>
      </div>`;
    LOAD_MORE.classList.add('d-none'); return;
  }
  slice.forEach(p => FEED_CONTAINER.appendChild(postCard(p)));
  page++;
  (page * PAGE_SIZE < posts.length) ? LOAD_MORE.classList.remove('d-none') : LOAD_MORE.classList.add('d-none');
}

// === Post card with Like + Comments - Ahmed Mohsen, Chihab (delete feature) ===
function postCard(p){
  // defaults
  p.likes = typeof p.likes === 'number' ? p.likes : 0;
  p.liked = !!p.liked;
  //for delete feature - Chihab
  p.comments = Array.isArray(p.comments) ? p.comments : [];

  const currentUser = getUser();
  const canDelete =
    currentUser &&
    currentUser.email &&
    p.authorEmail &&
    currentUser.email === p.authorEmail;

  const card = document.createElement('div');
  card.className = 'card shadow-sm';

  const tagsMarkup = (p.tags||[]).map(t=>`<span class="badge text-bg-light">#${escapeHtml(t)}</span>`).join(' ');
  const imgMarkup = p.imageData ? `<img class="img-fluid" src="${p.imageData}" alt="post image" />` : '';

  const heartIcon = p.liked ? 'bi-heart-fill' : 'bi-heart';
  const commentCount = p.comments.length;
   const deleteMarkup = canDelete
    ? `<button class="btn btn-sm btn-outline-danger ms-2 delete-btn">Delete</button>`
    : '';

  card.innerHTML = `
    ${imgMarkup}
    <div class="card-body">
      <div class="d-flex justify-content-between align-items-start gap-3">
        <div>
          <h5 class="card-title mb-1">${escapeHtml(p.title)}</h5>
          <div class="text-muted small">${escapeHtml(p.category||'Post')} • ${timeAgo(p.createdAt)}</div>
        </div>
        <div class="d-flex align-items-start gap-2">
          <div class="d-flex flex-wrap gap-1">${tagsMarkup}</div>
          ${deleteMarkup}
        </div>
      </div>

      <p class="card-text mt-2">${escapeHtml(p.body)}</p>

      <div class="d-flex align-items-center gap-3">
        <button class="btn like-btn" aria-label="like">
          <i class="bi ${heartIcon}"></i>
        </button>
        <span class="likes small text-muted">${p.likes}</span>

        <button class="comment-toggle ms-auto" type="button" aria-expanded="false">
          <i class="bi bi-chat"></i>
          <span class="comment-count">${commentCount}</span>
          <i class="bi bi-chevron-down"></i>
        </button>
      </div>

      <div class="comment-box d-none">
        <div class="comment-list mt-2"></div>
        <div class="add-comment">
          <input type="text" class="form-control form-control-sm" placeholder="Add a comment…" maxlength="280" />
          <button class="btn btn-sm btn-secondary">Post</button>
        </div>
      </div>
    </div>
  `;

  // Like behavior
  const likeBtn = card.querySelector('.like-btn');
  const likeIcon = likeBtn.querySelector('i');
  const likeCountEl = card.querySelector('.likes');

  likeBtn.addEventListener('click', () => {
    p.liked = !p.liked;
    p.likes = Math.max(0, (p.likes || 0) + (p.liked ? 1 : -1));
    likeIcon.className = 'bi ' + (p.liked ? 'bi-heart-fill' : 'bi-heart');
    likeCountEl.textContent = p.likes;
    persist(p);
  });

  // Comments behavior
  const box = card.querySelector('.comment-box');
  const list = card.querySelector('.comment-list');
  const toggleBtn = card.querySelector('.comment-toggle');
  const countEl = card.querySelector('.comment-count');
  const input = card.querySelector('.add-comment input');
  const postBtn = card.querySelector('.add-comment button');

  function renderComments(){
    list.innerHTML = '';
    if (!p.comments.length) {
      list.innerHTML = `<div class="text-muted small">Be the first to comment.</div>`;
      return;
    }
    p.comments
      .sort((a,b)=>a.createdAt-b.createdAt) // oldest first
      .forEach(c=>{
        const row = document.createElement('div');
        row.className='comment-item py-2';
        row.innerHTML = `
          <div class="d-flex justify-content-between">
            <strong>${escapeHtml(c.authorName||'AUS User')}</strong>
            <span class="meta">${timeAgo(c.createdAt)}</span>
          </div>
          <div>${escapeHtml(c.text)}</div>`;
        list.appendChild(row);
      });
  }

  toggleBtn.addEventListener('click', ()=>{
    const isOpen = !box.classList.contains('d-none');
    box.classList.toggle('d-none', isOpen);
    toggleBtn.setAttribute('aria-expanded', String(!isOpen));
    // render when opening
    if (!isOpen) renderComments();
  });

  postBtn.addEventListener('click', ()=>{
    const text = (input.value||'').trim();
    if (!text) return;
    const user = getUser();
    p.comments.push({
      id: (crypto.randomUUID? crypto.randomUUID(): String(Math.random())),
      authorName: (user.name||'AUS User'),
      text,
      createdAt: Date.now()
    });
    input.value='';
    countEl.textContent = p.comments.length;
    persist(p);
    renderComments();
  });

  // Delete event listener - CHihab
  const delBtn = card.querySelector('.delete-btn');
  if (delBtn) {
    delBtn.addEventListener('click', async () => {
      await deletePostById(p.id);
      FEED_CONTAINER.innerHTML = '';
      page = 0;
      renderSlice();
    });
  }

  return card;
}

async function init(){
  await loadPosts();
  renderSlice();
}

init();
LOAD_MORE.addEventListener('click', renderSlice);
