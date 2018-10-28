const database = firebase.database();

$(document).ready(function() {
  $(".content").delay("1500").fadeIn();
  $(".splash-logo").fadeIn(3500);
  $(".sign-in-button").click(signInClick);
  $(".register-link").click(showRegister);
  $(".sign-up-button").click(signUpClick);
})

const showRegister = (event) => {
  event.preventDefault();
  $(".new-user-register").removeClass("display-none");
  $(".user-login").addClass("display-none");
}

// Cadastrar novos usuários
const signUpClick = (event) => {
  event.preventDefault();
  const name = $(".sign-up-username").val();
  const email = $(".sign-up-email").val();
  const password = $(".sign-up-password").val();
  registerNewUser(name, email, password);
}

const registerNewUser = (name, email, password) => {
  firebase.auth().createUserWithEmailAndPassword(email, password)
  .then(response => {
    const userId = response.user.uid;
    database.ref("users/" + userId).set({
      name: name,
      email: email
    })
    redirectToProfile(userId);
  })
  .catch(error => {
    handleError(error);
  })
}

// Login de usuários
const signInClick = (event) => {
  event.preventDefault();
  const email = $(".sign-in-email").val();
  const password = $(".sign-in-password").val();
  signInUser(email, password);
}

const signInUser = (email, password) => {
  firebase.auth().signInWithEmailAndPassword(email, password)
  .then(response => {
    const userId = response.user.uid;
    redirectToProfile(userId);
  })
  .catch(error => {
    handleError(error)
  })
}

// Exibir alertas de erros
const handleError = (error) => {
  const errorMessage = error.message;
  alert(errorMessage);
}

// Direcionar para profile
const redirectToProfile = (userId) => {
  localStorage.setItem("userId", userId)
  window.location = "profile.html";
}
