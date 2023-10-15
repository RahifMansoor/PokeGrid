document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById('grid');
    const dimBackground = document.createElement('div');
    dimBackground.id = 'dimBackground';
    document.body.appendChild(dimBackground);

    const searchBar = document.createElement('input');
    searchBar.id = 'dynamicSearchBar';
    dimBackground.appendChild(searchBar);

    const dropdown = document.createElement('div');
    dropdown.id = 'pokemonDropdown';
    dimBackground.appendChild(dropdown);

    let allPokemon = [];
    let allTypes = [];
    let selectedInput = null;
    let selectedPokemons = [];

    const forbiddenCombinations = [
        ["normal", "rock"],
        ["normal", "bug"],
        ["normal", "steel"],
        ["normal", "ice"],
        ["poison", "ice"],
        ["ground", "fairy"],
        ["rock", "ghost"],
        ["bug", "dragon"],
        ["fire", "fairy"]
    ];

    fetchKantoPokemon();
    fetchPokemonTypes();

    searchBar.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        dropdown.innerHTML = '';
        if (searchTerm.length > 0) {
            const matchingPokemon = allPokemon.filter(pokemon => 
                pokemon.name.includes(searchTerm) && !selectedPokemons.includes(pokemon.name)
            );
            matchingPokemon.forEach(pokemon => {
                renderPokemon(pokemon);
            });
            if (matchingPokemon.length > 0) {
                dropdown.style.display = 'block';
            } else {
                dropdown.style.display = 'none';
            }
        } else {
            dropdown.style.display = 'none';
        }
    });

    searchBar.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            dimBackground.style.display = 'none';
        }
    });

    dimBackground.addEventListener('click', function(e) {
        if (e.target === dimBackground) {
            dimBackground.style.display = 'none';
            searchBar.value = '';
            dropdown.innerHTML = '';
        }
    });

    dropdown.addEventListener('click', function(e) {
        if (e.target !== dropdown) {
            dimBackground.style.display = 'none';
        }
    });

    function fetchKantoPokemon() {
        fetch('https://pokeapi.co/api/v2/pokemon?limit=1015')
            .then(response => response.json())
            .then(allpokemon => {
                allPokemon = allpokemon.results;
                allpokemon.results.forEach(pokemon => {
                    fetchPokemonData(pokemon);
                });
            });
    }

    function fetchPokemonData(pokemon) {
        fetch(pokemon.url)
            .then(response => response.json())
            .then(pokeData => {
                pokemon.image = pokeData.sprites.front_default;
            })
            .catch(error => {
                console.error("Error fetching Pokémon data:", error);
            });
    }

    function fetchPokemonTypes() {
        fetch("https://pokeapi.co/api/v2/type/")
            .then(response => response.json())
            .then(data => {
                allTypes = data.results.map(type => type.name).filter(type => type !== "unknown");
                shuffleArray(allTypes);
                createGrid();
            })
            .catch(error => {
                console.error("Error fetching Pokémon types:", error);
            });
    }

    function renderPokemon(pokemon) {
        let pokeContainer = document.createElement("div");
        pokeContainer.addEventListener('click', function() {
            if (selectedInput) {
                selectedInput.style.backgroundImage = `url(${pokemon.image})`;
                selectedInput.style.backgroundSize = 'cover';
                selectedInput.style.backgroundPosition = 'center';
                selectedInput.style.backgroundRepeat = 'no-repeat';
                selectedInput.removeEventListener('click', selectedInput.clickEvent);
                selectedPokemons.push(pokemon.name);
                dimBackground.style.display = 'none';
                searchBar.value = '';
                dropdown.innerHTML = '';
            }
        });
        let pokeName = document.createElement('h4');
        pokeName.innerText = pokemon.name;
        let pokeImage = document.createElement('img');
        pokeImage.src = pokemon.image;
        pokeContainer.append(pokeName, pokeImage);
        dropdown.appendChild(pokeContainer);
    }

    function createGrid() {
        let typeIndex = 0;
        for(let i = 0; i < 16; i++) {
            if (i === 0) {
                const logoPlaceholder = document.createElement('div');
                logoPlaceholder.classList.add('logo-placeholder');
                grid.appendChild(logoPlaceholder);
            } else if (i < 4 || i % 4 === 0) {
                const logoPlaceholder = document.createElement('div');
                logoPlaceholder.classList.add('logo-placeholder');
                logoPlaceholder.textContent = allTypes[typeIndex++];
                grid.appendChild(logoPlaceholder);
            } else {
                const inputBox = document.createElement('div');
                inputBox.classList.add('poke-input');
                inputBox.clickEvent = function() {
                    selectedInput = inputBox;
                    dimBackground.style.display = 'block';
                    searchBar.value = '';
                    searchBar.focus();
                };
                inputBox.addEventListener('click', inputBox.clickEvent);
                grid.appendChild(inputBox);
            }
        }
    }

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
});
