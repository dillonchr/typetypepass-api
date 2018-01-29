let players = [];
let lines = [];
let started = false;
let cycle = 1;
let removePlayerTimers = {};

module.exports = {
    logState(...preMessage) {
        console.log(preMessage, players.map(p => p.name).join(), `#oLINES: ${lines.length}; #cycle: ${cycle}; #started: ${started}`);
    },
    addPlayer(uuid, socket) {
        this.logState(uuid, 'IS IT IN');
        if (!players.some(p => p.uuid === uuid)) {
            this.logState('NOpe', uuid, 'is new');
            const upNext = !players.length;
            players = [...players, {uuid, socket, upNext, online: true}];
        } else {
            this.logState('Yes, updating', uuid);
            players = players.map(p => p.uuid === uuid ? {...p, socket, online: true} : p);
            clearTimeout(removePlayerTimers[uuid]);
            delete removePlayerTimers[uuid];
        }
    },
    playerIsNext(uuid) {
        return started && players.some(p => p.uuid === uuid && p.upNext);
    },
    removePlayer(uuid) {
        players = players.filter(p => p.online || p.uuid !== uuid);
        this.logState('TRIED TO REMOVING', uuid);
    },
    disconnectPlayer(uuid) {
        players = players.map(p => p.uuid === uuid ? {...p, online: false} : p);
        removePlayerTimers[uuid] = setTimeout(() => this.removePlayer(uuid), 10000);
    },
    namePlayer(uuid, name) {
        players = players.map(p => p.uuid === uuid ? {...p, name} : p);
    },
    getPlayerList() {
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
        this.logState(nextIndex, 'SENDING LINE', line, 'TO', players[nextIndex].name);
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
        players.length = 0;
        lines.length = 0;
        started = false;
        cycle = 1;
    }
};
