// API URL for Pokémon data
const BASE_URL = "https://pokeapi.co/api/v2/pokemon?limit=10";

// Variables for Pokémon navigation
let currentPokemonIndex = 0;
let pokemonArray = [];  // Array to store Pokémon data

// Create Pokémon card
function createPokemonCard(pokemon) {
    const pokemonList = document.querySelector('.pokemon-list');
    
    const card = document.createElement('div');
    card.classList.add('pokemon-card');
    card.classList.add(pokemon.types[0].type.name.toLowerCase());  // Dynamic background based on type
    card.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <h2>${pokemon.name.toUpperCase()}</h2>
        <p>Type: ${pokemon.types[0].type.name}</p>
    `;

    // Click event for overlay
    card.onclick = function() {
        showPokemonOverlay(pokemon);
    };

    pokemonList.appendChild(card);
}

// Load Pokémon data
function loadData() {
    loadMoreBtn.disabled = true;  // Disable button during loading
    document.getElementById('loading').style.display = "block";  // Show loading screen

    fetch(BASE_URL)
        .then(response => response.json()) // Convert response to JSON
        .then(data => {
            const pokemonArray = data.results;
            pokemonArray.forEach(pokemon => {
                fetch(pokemon.url)
                    .then(response => response.json())
                    .then(pokemonData => {
                        createPokemonCard(pokemonData);
                        pokemonArray.push(pokemonData); // Add Pokémon to array for navigation
                    })
                    .catch(error => console.error('Error loading Pokémon data:', error));
            });

            document.getElementById('loading').style.display = "none";  // Hide loading screen
        })
        .catch(error => {
            console.error('Error loading data:', error);
            document.getElementById('loading').style.display = "none";  // Hide loading screen
        })
        .finally(() => {
            loadMoreBtn.disabled = false;  // Enable button after loading
        });
}

// Show Pokémon details in overlay
function showPokemonOverlay(pokemon) {
    const overlay = document.getElementById('pokemonOverlay');
    const overlayName = document.getElementById('overlayName');
    const overlayType = document.getElementById('overlayType');
    const overlayStats = document.getElementById('overlayStats');

    overlay.style.display = "block";  // Show the overlay
    overlayName.innerText = pokemon.name;
    overlayType.innerText = `Type: ${pokemon.types[0].type.name}`;
    overlayStats.innerHTML = `
        <strong>Attack:</strong> ${pokemon.stats[1].base_stat} <br>
        <strong>Defense:</strong> ${pokemon.stats[2].base_stat} <br>
        <strong>Health:</strong> ${pokemon.stats[0].base_stat}
    `;
}

// Close the overlay
document.getElementById('closeOverlayBtn').onclick = function() {
    document.getElementById('pokemonOverlay').style.display = "none";
};

// Navigation between Pokémon in the overlay
document.getElementById('prevPokemon').onclick = function() {
    if (currentPokemonIndex > 0) {
        currentPokemonIndex--;
        showPokemonOverlay(pokemonArray[currentPokemonIndex]);
    }
};

document.getElementById('nextPokemon').onclick = function() {
    if (currentPokemonIndex < pokemonArray.length - 1) {
        currentPokemonIndex++;
        showPokemonOverlay(pokemonArray[currentPokemonIndex]);
    }
};

// Initial data loading
loadData();

// Load more Pokémon when the button is clicked
const loadMoreBtn = document.getElementById('loadMoreBtn');
loadMoreBtn.onclick = function() {
    loadData();
};
