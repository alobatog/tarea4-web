var USERMAIL = '';


firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
        showChat()
        user = firebase.auth().currentUser
        USERMAIL = user['email']
    }
    else{
        showLogin()
        USERMAIL = ''
    }
});

firebase.database().ref('chat').on('value', function(snapshot) {
    html = '';
    snapshot.forEach(element => {
        element = element.val();
        username = element.name;
        message = element.message;
        html += `<li><b> ${username}    ${message} </li></b>`;
    });
    messages = document.getElementById('messages');
    messages.innerHTML = html 
});

function showSignup(){
    document.getElementById('signup').style.display = 'initial';
    document.getElementById('login').style.display = 'none';
    document.getElementById('chat').style.display = 'none';
}


function showLogin(){
    document.getElementById('chat').style.display = 'none';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('login').style.display = 'initial';
}


function showChat(){
    document.getElementById('chat').style.display = 'initial';
    document.getElementById('signup').style.display = 'none';
    document.getElementById('login').style.display = 'none';
}


function login(){
    email = document.getElementById('email-login').value;
    password = document.getElementById('password-login').value;
    document.getElementById('password-login').value = ''
    showChat();
    firebase.auth().signInWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert( `${errorCode} ${errorMessage}`)
        showLogin();
      });
}


function createaccount(){
    email = document.getElementById('email-signup').value;
    password = document.getElementById('password-signup').value;
    showChat();
    firebase.auth().createUserWithEmailAndPassword(email, password).catch(function(error) {
        var errorCode = error.code;
        var errorMessage = error.message;
        window.alert( `${errorCode} ${errorMessage}`)
        showSignup();
      });
}


function logout(){
    firebase.auth().signOut().then(function() {
        showLogin()
    }).catch(function() {
    })
}

function send(){
    console.log(USERMAIL, 'en el send')
    message = document.getElementById('message').value;
    firebase.database().ref('chat').push({
        name: USERMAIL,
        message: message
    });
    document.getElementById('message').value = ''
}

