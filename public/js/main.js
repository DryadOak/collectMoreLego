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
                    const actionComplete = await this.editItem();
                    return actionComplete
                case 'Collection':
                    this.showLoadingAnimation();
                    try {
                        const collectionItemAdded = await this.addItemToCollection();
                        if (collectionItemAdded) {
                            this.showSuccessAnimation();
                        } else {
                            this.showFailureAnimation();
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        this.showFailureAnimation();
                    }
                    break;
                case 'Wishlist':
                    this.showLoadingAnimation();
                    try {
                        const wishlistItemAdded = await this.addItemToWishlist();
                        if (wishlistItemAdded) {
                            this.showSuccessAnimation();
                        } else {
                            this.showFailureAnimation();
                        }
                    } catch (error) {
                        console.error('Error:', error);
                        this.showFailureAnimation();
                    }
                default:
                    console.error('Invalid button label');
                    return;
            }
        } catch (error) {
            console.error('Error:', error);
        }
    }

    showLoadingAnimation() {
        this.buttonElement.classList.add('loading');
    }

    showSuccessAnimation() {
        this.buttonElement.classList.remove('loading');
        this.buttonElement.classList.add('success');
        setTimeout(() => {
            this.buttonElement.classList.remove('success');
        }, 2000);
    }

    showFailureAnimation() {
        this.buttonElement.classList.remove('loading');
        this.buttonElement.classList.add('failure');
        setTimeout(() => {
            this.buttonElement.classList.remove('failure');
        }, 2000);
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
        const actionComplete = await this.performAction(url, method);
        // console.log(actionComplete)
        return actionComplete
    }

    async addItemToCollection() {
        const url = '/userCollection/addToCollection';
        const method = 'POST'
        const actionComplete = await this.performAction(url, method);
        return actionComplete
    }

    async addItemToWishlist() {
        const url = '/userCollection/addToWishlist';
        const method = 'POST'
        const actionComplete = await this.performAction(url, method);
        return actionComplete
    }

    async performAction(url, method) {
        // console.log(this.buttonLabel)
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
        // console.log(confirmation)
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

    static createInteractiveButton() {
        const buttonContainer = document.createElement("div");
        buttonContainer.classList.add("interactive-button-container");

        const button = document.createElement("button");
        button.classList.add("interactive-button", "expand");
        button.textContent = "Save";

        const expandIcon = document.createElement("span");
        expandIcon.classList.add("expand-icon", "expand-hover");

        const firstSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        firstSvg.classList.add("first");
        firstSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        firstSvg.setAttribute("fill", "#000");
        firstSvg.setAttribute("viewBox", "0 0 32 32");

        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M8.489 31.975c-0.271 0-0.549-0.107-0.757-0.316-0.417-0.417-0.417-1.098 0-1.515l14.258-14.264-14.050-14.050c-0.417-0.417-0.417-1.098 0-1.515s1.098-0.417 1.515 0l14.807 14.807c0.417 0.417 0.417 1.098 0 1.515l-15.015 15.022c-0.208 0.208-0.486 0.316-0.757 0.316z");
        firstSvg.appendChild(path);

        const loaderSpan = document.createElement("span");
        loaderSpan.classList.add("loader");

        const secondSvg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        secondSvg.classList.add("second");
        secondSvg.setAttribute("viewBox", "0 0 20 20");
        secondSvg.setAttribute("xmlns", "http://www.w3.org/2000/svg");
        secondSvg.setAttribute("fill", "none");

        const secondPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        secondPath.setAttribute("stroke", "#000");
        secondPath.setAttribute("stroke-linecap", "round");
        secondPath.setAttribute("stroke-linejoin", "round");
        secondPath.setAttribute("stroke-width", "2");
        secondPath.setAttribute("d", "M17 5L8 15l-5-4");
        secondSvg.appendChild(secondPath);

        expandIcon.appendChild(firstSvg);
        expandIcon.appendChild(loaderSpan);
        expandIcon.appendChild(secondSvg);

        button.appendChild(expandIcon);
        buttonContainer.appendChild(button);

        return buttonContainer;
    }


    
    static addEditOption(popup, set, setDetailsUl) {
        const editButton = document.createElement('button');
        editButton.textContent = 'Edit';
        editButton.classList.add('edit-button');

        const saveButton = DOMUtils.createInteractiveButton()
        saveButton.style.display = 'none';
        

        
        
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
        
        saveButton.addEventListener('click', async (e) => {
            e.preventDefault();
            e.stopPropagation();
            const button = e.currentTarget.querySelector('button');
            button.classList.add("loading");
            button.disabled = true;
            const inputs = setDetailsUl.querySelectorAll('input');
            inputs.forEach(input => {
                const property = input.id;
                const sanitizedValue = DOMUtils.sanitizeInput(input.value);
                set[property] = sanitizedValue;
            });
            const figureButtonHandler = new FigureButtonHandler('Edit', set);
            const response = await figureButtonHandler.handleChange();
            if(response){
                button.classList.add("loaded");
				button.classList.add("finished");
                    setTimeout(() => {
				        	button.classList.remove("loading");
				        }, 1000);
                    setTimeout(() => {
                        button.classList.remove("loaded");
                        button.classList.remove("finished");
                        button.disabled = false;
                    }, 2000);
            } else {
                button.classList.add("finished");
				        setTimeout(() => {
                            button.classList.remove("loading");
				        	button.classList.remove("finished");
				        	button.disabled = false;
				        }, 1500);
            }
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

    static async handleFormSubmit(form, url) {
        const formData = new FormData(form);
        const data = Object.fromEntries(formData.entries());
    
        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            const result = await response.json();
    
            if (result.errors) {
                DOMUtils.displayErrors(result.errors);
            } else {
                window.location.href = result.redirectUrl;
            }
        } catch (error) {
            console.error('Error during form submission:', error);
        }
    }
    
    static displayErrors(errors) {
        const container = document.getElementById('flashMessages');
        container.innerHTML = ''; 
        container.classList.add('flash-messages');

    if (!Array.isArray(errors)) {
            errors = [errors]; // Wrap single error object in an array
        }

        console.log('Displaying errors:', errors);
    
        errors.forEach(error => {
            const errorDiv = document.createElement('div');
            errorDiv.className = 'alert alert-danger';
            errorDiv.textContent = error.msg;
            container.appendChild(errorDiv);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const sortByOptions = document.getElementById('sortBy')
    if(sortByOptions){
        sortByOptions.addEventListener('change', function() {
        this.form.submit();
    });
    }
    // Display current year
    const currentYearElement = document.querySelector("#currentYear");
    const currentYear = new Date().getFullYear();
    currentYearElement.innerHTML += currentYear;

});

// Fallback image
document.addEventListener('DOMContentLoaded', function() {
    const images = document.querySelectorAll('.lego-image');
    
    images.forEach(function(img) {
      img.onerror = function() {
        img.src = '/images/default_logo.svg'; 
      };
    });
  });

// //   login / signup
// also add logout option
document.addEventListener("DOMContentLoaded", () => {

    const signInBtn = document.getElementById("signIn");
    const signUpBtn = document.getElementById("signUp");
    const firstForm = document.getElementById("form1");
    const secondForm = document.getElementById("form2");
    const loginContainer = document.querySelector(".login-form-container");

    signInBtn && signInBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (loginContainer.classList.contains("right-panel-active")) {
            loginContainer.classList.remove("right-panel-active");
            // Prevent form submission if switching panels
        } else {
            await handleFormSubmit(secondForm, '/login');
        }
    });

    signUpBtn && signUpBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        if (!loginContainer.classList.contains("right-panel-active")) {
            loginContainer.classList.add("right-panel-active");
            // Prevent form submission if switching panels
        } else {
            await handleFormSubmit(firstForm, '/signup'); 
        }
    });

    
});

    



