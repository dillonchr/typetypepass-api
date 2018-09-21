module.exports = {
    IS_PROD: process.env.NODE_ENV === 'production',
    REMOVE_PLAYER_DISCONNECT_TIMEOUT: process.env.REMOVE_PLAYER_DISCONNECT_TIMEOUT || 10000
};
