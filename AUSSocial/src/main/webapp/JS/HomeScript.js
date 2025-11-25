// Ahmed Abdelmohsen - B00099927

const FEED_CONTAINER = document.getElementById('feedList');
    const LOAD_MORE = document.getElementById('loadMore');
    const PAGE_SIZE = 5; let page = 0; let posts = [];

    
    function loadPosts(){
      posts = (JSON.parse(sessionStorage.getItem('aus_posts')||'[]')).sort((a,b)=>b.createdAt-a.createdAt);
    }

    function timeAgo(ts){
      const diff = Math.floor((Date.now()-ts)/1000);
      if (diff < 60) return diff + 's ago';
      const m = Math.floor(diff/60); if (m<60) return m + 'm ago';
      const h = Math.floor(m/60); if (h<24) return h + 'h ago';
      const d = Math.floor(h/24); return d + 'd ago';
    }

    function persist(updated){
      const arr = JSON.parse(sessionStorage.getItem('aus_posts') || '[]');
      const idx = arr.findIndex(x=>x.id===updated.id);
      if (idx>-1) arr[idx]=updated; else arr.unshift(updated);
      sessionStorage.setItem('aus_posts', JSON.stringify(arr));
    }

    function escapeHtml(s){
      return (s||'').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m] || m));
    }

    function getUser(){
      try { return JSON.parse(sessionStorage.getItem('aus_user')||'{}'); }
      catch { return {}; }
    }

    function renderSlice(){
      const start = page*PAGE_SIZE, end = start + PAGE_SIZE;
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
      (page*PAGE_SIZE < posts.length) ? LOAD_MORE.classList.remove('d-none') : LOAD_MORE.classList.add('d-none');
    }

    // === Post card with Like + Comments ===
    function postCard(p){
      // defaults
      p.likes = typeof p.likes === 'number' ? p.likes : 0;
      p.liked = !!p.liked;
      p.comments = Array.isArray(p.comments) ? p.comments : [];

      const card = document.createElement('div');
      card.className = 'card shadow-sm';

      const tagsMarkup = (p.tags||[]).map(t=>`<span class="badge text-bg-light">#${escapeHtml(t)}</span>`).join(' ');
      const imgMarkup = p.imageData ? `<img class="img-fluid" src="${p.imageData}" alt="post image" />` : '';

      const heartIcon = p.liked ? 'bi-heart-fill' : 'bi-heart';
      const commentCount = p.comments.length;

      card.innerHTML = `
        ${imgMarkup}
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start gap-3">
            <div>
              <h5 class="card-title mb-1">${escapeHtml(p.title)}</h5>
              <div class="text-muted small">${escapeHtml(p.category||'Post')} • ${timeAgo(p.createdAt)}</div>
            </div>
            <div class="d-flex flex-wrap gap-1">${tagsMarkup}</div>
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

      return card;
    }

    //init

    loadPosts();
    renderSlice();

    LOAD_MORE.addEventListener('click', renderSlice);
    