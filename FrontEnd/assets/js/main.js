/* 
   ===============================
   Section: Configuration
   ===============================
*/



import {
    baseURL
} from './config.js'



/* 
   ===============================
   Section: Fetch 
   ===============================
*/



/** Get works */
const getWorks = () => {
    return fetch(`${baseURL}/api/works`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch works');
            }
            return response.json();
        })
        .catch(error => {
            console.error(error);
        })
}

/** Get categories */
const getCategories = () => {
    return fetch(`${baseURL}/api/categories`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch categories');
            }
            return response.json();
        })
        .catch(error => {
            console.error(error);
        })
}

/** Delete a work 
 * @param {int} id - category id  
 */
const deleteWork = (id) => {
    // Delete data
    fetch(`${baseURL}/api/works/${id}`, {
            method: 'DELETE',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to delete work');
            }
            // Update content
            works = works.filter(work => work.id != id);
            displayGallery(works);
            displayEditModal();
        })
        .catch(error => {
            showMessage('Erreur lors de la suppression!');
            console.error(error);
        })
}

/** Submit a new work */
const addWork = () => {
    const inputTitle = document.querySelector('.modal-form input[name=titre]');
    const inputFile = document.querySelector('.modal-form input[type="file"]');
    const selectedOption = document.querySelector('.modal-form select option:checked');

    // Append form data
    const formData = new FormData();
    formData.append('image', inputFile.files[0]);
    formData.append('title', inputTitle.value);
    formData.append('category', selectedOption.dataset.id);

    // Post data
    fetch(`${baseURL}/api/works`, {
            method: 'POST',
            headers: {
                "Authorization": `Bearer ${localStorage.getItem('token')}`
            },
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to post work');
            }
            return response.json();
        })
        .then(data => {
            // Update content
            showMessage('Ajouté avec succès!');
            pushWork(data, selectedOption);
            displayGallery(works);

        })
        .catch(error => {
            showMessage('Erreur lors de l\'ajout!');
            console.error(error);
        })
}



/* 
   ===============================
   Section: Data filtering
   ===============================
*/



/** Sort items by category name
 * @param {string} name - category name
 */
const sortByCategory = (name) => {
    return works.filter(item => item?.category?.name === name);
}

/** Replace imageUrl with the baseUrl */
const replaceImageUrl = () => {
    works = works.map(work => {
        const newImageUrl = work.imageUrl.replace('http://localhost:5678', baseURL);
        return {
            ...work,
            imageUrl: newImageUrl
        };
    })
}

/** Check every input validity */
const checkFormValidity = () => {
    const form = document.querySelector('.modal-form form');
    const submitButton = document.querySelector('.modal-submit button');

    const isValid = Array.from(form.elements).every(element => element.checkValidity());

    if (!isValid) showMessage('Veuillez remplir tous les champs!');
    submitButton.disabled = !isValid;
    submitButton.style.background = isValid === true ? (clearMessage(), '#1D6154') : '#A7A7A7';
}

/** Push a new object to 'works'
 * @param {object} data - json returned by the API
 * @param {object} option - element 
 */
const pushWork = (data, option) => {
    const newWork = {
        "id": data.id,
        "title": data.title,
        "imageUrl": data.imageUrl,
        "categoryId": parseInt(data.categoryId),
        "userId": parseInt(data.userId),
        "category": {
            "id": parseInt(option.dataset.id),
            "name": option.value
        }
    }
    works.push(newWork);
}



/* 
   ===============================
   Section: Display DOM
   ===============================
*/



/** Display a custom message 
 * @param {string} message - The text to display 
 */
const showMessage = (message) => {
    const modalHandler = document.querySelector('.modal-submit .handler');
    modalHandler.innerText = message;
    modalHandler.style.display = 'block';
}


const clearMessage = () => {
    const modalHandler = document.querySelector('.modal-submit .handler');
    modalHandler.innerText = '';
    modalHandler.style.display = 'none';
}


/** Update main page text */
const displayEditMode = () => {
    const loginBtn = document.querySelector('nav ul li a[href="login.html"]');
    const backdropFilter = document.querySelector('.backdrop-filter');
    const header = document.querySelector('header');
    const editBanner = document.createElement('div');
    const editIcon = document.createElement('i');
    const editText = document.createElement('p');

    header.style.margin = '80px 0 50px 0';
    editBanner.className = 'edit-banner';
    editIcon.className = 'fa-regular fa-pen-to-square';
    editText.innerText = 'Mode édition';
    loginBtn.innerText = 'logout';
    loginBtn.href = '';

    editBanner.append(editIcon, editText);
    document.body.insertBefore(editBanner, backdropFilter);

    loginBtn.addEventListener('click', () => {
        localStorage.removeItem('token');
        location.reload();
    })
}

