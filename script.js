document.addEventListener('DOMContentLoaded', () => {
    const loadMoreBtn = document.getElementById('loadMoreBtn');
    const pokemonList = document.querySelector('.pokemon-list');

    const pokemonData = [
        { name: 'Bulbasaur', type: 'Grass/Poison', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/1.png' },
        { name: 'Ivysaur', type: 'Grass/Poison', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/2.png' },
        { name: 'Venusaur', type: 'Grass/Poison', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/3.png' },
        { name: 'Charmander', type: 'Fire', image: 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/4.png' }
    ];

    // Funktion zum Erstellen der Pokémon-Karten
    function createPokemonCard(pokemon) {
        const card = document.createElement('div');
        card.classList.add('pokemon-card');
        card.innerHTML = `
            <img src="${pokemon.image}" alt="${pokemon.name}">
            <h2>${pokemon.name}</h2>
            <p>Typ: ${pokemon.type}</p>
        `;
        pokemonList.appendChild(card);
    }

    // Lade die ersten Pokémon
    pokemonData.forEach(createPokemonCard);

    // Funktion zum Laden von mehr Pokémon
    loadMoreBtn.addEventListener('click', () => {
        pokemonData.forEach(createPokemonCard);  // Hier könnte später API-Aufruf für mehr Pokémon kommen
    });
});
