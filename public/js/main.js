"use strict";
class FigureButtonHandler {
    constructor(buttonLabel, set) {
        this.buttonLabel = buttonLabel;
        this.set = set;
        this.buttonElement = document.getElementById(`${this.buttonLabel}-${set.number}`);
        if(this.buttonElement){
            this.buttonElement.addEventListener('click', this.handleChange.bind(this));
        }
    }

    async handleChange() {
        try {
            switch (this.buttonLabel) {
                case 'Remove':
                    await this.removeItem();
                    break;
                case 'Details':
                    await DOMUtils.createItemDetailsPopup(this.set);
                    break;
                case 'Edit':
                    await this.editItem();
                    break;
                case 'Collection':
                    await this.addItemToCollection();
                    break;
                case 'Wishlist':
                    await this.addItemToWishlist();
                    break;
                default:
                    console.error('Invalid button label');
                    return;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    async removeItem() {
        const url = '/userCollection/deleteItem';
        const method = 'DELETE'
        await this.performAction(url, method);
        DOMUtils.deleteItemSmoothly(this.buttonElement)
    }

    async editItem() {
        const url = '/userCollection/updateItem';
        const method = 'PUT'
        await this.performAction(url, method);
    }

    async addItemToCollection() {
        const url = '/userCollection/addToCollection';
        const method = 'POST'
        await this.performAction(url, method);
    }

    async addItemToWishlist() {
        const url = '/userCollection/addToWishlist';
        const method = 'POST'
        await this.performAction(url, method);
    }

    async performAction(url, method) {
        console.log(this.buttonLabel)
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ set: this.set,  }),
        });

        if (!response.ok) {
            const errorResponse = await response.json();
            const errorMessage = errorResponse.error;
            throw new Error(`Failed to perform action ${this.buttonLabel}: ${errorMessage}`);
        }

        const confirmation = await response.json();
        return confirmation
    }
}


class DOMUtils {
    static deleteItemSmoothly(buttonElement) {
        const setCard = buttonElement.closest('.set-card')

        if (setCard) {
            setCard.style.transition = 'opacity 0.5s ease'; 
            setCard.style.opacity = 0;
            setTimeout(() => {
                setCard.parentNode.removeChild(setCard); 
            }, 500);
        }
    }

    static createItemDetailsPopup(set) {
        const popup = DOMUtils.createPopup();
        DOMUtils.addCloseButton(popup);
        DOMUtils.addImage(popup, set.image.thumbnailURL);
        DOMUtils.addSetDetails(popup, set);
        document.body.appendChild(popup);

        const overlay = document.createElement('div');
        overlay.classList.add('overlay');
        document.body.appendChild(overlay);
    }

    static createPopup() {
        const popup = document.createElement('div');
        popup.classList.add('popup');
        return popup;
    }

    static addCloseButton(popup) {
        const closeButton = document.createElement('span');
        closeButton.classList.add('close');
        closeButton.textContent = 'x';
        closeButton.onclick = function() {
            document.body.removeChild(popup);
            // Remove overlay when closing popup
            const overlay = document.querySelector('.overlay');
            if (overlay) {
                document.body.removeChild(overlay);
            }
        };
        popup.appendChild(closeButton);
    }

    static addImage(popup, thumbnailURL) {
        const img = document.createElement('img');
        img.src = thumbnailURL;
        popup.appendChild(img);
    }

