// get main elements
const container    = document.getElementById('pokemonContainer');
const cardTpl      = document.getElementById('card-template').content;
const overlayTpl   = document.getElementById('overlay-template').content;
const input        = document.getElementById('search-input');
const resetBtn     = document.getElementById('reset-button');
const loadBtn      = document.getElementById('loadMoreBtn');

// state variables
let pageSize       = 20;
let offset         = 0;
let currentList    = [];
let cache          = {};
let currentOverlay = 0;

// initial load
loadBatch();

// load next batch of Pokémon
async function loadBatch() {
  loadBtn.disabled = true;
  try {
    // fetch paged list
    const res  = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`);
    const list = (await res.json()).results;
    // append to list and render
    list.forEach(p => currentList.push(p));
    renderList(list, currentList.length - list.length);
    offset += pageSize;
  } catch {
    alert('Could not load list.');
  } finally {
    loadBtn.disabled = false;
  }
}

// render a batch of cards
function renderList(list, startIdx) {
  list.forEach((entry, i) => renderCard(entry, startIdx + i));
}

// render a single small card
async function renderCard(entry, idx) {
  const key   = entry.name;
  const clone = cardTpl.cloneNode(true);
  const card  = clone.firstElementChild;
  const img   = card.getElementsByClassName('pokemon-img')[0];
  const spinner = card.getElementsByClassName('spinner')[0];
  const nameEl  = card.getElementsByClassName('pokemon-name')[0];
  const idEl    = card.getElementsByClassName('pokemon-id')[0];
  const typesEl = card.getElementsByClassName('type-badges')[0];

  // open overlay on click
  card.onclick = () => openOverlay(idx);

  // remove spinner when image loads or fails
  img.onload   = () => { spinner.remove(); img.style.visibility = 'visible'; };
  img.onerror  = img.onload;

  container.appendChild(card);

  // fetch or use cache
  let data = cache[key] || await fetchData(entry.url, key);
  if (data) fillCard(data, img, nameEl, idEl, typesEl, card);
}

// helper: fetch detail and cache
async function fetchData(url, key) {
  try {
    const res = await fetch(url);
    const d   = await res.json();
    cache[key] = d;
    return d;
  } catch {
    return null;
  }
}

// fill card content
function fillCard(data, img, nameEl, idEl, typesEl, card) {
  img.src            = data.sprites.front_default;
  nameEl.textContent = data.name.toUpperCase();
  idEl.textContent   = `#${data.id}`;
  typesEl.innerHTML  = '';
  data.types.forEach(t => {
    const span = document.createElement('span');
    span.className   = 'type-badge';
    span.textContent = t.type.name;
    typesEl.appendChild(span);
  });
  card.setAttribute('data-type', data.types[0].type.name);
}

// handle search form
async function onSearch(e) {
  e.preventDefault();
  const term = input.value.trim().toLowerCase();
  if (!term)      return onReset(), false;
  if (term.length < 3) return alert('Enter at least 3 letters.'), false;

  try {
    const res   = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
    const names = (await res.json()).results.map(p => p.name);
    const hits  = names.filter(n => n.includes(term));
    if (!hits.length) return alert('No results.'), false;

    currentList = hits.map(n => ({ name: n, url: `https://pokeapi.co/api/v2/pokemon/${n}` }));
    container.innerHTML = '';
    loadBtn.hidden   = true;
    resetBtn.hidden  = false;
    renderList(currentList, 0);
  } catch {
    alert('Could not load names.');
  }
  return false;
}

// reset to default view
function onReset() {
  input.value         = '';
  container.innerHTML = '';
  offset              = 0;
  currentList         = [];
  loadBtn.hidden      = false;
  resetBtn.hidden     = true;
  loadBatch();
}

// open overlay with details
function openOverlay(idx) {
  closeOverlay();
  const clone = overlayTpl.cloneNode(true);
  document.body.appendChild(clone);
  document.body.classList.add('overlay-open');
  currentOverlay = idx;
  fillOverlay(idx);
}

// fill overlay details
function fillOverlay(idx) {
  const data   = cache[currentList[idx].name];
  const o      = document.getElementsByClassName('overlay')[0];
  o.getElementsByClassName('overlay-img')[0].src =
    data.sprites.other['official-artwork'].front_default || data.sprites.front_default;
  o.getElementsByClassName('overlay-name')[0].textContent =
    data.name.toUpperCase();
  o.getElementsByClassName('overlay-id')[0].textContent = `#${data.id}`;
  const typesEl = o.getElementsByClassName('overlay-types')[0];
  typesEl.innerHTML = data.types
    .map(t => `<span class="type-badge">${t.type.name}</span>`)
    .join('');
  o.getElementsByClassName('overlay-stats')[0].innerHTML =
    data.stats.map(s => `${s.stat.name.toUpperCase()}: ${s.base_stat}`)
      .join('<br>');
}

// close overlay
function closeOverlay() {
  const el = document.getElementsByClassName('overlay')[0];
  if (el) el.remove();
  document.body.classList.remove('overlay-open');
}

// navigate overlay
function prevOverlay() {
  openOverlay((currentOverlay - 1 + currentList.length) % currentList.length);
}
function nextOverlay() {
  openOverlay((currentOverlay + 1) % currentList.length);
}
