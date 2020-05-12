let USERMAIL = '';
const elements = [
    "loading",
    "login",
    "signup",
    "chat",
];

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
            await navigator.serviceWorker.register('./sw.js')
        } catch(e){
            console.log('ERROR registering ServiceWorker')
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

function createaccount(){
    email = document.getElementById('email-signup').value;
    password = document.getElementById('password-signup').value;
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
    firebase.database().ref('chat').push({
        name: USERMAIL,
        message: message
    });
    document.getElementById('message').value = ''
}
