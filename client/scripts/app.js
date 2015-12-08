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

  setInterval(function() { app.fetch(app._updateMessages); }, 1000);
};

//poll for new messages and adds them to DOM
app._updateMessages = function(response) {

  var addMessage = function(message) {
    // -- helper functions --
    var sanitize = function(str) {

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

    var addRoom = function(roomName) {
      var $newNode = $( '<li><a href="#">' + roomName + '</li>' );

      $('#roomSelect').append($newNode);
      $newNode.on("click", app.handleRoomSelect);
    }

    // -- function body --
    app._lastObjectId = message.objectId;

    //extract and sanitize data from message
    var username = (typeof message.username === 'string') ? message.username : '[undefined]';
    var text = (typeof message.text === 'string') ? message.text : '[undefined]';
    var roomname = (typeof message.roomname === 'string') ? message.roomname : '[undefined]';
    var objectId = message.objectId; //guaranteed clean and defined by server

    //create message node and add to DOM
    var $usernameNode = $('<a href="#" class="username" data-objectid="' + objectId + '"></a>');
    $usernameNode.append(sanitize(username));

    var $newNode = $( '<p data-roomname="' + roomname + '"></p>' );
    $newNode.append($usernameNode);
    $newNode.append(': ' + sanitize(text));

    $('#chats').prepend($newNode);

    //add listener to username link: when clicked, friend will be added to friends list
    $usernameNode.on("click", app.handleClickFriend);

    //add a room if the room is new
    if (!app._roomNames[roomname]) {
      addRoom(roomname);
      app._roomNames[roomname] = roomname; //dummy value
    }
  };

  //function starts here:
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

  //call addMessage for each new message (rendering most recent first)
  while (message = newMessages.pop()) {
    addMessage(message);
    console.log(message);
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

app.send = function(message, success) {
  $.ajax({
    type: "POST",
    url: 'https://api.parse.com/1/classes/chatterbox',
    data: JSON.stringify(message),
    success: success
  });
};

app.fetch = function(success) {
  $.ajax({
    type: "GET",
    url: 'https://api.parse.com/1/classes/chatterbox',
    success: app._updateMessages
  });
};

//------------- MAIN --------------

var Message = function(roomname, text) {
  this.roomname = roomname;
  this.text = text;
  this.username = app._username;
};

window.onload = app.init;