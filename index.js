const http = require('http');
const fs = require('fs');
const trackError = require('./errors');
const app = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('shh.', 'utf-8');
});
const io = require('socket.io')(app);
const game = require('./store');
const hat = require('hat');
const config = require('./config');
app.listen(process.env.PORT || 24896);

io.on('connection', socket => {
    const user = {id: null, removePlayerTimer: null};

    const welcomeNewPlayer = () => {
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
            const story = game.getStory();
            io.emit('storytime', story);
            game.reset();
            fs.writeFile(`stories/${hat()}.txt`, story, err => {
                if (err) {
                    trackError(err);
                }
            });
        } else {
            socket.emit('early-bird');
        }
    });

    socket.on('disconnect', () => {
        game.disconnectPlayer(user.id);
        setTimeout(() => {
            game.getPlayerWhoIsNext().emit('your-turn', game.getPromptForNextPlayer());
        }, config.REMOVE_PLAYER_DISCONNECT_TIMEOUT + 1);
    });

    socket.on('exit-game', () => {
        game.removePlayer(user.uuid);
        io.emit('list-players', game.getPlayerList());
    });
});
