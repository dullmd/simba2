const fs = require('fs-extra');
const path = require('path');
const { getContentType } = require('@whiskeysockets/baileys');

const ANTI_DELETE_FILE = path.join(__dirname, '..', 'database', 'antidelete.json');
const MESSAGES_DIR = path.join(__dirname, '..', 'database', 'deleted_messages');

// Initialize anti-delete settings
const initAntiDelete = () => {
    if (!fs.existsSync(ANTI_DELETE_FILE)) {
        fs.ensureDirSync(path.dirname(ANTI_DELETE_FILE));
        fs.ensureDirSync(MESSAGES_DIR);
        fs.writeJSONSync(ANTI_DELETE_FILE, { 
            global: { 
                dm: false, 
                group: false, 
                all: false 
            },
            path: 'inbox' // 'inbox' or 'original'
        });
    }
    return fs.readJSONSync(ANTI_DELETE_FILE);
};

// Get anti-delete settings
const getAntiDeleteSettings = () => {
    try {
        return initAntiDelete();
    } catch (error) {
        console.error('Error getting anti-delete settings:', error);
        return { global: { dm: false, group: false, all: false }, path: 'inbox' };
    }
};

// Update anti-delete settings
const updateAntiDeleteSettings = (type, value) => {
    try {
        const data = initAntiDelete();
        
        if (type === 'dm') {
            data.global.dm = value;
        } else if (type === 'group') {
            data.global.group = value;
        } else if (type === 'all') {
            data.global.all = value;
            if (value) {
                data.global.dm = true;
                data.global.group = true;
            } else {
                data.global.dm = false;
                data.global.group = false;
            }
        } else if (type === 'path') {
            data.path = value;
        }
        
        data.updatedAt = new Date().toISOString();
        fs.writeJSONSync(ANTI_DELETE_FILE, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error updating anti-delete settings:', error);
        return false;
    }
};

// Check if anti-delete is enabled for a chat
const isAntiDeleteEnabled = (chatId) => {
    try {
        const data = initAntiDelete();
        const isGroup = chatId.endsWith('@g.us');
        
        if (data.global.all) return true;
        if (isGroup && data.global.group) return true;
        if (!isGroup && data.global.dm) return true;
        
        return false;
    } catch (error) {
        console.error('Error checking anti-delete:', error);
        return false;
    }
};

// Get delivery path
const getDeliveryPath = () => {
    try {
        const data = initAntiDelete();
        return data.path || 'inbox';
    } catch (error) {
        return 'inbox';
    }
};

// Store message for anti-delete
const storeMessage = async (msg) => {
    try {
        if (!msg || !msg.key) return null;
        
        const messageId = msg.key.id;
        const filePath = path.join(MESSAGES_DIR, `${messageId}.json`);
        
        await fs.writeJSON(filePath, {
            key: msg.key,
            message: msg.message,
            sender: msg.key.participant || msg.key.remoteJid,
            timestamp: msg.messageTimestamp || Date.now(),
            savedAt: new Date().toISOString()
        }, { spaces: 2 });
        
        return filePath;
    } catch (error) {
        console.error('Error storing message:', error);
        return null;
    }
};

// Load stored message
const loadMessage = async (messageId) => {
    try {
        const filePath = path.join(MESSAGES_DIR, `${messageId}.json`);
        if (!fs.existsSync(filePath)) return null;
        
        return fs.readJSONSync(filePath);
    } catch (error) {
        console.error('Error loading message:', error);
        return null;
    }
};

// Get message type
const getMessageType = (message) => {
    if (!message) return 'Unknown';
    
    const type = getContentType(message);
    const typeMap = {
        conversation: 'Text',
        imageMessage: 'Image',
        videoMessage: 'Video',
        audioMessage: 'Audio',
        documentMessage: 'Document',
        stickerMessage: 'Sticker',
        extendedTextMessage: 'Text with Link',
        contactMessage: 'Contact',
        locationMessage: 'Location'
    };
    
    return typeMap[type] || type?.replace('Message', '') || 'Unknown';
};

// Clean old messages (keep last 100)
const cleanOldMessages = async () => {
    try {
        const files = await fs.readdir(MESSAGES_DIR);
        if (files.length > 100) {
            const sorted = files.map(f => ({ 
                name: f, 
                time: fs.statSync(path.join(MESSAGES_DIR, f)).birthtime 
            })).sort((a, b) => b.time - a.time);
            
            for (let i = 100; i < sorted.length; i++) {
                await fs.remove(path.join(MESSAGES_DIR, sorted[i].name));
            }
        }
    } catch (error) {
        console.error('Error cleaning old messages:', error);
    }
};

module.exports = {
    getAntiDeleteSettings,
    updateAntiDeleteSettings,
    isAntiDeleteEnabled,
    getDeliveryPath,
    storeMessage,
    loadMessage,
    getMessageType,
    cleanOldMessages
};
