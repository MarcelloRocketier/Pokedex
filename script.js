// DOM
var container    = document.getElementById('pokemonContainer');
var cardTpl      = document.getElementById('card-template').content;
var overlayTpl   = document.getElementById('overlay-template').content;
var input        = document.getElementById('search-input');
var resetBtn     = document.getElementById('reset-button');
var loadBtn      = document.getElementById('loadMoreBtn');

// state
var pageSize       = 20;
var offset         = 0;
var currentList    = [];
var cache          = {};
var currentOverlay = 0;

// start
loadBatch();

// load next batch
function loadBatch() {
  loadBtn.disabled = true;
  fetchList(pageSize, offset)
    .then(function(list){
      list.forEach(function(it){ currentList.push(it); });
      return renderList(list, currentList.length - list.length);
    })
    .then(function(){ offset += pageSize; })
    .finally(function(){ loadBtn.disabled = false; });
}

// fetch overview list
function fetchList(limit, start) {
  return fetch(
    'https://pokeapi.co/api/v2/pokemon?limit=' + limit +
    '&offset=' + start
  )
  .then(function(r){ return r.json(); })
  .then(function(j){ return j.results; })
  .catch(function(){ alert('Could not load list.'); return []; });
}

// render small cards
function renderList(list, startIdx) {
  var seq = Promise.resolve();
  list.forEach(function(entry, i){
    seq = seq.then(function(){
      return renderCard(entry, startIdx + i);
    });
  });
  return seq;
}

// render one card
function renderCard(entry, idx) {
  return new Promise(function(resolve){
    var key   = entry.name;
    var clone = document.importNode(cardTpl, true);
    var card     = clone.querySelector('.pokemon-card');
    var spinner  = clone.querySelector('.spinner');
    var img      = clone.querySelector('.pokemon-img');
    var nameEl   = clone.querySelector('.pokemon-name');
    var idEl     = clone.querySelector('.pokemon-id');
    var typesEl  = clone.querySelector('.type-badges');

    card.onclick = function(){ openOverlay(idx); };

    img.onload = function(){
      spinner.remove();
      img.style.visibility = 'visible';
      resolve();
    };
    img.onerror = img.onload;

    container.appendChild(clone);

    function fill(data){
      img.src = data.sprites.front_default;
      img.alt = data.name;
      nameEl.textContent = data.name.toUpperCase();
      idEl.textContent   = '#' + data.id;
      typesEl.innerHTML = '';
      data.types.forEach(function(t){
        var span = document.createElement('span');
        span.textContent = t.type.name;
        typesEl.appendChild(span);
      });
      card.setAttribute('data-type', data.types[0].type.name);
    }

    if(cache[key]){
      fill(cache[key]);
    } else {
      fetch(entry.url)
        .then(function(r){ return r.json(); })
        .then(function(d){ cache[key] = d; fill(d); })
        .catch(function(){ resolve(); });
    }
  });
}

// overlay: open and fill
function openOverlay(idx){
  closeOverlay();
  var clone = document.importNode(overlayTpl, true);
  document.body.appendChild(clone);
  document.body.classList.add('overlay-open');
  currentOverlay = idx;
  fillOverlay(idx);
}

function fillOverlay(idx){
  var data = cache[currentList[idx].name];
  var o = document.querySelector('.overlay');
  o.querySelector('.overlay-img').src =
    (data.sprites.other['official-artwork'].front_default ||
     data.sprites.front_default);
  o.querySelector('.overlay-name').textContent =
    data.name.toUpperCase();
  o.querySelector('.overlay-id').textContent =
    '#' + data.id;

  var typesEl = o.querySelector('.overlay-types');
  typesEl.innerHTML = '';
  data.types.forEach(function(t){
    var span = document.createElement('span');
    span.textContent = t.type.name;
    typesEl.appendChild(span);
  });

  var stats = data.stats;
  o.querySelector('.overlay-stats').innerHTML =
    'HP: ' + stats.find(s=>s.stat.name==='hp').base_stat +
    '<br>ATK: ' + stats.find(s=>s.stat.name==='attack').base_stat +
    '<br>DEF: ' + stats.find(s=>s.stat.name==='defense').base_stat;
}

function closeOverlay(){
  var el = document.querySelector('.overlay');
  if(el) el.remove();
  document.body.classList.remove('overlay-open');
}

// overlay navigation
function prevOverlay(){
  var i = (currentOverlay - 1 + currentList.length) % currentList.length;
  currentOverlay = i;
  fillOverlay(i);
}
function nextOverlay(){
  var i = (currentOverlay + 1) % currentList.length;
  currentOverlay = i;
  fillOverlay(i);
}

// search
function onSearch(e){
  e.preventDefault();
  var term = input.value.trim().toLowerCase();
  if(!term){ onReset(); return false; }
  if(term.length < 3){ alert('Enter at least 3 letters.'); return false; }
  fetchAllNames().then(function(names){
    var hits = names.filter(function(n){return n.indexOf(term)>-1;});
    if(!hits.length){ alert('No results.'); return; }
    currentList = hits.map(function(n){
      return { name:n, url:'https://pokeapi.co/api/v2/pokemon/'+n };
    });
    container.innerHTML='';
    loadBtn.hidden  = true;
    resetBtn.hidden = false;
    renderList(currentList,0);
  });
  return false;
}

// reset
function onReset(){
  input.value=''; container.innerHTML='';
  offset=0; currentList=[]; loadBtn.hidden=false;
  resetBtn.hidden=true; loadBatch();
}

// fetch all names
function fetchAllNames(){
  return fetch('https://pokeapi.co/api/v2/pokemon?limit=100000')
    .then(r=>r.json()).then(j=>j.results.map(p=>p.name))
    .catch(function(){ alert('Could not load names.'); return []; });
}
