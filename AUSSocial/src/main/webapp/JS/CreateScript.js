// Ahmed Abdelmohsen - B00099927
// ---------- Helpers ----------
const $$ = (sel, root = document) => root.querySelector(sel);
const $$$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

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
const tagsHidden = $$('#tagsHidden');
let tags = [];

// Preview refs
const pTitle = $$('#pTitle'), pBody = $$('#pBody'), pMeta = $$('#pMeta'), pTags = $$('#pTags');
const pImg = $$('#previewImg'), pImgWrap = $$('#previewImgWrap');

// ---------- Category toggles ----------
function toggleCategoryUI() {
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
function esc(s) {
  return (s || '').replace(/[&<>"']/g, m => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[m]));
}
titleEl.addEventListener('input', () => pTitle.textContent = titleEl.value || 'Your title');
bodyEl.addEventListener('input', () => pBody.textContent = bodyEl.value || 'Start typing to see a preview…');

imgEl.addEventListener('change', () => {
  const f = imgEl.files?.[0];
  if (!f) { pImgWrap.classList.add('d-none'); pImg.removeAttribute('src'); return; }
  const r = new FileReader();
  r.onload = e => { pImg.src = e.target.result; pImgWrap.classList.remove('d-none'); };
  r.readAsDataURL(f);
});

// ---------- Tags ----------
function renderTags() {
  tagList.innerHTML = '';
  tags.forEach((t, i) => {
    const chip = document.createElement('span');
    chip.className = 'chip';
    chip.innerHTML = `#${esc(t)} <button aria-label="remove" data-i="${i}">×</button>`;
    tagList.appendChild(chip);
  });
  pTags.innerHTML = tags.map(t => `<span class="tag">#${esc(t)}</span>`).join(' ');
}
addTagBtn.addEventListener('click', () => {
  const v = (tagInput.value || '').trim().replace(/^#/, '');
  if (v && !tags.includes(v)) { tags.push(v); renderTags(); }
  tagInput.value = '';
});
tagList.addEventListener('click', (e) => {
  if (e.target.tagName === 'BUTTON') { const i = +e.target.dataset.i; tags.splice(i, 1); renderTags(); }
});

// ---------- Submit ----------
form.addEventListener('submit', (e) => {
  if (!titleEl.value.trim() || !bodyEl.value.trim()) {
    e.preventDefault();
    return;
  }

  // keep optional fields clean when not relevant
  if (catEl.value !== 'Sell') {
    priceEl.value = '';
  }
  if (catEl.value !== 'Event') {
    dateEl.value = '';
    timeEl.value = '';
    buildingEl.value = '';
    locEl.value = '';
  }

  // send tags to the backend as a comma-separated list
  if (tagsHidden) {
    tagsHidden.value = tags.join(',');
  }
});
