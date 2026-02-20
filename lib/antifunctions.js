const fs = require('fs-extra');
const path = require('path');

// ============================================
// 📌 ANTI LINK FUNCTIONS
// ============================================
const ANTI_LINK_FILE = path.join(__dirname, '..', 'database', 'antilink.json');

// Initialize anti-link settings
const initAntiLink = () => {
    if (!fs.existsSync(ANTI_LINK_FILE)) {
        fs.ensureDirSync(path.dirname(ANTI_LINK_FILE));
        fs.writeJSONSync(ANTI_LINK_FILE, { groups: {} });
    }
    return JSON.parse(fs.readFileSync(ANTI_LINK_FILE));
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

// Set anti-link status for a group
const setAntiLinkStatus = (groupId, enabled) => {
    try {
        const data = initAntiLink();
        if (!data.groups[groupId]) {
            data.groups[groupId] = {};
        }
        data.groups[groupId].enabled = enabled;
        data.groups[groupId].updatedAt = new Date().toISOString();
        fs.writeJSONSync(ANTI_LINK_FILE, data, { spaces: 2 });
        return true;
    } catch (error) {
        console.error('Error setting anti-link status:', error);
        return false;
    }
};

// Get all groups with anti-link enabled
const getAllAntiLinkGroups = () => {
    try {
        const data = initAntiLink();
        return Object.entries(data.groups)
            .filter(([_, settings]) => settings.enabled)
            .map(([groupId]) => groupId);
    } catch (error) {
        console.error('Error getting anti-link groups:', error);
        return [];
    }
};

// Check if message contains a link
const containsLink = (text) => {
    if (!text) return false;
    
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

// ============================================
// 📌 ANTI DELETE FUNCTIONS
// ============================================
const ANTI_DELETE_FILE = path.join(__dirname, '..', 'database', 'antidelete.json');

// Initialize anti-delete settings
const initAntiDelete = () => {
    if (!fs.existsSync(ANTI_DELETE_FILE)) {
        fs.ensureDirSync(path.dirname(ANTI_DELETE_FILE));
        fs.writeJSONSync(ANTI_DELETE_FILE, { 
            global: { 
                dm: false, 
                group: false, 
                all: false 
            },
            chats: {}
        });
    }
    return JSON.parse(fs.readFileSync(ANTI_DELETE_FILE));
};

// Get anti-delete settings
const getAntiDeleteSettings = () => {
    try {
        return initAntiDelete();
    } catch (error) {
        console.error('Error getting anti-delete settings:', error);
        return { global: { dm: false, group: false, all: false }, chats: {} };
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
        
        // Check specific chat override
        return data.chats[chatId] || false;
    } catch (error) {
        console.error('Error checking anti-delete:', error);
        return false;
    }
};

// Store deleted message
const storeDeletedMessage = async (chatId, messageData) => {
    try {
        const deletedDir = path.join(__dirname, '..', 'database', 'deleted_messages');
        fs.ensureDirSync(deletedDir);
        
        const fileName = `${Date.now()}_${chatId.replace(/[^a-zA-Z0-9]/g, '_')}.json`;
        const filePath = path.join(deletedDir, fileName);
        
        await fs.writeJSON(filePath, {
            chatId,
            timestamp: new Date().toISOString(),
            message: messageData
        }, { spaces: 2 });
        
        // Clean old files (keep last 100)
        const files = await fs.readdir(deletedDir);
        if (files.length > 100) {
            const sorted = files.map(f => ({ 
                name: f, 
                time: fs.statSync(path.join(deletedDir, f)).birthtime 
            })).sort((a, b) => b.time - a.time);
            
            for (let i = 100; i < sorted.length; i++) {
                await fs.remove(path.join(deletedDir, sorted[i].name));
            }
        }
        
        return filePath;
    } catch (error) {
        console.error('Error storing deleted message:', error);
        return null;
    }
};

// Get recent deleted messages
const getRecentDeletedMessages = (limit = 10) => {
    try {
        const deletedDir = path.join(__dirname, '..', 'database', 'deleted_messages');
        if (!fs.existsSync(deletedDir)) return [];
        
        const files = fs.readdirSync(deletedDir);
        const messages = files
            .map(f => {
                try {
                    const filePath = path.join(deletedDir, f);
                    const data = fs.readJSONSync(filePath);
                    return {
                        ...data,
                        filePath,
                        fileName: f
                    };
                } catch {
                    return null;
                }
            })
            .filter(m => m !== null)
            .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
            .slice(0, limit);
        
        return messages;
    } catch (error) {
        console.error('Error getting deleted messages:', error);
        return [];
    }
};

module.exports = {
    // Anti-link functions
    getAntiLinkStatus,
    setAntiLinkStatus,
    getAllAntiLinkGroups,
    containsLink,
    
    // Anti-delete functions
    getAntiDeleteSettings,
    updateAntiDeleteSettings,
    isAntiDeleteEnabled,
    storeDeletedMessage,
    getRecentDeletedMessages
};
