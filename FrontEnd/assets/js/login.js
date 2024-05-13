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
   Section: Listeners
   ===============================
*/



const form = document.querySelector('#login');
const handler = document.querySelector('.handler');

form.addEventListener('change', () => {
    const form = document.querySelector('#login');
    const isValid = Array.from(form).every(element => element.checkValidity());

    handler.innerText = isValid === false ? 'Veuillez remplir tous les champs!' : '';
})

form.addEventListener('submit', (e) => {

    e.preventDefault();
    const creds = {
        "email": form[0].value,
        "password": form[1].value
    }

    fetch(`${baseURL}/api/users/login`, {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(creds)
        }).then(response => {
            if (response.status === 200) {
                response.json().then((data) => {
                    localStorage.setItem('token', data.token);
                    handler.innerText = 'Redirection....';
                    setTimeout(() => {
                        location.href = 'index.html';
                    }, 1500)
                })
            } else {
                handler.innerText = 'Identifiants incorrects!';
            }
        })
        .catch(error => {
            console.error(error)
        })
})