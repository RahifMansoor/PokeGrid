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
    let allGenerations = [];
    let selectedInput = null;
    let selectedPokemons = [];
    let attempts = 9;
    const attemptsDisplay = document.createElement('div');
    attemptsDisplay.id = 'attemptsDisplay';
    attemptsDisplay.innerText = `Attempts remaining: ${attempts}`;
    document.body.appendChild(attemptsDisplay);

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

    Promise.all([fetchKantoPokemon(), fetchPokemonTypes(), fetchGenerations()]).then(() => {
        createGrid();
    });
    

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
    function romanToDecimal(roman) {
        const romanNumerals = {
            'i': 1,
            'ii': 2,
            'iii': 3,
            'iv': 4,
            'v': 5,
            'vi': 6,
            'vii': 7,
            'viii': 8,
            'ix': 9
        };
        return romanNumerals[roman];
    }
    
    function capitalizeFirstLetter(string) {
        return string.charAt(0).toUpperCase() + string.slice(1);
    }
    
    function fetchKantoPokemon() {
        return fetch('https://pokeapi.co/api/v2/pokemon?limit=1376')
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
            });
    }

    function fetchPokemonTypes() {
        return fetch("https://pokeapi.co/api/v2/type/")
            .then(response => response.json())
            .then(data => {
                allTypes = data.results.map(type => capitalizeFirstLetter(type.name)).filter(type => type !== "Unknown" && type !== "Shadow");
                shuffleArray(allTypes);  // Shuffle the types
            });
    }

    function fetchGenerations() {
        return fetch("https://pokeapi.co/api/v2/generation/")
            .then(response => response.json())
            .then(data => {
                allGenerations = data.results.map(gen => {
                    let name = gen.name.replace(/generation-/, "");
                    let decimalNumber = romanToDecimal(name);
                    return `Gen ${decimalNumber}`;
                });
                shuffleArray(allGenerations); // Randomize the order
            });
    }
    function isPokemonLegendary(pokemonIdOrName) {
        console.log(`Checking if ${pokemonIdOrName} is legendary...`); // Debug log
        return fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonIdOrName}/`)
            .then(response => {
                if (!response.ok) {
                    console.error("Error fetching Pokémon details:", response.status, response.statusText);
                    throw new Error("Network response was not ok");
                }
                return response.json();
            })
            .then(data => {
                console.log(`Is ${pokemonIdOrName} legendary?`, data.is_legendary); // Debug log
                return data.is_legendary;
            })
            .catch(error => {
                console.error("Error fetching Pokémon details:", error);
                return false;
            });
    }
    
    function isPokemonInGeneration(pokemonIdOrName, desiredGeneration) {
        return fetch(`https://pokeapi.co/api/v2/pokemon-species/${pokemonIdOrName}/`)
            .then(response => response.json())
            .then(data => {
                console.log(`Is ${pokemonIdOrName} in ${desiredGeneration}?`, data.generation.name === desiredGeneration); // Debug log
                return data.generation.name === desiredGeneration;
            })
            .catch(error => {
                console.error("Error fetching Pokémon details:", error);
                return false;
            });
    }
    
    



    function renderPokemon(pokemon) {
        let pokeContainer = document.createElement("div");
        pokeContainer.addEventListener('click', async function() {
            if (selectedInput) {
                if (attempts <= 0) {
                    alert('No more attempts left!');
                    return;
                }
    
                // Directly check if the Pokémon is legendary when required
                if ((selectedInput.previousElementSibling && selectedInput.previousElementSibling.textContent === "Legendaries") ||
                    (selectedInput.nextElementSibling && selectedInput.nextElementSibling.textContent === "Legendaries")) {
                    if (!(await isPokemonLegendary(pokemon.name))) {
                        alert('Please select a Legendary Pokémon for this box.');
                        return;
                    }
                }
    
                const generationMatch = selectedInput.previousElementSibling && selectedInput.previousElementSibling.textContent.match(/^Gen (\d+)$/);
                if (generationMatch) {
                    const desiredGeneration = `generation-${romanToDecimal(generationMatch[1].toLowerCase())}`;
                    if (!(await isPokemonInGeneration(pokemon.name, desiredGeneration))) {
                        alert(`Please select a Pokémon from ${desiredGeneration.replace('generation-', 'Generation ').toUpperCase()} for this box.`);
                        return;
                    }
                }
    
                placePokemonInGrid(pokemon);
            }
        });
    let pokeName = document.createElement('h4');
    pokeName.innerText = pokemon.name;
    let pokeImage = document.createElement('img');
    pokeImage.src = pokemon.image;
    pokeContainer.append(pokeName, pokeImage);
    dropdown.appendChild(pokeContainer);
}

function placePokemonInGrid(pokemon) {
    // Decrement the attempts and update the display
    attempts--;
    attemptsDisplay.innerText = `Attempts remaining: ${attempts}`;

    selectedInput.style.backgroundImage = `url(${pokemon.image})`;
    selectedInput.style.backgroundSize = 'cover';
    selectedInput.style.backgroundPosition = 'center';
    selectedInput.style.backgroundRepeat = 'no-repeat';
    selectedInput.removeEventListener('click', selectedInput.clickEvent);
    selectedPokemons.push(pokemon.name);
    dimBackground.style.display = 'none';
    searchBar.value = '';
    dropdown.innerHTML = '';

    const pokemonNameDisplay = document.createElement('div');
    pokemonNameDisplay.classList.add('pokemonName');
    pokemonNameDisplay.textContent = pokemon.name;
    selectedInput.appendChild(pokemonNameDisplay);

    const pokemonNameForURL = pokemon.name.includes('-') ? pokemon.name.split('-')[0] : pokemon.name;
    const bulbapediaLink = `https://bulbapedia.bulbagarden.net/wiki/${pokemonNameForURL}_(Pokémon)`;
    selectedInput.addEventListener('click', function() {
        window.open(bulbapediaLink, '_blank');
    });
}

    function createGrid() {
        let typeIndex = 0;
        let genIndex = 0;
        for (let i = 0; i < 16; i++) {
            if (i === 0) {
                const emptyPlaceholder = document.createElement('div');
                emptyPlaceholder.classList.add('placeholder');
                grid.appendChild(emptyPlaceholder);
            } else if (i === 3) { // Top right corner
                const legendaryPlaceholder = document.createElement('div');
                legendaryPlaceholder.classList.add('placeholder', 'dark-bg');
                legendaryPlaceholder.textContent = "Legendaries";
                grid.appendChild(legendaryPlaceholder);
            } else if (i % 4 === 0) {
                const typePlaceholder = document.createElement('div');
                typePlaceholder.classList.add('placeholder', 'dark-bg');
                typePlaceholder.textContent = capitalizeFirstLetter(allTypes[typeIndex++]);
                grid.appendChild(typePlaceholder);
            } else if (i < 4) {
                const logoPlaceholder = document.createElement('div');
                logoPlaceholder.classList.add('placeholder', 'dark-bg');
                if (i === 1) {
                    logoPlaceholder.textContent = capitalizeFirstLetter(allTypes[typeIndex++]);
                } else if (i === 2) {
                    logoPlaceholder.textContent = capitalizeFirstLetter(allGenerations[genIndex++]);
                }
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
