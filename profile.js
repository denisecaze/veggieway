const database = firebase.database();
const USER_ID = localStorage.getItem("userId");  

if (!USER_ID) { 
  window.location = "index.html" 
};

$(".my-messages-button").on("click touchstart", displayBtnMyMessages);
$(".friends-messages-button").on("click touchstart", displayBtnFriendsMessages);
$(".all-messages-button").on("click touchstart", allMessages);

$(document).ready(function() {
  allMessages();
  $(".add-new-post-button").on("click touchstart", addPostToProfile);
  $(".private-post").on("click touchstart", function() {
    $(this).attr("data-privacy-settings", "private");
  })
})

// Adicionar novo user ao database
database.ref("users").once("value")
.then(function(snapshot) {
  snapshot.forEach(function(childSnapshot) {
    const childKey = childSnapshot.key;
    const childData = childSnapshot.val();
    createUsers(childData.name, childKey);
  })
})

// Exibir lista de usuários e seguir alguém
function createUsers(name, key) {
  if (key !== USER_ID) {
    $(".lista-users").append(`
      <div class="friends">
        <span>${name}</span>
        <br />
        <button class="follow-button" data-seguir-id="${key}">seguir</button>
      </div>
    `);
  };
  
  $(`button[data-seguir-id=${key}]`).on("click touchstart", function() {
    $(this).html("seguindo");
    database.ref("friendship/" + USER_ID).push({
      friendId: key, 
      following: "seguindo"
    })
  }) 
}

// Mostrar nome do usuário logado na tela 
database.ref("users/" + USER_ID).once("value")
  .then(function(snapshot) {
    const userInfo = snapshot.val();
    $(".show-name").text(userInfo.name)
  })

// Configurações de privacidade do post
function setPrivacy() {
  let privacySettings = "";
  $(".private-post").data("privacy-settings") ? (privacySettings = "private") : (privacySettings = "public");
  return privacySettings;
}

// Adicionar novo post
function addPostToProfile() {
  const newPost = $(".new-post-input").val();
  addPostToDB(newPost, setPrivacy());
  window.location.reload()
}

// Adicionar novo post ao database
function addPostToDB(text, type) {
  return database.ref("profile/" + USER_ID).push({
    text: text,
    type: type
  })
}

// Filtro - minhas mensagens
function displayBtnMyMessages() {
  $(".feed-list").html("");
  database.ref("friendship/" + USER_ID).once("value")
  .then(function(snapshot) {
    snapshot.forEach(function(childSnapshot) {
      const messageKey = childSnapshot.key;
      const messageContent = childSnapshot.val();
      const friendMessage = messageContent.friendId;
    })

    filterMyMessages();

    function filterMyMessages() {
    database.ref("profile/").once("value")
      .then(function(snapshot) {
        const users = snapshot.val();
        const userKeys = [];
        for (user in users) {
          if (user === USER_ID) {
            userKeys.push(users[user]);
          }
        }
        userKeys.forEach(function(element) {
          for (el in element) {
            const messageKey = el;
            const messageText = element[el].text;
            const messageType = element[el].type;
            showMyMessages(messageKey, messageText);
          }
        })
      })
    }

    function showMyMessages(key, text) {
      $(".feed-list").prepend(`
        <div class="post-feed-box-public" data-post-box-public-id=${key}>
          <div data-image-id=${key}>
            <img class="post-feed-image" width="60px" height="60px" src="images/persona.jpg" />
          </div>
          <div class="post-feed-message">
            <p data-post-id=${key}>
              <span data-text-id="${key}">${text}</span>
            </p>
          </div>
          <div class="post-feed-utilities">
            <button class="post-interactive-button" data-edit-id="${key}">
              <i class="interactive-icon fas fa-edit"></i>
            </button>
            <button class="post-interactive-button" data-delete-id="${key}">
              <i class="interactive-icon far fa-trash-alt"></i>
            </button>
          </div>
        </div>
      `)
      $(`button[data-delete-id="${key}"]`).on("click touchstart", function() {
        $(`div[data-post-box-public-id="${key}"]`).remove();
        database.ref(`profile/${USER_ID}/${key}`).remove();
      })
      $(`button[data-edit-id=${key}]`).on("click touchstart", function() {
        const newText = prompt(`Altere o seu post: ${text}`);
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
  database.ref("friendship/" + USER_ID).once("value")
    .then(function(snapshot) {
      snapshot.forEach(function(childSnapshot) {
        const messageKey = childSnapshot.key;
        const messageContent = childSnapshot.val();
        const friendMessage = messageContent.friendId;
        addFriendsMessages(friendMessage);
     })

    function addFriendsMessages(friendMessage) {
      database.ref("profile/").once("value")
      .then(function(snapshot) {
        const messages = snapshot.val();
        const users = Object.keys(messages);
        const userKeys = [];
        for(message in messages) {
          if(friendMessage === message) {
            if(message !== USER_ID) {
              userKeys.push(messages[message]);
            }
          }
        }
        userKeys.forEach(function(element) {
          for (i in element) {
            let messageKey = i;
            let messageText = element[i].text;
            appendfriendsmessages(messageKey, messageText);
          }
        })
      })
    }

    function appendfriendsmessages(key, text) {
      $(".feed-list").append(`
        <div class="post-feed-box-public" data-post-box-public-id=${key}>
          <div data-image-id=${key}>
            <img class="post-feed-image" width="60px" height="60px" src="images/persona.jpg" />
          </div>
          <div class="post-feed-message">
            <p data-post-id=${key}>
              <span data-text-id="${key}">${text}</span>
            </p>
          </div>
          <div class="post-feed-utilities">
            <button class="post-interactive-button" data-like-id="${key}">
              <i class="interactive-icon far fa-heart"></i>
            </button>
          </div>
        </div>
      `)
    }
  })
}

// Filtro - todas as mensagens
function allMessages() {
  displayBtnFriendsMessages();
  displayBtnMyMessages();
}

// Configurações da textarea e contador de caracteres 
const charCounter = $(".character-counter");
const addNewPost = $(".add-new-post-button");
const newPost = $(".new-post-input");

newPost.keydown(startCounting, enableButton);
newPost.keyup(startCounting);

// Habilitar e desabilitar botão publicar
function enableButton() {
  addNewPost.prop("disabled", false);
  addNewPost.css("cursor", "pointer");
  addNewPost.css("opacity", "1");
}

function disableButton() {
  addNewPost.css("cursor", "not-allowed");
  addNewPost.prop("disabled", true);  
}

// Alteração cor contador e ajuste dimensões textarea
function startCounting() {
  const charAllowed = 140;
  const typedChar = newPost.val().length;
  let remainingChar = charAllowed - typedChar;
  charCounter.text(remainingChar);
  if (typedChar >= 130 && typedChar <= 140) {
    charCounter.css("color", "orange");
  } else if (typedChar > 140 || typedChar === 0 || !newPost.val().trim()) { 
    disableButton();
    if (typedChar > 140) {
      charCounter.css("color", "red");
    }
  } else {
    charCounter.css("color", "black");  
  }
  const lines = newPost.val().split("\n");
  const linesSize = lines.map(x => Math.max(1, Math.ceil(x.length / 38)));
  newPost.attr("rows", linesSize.reduce((acum, index) => acum + index));
}