/**
 * Display the main gallery 
 * @param {object} galleryData - The content of the gallery
 */
const displayGallery = (galleryData) => {
    const gallery = document.querySelector('.gallery');
    gallery.innerHTML = '';

    // Append each work
    galleryData.forEach(key => {
        const wrapper = document.createElement('figure');
        const wrapperImg = document.createElement('img');
        const wrapperTitle = document.createElement('figcaption');

        wrapperImg.src = key.imageUrl;
        wrapperTitle.innerText = key.title;
        wrapperTitle.dataset.id = key.id;

        wrapper.append(wrapperImg, wrapperTitle);
        gallery.appendChild(wrapper);
    })
}

/** 
 * Toggle modal style & add backdrop filter 
 * @param {string} selector - modal selector
 */

const displayModal = (selector) => {
    const modal = document.querySelector(selector);
    const filter = document.querySelector('.backdrop-filter');

    // Change modal style
    modal.style.display = modal.style.display === 'flex' ? 'none' : 'flex';
    filter.style.display = filter.style.display === 'block' ? 'none' : 'block';
}

/** Display the modal to edit works */
const displayEditModal = () => {
    const modalMain = document.querySelector('.modal-main');
    const modalTitle = document.querySelector('.modal-wrapper h2');
    const modalBack = document.querySelector('.modal-wrapper .fa-arrow-left');
    const submitButton = document.querySelector('.modal-submit button');
    const galleryContainer = document.createElement('div');

    galleryContainer.className = "modal-edit";
    modalTitle.innerText = 'Galerie photo';
    submitButton.disabled = false;
    submitButton.style.background = '#1D6154';
    submitButton.innerText = 'Ajouter une photo';
    modalBack.style.display = 'none';

    modalMain.innerHTML = "";
    modalMain.appendChild(galleryContainer);

    // Append each work
    works.forEach(key => {
        const wrapper = document.createElement('figure');
        const wrapperIcon = document.createElement('i');
        const wrapperImg = document.createElement('img');

        wrapperIcon.className = 'fa-solid fa-trash-can';
        wrapperIcon.dataset.id = key.id;
        wrapperImg.src = key.imageUrl;

        wrapper.append(wrapperIcon, wrapperImg);
        galleryContainer.appendChild(wrapper);
    })

    // Listeners 
    attachDeleteListeners();
    submitButton.removeEventListener('click', addWork);
    submitButton.addEventListener('click', displayAddModal);
}

/** Display a preview of the uploaded image */
const previewImage = () => {
    const uploadContainer = document.querySelector('.upload-form');
    const uploadElements = Array.from(uploadContainer.children);
    const uploadImg = document.createElement('img');
    const inputFile = document.querySelector('.modal-form input[type="file"]');
    const file = inputFile.files[0];

    uploadImg.className = 'preview';

    // Remove UploadContainer content to preview the file
    uploadElements.forEach(element => {
        element.style.display = 'none';
    })

    // Check file size and preview it 
    if (file.size > 4000) {
        const fileReader = new FileReader()

        fileReader.onload = (e) => {
            uploadImg.src = e.target.result;
        }

        fileReader.readAsDataURL(file);
        uploadContainer.appendChild(uploadImg);
    } else {
        // If the file is too big then reset the input
        inputFile.value = "";
    }

}

