// Ahmed Abdelmohsen - B00099927
	let CURRENT_USER_ID = null;
	const FEED_CONTAINER = document.getElementById('feedList');
	const LOAD_MORE = document.getElementById('loadMore');
	const PAGE_SIZE = 5;
	let page = 0;
	let posts = [];

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

	async function initFeed() {
	  try {
	    const res = await fetch('whoami');
	    if (res.ok) {
	      const data = await res.json();
	      CURRENT_USER_ID = data.authenticated ? data.id : null;
	    }
	  } catch (err) {
	    console.error('whoami failed', err);
	  }
	  //even if whoami fails we still load the feed (but without delete buttons)
	  loadFeed();
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
	// === Post card with Like - Ahmed Mohsen, Chihab (delete feature) ===
	function postCard(p) {
	  const card = document.createElement('div');
	  card.className = 'card shadow-sm';

	  const tagsMarkup = (p.tags ? p.tags.split(",").filter(Boolean) : [])
	    .map(t => `<span class="badge text-bg-light">#${escapeHtml(t.trim())}</span>`)
	    .join(' ');



	  const timeLabel = p.createdAt ? timeAgoFromIso(p.createdAt) : '';

	  const ownerId = Number(p.userId);
	  const canDelete =
	    CURRENT_USER_ID !== null &&
	    !Number.isNaN(ownerId) &&
	    ownerId === CURRENT_USER_ID;

	  const deleteMarkup = canDelete
	    ? `
	      <button
	        class="btn btn-sm btn-outline-danger ms-2 delete-btn"
	        data-id="${p.id}">
	        Delete
	      </button>`
	    : '';

	  const likeCount = typeof p.likeCount === "number" ? p.likeCount : 0;

	  card.innerHTML = `
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

	      <p class="card-text mt-2 mb-2">${escapeHtml(p.body)}</p>

	      <div class="d-flex align-items-center gap-2 mt-2">
	        <button class="btn btn-sm btn-outline-danger like-btn" data-id="${p.id}">
	          <i class="bi bi-heart${p.liked ? '-fill' : ''}"></i>
	        </button>
	        <span class="small text-muted">
	          <span class="likes">${likeCount}</span> likes
	        </span>
	      </div>
	    </div>
	  `;



	  // Like button
	    const likeBtn = card.querySelector('.like-btn');
	    const likeIcon = likeBtn ? likeBtn.querySelector('i') : null;
	    const likeCountEl = card.querySelector('.likes');

	    if (likeBtn && likeIcon && likeCountEl) {
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
	    } else {
	      console.warn('Missing like elements for post', p);
	    }

	  // Delete button
	  const delBtn = card.querySelector('.delete-btn');
	    if (delBtn) {
	      delBtn.addEventListener('click', async () => {
	        const id = delBtn.dataset.id;
	        if (!confirm("Delete this post?")) return;
	        try {
	          const res = await fetch('deletePost?id=' + encodeURIComponent(id), {
	            method: 'POST'
	          });
	          if (res.ok) {
	            posts = posts.filter(x => x.id !== Number(id));
	            FEED_CONTAINER.innerHTML = '';
	            page = 0;
	            renderSlice();
	          }
	        } catch (err) {
	          console.error(err);
	        }
	      });
	    }

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
	  initFeed();
	  LOAD_MORE.addEventListener('click', renderSlice);
	}

    