    static addSetDetails(popup, set) {
        const setDetailsUl = document.createElement('ul');
        const propertiesToDisplay = ['number', 'theme', 'year', 'pieces', 'minifigs', 'purchasePrice', 'priority', 'acquisitionDate', 'dimensions']
            
        propertiesToDisplay.forEach((property) => {
            const propertyValue = set[property];
            if (propertyValue) {
                const formattedPropertyName = DOMUtils.formatWithCapitalizeAndSpace(property);
                const li = document.createElement('li');

                if(property === 'dimensions'){
                    const { height, width, depth } = propertyValue;
                    li.innerHTML = `<span class="fw-semi-bold">${formattedPropertyName}:</span> H: ${height.toFixed(1)}, W: ${width.toFixed(1)}, D: ${depth.toFixed(1)}`;
                } else {
                    li.innerHTML = `<span class="fw-semi-bold">${formattedPropertyName}:</span> <input type="text" value="${propertyValue}" id="${property}" disabled>`;
                }
            setDetailsUl.appendChild(li);
            }
        });

        popup.appendChild(setDetailsUl);
        DOMUtils.addEditOption(popup, set, setDetailsUl)
    }

    
    static addEditOption(popup, set, setDetailsUl) {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');
        
        const saveButton = document.createElement('button');
        saveButton.textContent = 'Save';
        saveButton.style.display = 'none';
        saveButton.classList.add('save-button');
        
        let editButtonClicked = false;

        editButton.addEventListener('click', function() {
            editButtonClicked = !editButtonClicked;
            const saveButtonDisplay = editButtonClicked ? 'inline-block' : 'none';
            saveButton.style.display = saveButtonDisplay;
            const inputs = setDetailsUl.querySelectorAll('input');
            inputs.forEach(input => {
                input.disabled = !editButtonClicked;
            });
        });
        
        saveButton.addEventListener('click', async () => {
            const inputs = setDetailsUl.querySelectorAll('input');
            inputs.forEach(input => {
                const property = input.id;
                const sanitizedValue = DOMUtils.sanitizeInput(input.value);
                set[property] = sanitizedValue;
            });
            const figureButtonHandler = new FigureButtonHandler('Edit', set);
            await figureButtonHandler.handleChange();
        });
        
        popup.appendChild(editButton);
        popup.appendChild(saveButton);
    }
        
    static formatWithCapitalizeAndSpace(str) {
        return str.replace(/([a-z])([A-Z])/g, '$1 $2')
                .replace(/^./, (char) => char.toUpperCase());
    }
        
    static sanitizeInput(input) {
        input = input.trim();
        input = DOMUtils.escapeHtml(input);
        if (input.length > 100) {
            input = input.slice(0, 100);
        }
        input = input.toLowerCase();
        return input;
    }

    static escapeHtml(unsafe) {
        return unsafe.replace(/[&<"']/g, function(match) {
            switch (match) {
            case "&":
                return "&amp;";
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case '"':
                return "&quot;";
            case "'":
                return "&#039;";
            default:
                return match;
            }
        });
    }
}


// function sortResults(){
//     const sortOption = document.getElementById("sortBy").value
//     const currentPage = window.location.pathname; // Getting the current page URL
//     const currentPageName = currentPage.substring(currentPage.lastIndexOf('/') + 1); 
//     console.log(sortOption)
//     console.log(currentPage)
//     console.log(currentPageName)
    
//         const url = `/userCollection/sortResults?sortOption=${sortOption}&currentPage=${currentPageName}`;
//     try {
//         fetch(url)
//         .then(response => {
//             if (!response.ok) {
//                 throw new Error('Network response was not ok');
//             }
//         })
//     } catch (error){
//         throw new Error(`Failed to perform action: sort ${sortOption}`);
//     }
    
// }

document.addEventListener("DOMContentLoaded", () => {
    const sortByOptions = document.getElementById('sortBy')
    if(sortByOptions){
        sortByOptions.addEventListener('change', function() {
        this.form.submit();
    });
    }
    // Display current year
    // const currentYearElement = document.querySelector("#currentYear");
    // const currentYear = new Date().getFullYear();
    // currentYearElement.innerHTML += currentYear;

    // Creates loading effect for smoother img rendering by adding an effect class
    const blurDivs = document.querySelectorAll(".blur-load");
    if (blurDivs.length > 0) {
        applyLoadingEffect(blurDivs, "loaded");
    }

    function applyLoadingEffect(selector, effectClass) {
        selector.forEach((effectDiv) => {
            const img = effectDiv.querySelector("img");

            function handleLoadEffect() {
                effectDiv.classList.add(effectClass);
            }

            if (img.complete) {
                handleLoadEffect();
            } else {
                img.addEventListener("load", handleLoadEffect);
            }
        });
    }

    

    

    
        // displayNoResultsMessage() {
        //     const noResultsMessage = document.createElement('p');
        //     noResultsMessage.textContent = 'No matching sets found.';
        //     this.resultsContainer.appendChild(noResultsMessage);
        // }
    
    


});

