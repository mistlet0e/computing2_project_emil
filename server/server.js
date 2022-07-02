/**
 * server is a module to load and save game stats and Elo ratings
 * for reversi games.
 * @namespace reversi
 * @author Emil Lau
 * @version 2022
 */
/*set up static file server*/
let static_server = require("node-static");

/*set up http server*/
let http = require("http");

/*run on heroku*/
let port = process.env.PORT;
let directory = __dirname + "/web-app";

if ((typeof port == "undefined") || (port === null)) {
    port = 8080;
    directory = "./web-app";
}

let file = new static_server.Server(directory);

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
let players = [];
const { Server } = require("socket.io");
const { ppid } = require("process");
const io = new Server(app);

/** main moudle where the functions are made when connection of the socket are connected
 * @name connection
 * @memberof reversi
 * @param {socket} socket conncetion from the client
 */
io.on('connection', (socket) => {

    /**
     * output a log message on the server and send it to the client
     * @param  {...any} messages - messages appearing on the command prompt
     */
    function serverLog(...messages) {
        io.emit('log', ['**** Message from the server: \n']);
        messages.forEach((item) => {
            io.emit('log', ['****\t' + item]);
            console.log(item);
        });
    }

    serverLog('a page connected to the server: ' + socket.id);

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

    /** send chat message moudle where it allows user to
     * input chat message and broadcast
     * @name send_chat_message
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {response} either fail or output 
     */
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
        response = {};
        response.result = 'success';
        response.username = username;
        response.room = room;
        response.message = message;

        // broadcast the message
        io.of('/').to(room).emit('send_chat_message_response', response);
        serverLog('send_chat_message command succeeded', JSON.stringify(response));
    });


    //token response
    /** function that handles token response when the user would like to 
     * user would like to place token on the board
     * @name play_token
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {null | response}
     */
    socket.on('play_token', (payload) => {
        serverLog('Server received a commend', '\'play_token\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let player = players[socket.id];
        //payload room not valid
        if ((typeof player == 'undefined') || (player === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'play_token came from an unregister player';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }
        // not valid username
        let username = player.username;
        if ((typeof username == 'undefined') || (username === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'play_token come from registered username';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }
        // not valid message
        let game_id = player.room;
        if ((typeof game_id == 'undefined') || (game_id === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'no valid game';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }

        let row = payload.row;
        if ((typeof row == 'undefined') || (row === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'no valid row';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }

        let column = payload.column;
        if ((typeof column == 'undefined') || (column === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'no valid column';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }

        let color = payload.color;
        if ((typeof color == 'undefined') || (color === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'no valid color';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }

        let game = games[game_id];
        if ((typeof game == 'undefined') || (game === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'no valid game';
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
            return;
        }

        //error checking: player play in turn
        if (color !== game.whose_turn) {
            let response = {
                result: 'fail',
                message: 'play_token pkayed the wrong token. It\'s not the right color'
            }
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
        }

        //error checking: current play from expected player
        if (
            ((game.whose_turn === 'white') && (game.player_white.socket != socket.id)) ||
            ((game.whose_turn === 'black') && (game.player_black.socket != socket.id))
        ) {
            let response = {
                result: 'fail',
                message: 'play_token pkayed the right color. It\'s not the right person playing'
            }
            socket.emit('play_token_response', response);
            serverLog('play_token command failed', JSON.stringify(response));
        }


        response = {
            result: 'success'
        };
        socket.emit('play_token_response', response);

        //main move execution
        if (color === 'white') {
            game.board[row][column] = 'w';
            flip_tokens('w',row,column,game.board);
            game.whose_turn = 'black';
            game.legal_moves = calculate_legal_moves('b',game.board);
        }
        else if (color === 'black') {
            game.board[row][column] = 'b';
            flip_tokens('b',row,column,game.board);
            game.whose_turn = 'white';
            game.legal_moves = calculate_legal_moves('w',game.board);
        }
        let d = new Date();
        game.last_move_time = d.getTime();
        

        send_game_update(socket, game_id, 'played a token');
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
    //      'socket_id': the socket of the user that joined the room
    // }
    // or
    // output: join_room_response:{
    //     'result': fail,
    //     'message': reason for failure,

    // }

    /** allow user to join room,
     * either lobby or game room
     * @name join_room
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {response} either fail or output response that include
     * result, socket_id, room, username, count
     */
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
            //if the socket didnt join the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.includes(socket)) {
                response = {};
                response.result = 'fail';
                response.message = 'server internal error';
                socket.emit('join_room_response', response);
                serverLog('join_room command failed', JSON.stringify(response), sockets.includes(socket));
            }

            else {
                players[socket.id] = {
                    username: username,
                    room: room
                }
                //announce to everyone in the loop
                for (const member of sockets) {
                    let room = players[member.id].room;
                    response = {
                        result: 'success',
                        socket_id: member.id,
                        room: players[member.id].room,
                        username: players[member.id].username,
                        count: sockets.length
                    };
                    // a new user has joined
                    io.of('/').to(room).emit('join_room_response', response);
                    serverLog('join_room command succeed', JSON.stringify(response));
                    if (room !== "Lobby") {
                        send_game_update(socket, room, 'initial update');
                    }
                }
            }
        });
    });

    /** allow user to invite other user
     * to play a game
     * @name invite
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {response} either fail or output response that include
     * result, socket_id
     */
    socket.on('invite', (payload) => {
        serverLog('Server received a commend', '\'invite\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('invite_response', response);
            serverLog('invite command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let requested_user = payload.requested_user;
        let room = players[socket.id].room;
        let username = players[socket.id].username;
        //payload room not valid
        if ((typeof requested_user == 'undefined') || (requested_user === null) || (requested_user === "")) {
            response = {
                result: 'fail',
                message: 'client did not request a valid user to invite to play',
            };
            socket.emit('invite_response', response);
            serverLog('invite command failed', JSON.stringify(response));
            return;
        }
        // not valid room
        if ((typeof room == 'undefined') || (room === null) || (room === "")) {
            response = {
                result: 'fail',
                message: 'the user that was invited is not in a room',
            };
            socket.emit('invite_response', response);
            serverLog('invite command failed', JSON.stringify(response));
            return;
        }
        //not valid username
        if ((typeof username == 'undefined') || (username === null) || (username === "")) {
            response = {
                result: 'fail',
                message: 'the user that was invited is does not have a valid name',
            };
            socket.emit('invite_response', response);
            serverLog('invite command failed', JSON.stringify(response));
            return;
        }

        //make sure the invited player is present, prevent single player accepting multiple room request
        io.in(room).allSockets().then((sockets) => {
            //invitee not in the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.has(requested_user)) {
                response = {
                    result: 'fail',
                    message: 'the user was no longer in the room',
                };
                socket.emit('invite_response', response);
                serverLog('invite command failed', JSON.stringify(response));
                return;
            }
            // invitee in the room
            else {
                response = {
                    result: 'success',
                    socket_id: requested_user
                }
                socket.emit("invite_response", response);

                response = {
                    result: 'success',
                    socket_id: socket.id
                }
                socket.to(requested_user).emit("invited", response);
                serverLog('invite command succeeded', JSON.stringify(response));
            }
        });
    });

    /** allow user to uninvite other user
     * to play a game
     * @name uninvite
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {response} either fail or output response that include
     * result, socket_id
     */
    socket.on('uninvite', (payload) => {
        serverLog('Server received a commend', '\'uninvite\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('uninvited', response);
            serverLog('uninvite command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let requested_user = payload.requested_user;
        let room = players[socket.id].room;
        let username = players[socket.id].username;
        //payload room not valid
        if ((typeof requested_user == 'undefined') || (requested_user === null) || (requested_user === "")) {
            response = {
                result: 'fail',
                message: 'client did not request a valid user to invite to play',
            };
            socket.emit('uninvited', response);
            serverLog('uninvite command failed', JSON.stringify(response));
            return;
        }
        // not valid room
        if ((typeof room == 'undefined') || (room === null) || (room === "")) {
            response = {
                result: 'fail',
                message: 'the user that was uninvited is not in a room',
            };
            socket.emit('uninvited', response);
            serverLog('uninvite command failed', JSON.stringify(response));
            return;
        }
        //not valid username
        if ((typeof username == 'undefined') || (username === null) || (username === "")) {
            response = {
                result: 'fail',
                message: 'the user that was uninvited is does not have a valid name',
            };
            socket.emit('uninvited', response);
            serverLog('uninvite command failed', JSON.stringify(response));
            return;
        }

        //make sure the invited player is present, prevent single player accepting multiple room request
        io.in(room).allSockets().then((sockets) => {
            //uninvitee not in the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.has(requested_user)) {
                response = {
                    result: 'fail',
                    message: 'the user uninvited was no longer in the room',
                };
                socket.emit('uninvited', response);
                serverLog('uninvite command failed', JSON.stringify(response));
                return;
            }
            // uninvitee in the room
            else {
                response = {
                    result: 'success',
                    socket_id: requested_user
                }
                socket.emit("uninvited", response);

                response = {
                    result: 'success',
                    socket_id: socket.id
                }
                socket.to(requested_user).emit("uninvited", response);
                serverLog('uninvite command succeeded', JSON.stringify(response));
            }
        });
    });

    /** function to call when the game ha began
     * initalization of the board and game logic
     * @name game_start
     * @memberof reversi
     * @function 
     * @param {payload} payload information from the client
     * @return {response} either fail or output response that include
     * result, game_id, socket_id
     */
    socket.on('game_start', (payload) => {
        serverLog('Server received a commend', '\'game_start\'', JSON.stringify(payload));
        //reject if no payload
        if ((typeof payload == 'undefined') || (payload === null)) {
            response = {};
            response.result = 'fail';
            response.message = 'client did not send a payload';
            socket.emit('game_start_response', response);
            serverLog('game_start command failed', JSON.stringify(response));
            return;
        }
        //if have payload
        let requested_user = payload.requested_user;
        let room = players[socket.id].room;
        let username = players[socket.id].username;
        //payload room not valid
        if ((typeof requested_user == 'undefined') || (requested_user === null) || (requested_user === "")) {
            response = {
                result: 'fail',
                message: 'client did not request a valid user to engage in play',
            };
            socket.emit('game_start_response', response);
            serverLog('game_start command failed', JSON.stringify(response));
            return;
        }
        // not valid room
        if ((typeof room == 'undefined') || (room === null) || (room === "")) {
            response = {
                result: 'fail',
                message: 'the user that was engaged is not in a room',
            };
            socket.emit('game_start_response', response);
            serverLog('game_start command failed', JSON.stringify(response));
            return;
        }
        //not valid username
        if ((typeof username == 'undefined') || (username === null) || (username === "")) {
            response = {
                result: 'fail',
                message: 'the user that was engaged to play is does not have a valid name',
            };
            socket.emit('game_start_response', response);
            serverLog('game_start command failed', JSON.stringify(response));
            return;
        }

        //make sure the invited player is present, prevent single player accepting multiple room request
        io.in(room).allSockets().then((sockets) => {
            //uninvitee not in the room
            if ((typeof sockets == 'undefined') || (sockets === null) || !sockets.has(requested_user)) {
                response = {
                    result: 'fail',
                    message: 'the user engaged was no longer in the room',
                };
                socket.emit('game_start_response', response);
                serverLog('game_start command failed', JSON.stringify(response));
                return;
            }
            // engaged player in the room
            else {
                let game_id = Math.floor(1 + Math.random() * 0x100000).toString(16);
                response = {
                    result: 'success',
                    game_id: game_id,
                    socket_id: requested_user
                }
                socket.emit("game_start_response", response);
                socket.to(requested_user).emit("game_start_response", response);
                serverLog('game_start command succeeded', JSON.stringify(response));
            }
        });
    });

    /** function to disconnect the user
     * @name disconnect
     * @memberof reversi
     * @function 
     * @return {null} either fail or output response that include
     */
    socket.on('disconnect', () => {
        serverLog('a page disconnected to the server: ' + socket.id);
        if ((typeof players[socket.id] != 'undefined') && (players[socket.id] != null)) {
            let payload = {
                username: players[socket.id].username,
                room: players[socket.id].room,
                count: Object.keys(players).length - 1,
                socket_id: socket.id
            };
            let room = players[socket.id].room;
            delete players[socket.id];
            io.of("/").to(room).emit('player_disconnected', payload);
            serverLog('player_disconnected succeeded', JSON.stringify(payload));
        }
    });


});








//code related to game state

let games = [];
/**
 * Initalize the condition of the new game
 * @name create_new_game
 * @memberof reversi
 * @function
 * @returns { new_game }
 */
function create_new_game() {
    let new_game = {};
    new_game.player_white = {};
    new_game.player_white.socket = "";
    new_game.player_white.username = "";
    new_game.player_black = {};
    new_game.player_black.socket = "";
    new_game.player_black.username = "";

    var d = new Date();
    new_game.last_move_time = d.getTime();

    new_game.whose_turn = 'black';
    new_game.board = [
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', 'w', 'b', ' ', ' ', ' '],
        [' ', ' ', ' ', 'b', 'w', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
    ];

    new_game.legal_moves = calculate_legal_moves('b', new_game.board);
    return new_game;
}
/**
 * check if the line is a legal line that where the middle part could be flipped
 * @name check_line_match
 * @memberof reversi
 * @param {('w' | 'b')} color of the player
 * @param {int} dr change in row
 * @param {int} dc change in column
 * @param {int} r row that ur token is placing
 * @param {int} c column that ur token is placing
 * @param {game.board} board the board to check
 * @returns {function}
 */
function check_line_match(color, dr, dc, r, c, board) {
    if (board[r][c] === color) {
        return true;
    }
    //space between
    if (board[r][c] === ' ') {
        return false;
    }
    //check wont go off the board
    if ((r + dr < 0) || (r + dr > 7)) {
        return false;
    }
    if ((c + dc < 0) || (c + dc > 7)) {
        return false;
    }
    //recursive call
    return (check_line_match(color, dr, dc, r + dr, c + dc, board));
}


/**
 * check for if the moves are withing the board range,
 * return true if r+dr supports playing at r and c+dc supports playing at c
 * @name adjacent_support
 * @memberof reversi
 * @function
 * @param {'w' | 'b'} who which color is playing right now
 * @param {int} dr changes in row
 * @param {int} dc changes in column
 * @param {int} r row that ur token is placing
 * @param {int} c column that ur token is placing
 * @param {game.board} board the board to check
 * @returns {function}
 */
function adjacent_support(who, dr, dc, r, c, board) {
    let other;
    if (who === 'b') {
        other = 'w';
    }
    else if (who === 'w') {
        other = 'b';
    }
    else {
        log('Error: no legal move available for ' + who);
        return false;
    }

    //check to make sure the adjacent support is on the board
    if ((r + dr < 0) || (r + dr > 7)) {
        return false;
    }
    if ((c + dc < 0) || (c + dc > 7)) {
        return false;
    }

    //check if the oppo color is present
    if (board[r + dr][c + dc] != other) {
        return false;
    }

    //check to make sure there is space 
    if ((r + dr + dr < 0) || (r + dr + dr > 7)) {
        return false;
    }
    if ((c + dc + dc < 0) || (c + dc + dc > 7)) {
        return false;
    }

    return check_line_match(who, dr, dc, r + dr + dr, c + dc + dc, board);
}

/**
 * based on the color of the current token,
 * output all options that are available for a legal move
 * @name calculate_legal_moves
 * @memberof reversi
 * @function
 * @param {'w' | 'b'} who which color is playing right now
 * @param {game.board} board the board to check
 * @returns {legal_moves} position of the moves that was possible for that board for that color
 */
function calculate_legal_moves(who, board) {
    let legal_moves = [
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' '],
        [' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ']
    ];

    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            if (board[row][column] === ' ') {
                // -1 == move up one row i.e. north
                nn = adjacent_support(who, -1, 0, row, column, board);
                // 1 == move right one column i.e. east
                ee = adjacent_support(who, 0, 1, row, column, board);
                // 1 == move down one row i.e. south
                ss = adjacent_support(who, 1, 0, row, column, board);
                // -1 == move left one column i.e. west
                ww = adjacent_support(who, 0, -1, row, column, board);

                //diagonal
                nw = adjacent_support(who, -1, -1, row, column, board);
                ne = adjacent_support(who, -1, 1, row, column, board);
                sw = adjacent_support(who, 1, -1, row, column, board);
                se = adjacent_support(who, 1, 1, row, column, board);
                if (nn || ee || ss || ww || nw || ne || sw || se) {
                    legal_moves[row][column] = who;
                }

            }
        }
    }
    return legal_moves;
}
/**
 * check for the line where the token would need to be flipped,
 * checking for eight directions respectively
 * @name flip_line
 * @memberof reversi
 * @function
 * @param {'w' | 'b'} who which color is playing right now
 * @param {int} dr changes in row
 * @param {int} dc changes in column
 * @param {int} r row that ur token is placing
 * @param {int} c column that ur token is placing
 * @param {game.board} board the board to check
 * @returns { true | false }
 */
function flip_line(who ,dr ,dc ,r, c, board){
    //if it is off the board
    if ((r + dr < 0) || (r + dr > 7)) {
        return false;
    }
    if ((c + dc < 0) || (c + dc > 7)) {
        return false;
    }
    if (board[r + dr][c + dc] === ' ') {
        return false;
    }
    if (board[r + dr][c + dc] === who) {
        return true;
    }
    else{
        if(flip_line(who,dr,dc,r+dr,c+dc,board)){
            board[r+dr][c+dc] = who;
            return true;
        }
        else{
            return false;
        }
    }
}

/**
 * flip token with the aid of flip_line function
 * @name flip_tokens
 * @memberof reversi
 * @function
 * @param {'w' | 'b'} who which color is playing right now
 * @param {int} row the row that ur token is placing
 * @param {int} column the column that ur token is placing
 * @param {game.board} board the board to check
 */
function flip_tokens(who, row, column, board){
    // -1 == move up one row i.e. north
    flip_line(who, -1, 0, row, column, board);
    // 1 == move right one column i.e. east
    flip_line(who, 0, 1, row, column, board);
    // 1 == move down one row i.e. south
    flip_line(who, 1, 0, row, column, board);
    // -1 == move left one column i.e. west
    flip_line(who, 0, -1, row, column, board);

    //diagonal
    flip_line(who, -1, -1, row, column, board);
    flip_line(who, -1, 1, row, column, board);
    flip_line(who, 1, -1, row, column, board);
    flip_line(who, 1, 1, row, column, board);
}

/**
 * constantly send game update to the specific socket,
 * assign colors to two players and
 * determines winning condition
 * (either when the board is full or there is no legal moves left)
 * @name send_game_update
 * @memberof reversi
 * @function
 * @param {*} socket the socket of the joining player
 * @param {*} game_id the game room that has created
 */
function send_game_update(socket, game_id, message) {
    //chk if a game with game_id exists
    if ((typeof games[game_id] == 'undefined') || (games[game_id] === null) || (games[game_id] === 'null')) {
        console.log("no game exists with game_id:" + game_id + ". Making a new game for " + socket.id);
        games[game_id] = create_new_game();
    }
    //2 ppl in room
    //assign the socket a color
    io.of('/').to(game_id).allSockets().then((sockets) => {
        const iterator = sockets[Symbol.iterator]();
        if (sockets.size >= 1) {
            let first = iterator.next().value;
            if ((games[game_id].player_white.socket != first) &&
                (games[game_id].player_black.socket != first)) {
                //player does not have color
                if (games[game_id].player_white.socket === "") {
                    console.log("white is assigned to: " + first);
                    games[game_id].player_white.socket = first;
                    games[game_id].player_white.username = players[first].username;
                }
                else if (games[game_id].player_black.socket === "") {
                    console.log("black is assigned to: " + first);
                    games[game_id].player_black.socket = first;
                    games[game_id].player_black.username = players[first].username;
                }
                else {
                    //third player
                    console.log("kicking" + first + "out of game")
                    io.in(first).socketsLeave([game_id]);
                }
            }
        }
        if (sockets.size >= 2) {
            let second = iterator.next().value;
            if ((games[game_id].player_white.socket != second) &&
                (games[game_id].player_black.socket != second)) {
                //player does not have color
                if (games[game_id].player_white.socket === "") {
                    console.log("white is assigned to: " + second);
                    games[game_id].player_white.socket = second;
                    games[game_id].player_white.username = players[second].username;
                }
                else if (games[game_id].player_black.socket === "") {
                    console.log("black is assigned to: " + second);
                    games[game_id].player_black.socket = second;
                    games[game_id].player_black.username = players[second].username;
                }
                else {
                    //third player
                    console.log("kicking" + second + "out of game")
                    io.in(second).socketsLeave([game_id]);
                }
            }
        }

        //send game update

        let payload = {
            result: 'success',
            game_id: game_id,
            game: games[game_id],
            message: message
        }
        io.of("/").to(game_id).emit('game_update', payload);
    })

    //chk if the game is over

    let legal_moves = 0;
    let whitesum = 0;
    let blacksum = 0;
    for (let row = 0; row < 8; row++) {
        for (let column = 0; column < 8; column++) {
            if (games[game_id].legal_moves[row][column] !== ' ') {
                legal_moves++;
            }
            if (games[game_id].board[row][column] === 'w') {
                whitesum++;
            }
            if (games[game_id].board[row][column] === 'b') {
                blacksum++;
            }
        }
    }
    if (legal_moves === 0) {
        let winner = "Tie Game";
        if(whitesum > blacksum){
            winner = "white";
        }
        if (whitesum < blacksum){
            winner = "black";
        }
        let payload = {
            result: 'success',
            game_id: game_id,
            game: games[game_id],
            who_won: winner
        }
        io.in(game_id).emit('game_over', payload);

        //delete games after one hr
        setTimeout(((id) => {
            return (() => {
                delete games[id];
            });
        })(game_id), 60 * 60 * 1000
        );
    }
}