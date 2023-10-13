document.addEventListener("DOMContentLoaded", function() {
    const grid = document.getElementById('grid');
    
    // Create a 4x4 grid, with logo placeholders in the top row and left-most column
    for(let i = 0; i < 16; i++) {
        if (i < 4) {
            const logoPlaceholder = document.createElement('div');
            logoPlaceholder.classList.add('logo-placeholder');
            logoPlaceholder.textContent = "LOGO";
            grid.appendChild(logoPlaceholder);
        } else if (i % 4 === 0) {
            const logoPlaceholder = document.createElement('div');
            logoPlaceholder.classList.add('logo-placeholder');
            logoPlaceholder.textContent = "LOGO";
            grid.appendChild(logoPlaceholder);
        } else {
            const inputBox = document.createElement('input');
            inputBox.type = "text";
            inputBox.placeholder = "";
            inputBox.readOnly = true;
            grid.appendChild(inputBox);
        }
    }

    document.getElementById('grid').addEventListener('click', function(e) {
        if (e.target.tagName.toLowerCase() === 'input') {
            document.getElementById('dimBackground').style.display = 'flex';
            document.getElementById('dynamicSearchBar').focus();
        }
    });

    document.getElementById('dimBackground').addEventListener('click', function() {
        this.style.display = 'none';
    });

    document.getElementById('dynamicSearchBar').addEventListener('click', function(e) {
        e.stopPropagation();
    });
});
