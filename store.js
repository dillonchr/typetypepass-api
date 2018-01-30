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
        if (!players.some(p => p.uuid === uuid)) {
            const upNext = !players.length;
            players = [...players, {uuid, socket, upNext, online: true}];
        } else {
            players = players.map(p => p.uuid === uuid ? {...p, socket, online: true} : p);
            clearTimeout(removePlayerTimers[uuid]);
            delete removePlayerTimers[uuid];
        }
    },
    playerIsNext(uuid) {
        return started && players.some(p => p.uuid === uuid && p.upNext);
    },
    removePlayer(uuid) {
        const i = players.findIndex(p => p.uuid === uuid);
        const ousted = players[i];
        if (ousted && !ousted.online) {
            this.logState('the ousted', ousted.name);
            let upNextUuid;
            if (ousted.upNext) {
                this.logState('HE WAS NEXT UP!!!');
                const nextI = i > players.length - 2 ? 0 : i + 1;
                this.logState('NEXT INDEX', nextI);
                upNextUuid = players[nextI].uuid;
                this.logState('NEW NEXT', players[nextI].name);
            }
            players = players.filter(p => p.online || p.uuid !== uuid);
            if (upNextUuid) {
                players = players.map(p => ({...p, upNext: p.uuid === upNextUuid}));
            }
            this.logState(players.map(p => ({next:p.upNext,name:p.name})));
            this.logState('ACTUALLY REMOVED', uuid);
        }
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
