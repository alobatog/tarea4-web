let USERMAIL = '';
let MESSAGES = [];
let ONLINE = true;
const elements = [
    "loading",
    "login",
    "signup",
    "chat",
];

window.addEventListener('online', () => {
    ONLINE = true;
    window.alert('Volvió el internet');
    MESSAGES.forEach(message => {
        firebase.database().ref('chat').push({
            name: USERMAIL,
            message: message
        });
    });
    MESSAGES = [];
});
window.addEventListener('offline', () => {
    window.alert('Estas sin internet');
    ONLINE = false;
});

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        showElement("chat");
        user = firebase.auth().currentUser;
        USERMAIL = user['email'];
    }
    else{
        showElement("login");
        USERMAIL = '';
    }
});

firebase.database().ref('chat').on('value', function(snapshot) {
    html = '';
    snapshot.forEach(element => {
        element = element.val();
        username = element.name;
        message = element.message;
        html += `<li><b>${username.split("@")[0]}:</b>    ${message} </li>`;
    });
    messages = document.getElementById('messages');
    messages.innerHTML = html
});

window.addEventListener('load', () => {
    registerSW();
})

async function registerSW(){
    if('serviceWorker' in navigator){
        try{
            navigator.serviceWorker.register('./sw.js')
        } catch(e){
            console.log('ERROR registering ServiceWorker');
        }
    }
}

function showElement(elementId) {
    elements.filter(el => el !== elementId).forEach(element => {
        document.getElementById(element).style.display = "none";
    });
    document.getElementById(elementId).style.display = "initial";
}

function login(){
    email = document.getElementById('email-login').value;
    password = document.getElementById('password-login').value;
    document.getElementById('password-login').value = ''
    firebase.auth().signInWithEmailAndPassword(email, password)
        .then(() => showElement("chat"))
        .catch(function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            window.alert(`${errorCode} ${errorMessage}`);
        });
}

function showErrorMsg(msg, id){
    document.getElementById(id).style.display = 'initial'; 
    document.getElementById(id).textContent = msg;
}

function cleanErrorMsg(id){
    document.getElementById(id).style.display = 'none'; 
}

function validateEmail(email){
    var mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    if(email.match(mailformat)){
        return true;
    }
    return false;
}

function createaccount(){
    email = document.getElementById('email-signup').value;
    password = document.getElementById('password-signup').value;
    password_confirmation = document.getElementById('password-confirmation-signup').value;
    //input validation before creating user
    errors = 0
    if (!validateEmail(email)){
        showErrorMsg("Email invalido", 'email-error');
        errors += 1;
    }
    else {
        cleanErrorMsg('email-error');
    }
    if (password !== password_confirmation){
        showErrorMsg("Las contraseñas no coinciden", "confirmation-error");
        errors += 1;
    }
    else {
        cleanErrorMsg("confirmation-error")
    }
    if (password.length < 5){
        showErrorMsg("Contraseña muy corta", "password-error")
        errors += 1
    }
    else {
        cleanErrorMsg("password-error")
    }
    if (errors !== 0) return;
    //after input validation create user
    firebase.auth().createUserWithEmailAndPassword(email, password)
        .then(() => showElement("chat"))
        .catch(function(error) {
            let errorCode = error.code;
            let errorMessage = error.message;
            window.alert( `${errorCode} ${errorMessage}`);
        });
}

function logout(){
    firebase.auth().signOut().then(function() {
        showElement("login");
    }).catch(function() {
    })
}

function send(){
    message = document.getElementById('message').value;
    document.getElementById('message').value = ''
    if(ONLINE){
        firebase.database().ref('chat').push({
            name: USERMAIL,
            message: message
        });
    }else{
        MESSAGES.push(message);
    }
}
