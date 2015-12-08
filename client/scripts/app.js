// YOUR CODE HERE:
var app = {};

app.escapeMap = {
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
  var username = (typeof message.username === 'string') ? message.username : '[undefined]';
  var text = (typeof message.text === 'string') ? message.text : '[undefined]';


  var usernameHtml = '<a href="#" class="username">' + app._sanitize(username) + '</a>';
  var newNode = $( "<p>" + usernameHtml + ": " + app._sanitize(text) + "</p>" );
  $('#chats').append(newNode);
};

app.addRoom = function(roomName) {
  var newNode = $( "<p>" + roomName + "</p>" );
  $('#roomSelect').append(newNode);
}

app.addFriend = function() {

};

app.handleSubmit = function() {

};

app._printMessages = function(response) {
  console.log("hi");
  console.log(arguments);
  var messages = response.results;
  for (var i = 0; i < messages.length; i++) {
    app.addMessage(messages[i]);
  }
};

app._sanitize = function(str) {
  var result = '';
  for (var i = 0; i < str.length; i++) {
    if (str[i] === '<') {
      result += '&lt;';
    } else if(str[i] === '>') {
      result += '&gt;';
    } else {
      result += str[i];
    }
  }
  return result;
};

//------------- sandbox --------------

var message = {
  username: 'Gloria&Max Mel Brooks',
  text: 'It\'s good to be the king',
  roomname: 'lobby'
};

var Message = function(roomname, text, username) {
  this.opponents = {};
  this.roomname = "Gloria and Max";
  this.text = text;
  this.username = 'rhodia';
};

//app.send(message, function() { console.log("ok"); });
//$.post('https://api.parse.com/1/classes/chatterbox', new Message("test from Max and Gloria"), function() {console.log("success");});



$.get('https://api.parse.com/1/classes/chatterbox', 'abc', app._printMessages);
