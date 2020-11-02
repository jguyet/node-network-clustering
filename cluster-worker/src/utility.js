const getTime = () => {
    return new Date().toLocaleString('fr-FR', { timeZone: 'Europe/Paris' });
};

const sleep = (ms) => {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
};

module.exports = {
    getTime,
    sleep
};