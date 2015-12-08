// YOUR CODE HERE:
var app = {
  _lastObjectId: null,
  _username: window.location.search.split('=')[1],
  _friendNames: {},
  _roomNames: {},
  _currRoomName: 'lobby',
  server: 'https://api.parse.com/1/classes/chatterbox'
};

app._escapeMap = {
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

app.init = function() {
  $('#send .submit').on("click", app.handleSubmit);
  $('#roomnamebox').val(app._currRoomName);
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

app.fetch = function() {
  $.ajax({
    type: "GET",
    url: 'https://api.parse.com/1/classes/chatterbox'
  });
};

//---------------------------------

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.addMessage = function(message) {
  app._lastObjectId = message.objectId;

  //extract and sanitize data from message
  var username = (typeof message.username === 'string') ? message.username : '[undefined]';
  var text = (typeof message.text === 'string') ? message.text : '[undefined]';
  var roomname = (typeof message.roomname === 'string') ? message.roomname : '[undefined]';
  var objectId = message.objectId; //guaranteed clean and defined by server

  //create message node and add to DOM
  var $usernameNode = $('<a href="#" class="username" data-objectid="' + objectId + '"></a>');
  $usernameNode.append(app._sanitize(username));

  var $newNode = $( '<p data-roomname="' + roomname + '"></p>' );
  $newNode.append($usernameNode);
  $newNode.append(': ' + app._sanitize(text));

  $('#chats').prepend($newNode);

  //add listener to username link: when clicked, friend will be added to friends list
  $usernameNode.on("click", app.addFriend);

  //add a room if the chatroom is new
  if (!app._roomNames[roomname]) {
    app.addRoom(roomname);
    app._roomNames[roomname] = roomname; //dummy value
  }
};

app.addRoom = function(roomName) {
  var $newNode = $( '<li><a href="#">' + roomName + '</li>' );

  $('#roomSelect').append($newNode);
  $newNode.on("click", app.handleRoomSelect);
}

app.addFriend = function(event) { //adds the dom node to the friends list
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

  app._currRoomName = roomname;

  //call app.send on that text
  app.send(new Message(roomname, text));};

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

app._sanitize = function(str) {
  var result = '';

  for (var i = 0; i < str.length; i++) {
    if (str[i] in app._escapeMap) {
      result += app._escapeMap[str[i]];
    } else {
      result += str[i];
    }
  }
  return result;
};

//------------- poll for new updates --------------
app._getMessages = function(response) {
  var allMessages = response.results;
  var message;
  var newMessages = [];

  //traverse from beginning
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
  //using newMessages as a stack, prepend to #chats
  while (message = newMessages.pop()) {
    app.addMessage(message);
    console.log(message);
  }
};

app._updateMessages = function() {
  $.get('https://api.parse.com/1/classes/chatterbox', null, app._getMessages);
};

setInterval(app._updateMessages, 1000);


//------------- sandbox --------------

var Message = function(roomname, text) {
  this.roomname = roomname;
  this.text = text;
  this.username = app._username;
};

app._makeChatForm = function() {
  //create a form in jquery
  var $chatForm = $('<form id="send"></form>');
  var $inputBox = $('<input type="text" id="inputbox"></input>');
  var $roomNameBox = $('<input type="text" id="roomnamebox"></input>');
  var $submitButton = $('<input type="submit" class="submit"></input>');

  //append it to body
  $('#main').append($chatForm);
  $chatForm.append('Message text:');
  $chatForm.append($inputBox);
  $chatForm.append('Room name:');
  $chatForm.append($roomNameBox);
  $chatForm.append($submitButton);
};

app._makeChatRoomsList = function() {
  var $chatRoomsList = $('<ul id="roomSelect"></ul>');

  //append it to body
  $('#main').append($chatRoomsList);
}

app._makeFriendsList = function() {
  //create a list in jquery
  var $friendsList = $('<ul id="friendsList"></ul>');

  //append it to body
  $('#main').append($friendsList);
};

window.onload = function() {
  app._makeChatForm();
  app._makeChatRoomsList();
  app._makeFriendsList();
  app.init();
};