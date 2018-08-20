var database = firebase.database();

$(document).ready(function() {
  $('.content').delay('5000').fadeIn('slow');
  $(".splash-logo").delay('500').fadeIn(2500);
  $(".sign-in-button").click(signInClick);
  $(".register-link").click(showRegister);
  $(".sign-up-button").click(signUpClick);
});

function showRegister(event) {
  event.preventDefault();
  $('.new-user-register').removeClass("display-none");
  $('.user-login').addClass("display-none");
}

// Cadastrar novos usuários
function signUpClick(event) {
  event.preventDefault();
  var name = $(".sign-up-username").val();
  var email = $(".sign-up-email").val();
  var password = $(".sign-up-password").val();

  registerNewUser(name, email, password);
  function registerNewUser(name, email, password) {
    firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function(response) {
        
        var userId = response.user.uid;
 
        database.ref('users/' + userId).set({
          name: name,
          email: email
          
        });

        redirectToProfile(userId);
      })
      .catch(function(error) {
        handleError(error);
      });
  }
}

// Login de usuários
function signInClick(event) {
  event.preventDefault();

  var email = $(".sign-in-email").val();
  var password = $(".sign-in-password").val();

  signInUser(email, password);
}

function signInUser(email, password) {
  firebase.auth().signInWithEmailAndPassword(email, password)
    .then(function(response) {
      var userId = response.user.uid;
      redirectToProfile(userId);
    })
    .catch(function(error) {
      handleError(error)
    });
}

// Exibir alertas de erros
function handleError(error) {
  var errorMessage = error.message;
  alert(errorMessage);
}

// Direcionar para profile
function redirectToProfile(userId) {
  window.location = "profile.html?id=" + userId;
}
