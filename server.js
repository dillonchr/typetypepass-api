const https = require('https');
const fs = require('fs');
const path = require('path');
const app = https.createServer({
    key: fs.readFileSync(path.join(process.env.CERTS_PATH, 'dillonchristensen.com.key')),
    cert: fs.readFileSync(path.join(process.env.CERTS_PATH, 'dillonchristensen.com.cer'))
}, (req, res) => {
    res.writeHead(200);
    res.end('oh hi there', 'utf-8');
});
const io = require('socket.io')(app);
const game = require('./store');

app.listen(process.env.PORT || 3000);

io.on('connection', socket => {
    socket.on('add-player', name => {
        game.addPlayer(name, socket);
        const playerList = game.getPlayerList();
        io.emit('list-players', playerList);
        if (game.canStart()) {
            game.begin();
            game.getPlayerSocket(0).emit('your-turn');
        }
    });

    socket.on('add-line', line => {
        const nextSocket = game.addLine(line, socket);
        nextSocket.emit('your-turn', {prompt: line, cycle: game.getCycle()});
    });

    socket.on('disconnect', () => {
        game.removePlayer(socket);
        io.emit('list-players', game.getPlayerList());
    });
});
