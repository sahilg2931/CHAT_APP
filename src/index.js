const path = require('path');
const http = require('http');

const Filter = require('bad-words');
const express = require('express');
const socketio = require('socket.io');

const { generateMessage, generateLocationMessage } = require('./utils/message.js')
const { addUser, removeUser, getUsersInRoom, getUser } = require('./utils/users.js')

const app = express();
const server = http.createServer(app);
const io = socketio(server);//passing server created to socketio to establish client<->server connection

const port = process.env.PORT || 3000;

const PublicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(PublicDirectoryPath));//the directory which is accessed by socket and it is static .

let msg = "WELCOME";
io.on('connection', (socket) => {// if a client is connected to server then this fn will run//socket contains info about client etcand is used to connect to the connected client
    console.log('new web socket connected');

    //socket.emit('msg', generateMessage('Welcome'));  //sends an event named 'msgsent', to client connected

    // socket.broadcast.emit('msg', generateMessage('A new user has joined'));//sends msg to everyone except the client that just connected

    socket.on('join', (options, callback) => {
        const { error, user } = addUser({ id: socket.id, ...options }); //spreadback 
        // console.log(user);
        if (error) {
            return callback(error);
        }

        socket.join(user.room);   //creating room with socket where we can broadcast and emit events in this room with the name stored in string room
        //io.to().emit->sends event to everyone in the room
        //socket.broadcast.to().emit ->sends event to everyone in the room except for connected client

        socket.emit('msg', generateMessage('ADMIN', 'Welcome'));
        socket.broadcast.to(user.room).emit('msg', generateMessage('ADMIN', `${user.username} has joined`));
        io.to(user.room).emit('roomInfo', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })
        callback(); //call back without error
    })
    socket.on('msgsent', (msgr, callback) => {                   // event listener for msgsent,receiving  clients msg
        const user = getUser(socket.id);
        const filter = new Filter();

        if (filter.isProfane(msgr)) {
            return callback('pls dont use bad words');
        }
        io.to(user.room).emit('msg', generateMessage(user.username, msgr)); //received msg is sent to all connected clients if not profane
        callback();
    })

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);// we use socket id,which  is given and recognised by socket 
        // console.log(user);

        if (user) {
            io.to(user.room).emit('roomInfo', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
            io.to(user.room).emit('msg', generateMessage('ADMIN', `${user.username} has left`));
        }

    })

    socket.on('loc', (lat, long, callback) => {//receiving location from client
        let url = `https://google.com/maps?q=${lat},${long}`;
        const user = getUser(socket.id);
        console.log(user);
        io.to(user.room).emit('location', generateLocationMessage(user.username, url))
        callback()
    })
})


server.listen(port, () => {//if server is active on the port, the fn will run 
    console.log(`Server is active on port ${port}`);
})