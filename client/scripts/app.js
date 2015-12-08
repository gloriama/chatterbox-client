// YOUR CODE HERE:
var app = {
  _lastObjectId: null,
  _username: window.location.search.split('=')[1],
  _friendNames: {},
  _roomNames: {},
  _currRoomName: 'lobby',
  server: 'https://api.parse.com/1/classes/chatterbox'
};

//------------- INITIALIZE --------------

app.init = function() {

  (function addChatForm() {
    //create form
    var $chatForm = $('<form id="send"></form>');
    var $inputBox = $('<input type="text" id="inputbox"></input>');
    var $roomNameBox = $('<input type="text" id="roomnamebox"></input>');
    var $submitButton = $('<input type="submit" class="submit"></input>');

    //append to body
    $('#main').append($chatForm);
    $chatForm.append('Message text:');
    $chatForm.append($inputBox);
    $chatForm.append('Room name:');
    $chatForm.append($roomNameBox);
    $chatForm.append($submitButton);
    
    //initialize form value
    $roomNameBox.val(app._currRoomName);

    //add event handler for submit button
    $submitButton.on("click", app.handleSubmit);
  }());

  (function addRoomsList() {
    //create list
    var $roomsList = $('<ul id="roomSelect"></ul>');

    //append to body
    $('#main').append($roomsList);
  
  }());

  (function addFriendsList() {
    //create list
    var $friendsList = $('<ul id="friendsList"></ul>');

    //append to body
    $('#main').append($friendsList);
  }());

  setInterval(function() { app.fetch(app.update); }, 1000);
};

//poll for new messages and adds them to DOM
app.update = function(response) {

  // ---- helper functions ----
  var sanitize = function(message) {

    var sanitizeText = function(str) {
      var escapeMap = {
        '&': '&amp;', 
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '`': '&#96;',
        ' ': '&nbsp;',
        '!': '&#33;',
        '@': '&#64;',
        '$': '&#36;',
        '%': '&#37;',
        '(': '&#40;',
        ')': '&#41;',
        '=': '&#61;',
        '+': '&#43;',
        '{': '&#123;',
        '}': '&#125;',
        '[': '&#91;',
        ']': '&#93;'
      }

      var result = '';
      for (var i = 0; i < str.length; i++) {
        if (str[i] in escapeMap) {
          result += escapeMap[str[i]];
        } else {
          result += str[i];
        }
      }
      return result;
    };

    var newObj = {}

    //extract data from message (supplying defaults where given types are incorrect)
    newObj.username = (typeof message.username === 'string') ? sanitizeText(message.username) : '[undefined]';
    newObj.text = (typeof message.text === 'string') ? sanitizeText(message.text) : '[undefined]';
    newObj.roomname = (typeof message.roomname === 'string') ? sanitizeText(message.roomname) : '[undefined]';

    return newObj;
  }
  
  var addRoom = function(roomName) {
    var $newNode = $( '<li><a href="#">' + roomName + '</li>' );

    $('#roomSelect').append($newNode);
    $newNode.on("click", app.handleRoomSelect);
  }

  var addMessage = function(username, text, roomname, objectId) {
    //create message node and add to DOM
    var $usernameNode = $('<a href="#" class="username" data-objectid="' + objectId + '"></a>');
    $usernameNode.append(username);

    var $newNode = $( '<p data-roomname="' + roomname + '"></p>' );
    $newNode.append($usernameNode);
    $newNode.append(': ' + text);

    $('#chats').prepend($newNode);

    //add listener to username link: when clicked, friend will be added to friends list
    $usernameNode.on("click", app.handleClickFriend);
  }

  // ---- function body ----
  var allMessages = response.results;
  var message;

  // collect new messages
  var newMessages = [];
  for(var i = 0; i < allMessages.length; i++) {
    message = allMessages[i];
    //if objectId is unseen before 
    if(message.objectId === app._lastObjectId) {
      break;
    } else {
      //push message to newMessages
      newMessages.push(message);
    }
  }

  //update app._lastObjectId to the most recent
  app._lastObjectId = allMessages[0].objectId;

  // deal with each new message (rendering most recent first)
  while (message = newMessages.pop()) {
    console.log("new");
    var cleanMessage = sanitize(message);

    //add message
    addMessage(cleanMessage.username, cleanMessage.text, cleanMessage.roomname, message.objectId);

    //add a room if the room is new
    if (!app._roomNames[cleanMessage.roomname]) {
      addRoom(cleanMessage.roomname);
      app._roomNames[cleanMessage.roomname] = cleanMessage.roomname; //dummy value
    }
  }
};

//----------- graveyard ----------------------

// app.clearMessages = function() {
//   $('#chats').children().remove();
// };

//-------event handlers-------------

app.handleClickFriend = function(event) {
  event.stopPropagation();
  event.preventDefault();

  //get username from event
  console.log("!", arguments);
  var friendName = event.target.text;

  if (!app._friendNames[friendName]) {
    var $friendNode = $('<li>' + friendName + '</li>');

    $('#friendsList').prepend($friendNode);
    app._friendNames[friendName] = friendName; //dummy value
  }
};

app.handleSubmit = function(event) {
  event.stopPropagation();
  event.preventDefault();

  //get the text from inputBox and roomNameBox
  //clear them
  var text = $('#inputbox').val();
  var roomname = $('#roomnamebox').val();
  $('#inputbox').val('');

  //update current room name
  app._currRoomName = roomname;

  //send the message to the server
  app.send(new Message(roomname, text));
};

app.handleRoomSelect = function(event) {
  var roomName = event.target.childNodes[0].data;
  app._currRoomName = roomName;

  //populate the roomname in roomNameBox;
  $('#roomnamebox').val(app._currRoomName);

  $('#chats p').each(function(index, node) {
    //access roomname of node
    var currRoomName = node.dataset.roomname;
    if (currRoomName === roomName) {
      node.style.display = "block";
    } else {
      node.style.display = "none";
    }
  });
};

//------------- AJAX --------------

app.send = function(message, successCallback) {
  $.ajax({
    type: "POST",
    url: 'https://api.parse.com/1/classes/chatterbox',
    data: JSON.stringify(message),
    success: successCallback
  });
};

app.fetch = function(successCallback) {
  $.ajax({
    type: "GET",
    url: 'https://api.parse.com/1/classes/chatterbox',
    success: successCallback
  });
};

//------------- MAIN --------------

var Message = function(roomname, text) {
  this.roomname = roomname;
  this.text = text;
  this.username = app._username;
};

window.onload = app.init;