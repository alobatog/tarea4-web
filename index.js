let USERMAIL = '';
const elements = [
    "loading",
    "login",
    "signup",
    "chat",
];
let swRegistration = null;
let indexedDB = null;

function storeNewMessage(message) {
    let store = indexedDB.transaction(["messages"], "readwrite").objectStore("messages");
    store.add(message);
}

function sendNotification(messages) {
    console.log(messages);
    if (messages.length) {
        console.log("Sending");
        const body = messages.length === 1
            ? `1 New message from ${messages[0].name}`
            : `${messages.length} New messages`;
        const options = {
            body,
            icon: './images/icon-192x192.png',
        };
        swRegistration.showNotification("Chatgram New Notification", options);
    }
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        showElement("chat");
        user = firebase.auth().currentUser;
        USERMAIL = user['email'];
    }
    else {
        showElement("login");
        USERMAIL = '';
    }
});

firebase.database().ref('chat').on('value', function(snapshot) {
    html = '';
    let newMessages = [];
    snapshot.forEach(element => {
        element = element.val();
        let query = indexedDB.transaction(["messages"]).objectStore("messages").get(element.id);
        query.onsuccess = function(event) {
            if (!query.result) {
                newMessages.push(element);
                storeNewMessage(element);
            }
        }
        username = element.name;
        message = element.message;
        html += `<li><b>${username.split("@")[0]}:</b>    ${message} </li>`;
    });
    messages = document.getElementById('messages');
    messages.innerHTML = html;
    sendNotification(newMessages);
});

window.addEventListener('load', () => {
    registerSW();
})

function showNotification(message) {

}

async function registerSW(){
    if('serviceWorker' in navigator){
        if ('PushManager' in window) {
            if (window.Notification && Notification.permission === "granted") {
                console.log("Push Notifications enabled");
            } else if (window.Notification && Notification.permission !== "granted") {
                Notification.requestPermission(status => {
                    if (status === "granted") {
                        console.log("Push Notifications enabled");
                    } else {
                        alert("Please enable notifications");
                    }
                });
            } else {
                alert("Please enable notifications");
            }
        } else {
            console.log('Push Notifications is not supported');
        }
        try {
            swRegistration = await navigator.serviceWorker.register('./sw.js');
            window.indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
            if (window.indexedDB) {
                let openRequest = window.indexedDB.open("database", 1);
                openRequest.onsuccess = function(event) {
                    indexedDB = openRequest.result;
                }
                openRequest.onupgradeneeded = function(event) {
                    indexedDB = openRequest.result;
                    let messages = indexedDB.createObjectStore("messages", { keyPath: "id" });
                }
                openRequest.onerror = function(event) {
                    alert("Error opening database " + event.target.errorCode);
                }
            } else {
                console.log("IndexedDB not supported");
            }
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
    firebase.database().ref('chat').push({
        name: USERMAIL,
        message: message,
        id: btoa(`${USERMAIL}${message}`),
    });
    document.getElementById('message').value = ''
}
