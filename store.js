let players = [];
let lines = [];
let started = false;
let cycle = 1;

module.exports = {
    addPlayer(name, socket) {
        players = [...players, {name, socket}];
    },
    removePlayer(socket) {
        players = players.filter(p => p.socket !== socket);
    },
    getPlayerList() {
        return players.map(p => p.name);
    },
    getPlayerSocket(index) {
        return players[index].socket;
    },
    addLine(line, fromSocket) {
        lines = [...lines, line];
        const submittorIndex = players.findIndex(p => p.socket === fromSocket);
        const nextIndex = submittorIndex === players.length - 1 ? 0 : submittorIndex + 1;
        if (!nextIndex) {
            cycle++;
        }
        return players[nextIndex].socket;
    },
    getCycle() {
        return cycle;
    },
    isStarted() {
        return started;
    },
    canStart() {
        return players.length > 2 && !started;
    },
    begin() {
        started = true;
    }
};
