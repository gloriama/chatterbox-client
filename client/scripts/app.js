// YOUR CODE HERE:
var app = {};

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
  ']': '&#93;',
}
app._lastObjectId = null;
app.server = 'https://api.parse.com/1/classes/chatterbox';

app.init = function() {
  $('.username').on("click", app.addFriend);

  $('#send .submit').on("submit", app.handleSubmit);
};

app.send = function(message, success) {
  $.ajax({
    type: "POST",
    url: 'https://api.parse.com/1/classes/chatterbox',
    data: JSON.stringify(message),
    success: success
    // dataType: dataType
  });
};

app.fetch = function() {
  $.ajax({
    type: "GET",
    url: 'https://api.parse.com/1/classes/chatterbox'
  });
};

app.clearMessages = function() {
  $('#chats').children().remove();
};

app.addMessage = function(message) {
  app._lastObjectId = message.objectId;

  var username = (typeof message.username === 'string') ? message.username : '[undefined]';
  var text = (typeof message.text === 'string') ? message.text : '[undefined]';

  var usernameHtml = '<a href="#" class="username">' + app._sanitize(username) + '</a>';
  var newNode = $( "<p>" + usernameHtml + ": " + app._sanitize(text) + "</p>" );
  $('#chats').prepend(newNode);
};

app.addRoom = function(roomName) {
  var newNode = $( "<p>" + roomName + "</p>" );
  $('#roomSelect').append(newNode);
}

app.addFriend = function() {

};

app.handleSubmit = function() {

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

  //newMessages = empty array
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
  }
};

var updateMessages = function() {
  $.get('https://api.parse.com/1/classes/chatterbox', 'abc', app._getMessages);
};
setInterval(updateMessages, 1000);


//------------- sandbox --------------

var Message = function(roomname, text, username) {
  this.roomname = "Gloria and Max";
  this.text = text;
  this.username = 'rhodia';
};

var message = new Message('lobby', 'It\'s good to be the king', 'Gloria & Max');

app.send(message, function() { console.log("ok"); });
$.get('https://api.parse.com/1/classes/chatterbox', 'abc', app._printMessages);
//$.post('https://api.parse.com/1/classes/chatterbox', new Message("test from Max and Gloria"), function() {console.log("success");});
