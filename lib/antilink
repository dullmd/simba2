const fs = require('fs-extra');
const path = require('path');

const ANTI_LINK_FILE = path.join(__dirname, '..', 'database', 'antilink.json');

// Initialize anti-link settings
const initAntiLink = () => {
    if (!fs.existsSync(ANTI_LINK_FILE)) {
        fs.ensureDirSync(path.dirname(ANTI_LINK_FILE));
        fs.writeJSONSync(ANTI_LINK_FILE, { 
            groups: {},
            defaultMode: 'delete' 
        });
    }
    return fs.readJSONSync(ANTI_LINK_FILE);
};

// Get anti-link status for a group
const getAntiLinkStatus = (groupId) => {
    try {
        const data = initAntiLink();
        return data.groups[groupId]?.enabled || false;
    } catch (error) {
        console.error('Error getting anti-link status:', error);
        return false;
    }
};

// Get anti-link mode for a group
const getAntiLinkMode = (groupId) => {
    try {
        const data = initAntiLink();
        return data.groups[groupId]?.mode || 'delete';
    } catch (error) {
        console.error('Error getting anti-link mode:', error);
        return 'delete';
    }
};

// Set anti-link status for a group
const setAntiLinkStatus = (groupId, enabled, mode = 'delete') => {
    try {
        const data = initAntiLink();
        if (!data.groups[groupId]) {
            data.groups[groupId] = {};
        }
        data.groups[groupId].enabled = enabled;
        data.groups[groupId].mode = mode;
        data.groups[groupId].updatedAt = new Date().toISOString();
        fs.writeJSONSync(ANTI_LINK_FILE, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error setting anti-link status:', error);
        return false;
    }
};

// Check if message contains a link
const containsLink = (text) => {
    if (!text || typeof text !== 'string') return false;
    
    const urlRegex = /(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/gi;
    const whatsappRegex = /chat\.whatsapp\.com|wa\.me|whatsapp\.com/gi;
    const telegramRegex = /t\.me|telegram\.me/gi;
    const instagramRegex = /instagram\.com|instagr\.am/gi;
    const facebookRegex = /facebook\.com|fb\.com|fb\.watch/gi;
    const twitterRegex = /twitter\.com|x\.com|t\.co/gi;
    const tiktokRegex = /tiktok\.com|vm\.tiktok\.com/gi;
    const youtubeRegex = /youtube\.com|youtu\.be/gi;
    
    return urlRegex.test(text) || 
           whatsappRegex.test(text) || 
           telegramRegex.test(text) || 
           instagramRegex.test(text) || 
           facebookRegex.test(text) || 
           twitterRegex.test(text) || 
           tiktokRegex.test(text) || 
           youtubeRegex.test(text);
};

module.exports = {
    getAntiLinkStatus,
    getAntiLinkMode,
    setAntiLinkStatus,
    containsLink
};
