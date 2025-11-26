// Ahmed Abdelmohsen - B00099927

	const FEED_CONTAINER = document.getElementById('feedList');
	const LOAD_MORE = document.getElementById('loadMore');
	const PAGE_SIZE = 5;
	let page = 0;
	let posts = [];

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

	function escapeHtml(s) {
	  return (s || "").replace(/[&<>"']/g, (m) => ({
	    "&": "&amp;",
	    "<": "&lt;",
	    ">": "&gt;",
	    '"': "&quot;",
	    "'": "&#39;"
	  }[m] || m));
	}

	function getCurrentUser() {
	  // we don't expose this on frontend anymore; backend guards protected actions
	  return null;
	}

	function renderSlice() {
	  const start = page * PAGE_SIZE;
	  const end = start + PAGE_SIZE;
	  const slice = posts.slice(start, end);

	  if (!slice.length && page === 0) {
	    FEED_CONTAINER.innerHTML = `
	      <div class="card border-0">
	        <div class="card-body text-center text-muted">
	          <p class="mb-2">No posts yet.</p>
	          <a href="create.html" class="btn btn-dark btn-sm">Create your first post</a>
	        </div>
	      </div>`;
	    LOAD_MORE.classList.add('d-none');
	    return;
	  }

	  slice.forEach(p => FEED_CONTAINER.appendChild(postCard(p)));
	  page++;
	  (page * PAGE_SIZE < posts.length)
	    ? LOAD_MORE.classList.remove('d-none')
	    : LOAD_MORE.classList.add('d-none');
	}
	// === Post card with Like + Comments - Ahmed Mohsen, Chihab (delete feature) ===
	function postCard(p) {
	  const card = document.createElement('div');
	  card.className = 'card shadow-sm';

	  const tagsMarkup = (p.tags ? p.tags.split(",").filter(Boolean) : [])
	    .map(t => `<span class="badge text-bg-light">#${escapeHtml(t.trim())}</span>`)
	    .join(' ');

	  const imgMarkup = p.imagePath
	    ? `<img class="img-fluid" src="${escapeHtml(p.imagePath)}" alt="post image" />`
	    : '';

	  const timeLabel = p.createdAt ? timeAgoFromIso(p.createdAt) : '';

	  const deleteMarkup = `
	    <button class="btn btn-sm btn-outline-danger ms-2 delete-btn" data-id="${p.id}">
	      Delete
	    </button>`;

	  card.innerHTML = `
	    ${imgMarkup}
	    <div class="card-body">
	      <div class="d-flex justify-content-between align-items-start gap-3">
	        <div>
	          <h5 class="card-title mb-1">${escapeHtml(p.title)}</h5>
	          <div class="text-muted small">
	            ${escapeHtml(p.category || 'Post')} • ${timeLabel}
	          </div>
	        </div>
	        <div class="d-flex align-items-start gap-2">
	          <div class="d-flex flex-wrap gap-1">${tagsMarkup}</div>
	          ${deleteMarkup}
	        </div>
	      </div>

	      <p class="card-text mt-2">${escapeHtml(p.body)}</p>

	      <div class="d-flex align-items-center gap-3">
	        <button class="btn like-btn" data-id="${p.id}" type="button">
	          <i class="bi bi-heart"></i>
	        </button>
	        <span class="likes small text-muted">${p.likeCount || 0}</span>
	      </div>
	    </div>
	  `;

	  // Like button
	  const likeBtn = card.querySelector('.like-btn');
	  const likeIcon = likeBtn.querySelector('i');
	  const likeCountEl = card.querySelector('.likes');

	  likeBtn.addEventListener('click', async () => {
	    const postId = likeBtn.dataset.id;
	    try {
	      const res = await fetch('likePost', {
	        method: 'POST',
	        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
	        body: new URLSearchParams({ postId })
	      });
	      if (!res.ok) return;
	      const data = await res.json();
	      if (data.success) {
	        likeCountEl.textContent = data.likeCount;
	        likeIcon.className = data.liked ? 'bi bi-heart-fill' : 'bi bi-heart';
	      }
	    } catch (err) {
	      console.error(err);
	    }
	  });

	  // Delete button (backend will enforce ownership)
	  const delBtn = card.querySelector('.delete-btn');
	  delBtn.addEventListener('click', async () => {
	    const id = delBtn.dataset.id;
	    if (!confirm("Delete this post?")) return;
	    try {
	      const res = await fetch('deletePost?id=' + encodeURIComponent(id), {
	        method: 'POST'
	      });
	      if (res.ok) {
	        // remove from local array and re-render
	        posts = posts.filter(x => x.id !== Number(id));
	        FEED_CONTAINER.innerHTML = '';
	        page = 0;
	        renderSlice();
	      }
	    } catch (err) {
	      console.error(err);
	    }
	  });

	  return card;
	}

	async function loadFeed() {
	  try {
	    const res = await fetch('feed');
	    if (!res.ok) {
	      console.error('Failed to load feed');
	      return;
	    }
	    posts = await res.json();
	    FEED_CONTAINER.innerHTML = '';
	    page = 0;
	    renderSlice();
	  } catch (err) {
	    console.error(err);
	  }
	}

	if (FEED_CONTAINER && LOAD_MORE) {
	  loadFeed();
	  LOAD_MORE.addEventListener('click', renderSlice);
	}

    