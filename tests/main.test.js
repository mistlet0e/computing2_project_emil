// var server = require('../server/server');
// var socket = require('socket.io');

// socket.on('invited', (payload) => {
//     describe('Empty board', function(){
//     it('An empty board have valid legal move', function(){
//         const empty_board = server.calculate_legal_moves();
//         });
//     });
// })

var should = require('should');
var io = require('socket.io-client');
var server = require('../server/server');
var socketURL = 'http://0.0.0.0:8080';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

const correct_join_room_payload_pansy = {room: 'Lobby', username:'Pansy'};
const correct_join_room_payload_emil = {room: 'Lobby', username:'Emil'};

describe("Joining room function",function(){
    it('Multiple user should be able to join the server', function(done){
        var client1 = io.connect(socketURL, options);
        client1.emit('connection', client1);
        client1.on('log', "message");
        client1.disconnect();
          /* Since first client is connected, we connect
          the second client. */
        done();
    });

    const correct_payload = {room: 'lobby', username:'Pansy'};
    const empty_payload = {};
    const invalid_username_payload = {room: 'lobby', username: null};
    it('Return fail if the payload is empty', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('join_room', empty_payload);
        client3.on('join_room_response', (response) => {
            console.log(response.result);
            if (response.message === "client did not send a valid username to join"){
                client3.disconnect();
                done();
            }
        });
    });

    it('Return fail if the username is invalid', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('join_room', invalid_username_payload);
        client3.on('join_room_response', (response) => {
            console.log(response.message);
            if (response.message === "client did not send a valid username to join"){
                client3.disconnect();
                done();
            }
        });
    });

    it('Return success if payload is valid', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('join_room', correct_payload);
        client3.on('join_room_response', (response) => {
            console.log(response.result);
            if (response.result === "success"){
                client3.disconnect();
                done();
            }
        });
    });
});

describe("Send Message to user in the room with the chat function",function(){
    const correct_payload = {room: 'Lobby', username:'Pansy', message:'Hi anyone want to play reversi?'};
    const empty_payload = null;
    const invalid_username_payload = {room: 'lobby', username: null};
    const invalid_message_payload = {room: 'lobby', username: 'Emil', message: null};
    it('Return success if the token payload is valid - move not legal yet', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('send_chat_message', empty_payload);
        client3.on('send_chat_message_response', (response) => {
            console.log(response.message);
            if (response.message === "client did not send a payload"){
                client3.disconnect();
                done();
            }
        });
    });

    it('Return fail if the chat payload does not have a valid username', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('send_chat_message', invalid_username_payload);
        client3.on('send_chat_message_response', (response) => {
            console.log(response.message);
            if (response.message === "client did not send a valid username to send message"){
                client3.disconnect();
                done();
            }
        });
    });

    it('Return fail if the chat payload does not have a valid message', function(done){
        var client3 = io.connect(socketURL, options);
        client3.emit('send_chat_message', invalid_message_payload);
        client3.on('send_chat_message_response', (response) => {
            console.log(response.message);
            if (response.message === "client did not send a valid  message"){
                client3.disconnect();
                done();
            }
        });
    });


    
    it('Return success if chat payload is valid', function(done){
        var client3 = io.connect(socketURL, options);
        //first need to join the room in order to chat 
        client3.emit('join_room', correct_join_room_payload_pansy);
        client3.emit('send_chat_message', correct_payload);
        client3.on('send_chat_message_response', function (response){
            console.log(response);
            if (response.result === "success"){
                client3.disconnect();
                done();
            }
        });
    });
});
describe("Check the invite function if it can invite people to join a room",function(){
    it('invite button', function(done){
        var client3 = io.connect(socketURL, options);
        //adding the one who is inviting
        client3.on('connect', () => {
            console.log(client3.id); // an alphanumeric id...
        });
        var client4 = io.connect(socketURL, options);
        //adding the one who is inviting
        client4.on('connect', () => {
            console.log(client4.id); // an alphanumeric id...
        });
        client3.emit('join_room',correct_join_room_payload_emil);
        client4.emit('join_room',correct_join_room_payload_pansy);

        done();

    });
});


describe("initalising board",()=>{
    it('new game board contains four original token', ()=>{
        new_game = server.create_new_game();
        new_game.board.should.equal([
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', 'w', 'b', ' ', ' ', ' '],
            [' ', ' ', ' ', 'b', 'w', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
            [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
        ]);
    });
});
// describe("Check the invite function if it can invite people to join a room",function(){
//     it('invite button', function(done){
//         var client3 = io.connect(socketURL, options);
//         //adding the one who is inviting
//         client3.on('connect', () => {
//             console.log(client3.id); // an alphanumeric id...
//             // adding the one who is being invited
//             done();
//             // var client4 = io.connect(socketURL, options);
//             // client4.on('connect', ()=>{
//             //     console.log(client4.id); // an alphanumeric id...
//             //     done();
//             //     client3.emit('join_room', correct_join_room_payload_pansy);
//             //     client3.on('join_room_response', (arg)=>{
//             //         console.log(arg);
                    
//             //     });
//             //     client4.emit('join_room', correct_join_room_payload_emil);
//             //     client3.emit('invite',{});
//             //     done();
//             // })
//          });
//     });
// });


// describe("Check the play_token function where a token would be placed if the position is legal",function(){
//     it('Return success if the token payload is valid - move not legal yet', function(done){
//         var client3 = io.connect(socketURL, options);
//         client3.emit('join_room', correct_join_room_payload_pansy);
//         client3.emit('play_token', {"row":4,"column":5,"color":"black"});
//         client3.on('play_token_response', (response) => {
//             console.log(response);
//             if (response.result === "success"){
//                 done();
//             }
//         });
//     });
// })
