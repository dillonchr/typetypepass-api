const https = require('https');
const fs = require('fs');
const app = https.createServer({
    key: fs.readFileSync(process.env.SSL_KEY_PATH),
    cert: fs.readFileSync(process.env.SSL_CERT_PATH)
}, (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('shh.', 'utf-8');
});
const io = require('socket.io')(app);
const game = require('./store');

app.listen(process.env.PORT || 3000);

io.on('connection', socket => {
    const user = {id: null, removePlayerTimer: null};

    const welcomeNewPlayer = uuid => {
        io.emit('list-players', game.getPlayerList());
        if (game.canStart()) {
            game.begin();
            game.getPlayerSocket(0).emit('your-turn', {first: true});
        } else if (game.playerIsNext(user.id)) {
            socket.emit('your-turn', game.getPromptForNextPlayer());
        } else {
            socket.emit('wait');
        }
    };

    socket.on('register-uuid', uuid => {
        user.id = uuid;
        game.addPlayer(uuid, socket);
    });

    socket.on('restart', ({name, uuid}) => {
        user.id = uuid;
        game.addPlayer(uuid, socket);
        game.namePlayer(uuid, name);
        welcomeNewPlayer(uuid);
    });

    socket.on('add-player', name => {
        game.namePlayer(user.id, name);
        welcomeNewPlayer(user.id);
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
