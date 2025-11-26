// Ahmed Abdelmohsen - B00099927
// ---------- Helpers ----------
    const $$ = (sel, root=document) => root.querySelector(sel);
    const $$$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    const currentUser = JSON.parse(sessionStorage.getItem('aus_user') || '{}');

    const form = $$('#createForm');
    const titleEl = $$('#title');
    const bodyEl = $$('#body');
    const catEl = $$('#category');
    const priceGroup = $$('#priceGroup');
    const priceEl = $$('#price');
    const eventRow = $$('#eventRow');
    const dateEl = $$('#date');
    const timeEl = $$('#time');
    const locEl = $$('#location');
    const imgEl = $$('#image');
    const buildingEl = $$('#building');

    const tagInput = $$('#tagInput');
    const addTagBtn = $$('#addTag');
    const tagList = $$('#tagList');
    let tags = [];

    // Preview refs
    const pTitle=$$('#pTitle'), pBody=$$('#pBody'), pMeta=$$('#pMeta'), pTags=$$('#pTags');
    const pImg=$$('#previewImg'), pImgWrap=$$('#previewImgWrap');

    // ---------- Category toggles ----------
    function toggleCategoryUI(){
    const v = catEl.value;
    priceGroup.classList.toggle('d-none', v !== 'Sell');
    eventRow.classList.toggle('d-none', v !== 'Event');
    pMeta.textContent = `${v} • just now`;

    // building is required only for Event
    buildingEl.required = (v === 'Event');
    if (v !== 'Event') {
      buildingEl.value = ""; // optional: clear when leaving Event
    }
  }

    catEl.addEventListener('change', toggleCategoryUI);
    toggleCategoryUI();

    // ---------- Live preview ----------
    function esc(s){ return (s||'').replace(/[&<>"']/g, m=>({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[m])); }
    titleEl.addEventListener('input', ()=> pTitle.textContent = titleEl.value || 'Your title');
    bodyEl.addEventListener('input', ()=> pBody.textContent = bodyEl.value || 'Start typing to see a preview…');

    imgEl.addEventListener('change', ()=>{
      const f = imgEl.files?.[0];
      if (!f) { pImgWrap.classList.add('d-none'); pImg.removeAttribute('src'); return; }
      const r = new FileReader();
      r.onload = e => { pImg.src = e.target.result; pImgWrap.classList.remove('d-none'); };
      r.readAsDataURL(f);
    });

    // ---------- Tags ----------
    function renderTags(){
      tagList.innerHTML = '';
      tags.forEach((t,i)=>{
        const chip = document.createElement('span');
        chip.className='chip';
        chip.innerHTML = `#${esc(t)} <button aria-label="remove" data-i="${i}">×</button>`;
        tagList.appendChild(chip);
      });
      pTags.innerHTML = tags.map(t=>`<span class="tag">#${esc(t)}</span>`).join(' ');
    }
    addTagBtn.addEventListener('click', ()=>{
      const v = (tagInput.value||'').trim().replace(/^#/,'');
      if (v && !tags.includes(v)) { tags.push(v); renderTags(); }
      tagInput.value='';
    });
    tagList.addEventListener('click', (e)=>{
      if (e.target.tagName==='BUTTON') { const i=+e.target.dataset.i; tags.splice(i,1); renderTags(); }
    });

    // Submit - Ahmed Abdelmohsen (Backend added by Chihab)
	form.addEventListener('submit', (e) => {

	  if (!titleEl.value.trim() || !bodyEl.value.trim()) {
	    e.preventDefault();
	    return;
	  }

	 
	  const tagsField = document.getElementById("tagsField");
	  if (tagsField) {
	    tagsField.value = tags.join(","); 
	  }
	});
      const done = (imageData)=>{
        if (imageData) post.imageData = imageData;
        const arr = JSON.parse(sessionStorage.getItem('aus_posts')||'[]');
        arr.unshift(post);
        sessionStorage.setItem('aus_posts', JSON.stringify(arr));

        // save to profile ONLY for: Question, Sell, Other - Chihab 
    if(["Question","Sell","Other"].includes(post.category)){
      const profArr = JSON.parse(sessionStorage.getItem('aus_profile_posts')||'[]');
      profArr.unshift(post);
      sessionStorage.setItem('aus_profile_posts', JSON.stringify(profArr));
    }
  // redirect-Karim 
  window.location.href = (post.category === 'Announcement')
    ? 'announcements.html'
    : 'home.html';

      };

      const f = imgEl.files?.[0];
      if (f) { const r = new FileReader(); r.onload = e=> done(e.target.result); r.readAsDataURL(f); }
      else { done(); }
    });