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
    const user = {id: null, removePlayerTimer: null};

    socket.on('register-uuid', uuid => {
        user.id = uuid;
        game.addPlayer(uuid, socket);
        console.log('connected', uuid);
    });

    socket.on('add-player', name => {
        game.namePlayer(user.id, name);
        console.log(user.id, name);
        io.emit('list-players', game.getPlayerList());
        if (game.canStart()) {
            console.log('SME1STARTIN');
            game.begin();
            game.getPlayerSocket(0).emit('your-turn', {first: true});
        } else if (game.playerIsNext(user.id)) {
            console.log('HIS TURN', name);
            socket.emit('your-turn', game.getPromptForNextPlayer());
        } else {
            console.log('WAIT A SEC', name);
            socket.emit('wait');
        }
    });

    socket.on('add-line', line => {
        if (game.isStarted()) {
            const nextSocket = game.addLine(line, user.id);
            nextSocket.emit('your-turn', game.getPromptForNextPlayer());
        } else {
            socket.emit('early-bird');
        }
    });

    socket.on('end-story', line => {
        if (game.isStarted()) {
            game.addLine(line, user.id);
            io.emit('storytime', game.getStory());
            game.reset();
        } else {
            socket.emit('early-bird');
        }
    });

    socket.on('disconnect', () => {
        game.disconnectPlayer(user.id);
    });

    socket.on('exit-game', () => {
        game.removePlayer(user.uuid);
        io.emit('list-players', game.getPlayerList());
    });
});
