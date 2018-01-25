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
app.listen(process.env.PORT || 3000);

let players = [];
let lines = [];
let started = false;
let cycle = 1;

io.on('connection', socket => {
    socket.on('add-player', name => {
        players = [...players, {name, socket}];
        io.emit('list-players', players.map(({name}) => name));
        if (players.length > 2 && !started) {
            started = true;
            players[0].socket.emit('your-turn');
        }
    });

    socket.on('add-line', line => {
        lines = [...lines, line];
        const submittorIndex = players.findIndex(p => p.socket === socket);
        let nextIndex;
        if (submittorIndex === players.length - 1) {
            cycle += 1;
            nextIndex = 0;
        } else {
            nextIndex = submittorIndex + 1;
        }
        players[nextIndex].socket.emit('your-turn', {prompt: line, cycle});
    });

    socket.on('disconnect', () => {
        players = players.filter(p => p.socket !== socket);
        io.emit('list-players', players.map(({name}) => name));
    });
});
