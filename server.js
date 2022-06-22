/*set up static file server*/
let static = require("node-static");

/*set up http server*/
let http = require("http");

/*run on heroku*/
let port = process.env.PORT;
let directory = __dirname + "/public";

if ((typeof port == "undefined") || (port === null)) {
    port = 8080;
    directory = "./public";
}

let file = new static.Server(directory);

let app = http.createServer(
    function (request, response) {
        request.addListener("end",
            function () {
                file.serve(request, response);
            }).resume();
    }
).listen(port);

console.log("the server is running");

// setting up the socket.io
const { Server } = require("socket.io");
const io = new Server(app);

io.on('connection', (socket) => {

    //output a log message on the server and send it to the client
    function serverLog(...messages) {
        io.emit('log', ['**** Message from the server: \n']);
        messages.forEach((item) => {
            io.emit('log', ['****\t' + item]);
            console.log(item);
        });
    }

    serverLog('a page connected to the server: ' + socket.id);

    socket.on('disconnect', () => {
        serverLog('a page disconnected to the server: ' + socket.id);
    });


    // send_chat_message command handler
    //expected payload
    // {
    //     'room' = the room which the message should be sent,
    //     'username' = the name of the sender 
    //      'message': the message to broadcast
    // }
    // output: send_chat_message_response:{
    //     'result': success,
    //     'username': the user that sent the message,
    //     'message': the message that was sent
    // }
    // or
    // output: send_chat_message_response:{
    //     'result': fail,
    //     'message': reason for failure,

    // }
    socket.on('send_chat_message', (payload) => {
        serverLog('Server received a commend', '\'send_chat_message\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let room = payload.room;
        let username = payload.username;
        let message = payload.message;
        //payload room not valid
        if ((typeof room == 'undefined') || (room === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid room to message';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        // not valid username
        if ((typeof username == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid username to send message';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }
        // not valid message
        if ((typeof message == 'undefined') || (message === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid  message';
            socket.emit('send_chat_message_response', response);
            serverLog('send_chat_message command failed', JSON.stringify(response));
            return;
        }

        //if username, payload is valid, join the player to the room
        let response = {};
        response.result = 'success';
        response.username = username;
        response.room = room;
        response.message = message;

        // broadcast the message
        io.of('/').to(room).emit('send_chat_message_response', response);
        serverLog('send_chat_message command succeeded', JSON.stringify(response));
    });

    // join room command handler
    //expected payload
    // {
    //     'room' = the room to be joined,
    //     'username' = the name of the user joining the room
    // }
    // output: join_room_response:{
    //     'result': success,
    //     'room': room that was joined,
    //     'username': the user that joined the room,
    //     'count': number of users in the chat room
    // }
    // or
    // output: join_room_response:{
    //     'result': fail,
    //     'message': reason for failure,

    // }

    socket.on('join_room', (payload) => {
        serverLog('Server received a commend', '\'join_room\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let room = payload.room;
        let username = payload.username;
        //payload room not valid
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid room to join';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }
        // not valid username
        if ((typeof username == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a valid username to join';
            socket.emit('join_room_response', response);
            serverLog('join_room command failed', JSON.stringify(response));
            return;
        }

        //if username, payload is valid, join the player to the room
        socket.join(room);

        //make sure the client was put in the room
        io.in(room).fetchSockets().then((sockets) => {
            serverLog('there are ' + sockets.length + ' clients in the room, ' + room + ')');
            //if the socket didnt join the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.includes(socket)) {
                response = {};
                response.result = 'fail';
                response.message = 'server internal error';
                socket.emit('join_room_response', response);
                serverLog('join_room command failed', JSON.stringify(response), sockets.includes(socket));
            }

            else {
                response = {};
                response.result = 'success';
                response.room = room;
                response.username = username;
                response.count = sockets.length;
                // a new user has joined
                io.of('/').to(room).emit('join_room_response', response);
                serverLog('join_room command succeed', JSON.stringify(response));
            }
        });
    });
});