/** Display the modal to add a new work */
const displayAddModal = () => {
    const modalMain = document.querySelector('.modal-main');
    const modalBack = document.querySelector('.modal-wrapper .fa-arrow-left')
    const modalTitle = document.querySelector('.modal-wrapper h2');
    const submitButton = document.querySelector('.modal-submit button');
    const formContainer = document.createElement('div');
    const form = document.createElement('form');
    const uploadContainer = document.createElement('div');
    const uploadImg = document.createElement('img');
    const uploadSpan = document.createElement('span');
    const uploadText = document.createElement('p');
    const inputFile = document.createElement('input');
    const labelTitle = document.createElement('label');
    const inputTitle = document.createElement('input');
    const labelCategory = document.createElement('label')
    const select = document.createElement('select');

    submitButton.style.background = '#A7A7A7';
    submitButton.disabled = true;
    modalTitle.innerText = 'Ajout photo';
    modalBack.style.display = 'block';
    formContainer.className = 'modal-form';
    submitButton.innerText = 'Valider';
    uploadContainer.className = 'upload-form';
    uploadSpan.innerText = '+ Ajouter photo';
    uploadText.innerText = 'jpg, png : 4mo max';
    uploadImg.src = './assets/images/vector.png';
    inputFile.type = 'file';
    inputFile.accept = '.jpg, .jpeg, .png';
    inputFile.required = true;
    labelTitle.innerText = 'Titre';
    labelCategory.innerText = 'Catégorie';
    select.required = true;
    inputTitle.type = 'text';
    inputTitle.name = 'titre';
    inputTitle.required = true;

    // Append each option
    categories.forEach(element => {
        const option = document.createElement('option');
        option.innerText = element.name;
        option.dataset.id = element.id;
        select.appendChild(option)
    })

    modalMain.innerHTML = "";
    uploadSpan.appendChild(inputFile);
    uploadContainer.append(uploadImg, uploadSpan, uploadText);
    form.append(uploadContainer, labelTitle, inputTitle, labelCategory, select);
    formContainer.appendChild(form);
    modalMain.appendChild(formContainer);

    // Listeners
    inputFile.addEventListener('change', previewImage);
    form.addEventListener('change', checkFormValidity);
    submitButton.removeEventListener('click', displayAddModal);
    submitButton.addEventListener('click', addWork);
}



/* 
   ===============================
   Section: Listeners
   ===============================
*/



/** Add listeners to the modal */
const attachModalListeners = () => {
    const editBox = document.querySelector('.edit');
    const editIcon = document.createElement('i');
    const editText = document.createElement('p');
    const modalMark = document.querySelector('.modal-wrapper .fa-xmark');
    const modalBack = document.querySelector('.modal-wrapper .fa-arrow-left');

    editIcon.className = 'fa-regular fa-pen-to-square';
    editText.innerText = 'modifier';
    editBox.append(editIcon, editText);

    // Mark & Edit box 
    for (let element of [modalMark, editBox]) {
        element.addEventListener('click', () => {
            document.body.style.overflow = document.body.style.overflow == '' ? 'hidden' : '';
            displayModal('.modal');
        })
    }

    // Mark & Arrow & Edit box
    for (let element of [modalMark, modalBack, editBox]) {
        element.addEventListener('click', () => {
            displayEditModal();
            clearMessage();
        })
    }
}

/** Add listeners to the trash-cans */
const attachDeleteListeners = () => {
    document.querySelectorAll('.modal-edit .fa-trash-can').forEach(element => {
        element.addEventListener('click', (e) => {
            deleteWork(e.target.dataset.id);
        })
    })
}

/** Add listeners to the filters except 'Tous' */
const attachFiltersListeners = () => {
    document.querySelectorAll('.sort-wrapper button').forEach(node => {
        node.addEventListener('click', (e) => {
            if (e.target.value !== 'Tous') {
                displayGallery(sortByCategory(e.target.value));
            } else {
                displayGallery(works);
            }
        })
    })

}



/* 
   ===============================
   Section: Create DOM
   ===============================
*/



/** Create the modal */
const createModal = () => {
    const modalWrapper = document.querySelector('.modal-wrapper');
    const modalMark = document.createElement('i');
    const modalBack = document.createElement('i');
    const modalTitle = document.createElement('h2');
    const modalMain = document.createElement('div');
    const modalHandler = document.createElement('span');
    const modalSubmit = document.createElement('div');
    const submitButton = document.createElement('button')

    modalMain.className = 'modal-main';
    modalMark.className = 'fa-solid fa-xmark';
    modalBack.className = 'fa-solid fa-arrow-left';
    modalHandler.className = 'handler';
    modalSubmit.className = 'modal-submit';

    modalSubmit.append(modalHandler, submitButton);
    modalWrapper.append(modalMark, modalBack, modalTitle, modalMain, modalSubmit);

    attachModalListeners();
}

/** Create the filters  */
const createFilters = () => {
    const sortContainer = document.querySelector('.sort-wrapper');
    const button = document.createElement('button');

    button.innerText = 'Tous';
    button.value = 'Tous';
    button.autofocus = true;
    sortContainer.appendChild(button);

    // Append each button
    categories.forEach(key => {
        const button = document.createElement('button');
        button.value = key.name;
        button.innerText = key.name;
        sortContainer.appendChild(button);
    })

    attachFiltersListeners();
}



/* 
   ===============================
   Section: Main
   ===============================
*/



let works = await getWorks();
let categories = await getCategories();

try {
    replaceImageUrl();
    displayGallery(works);

    if (localStorage.getItem('token') !== null) {
        // Logged in
        displayEditMode();
        createModal();
    } else {
        // Not logged in
        createFilters();
    }
} catch (error) {
    console.error(error);
}