const container = document.getElementById('pokemonContainer');
const cardTpl = document.getElementById('card-template').content;
const overlayTpl = document.getElementById('overlay-template').content;
const input = document.getElementById('search-input');
const resetBtn = document.getElementById('reset-button');
const loadBtn = document.getElementById('loadMoreBtn');

let pageSize = 20;
let offset = 0;
let currentList = [];
let cache = {};
let currentOverlay = 0;

loadBatch();

async function loadBatch() {
  loadBtn.disabled = true;
  try {
    const res = await fetch(
      `https://pokeapi.co/api/v2/pokemon?limit=${pageSize}&offset=${offset}`
    );
    const list = (await res.json()).results;
    currentList.push(...list);
    renderList(list, currentList.length - list.length);
    offset += pageSize;
  } catch {
    alert('Could not load list.');
  } finally {
    loadBtn.disabled = false;
  }
}

function renderList(list, startIdx) {
  list.forEach((entry, i) => renderCard(entry, startIdx + i));
}

async function renderCard(entry, idx) {
  const key = entry.name;
  const clone = cardTpl.cloneNode(true);
  const card = clone.firstElementChild;
  const img = card.getElementsByClassName('pokemon-img')[0];
  const spinner = card.getElementsByClassName('spinner')[0];
  const nameEl = card.getElementsByClassName('pokemon-name')[0];
  const idEl = card.getElementsByClassName('pokemon-id')[0];
  const typesEl = card.getElementsByClassName('type-badges')[0];

  card.onclick = () => openOverlay(idx);
  img.onload = () => {
    spinner.remove();
    img.style.visibility = 'visible';
  };
  img.onerror = img.onload;
  container.appendChild(card);

  let data = cache[key] || await fetchData(entry.url, key);
  if (data) fillCard(data, img, nameEl, idEl, typesEl, card);
}

async function fetchData(url, key) {
  try {
    const res = await fetch(url);
    const data = await res.json();
    cache[key] = data;
    return data;
  } catch {
    return null;
  }
}

function fillCard(data, img, nameEl, idEl, typesEl, card) {
  img.src = data.sprites.front_default;
  nameEl.textContent = data.name.toUpperCase();
  idEl.textContent = `#${data.id}`;
  typesEl.innerHTML = '';
  data.types.forEach(t => {
    const span = document.createElement('span');
    span.className = 'type-badge';
    span.textContent = t.type.name;
    typesEl.appendChild(span);
  });
  card.setAttribute('data-type', data.types[0].type.name);
}

async function onSearch(e) {
  e.preventDefault();
  const term = input.value.trim().toLowerCase();
  if (!term) {
    onReset();
    return false;
  }
  if (term.length < 3) {
    alert('Enter at least 3 letters.');
    return false;
  }

  try {
    const res = await fetch('https://pokeapi.co/api/v2/pokemon?limit=100000');
    const names = (await res.json()).results.map(p => p.name);
    const hits = names.filter(n => n.includes(term));
    if (!hits.length) {
      alert('No results.');
      return false;
    }
    currentList = hits.map(n => ({
      name: n,
      url: `https://pokeapi.co/api/v2/pokemon/${n}`
    }));
    container.innerHTML = '';
    loadBtn.hidden = true;
    resetBtn.hidden = false;
    renderList(currentList, 0);
  } catch {
    alert('Could not load names.');
  }
  return false;
}

function onReset() {
  input.value = '';
  container.innerHTML = '';
  offset = 0;
  currentList = [];
  loadBtn.hidden = false;
  resetBtn.hidden = true;
  loadBatch();
}

function openOverlay(idx) {
  closeOverlay();
  const clone = overlayTpl.cloneNode(true);
  document.body.appendChild(clone);
  document.body.classList.add('overlay-open');
  currentOverlay = idx;
  fillOverlay(idx);
}

function fillOverlay(idx) {
  const data = cache[currentList[idx].name];
  renderOverlayMedia(data);
  renderOverlayStats(data);
}

function renderOverlayMedia(pokemon) {
  const overlayElement = document.getElementsByClassName('overlay')[0];
  const imgEl = overlayElement.getElementsByClassName('overlay-img')[0];
  const idEl = overlayElement.getElementsByClassName('overlay-id')[0];
  const nameEl = overlayElement.getElementsByClassName('overlay-name')[0];
  const typesEl = overlayElement.getElementsByClassName('overlay-types')[0];

  imgEl.src = pokemon.sprites.other['official-artwork'].front_default
    || pokemon.sprites.front_default;
  idEl.textContent = `#${pokemon.id}`;
  nameEl.textContent = pokemon.name.toUpperCase();
  typesEl.innerHTML = pokemon.types
    .map(t => `<span class="type-badge">${t.type.name}</span>`)
    .join('');
}

function renderOverlayStats(pokemon) {
  const overlayElement = document.getElementsByClassName('overlay')[0];
  const statsEl = overlayElement.getElementsByClassName('overlay-stats')[0];
  statsEl.innerHTML = pokemon.stats
    .map(s => `${s.stat.name.toUpperCase()}: ${s.base_stat}`)
    .join('<br>');
}

function closeOverlay() {
  const overlayElement = document.getElementsByClassName('overlay')[0];
  if (overlayElement) {
    overlayElement.remove();
  }
  document.body.classList.remove('overlay-open');
}

function prevOverlay() {
  openOverlay(
    (currentOverlay - 1 + currentList.length) % currentList.length
  );
}
function nextOverlay() {
  openOverlay((currentOverlay + 1) % currentList.length);
}
