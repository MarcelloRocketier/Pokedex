// script.js

// element refs
const pokemonContainer  = document.getElementById('pokemonContainer');
const loadMoreBtn       = document.getElementById('loadMoreBtn');
const spinnerOverlay    = document.getElementById('spinnerOverlay');
const spinner           = document.getElementById('spinner');
const searchInput       = document.getElementById('searchInput');
const searchBtn         = document.getElementById('searchBtn');
const overlay           = document.getElementById('pokemonOverlay');
const overlayImg        = document.getElementById('overlayImg');
const overlayId         = document.getElementById('overlayId');
const overlayName       = document.getElementById('overlayName');
const overlayType       = document.getElementById('overlayType');
const overlayStats      = document.getElementById('overlayStats');
const overlayAbilities  = document.getElementById('overlayAbilities');

let offset = 0,
    limit  = 20,
    currentList = [],
    currentIndex = 0;

// initial load
displayPokemon();

// reset view on empty search
searchInput.oninput = () => {
  const v = searchInput.value.trim();
  searchBtn.disabled = v.length < 3;
  if (!v) {
    offset = 0;
    displayPokemon();
  }
};
searchBtn.onclick = () => {
  const q = searchInput.value.trim().toLowerCase();
  if (q.length < 3) return;
  searchPokemon(q);
};
function loadMore() {
  offset += limit;
  displayPokemon();
}

// fetch summary list
async function loadPokemonList() {
  const res  = await fetch(`https://pokeapi.co/api/v2/pokemon?limit=${limit}&offset=${offset}`);
  const data = await res.json();
  return data.results;
}

// fetch details
async function loadPokemonDetails(summary) {
  const res = await fetch(summary.url);
  if (!res.ok) throw new Error('Fetch failed');
  return res.json();
}

// clear cards
function clearContainer() {
  pokemonContainer.innerHTML = '';
}

// render one card
function displayCard(p, idx) {
  const c = document.createElement('div');
  c.className = `pokemon-card type-${p.types[0].type.name}`;
  c.onclick   = () => showOverlay(idx, p);
  c.innerHTML = `
    <div class="pokemon-id">#${p.id}</div>
    <img src="${p.sprites.front_default}" alt="${p.name}">
    <h3>${p.name.toUpperCase()}</h3>
    ${p.types.map(t=>`<span class="type-badge">${t.type.name}</span>`).join('')}
  `;
  pokemonContainer.appendChild(c);
}

async function displayPokemon() {
  // show spinner
  spinnerOverlay.classList.remove('hidden');
  clearContainer();

  try {
    const summaries = await loadPokemonList();
    currentList = summaries;

    // fetch all details in parallel
    const details = await Promise.all(
      summaries.map(summary => loadPokemonDetails(summary))
    );

    // render all cards
    details.forEach((p, i) => displayCard(p, i));
  } catch (e) {
    console.error('Load error:', e);
    alert('Failed to load.');
  } finally {
    // hide spinner
    spinnerOverlay.classList.add('hidden');
  }
}


// search local list
async function searchPokemon(q) {
  spinnerOverlay.classList.remove('hidden');
  clearContainer();
  try {
    const matches = currentList
      .map((s,i)=>({s,i}))
      .filter(o=>o.s.name.includes(q));
    if (!matches.length) {
      alert(`No results for "${q}"`);
      return;
    }
    for (let {s,i} of matches) {
      const p = await loadPokemonDetails(s);
      displayCard(p, i);
    }
  } catch {
    alert('Search error');
  } finally {
    spinnerOverlay.classList.add('hidden');
  }
}

// show overlay
function showOverlay(idx, p) {
  currentIndex = idx;
  overlayImg.src         = p.sprites.other['official-artwork'].front_default || p.sprites.front_default;
  overlayId.textContent  = `#${p.id}`;
  overlayName.textContent= p.name.toUpperCase();
  overlayType.textContent= `Type: ${p.types.map(t=>t.type.name).join(', ')}`;
  overlayStats.innerHTML = `
    <strong>HP:</strong>      ${p.stats.find(s=>s.stat.name==='hp').base_stat}<br>
    <strong>Attack:</strong>  ${p.stats.find(s=>s.stat.name==='attack').base_stat}<br>
    <strong>Defense:</strong> ${p.stats.find(s=>s.stat.name==='defense').base_stat}<br>
    <strong>Sp. Atk:</strong>${p.stats.find(s=>s.stat.name==='special-attack').base_stat}<br>
    <strong>Speed:</strong>   ${p.stats.find(s=>s.stat.name==='speed').base_stat}
  `;
  overlayAbilities.textContent = 'Abilities: ' + p.abilities.map(a=>a.ability.name).join(', ');
  document.body.classList.add('overlay-open');
  overlay.style.display = 'flex';
}

// close overlay
function closeOverlay() {
  overlay.style.display = 'none';
  document.body.classList.remove('overlay-open');
}

// navigate
function prevPokemon() {
  if (currentIndex > 0) {
    currentIndex--;
    loadPokemonDetails(currentList[currentIndex]).then(p=>showOverlay(currentIndex,p));
  }
}
function nextPokemon() {
  if (currentIndex < currentList.length - 1) {
    currentIndex++;
    loadPokemonDetails(currentList[currentIndex]).then(p=>showOverlay(currentIndex,p));
  }
}
