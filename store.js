let players = [];
let lines = [];
let started = false;
let cycle = 1;
let removePlayerTimers = {};

module.exports = {
    addPlayer(uuid, socket) {
        if (!players.some(p => p.uuid === uuid)) {
            const upNext = !players.length;
            players = [...players, {uuid, socket, upNext}];
        } else {
            players = players.map(p => p.uuid === uuid ? {...p, socket} : p);
            clearTimeout(removePlayerTimers[uuid]);
            delete removePlayerTimers[uuid];
        }
    },
    playerIsNext(uuid) {
        return started && players.some(p => p.uuid === uuid && p.upNext);
    },
    removePlayer(uuid) {
        console.log('REMOVING', uuid);
        players = players.filter(p => p.uuid !== uuid);
    },
    disconnectPlayer(uuid) {
        removePlayerTimers[uuid] = setTimeout(() => this.removePlayer(uuid), 10000);
    },
    namePlayer(uuid, name) {
        players = players.map(p => p.uuid === uuid ? {...p, name} : p);
    },
    getPlayerList() {
        console.log(players.map(p => p.name));
        return players.map(p => p.name);
    },
    getPlayerSocket(index) {
        return players[index].socket;
    },
    addLine(line, uuid) {
        lines = [...lines, line];
        const submittorIndex = players.findIndex(p => p.uuid === uuid);
        const nextIndex = submittorIndex === players.length - 1 ? 0 : submittorIndex + 1;
        players = players.map((p, i) => ({...p, upNext: i === nextIndex}))
        if (!nextIndex) {
            cycle++;
        }
        return players[nextIndex].socket;
    },
    getStory() {
        return lines.join(' ');
    },
    getPromptForNextPlayer() {
        return {prompt: lines.slice(-1).shift(), cycle};
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
    },
    reset() {
        lines.length = 0;
        started = false;
        cycle = 1;
    }
};
