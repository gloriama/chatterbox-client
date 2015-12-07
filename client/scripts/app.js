// YOUR CODE HERE:
var app = {};

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
  var usernameHtml = '<a href="#" class="username">' + message.username + '</a>';
  var newNode = $( "<p>" + usernameHtml + ": " + message.text + "</p>" );
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

var message = {
  username: 'Gloria&Max Mel Brooks',
  text: 'It\'s good to be the king',
  roomname: 'lobby'
};


// var Message = function(str) {
//   this.createdAt = '';
//   this.objectId = '';
//   this.opponents = {};
//   this.roomname = "Gloria and Max";
//   this.text = str;
//   this.updatedAt = '';
//   this.username = 'rhodia';
// };

app.send(message, function() { console.log("ok"); });
//$.post('https://api.parse.com/1/classes/chatterbox', new Message("test from Max and Gloria"), function() {console.log("success");});
$.get('https://api.parse.com/1/classes/chatterbox', 'abc', function() {console.log(arguments)});
