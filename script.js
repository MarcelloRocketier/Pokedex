// URL für PokeAPI
const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=10";

// Pokémon-Karten erstellen
function createPokemonCard(pokemon) {
    const pokemonList = document.querySelector('.pokemon-list');
    
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.classList.add(pokemon.types[0].type.name.toLowerCase());  // Dynamische Hintergrundfarbe basierend auf Typ
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name.toUpperCase()}</h2>
        <p>Typ: ${pokemon.types[0].type.name}</p>
        <div class="type">${pokemon.types[0].type.name}</div>
    `;

    // Klick-Event für Overlay
    card.addEventListener('click', () => showPokemonOverlay(pokemon));

    pokemonList.appendChild(card);
}

// Funktion zum Laden der Daten
function loadData() {
    fetch(BASE_URL)
        .then(response => response.json()) // Konvertiere die Antwort zu JSON
        .then(data => {
            const pokemonArray = data.results; // Hier gehst du davon aus, dass 'data.results' das Array ist
            pokemonArray.forEach(pokemon => {
                // Für jedes Pokémon müssen wir eine zusätzliche API-Anfrage machen, um detaillierte Informationen zu erhalten
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonData => {
                        createPokemonCard(pokemonData);
                    })
                    .catch(error => console.error('Fehler beim Laden der Pokémon-Daten:', error));
            });
        })
        .catch(error => console.error('Fehler beim Laden der Daten:', error));
}

// Funktion zum Anzeigen des Overlays
function showPokemonOverlay(pokemon) {
    const overlay = document.getElementById('pokemonOverlay');
    console.log(overlay); // Überprüfe, ob das Overlay-Element gefunden wird

    const overlayName = document.getElementById('overlayName');
    const overlayType = document.getElementById('overlayType');
    const overlayStats = document.getElementById('overlayStats');

    overlay.style.display = "block";
    overlayName.innerText = pokemon.name;
    overlayType.innerText = `Typ: ${pokemon.types[0].type.name}`;
    overlayStats.innerHTML = `
        <strong>Angriff:</strong> ${pokemon.stats[1].base_stat} <br>
        <strong>Verteidigung:</strong> ${pokemon.stats[2].base_stat} <br>
        <strong>Gesundheit:</strong> ${pokemon.stats[0].base_stat}
    `;
}

// Button zum Schließen des Overlays
const closeOverlayBtn = document.getElementById('closeOverlayBtn');
closeOverlayBtn.addEventListener('click', () => {
    document.getElementById('pokemonOverlay').style.display = "none";
});

// Initiales Laden der Daten
loadData();

// Mehr Pokémon laden beim Klicken auf den Button
const loadMoreBtn = document.getElementById('loadMoreBtn');
loadMoreBtn.addEventListener('click', () => {
    loadData();
});
