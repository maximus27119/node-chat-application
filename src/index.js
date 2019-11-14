
const path = require('path');
const http = require('http');
const express = require('express');

const socketIO = require('socket.io');
const Filter = require('bad-words');
const { generateMessage, generateLocationMessage } = require('./utils/messages');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);


const port = 3000;

// let count = 0;

const publicDirectoryPath = path.join(__dirname, '../public');
app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    console.log('New web socket connection');

    socket.emit('message', generateMessage('Welcome!'));
    socket.broadcast.emit('message', generateMessage('A new user has joined!'));

    socket.on('join', ({ username, room }) => {
        socket.join(room);
    })

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter();

        if(filter.isProfane(message))
            return callback('Profanity is not allowed!');
        
        io.emit('message', generateMessage(message));
        callback();
    });

    socket.on('sendLocation', (coordinates, callback) => {
        io.emit('locationMessage', generateLocationMessage(`http://google.com/maps?q=${coordinates.latitude},${coordinates.longitude}`));
        callback();
    })

    socket.on('disconnect', () => {
        io.emit('message', generateMessage('A user has left.'));
    });
});



server.listen(port, () => { 
    console.log(`Server is up on port ${port}`);
});