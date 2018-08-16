var database = firebase.database();
var USER_ID = window.location.search.match(/\?id=(.*)/)[1];  

$(document).ready(function() {
  allMessages();
  $(".add-new-post").click(addPostToProfile);
  $('.private-post').click(function() {
    $(this).attr("data-privacy-settings", "private");
  });
});

// Adicionar novo user ao database
database.ref("users").once("value")
.then(function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    var childKey = childSnapshot.key;
    var childData = childSnapshot.val();
    createUsers(childData.name, childKey);
  });
})

// Seguir alguém
function createUsers(name, key) {
  if (key !== USER_ID) {
    $('.lista-users').append(`<div class="friends"><span>${name}</span><br><button class="follow-button" data-seguir-id="${key}">seguir</button></div>`); // BOTÃO PARA SEGUR
  };
  
  $(`button[data-seguir-id=${key}]`).click(function() {
    $(this).html("seguindo");
    database.ref('friendship/' + USER_ID).push({
      friendId: key
    });
  });  
}

// Mostrar nome do usuário na tela 
database.ref("users/" + USER_ID).once("value")
  .then(function(snapshot) {
    var userInfo = snapshot.val();
    $(".show-name").text(userInfo.name)
  })


// Configurações de privacidade do post
function setPrivacy() {
  var privacySettings = "";
  if ($('.private-post').data('privacy-settings')) {
    privacySettings = "private";
  } else {
    privacySettings = "public";
  }
  return privacySettings;
}

// Adicionar novo post
function addPostToProfile(event) {
  event.preventDefault();
  var newPost = $(".new-post-input").val();
  var postFromDB = addPostToDB(newPost, setPrivacy());
  showPostItem(newPost, postFromDB.key)
}

// Adicionar novo post ao database
function addPostToDB(text, type) {
  return database.ref("profile/" + USER_ID).push({
    text: text,
    type: type,
  });
}

// Trazer posts do database
function getPostFromDB() {
  database.ref("profile/" + USER_ID).once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var childKey = childSnapshot.key;
      var childData = childSnapshot.val();
      showPostItem(childData.text, childKey)
    });
  });
}

// Exibir posts pessoais no perfil do usuário
function showPostItem(text, key) {
  $(".posts-list").append(`<p><span>${text}</span></p>`);
  $(`input[data-post-id="${key}"]`).click(function() {
    database.ref("profile/" + USER_ID + "/" + key).remove();
    $(this).parent().remove();
  });
}

// Filtro - minhas mensagens
function displayBtnMyMessages() {
  $(".feed-list").html("");
  database.ref("friendship/" + USER_ID).once('value')
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      var messageKey = childSnapshot.key;
      var messageContent = childSnapshot.val();
      var friendMessage = messageContent.friendId;
     })
    filterMyMessages();

    function filterMyMessages() {
    database.ref("profile/").once('value')
      .then(function(snapshot) {
        var messages = snapshot.val();
        var users = Object.keys(messages);
        var userKeys = [];
        for(message in messages) {
          console.log(message);
          console.log(messages[message]);
          if(message === USER_ID) {
            userKeys.push(messages[message]);
          }
        }
        userKeys.forEach(function(element) {
          for (i in element) {
            var messageKey = i;
            var messageText = element[i].text;
            var messageType = element[i].type;
            showMyMessages(messageKey, messageText);
          }
        })
      });
    }

    function showMyMessages(key, text) {
      $(".feed-list").append(`<div class="post-feed-box-public" data-post-box-public-id=${key}><div data-image-id=${key}><img class="post-feed-image" width="60px" height="60px" src="images/persona.jpg"></div><div class="post-feed-message"><p data-post-id=${key}><span data-text-id="${key}">${text}</span></p></div><div class="post-feed-utilities"><button class="post-interactive-button" data-edit-id="${key}"><i class="interactive-icon fas fa-edit"></i></button><button class="post-interactive-button" data-delete-id="${key}"><i class="interactive-icon far fa-trash-alt"></i></button></div></div>`)
      $(`button[data-delete-id="${key}"]`).click(function() {
        $(`div[data-post-box-public-id="${key}"]`).remove();
        database.ref("profile/" + USER_ID + "/" + key).remove();
      })
      $(`button[data-edit-id=${key}]`).click(function() {
        var newText = prompt(`Altere o seu texto: ${text}`);
        $(`span[data-text-id=${key}]`).text(newText);
        database.ref(`profile/${USER_ID}/${key}`).update({
          text: newText
        })
      })
    }
  })
}

// Filtro - mensagens amigos
function displayBtnFriendsMessages() {
  $(".feed-list").html("");
  database.ref("friendship/" + USER_ID).once('value')
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        var messageKey = childSnapshot.key;
        var messageContent = childSnapshot.val();
        var friendMessage = messageContent.friendId;
        console.log(friendMessage);
        mensagensAmigos(friendMessage);
     })

    function mensagensAmigos(friendMessage) {
      database.ref("profile/").once('value')
      .then(function(snapshot) {
        var messages = snapshot.val();
        var users = Object.keys(messages);
        var userKeys =[];
        for(message in messages) {
          if(friendMessage === message) {
            if(message !== USER_ID) {
              userKeys.push(messages[message]);
            }
          }
        }
        userKeys.forEach(function(element) {
          for (i in element) {
            var messageKey = i;
            var messageText = element[i].text;
            appendfriendsmessages(messageKey, messageText);
          }
        })
      });
    }

    function appendfriendsmessages(key, text) {
      $(".feed-list").append(`<div class="post-feed-box-public" data-post-box-public-id=${key}><div data-image-id=${key}><img class="post-feed-image" width="60px" height="60px" src="images/persona.jpg"></div><div class="post-feed-message"><p data-post-id=${key}><span data-text-id="${key}">${text}</span></p></div><div class="post-feed-utilities"><button class="post-interactive-button" data-like-id="${key}"><i class="interactive-icon far fa-heart"></i></button></div></div>`)
    }
  })
}

// Filtro - todas as mensagens
function allMessages() {
  displayBtnFriendsMessages();
  displayBtnMyMessages();
}

// Configurações da textarea e contador de caracteres 
var charCounter = $('.character-counter');
var addNewPost = $('.add-new-post');
var newPost = $('.new-post-input');

newPost.keypress(enableButton);

// Habilitar e desabilitar botão de post
function enableButton() {
  addNewPost.prop("disabled", false);
  addNewPost.css("cursor", "pointer");
  addNewPost.css("opacity", "1");
  newPost.keydown(startCounting);
  newPost.keyup(startCounting);
}

function disableButton() {
  addNewPost.css("cursor", "not-allowed");
  addNewPost.prop("disabled", true);  
}

// Contador e ajuste caixa de texto
function startCounting() {
  var charAllowed = 140;
  var typedChar = newPost.val().length;
  var remainingChar = charAllowed - typedChar;
  charCounter.text(remainingChar);
  if (typedChar >= 120 && typedChar < 130) { 
    charCounter.css("color", "yellow");
  } else if (typedChar >= 130 && typedChar <= 140) {
    charCounter.css("color", "orange");
  } else if (typedChar > 140 || typedChar === 0 || !newPost.val().trim()) { 
    charCounter.css("color", "red");
    disableButton();
  } else {
    charCounter.css("color", "black");  
  }
  var lines = newPost.val().split('\n');
  newPost.attr("rows", lines.length);
}




