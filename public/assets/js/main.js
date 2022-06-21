function getIRIParameterValue(requestedKey){
    let pageIRI = window.location.search.substring(1);
    let pageIRIVariables = pageIRI.split('&');
    for(let i = 0; i < pageIRIVariables.length; i++){
        let data = pageIRIVariables[i].split('=');
        let key = data[0];
        let value = data[1];
        if (key === requestedKey){
            return value;
        }

    }
}

// check if there is a username. If no just output a random anonymous tag
let username = decodeURI(getIRIParameterValue('username'));
if ((typeof username == 'undefined') || (username === null)){
    username = "Anonymous_"+Math.floor(Math.random()*1000);
}

//$('#messages').prepend("<b>"+username+":</b>");
let chatRoom = 'Lobby';

// setup socket.io connection to the server
let socket = io();
socket.on('log', function(array) {
    console.log.apply(console,array);
});

// request to join the chatroom
$(() => {
    let request = {};
    request.room = chatRoom;
    request.username = username;
    console.log('**** Client log message, sending \'join_room\' command: '+JSON.stringify(request));
    socket.emit('join_room', request);
})