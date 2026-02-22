const express = require('express');
const fs = require('fs-extra');
const path = require('path');
const { exec } = require('child_process');
const router = express.Router();
const pino = require('pino');
const cheerio = require('cheerio');
const moment = require('moment-timezone');
const Jimp = require('jimp');
const crypto = require('crypto');
const axios = require('axios');
const FormData = require("form-data");
const os = require('os'); 
const mongoose = require('mongoose');
const {
    default: makeWASocket,
    useMultiFileAuthState,
    delay,
    getContentType,
    makeCacheableSignalKeyStore,
    Browsers,
    jidNormalizedUser,
    downloadContentFromMessage,
    proto,
    prepareWAMessageMedia,
    generateWAMessageFromContent,
    generateWAMessage,
    S_WHATSAPP_NET
} = require('@whiskeysockets/baileys');

// ============================================
// 📌 LOAD CONFIGURATION
// ============================================
const config = require('../config');

// ============================================
// 📌 MONGODB CONNECTION
// ============================================
mongoose.connect(config.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
}).then(() => {
  console.log('✅ Connected to MongoDB');
}).catch(err => {
  console.error('❌ MongoDB connection error:', err);
  process.exit(1);
});

// ============================================
// 📌 MONGODB SCHEMAS
// ============================================
const sessionSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  sessionId: { type: String },
  settings: { type: Object, default: {} },
  creds: { type: Object },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const settingsSchema = new mongoose.Schema({
  number: { type: String, required: true, unique: true },
  settings: { type: Object, default: {} },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// 📌 ANTI-DELETE & ANTI-LINK SCHEMAS
// ============================================
const antiDeleteSchema = new mongoose.Schema({
  groupJid: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

const antiLinkSchema = new mongoose.Schema({
  groupJid: { type: String, required: true, unique: true },
  enabled: { type: Boolean, default: false },
  action: { type: String, default: 'delete' }, // 'delete', 'warn', 'kick'
  allowedLinks: { type: [String], default: [] }, // Allowed links (e.g., 'chat.whatsapp.com')
  warnCount: { type: Number, default: 3 }, // Warn count before kick
  updatedAt: { type: Date, default: Date.now }
});

const warnSchema = new mongoose.Schema({
  groupJid: { type: String, required: true },
  userJid: { type: String, required: true },
  count: { type: Number, default: 0 },
  reasons: { type: [String], default: [] },
  updatedAt: { type: Date, default: Date.now }
});

// ============================================
// 📌 MONGODB MODELS
// ============================================
const Session = mongoose.model('Session', sessionSchema);
const Settings = mongoose.model('Settings', settingsSchema);
const AntiDelete = mongoose.model('AntiDelete', antiDeleteSchema);
const AntiLink = mongoose.model('AntiLink', antiLinkSchema);
const Warn = mongoose.model('Warn', warnSchema);

// ============================================
// 📌 GLOBAL VARIABLES
// ============================================
const activeSockets = new Map();
const socketCreationTime = new Map();
const SESSION_BASE_PATH = './session';
const NUMBER_LIST_PATH = './numbers.json';
const otpStore = new Map();

// Store deleted messages for anti-delete
const deletedMessagesCache = new Map(); // key: messageId, value: { message, timestamp }

// ============================================
// 📌 LOAD FUNCTIONS & DATABASE
// ============================================
const { 
    sms, 
    downloadMediaMessage,
    formatMessage,
    formatBytes,
    generateOTP,
    getTimestamp,
    cleanDuplicateFiles,
    resize,
    capital,
    createSerial,
    getContextInfo,
    fkontak
} = require('../lib/functions');

const db = require('../lib/database');

// ============================================
// 📌 GROUP EVENTS HANDLER
// ============================================
const GroupEvents = async (conn, update) => {
    try {
        const { id, participants, action } = update;
        
        if (action === 'add') {
            for (let participant of participants) {
                // Welcome message
                await conn.sendMessage(id, {
                    text: `┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ━━━━━━━━━━━\n┃ 👋 @${participant.split('@')[0]}\n┃ 🎉 Welcome to the group!\n┃ 📌 Please read the description\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [participant]
                });
            }
        } else if (action === 'remove') {
            for (let participant of participants) {
                // Goodbye message
                await conn.sendMessage(id, {
                    text: `┏━❑ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━━━━━\n┃ 👋 @${participant.split('@')[0]}\n┃ 🚶 Left the group\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [participant]
                });
            }
        } else if (action === 'promote') {
            for (let participant of participants) {
                await conn.sendMessage(id, {
                    text: `┏━❑ 𝐀𝐃𝐌𝐈𝐍 ━━━━━━━━━━━━━\n┃ 👑 @${participant.split('@')[0]}\n┃ 📌 Promoted to admin\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [participant]
                });
            }
        } else if (action === 'demote') {
            for (let participant of participants) {
                await conn.sendMessage(id, {
                    text: `┏━❑ 𝐀𝐃𝐌𝐈𝐍 ━━━━━━━━━━━━━\n┃ 👤 @${participant.split('@')[0]}\n┃ 📌 Demoted from admin\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [participant]
                });
            }
        }
    } catch (error) {
        console.error('GroupEvents Error:', error);
    }
};

// ============================================
// 📌 ANTI-DELETE FUNCTIONS
// ============================================

// Get anti-delete status for a group
const getAntiDeleteStatus = async (groupJid) => {
    try {
        const setting = await AntiDelete.findOne({ groupJid });
        return setting ? setting.enabled : false;
    } catch (error) {
        console.error('Error getting anti-delete status:', error);
        return false;
    }
};

// Set anti-delete status for a group
const setAntiDelete = async (groupJid, enabled) => {
    try {
        await AntiDelete.findOneAndUpdate(
            { groupJid },
            { enabled, updatedAt: new Date() },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Error setting anti-delete:', error);
        return false;
    }
};

// Anti-Delete handler
const handleAntiDelete = async (conn, updates) => {
    try {
        for (const update of updates) {
            if (!update.update.message) continue;
            
            const { key } = update;
            if (!key) continue;
            
            const groupJid = key.remoteJid;
            if (!groupJid.endsWith('@g.us')) continue; // Only groups
            
            // Check if anti-delete is enabled for this group
            const isEnabled = await getAntiDeleteStatus(groupJid);
            if (!isEnabled) continue;
            
            // Store deleted message in cache
            if (update.update.message === null) {
                // Try to get original message from store or cache
                const msgId = key.id;
                const deletedMsg = deletedMessagesCache.get(msgId);
                
                if (deletedMsg) {
                    const sender = key.participant || key.remoteJid;
                    const messageContent = deletedMsg.message;
                    
                    let messageType = getContentType(messageContent);
                    let caption = '';
                    
                    if (messageType === 'conversation') {
                        caption = messageContent.conversation;
                    } else if (messageType === 'extendedTextMessage') {
                        caption = messageContent.extendedTextMessage.text;
                    } else if (messageType === 'imageMessage') {
                        caption = messageContent.imageMessage.caption || '[Image]';
                    } else if (messageType === 'videoMessage') {
                        caption = messageContent.videoMessage.caption || '[Video]';
                    } else if (messageType === 'audioMessage') {
                        caption = '[Audio]';
                    } else if (messageType === 'stickerMessage') {
                        caption = '[Sticker]';
                    } else if (messageType === 'documentMessage') {
                        caption = '[Document]';
                    } else {
                        caption = '[Unknown Message]';
                    }
                    
                    // Send anti-delete notification
                    await conn.sendMessage(groupJid, {
                        text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄 ━━━━━━━━━\n┃ 🚨 Someone deleted a message!\n┃ 👤 User: @${sender.split('@')[0]}\n┃ 💬 Message: ${caption}\n┃ ⏰ Time: ${new Date().toLocaleString()}\n┗━━━━━━━━━━━━━━━━━`,
                        mentions: [sender]
                    }, { quoted: fkontak });
                    
                    // Remove from cache after 5 minutes
                    setTimeout(() => {
                        deletedMessagesCache.delete(msgId);
                    }, 300000);
                }
            }
        }
    } catch (error) {
        console.error('AntiDelete Error:', error);
    }
};

// ============================================
// 📌 ANTI-LINK FUNCTIONS
// ============================================

// Common link patterns
const LINK_PATTERNS = [
    /chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/gi,
    /whatsapp\.com\/channel\/([a-zA-Z0-9_-]+)/gi,
    /t\.me\/([a-zA-Z0-9_-]+)/gi,
    /telegram\.me\/([a-zA-Z0-9_-]+)/gi,
    /instagram\.com\/([a-zA-Z0-9_-]+)/gi,
    /facebook\.com\/([a-zA-Z0-9_-]+)/gi,
    /fb\.com\/([a-zA-Z0-9_-]+)/gi,
    /twitter\.com\/([a-zA-Z0-9_-]+)/gi,
    /x\.com\/([a-zA-Z0-9_-]+)/gi,
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/gi,
    /youtu\.be\/([a-zA-Z0-9_-]+)/gi,
    /tiktok\.com\/([a-zA-Z0-9_-]+)/gi,
    /https?:\/\/[^\s]+/gi // Generic link
];

// Get anti-link status for a group
const getAntiLinkStatus = async (groupJid) => {
    try {
        const setting = await AntiLink.findOne({ groupJid });
        return setting ? setting.enabled : false;
    } catch (error) {
        console.error('Error getting anti-link status:', error);
        return false;
    }
};

// Get anti-link settings for a group
const getAntiLinkSettings = async (groupJid) => {
    try {
        const setting = await AntiLink.findOne({ groupJid });
        return setting || { enabled: false, action: 'delete', allowedLinks: [], warnCount: 3 };
    } catch (error) {
        console.error('Error getting anti-link settings:', error);
        return { enabled: false, action: 'delete', allowedLinks: [], warnCount: 3 };
    }
};

// Set anti-link status for a group
const setAntiLink = async (groupJid, enabled, action = 'delete', allowedLinks = []) => {
    try {
        await AntiLink.findOneAndUpdate(
            { groupJid },
            { enabled, action, allowedLinks, updatedAt: new Date() },
            { upsert: true }
        );
        return true;
    } catch (error) {
        console.error('Error setting anti-link:', error);
        return false;
    }
};

// Get warn count for a user in a group
const getUserWarns = async (groupJid, userJid) => {
    try {
        const warn = await Warn.findOne({ groupJid, userJid });
        return warn ? warn.count : 0;
    } catch (error) {
        console.error('Error getting user warns:', error);
        return 0;
    }
};

// Add warn for a user
const addWarn = async (groupJid, userJid, reason = 'Sending link') => {
    try {
        const warn = await Warn.findOneAndUpdate(
            { groupJid, userJid },
            { 
                $inc: { count: 1 },
                $push: { reasons: reason },
                updatedAt: new Date()
            },
            { upsert: true, new: true }
        );
        return warn.count;
    } catch (error) {
        console.error('Error adding warn:', error);
        return 0;
    }
};

// Reset warns for a user
const resetWarns = async (groupJid, userJid) => {
    try {
        await Warn.deleteOne({ groupJid, userJid });
        return true;
    } catch (error) {
        console.error('Error resetting warns:', error);
        return false;
    }
};

// Check if message contains links
const containsLinks = (text, allowedLinks = []) => {
    if (!text) return false;
    
    for (const pattern of LINK_PATTERNS) {
        const matches = text.match(pattern);
        if (matches) {
            // Check if any matched link is allowed
            for (const match of matches) {
                let isAllowed = false;
                for (const allowed of allowedLinks) {
                    if (match.includes(allowed)) {
                        isAllowed = true;
                        break;
                    }
                }
                if (!isAllowed) return true;
            }
        }
    }
    return false;
};

// Anti-Link handler
const handleAntiLink = async (conn, msg, groupJid, sender, text) => {
    try {
        // Get anti-link settings
        const settings = await getAntiLinkSettings(groupJid);
        if (!settings.enabled) return false;
        
        // Check if sender is admin (you can add admin check here)
        // For now, we'll assume non-admin
        
        // Check for links
        if (containsLinks(text, settings.allowedLinks)) {
            // Delete the message
            await conn.sendMessage(groupJid, { delete: msg.key });
            
            // Take action based on settings
            if (settings.action === 'warn' || settings.action === 'kick') {
                const warnCount = await addWarn(groupJid, sender, 'Sending unauthorized link');
                const maxWarns = settings.warnCount || 3;
                
                // Send warning message
                await conn.sendMessage(groupJid, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━\n┃ ⚠️ @${sender.split('@')[0]}\n┃ 🔗 Links are not allowed here!\n┃ 🚨 Warning: ${warnCount}/${maxWarns}\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [sender]
                });
                
                // Kick if max warns reached
                if (settings.action === 'kick' && warnCount >= maxWarns) {
                    await conn.groupParticipantsUpdate(groupJid, [sender], 'remove');
                    await conn.sendMessage(groupJid, {
                        text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━\n┃ 👢 @${sender.split('@')[0]}\n┃ 🚫 Removed for sending links\n┗━━━━━━━━━━━━━━━━━`,
                        mentions: [sender]
                    });
                    await resetWarns(groupJid, sender);
                }
            } else {
                // Just delete and notify
                await conn.sendMessage(groupJid, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━\n┃ ⚠️ @${sender.split('@')[0]}\n┃ 🔗 Links are not allowed here!\n┃ 🗑️ Message deleted\n┗━━━━━━━━━━━━━━━━━`,
                    mentions: [sender]
                });
            }
            
            return true;
        }
        
        return false;
    } catch (error) {
        console.error('AntiLink Handler Error:', error);
        return false;
    }
};

// ============================================
// 📁 LOAD ALL COMMANDS FROM SILATECH FOLDER
// ============================================
const silatechDir = path.join(__dirname, '../silatech');
if (!fs.existsSync(silatechDir)) {
    fs.mkdirSync(silatechDir, { recursive: true });
}

// Command collection
global.commands = new Map();
global.mainCommands = new Set(); // Store main command names

global.cmd = function(cmdInfo, handler) {
    const { pattern, alias = [], category = 'general', react = '✅', desc = '', filename, mainCmd = false } = cmdInfo;
    
    const registerCommand = (cmdName, isMain = false) => {
        if (!global.commands.has(cmdName)) {
            global.commands.set(cmdName, {
                pattern: cmdName,
                handler,
                category,
                react,
                desc,
                filename,
                isMain: isMain || cmdName === pattern // Mark as main if it's the pattern
            });
            
            // If it's a main command, add to mainCommands Set
            if (isMain || cmdName === pattern) {
                global.mainCommands.add(cmdName);
            }
        }
    };
    
    // Register main command (pattern)
    registerCommand(pattern, true);
    
    // Register aliases (but don't mark as main)
    if (Array.isArray(alias)) {
        alias.forEach(aliasName => {
            registerCommand(aliasName, false);
        });
    }
};

// Load all command files
const files = fs.readdirSync(silatechDir).filter(file => file.endsWith('.js'));
console.log(`📦 𝙻𝚘𝚊𝚍𝚒𝚗𝚐 ${files.length} 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜 𝚏𝚛𝚘𝚖 𝚜𝚒𝚕𝚊𝚝𝚎𝚌𝚑...`);

for (const file of files) {
    try {
        require(path.join(silatechDir, file));
        console.log(`   ✅ 𝙻𝚘𝚊𝚍𝚎𝚍: ${file}`);
    } catch (e) {
        console.error(`   ❌ 𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚕𝚘𝚊𝚍 ${file}:`, e.message);
    }
}

console.log(`📊 𝚃𝚘𝚝𝚊𝚕 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${global.commands.size}`);
console.log(`📊 𝙼𝚊𝚒𝚗 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${global.mainCommands.size}`);

// ============================================
// 📌 AUTO-REPLY MESSAGES
// ============================================
const autoReplies = {
    'hi': '*𝙷𝚎𝚕𝚕𝚘! 👋 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚑𝚎𝚕𝚙 𝚢𝚘𝚞 𝚝𝚘𝚍𝚊𝚢?*',
    'mambo': '*𝙿𝚘𝚊 𝚜𝚊𝚗𝚊! 👋 𝙽𝚒𝚔𝚞𝚜𝚊𝚒𝚍𝚒𝚎 𝙺𝚞𝚑𝚞𝚜𝚞?*',
    'hey': '*𝙷𝚎𝚢 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.*',
    'hello': '*𝙷𝚒 𝚝𝚑𝚎𝚛𝚎! 😊 𝚄𝚜𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚊𝚟𝚊𝚒𝚕𝚊𝚋𝚕𝚎 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜.*',
    'bot': '*𝚈𝚎𝚜, 𝙸 𝚊𝚖 𝚂𝙸𝙻𝙰 𝙼𝙳! 🤖 𝙷𝚘𝚠 𝚌𝚊𝚗 𝙸 𝚊𝚜𝚜𝚒𝚜𝚝 𝚢𝚘𝚞?*',
    'menu': '*𝚃𝚢𝚙𝚎 .𝚖𝚎𝚗𝚞 𝚝𝚘 𝚜𝚎𝚎 𝚊𝚕𝚕 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜! 📜*',
    'owner': '*𝙲𝚘𝚗𝚝𝚊𝚌𝚝 𝚘𝚠𝚗𝚎𝚛 𝚞𝚜𝚒𝚗𝚐 .𝚘𝚠𝚗𝚎𝚛 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 👑*',
    'thanks': '*𝚈𝚘𝚞\'𝚛𝚎 𝚠𝚎𝚕𝚌𝚘𝚖𝚎! 😊*',
    'thank you': '*𝙰𝚗𝚢𝚝𝚒𝚖𝚎! 𝙻𝚎𝚝 𝚖𝚎 𝚔𝚗𝚘𝚠 𝚒𝚏 𝚢𝚘𝚞 𝚗𝚎𝚎𝚍 𝚑𝚎𝚕𝚙 🤖*'
};

// ============================================
// 📌 SESSION FUNCTIONS
// ============================================
async function deleteSessionFromDB(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Session.deleteMany({ number: sanitizedNumber });
        await Settings.deleteOne({ number: sanitizedNumber });
        console.log(`Deleted session for ${sanitizedNumber} from MongoDB`);
    } catch (error) {
        console.error('Failed to delete session:', error);
    }
}

async function restoreSession(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const session = await Session.findOne({ number: sanitizedNumber }).sort({ updatedAt: -1 });
        return session ? session.creds : null;
    } catch (error) {
        console.error('Session restore failed:', error);
        return null;
    }
}

async function loadUserConfig(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        const configDoc = await Settings.findOne({ number: sanitizedNumber });
        return { ...config, ...(configDoc?.settings || {}) };
    } catch (error) {
        console.error('Failed to load config:', error);
        return { ...config };
    }
}

async function updateUserConfig(number, newConfig) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        await Settings.findOneAndUpdate(
            { number: sanitizedNumber },
            { $set: newConfig },
            { upsert: true, new: true }
        );
        console.log(`Updated config for ${sanitizedNumber} in MongoDB`);
    } catch (error) {
        console.error('Failed to update config:', error);
        throw error;
    }
}

async function updateNumberList(number) {
    try {
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        let numbers = [];
        if (fs.existsSync(NUMBER_LIST_PATH)) {
            numbers = JSON.parse(fs.readFileSync(NUMBER_LIST_PATH, 'utf8')) || [];
        }
        if (!numbers.includes(sanitizedNumber)) {
            numbers.push(sanitizedNumber);
            fs.writeFileSync(NUMBER_LIST_PATH, JSON.stringify(numbers, null, 2));
        }
    } catch (error) {
        console.error('Failed to update numbers list:', error);
    }
}

// ============================================
// 📌 GROUP FUNCTIONS
// ============================================
async function joinGroup(socket) {
    let retries = config.MAX_RETRIES || 3;
    let inviteCode = 'JlI0FDZ5RpAEbeKvzAPpFt';
    
    if (config.GROUP_INVITE_LINK) {
        const cleanInviteLink = config.GROUP_INVITE_LINK.split('?')[0];
        const inviteCodeMatch = cleanInviteLink.match(/chat\.whatsapp\.com\/(?:invite\/)?([a-zA-Z0-9_-]+)/);
        if (!inviteCodeMatch) {
            console.error('Invalid group invite link format:', config.GROUP_INVITE_LINK);
            return { status: 'failed', error: 'Invalid group invite link' };
        }
        inviteCode = inviteCodeMatch[1];
    }

    while (retries > 0) {
        try {
            const response = await socket.groupAcceptInvite(inviteCode);
            if (response?.gid) {
                console.log(`[ ✅ ] Successfully joined group with ID: ${response.gid}`);
                return { status: 'success', gid: response.gid };
            }
            throw new Error('No group ID in response');
        } catch (error) {
            retries--;
            let errorMessage = error.message || 'Unknown error';
            if (error.message.includes('not-authorized')) {
                errorMessage = 'Bot is not authorized to join (possibly banned)';
            } else if (error.message.includes('conflict')) {
                errorMessage = 'Bot is already a member of the group';
            } else if (error.message.includes('gone') || error.message.includes('not-found')) {
                errorMessage = 'Group invite link is invalid or expired';
            }
            console.warn(`Failed to join group: ${errorMessage} (Retries left: ${retries})`);
            
            if (retries === 0) {
                try {
                    await socket.sendMessage(`${config.OWNER_NUMBER}@s.whatsapp.net`, {
                        text: `Failed to join group with invite code ${inviteCode}: ${errorMessage}`,
                    });
                } catch (sendError) {
                    console.error(`Failed to send failure message to owner: ${sendError.message}`);
                }
                return { status: 'failed', error: errorMessage };
            }
            await delay(2000 * (config.MAX_RETRIES - retries + 1));
        }
    }
    return { status: 'failed', error: 'Max retries reached' };
}

// ============================================
// 📌 NEWSLETTER FUNCTIONS
// ============================================
async function loadNewsletterJIDsFromRaw() {
    try {
        const res = await axios.get('https://raw.githubusercontent.com/mbwa-md/jid/refs/heads/main/newsletter_list.json');
        return Array.isArray(res.data) ? res.data : [];
    } catch (err) {
        console.error('❌ Failed to load newsletter list:', err.message);
        return [];
    }
}

function setupNewsletterHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key) return;

        const allNewsletterJIDs = config.NEWSLETTER_JIDS || [];
        const jid = message.key.remoteJid;

        if (!allNewsletterJIDs.includes(jid)) return;

        try {
            const emojis = config.AUTO_LIKE_EMOJI || ['🩵', '🫶', '😀', '👍', '😶'];
            const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
            const messageId = message.newsletterServerId;

            if (!messageId) return;

            await socket.newsletterReactMessage(jid, messageId.toString(), randomEmoji);
            console.log(`✅ Reacted to newsletter ${jid} with ${randomEmoji}`);
        } catch (error) {
            console.error('⚠️ Newsletter reaction handler failed:', error.message);
        }
    });
}

// ============================================
// 📌 STATUS HANDLERS
// ============================================
async function setupStatusHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const message = messages[0];
        if (!message?.key || message.key.remoteJid !== 'status@broadcast' || !message.key.participant) return;

        try {
            if (config.AUTO_RECORDING === 'true' && message.key.remoteJid) {
                await socket.sendPresenceUpdate("recording", message.key.remoteJid);
            }

            if (config.AUTO_VIEW_STATUS === 'true') {
                await socket.readMessages([message.key]);
            }

            if (config.AUTO_LIKE_STATUS === 'true') {
                const randomEmoji = config.AUTO_LIKE_EMOJI[Math.floor(Math.random() * config.AUTO_LIKE_EMOJI.length)];
                await socket.sendMessage(
                    message.key.remoteJid,
                    { react: { text: randomEmoji, key: message.key } },
                    { statusJidList: [message.key.participant] }
                );
                console.log(`Reacted to status with ${randomEmoji}`);
            }
        } catch (error) {
            console.error('Status handler error:', error);
        }
    });
}

// ============================================
// 📌 AUTO BIO
// ============================================
async function setupAutoBio(socket) {
    try {
        const bios = [
            "🌟 𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝚈𝚘𝚞𝚛 𝚞𝚕𝚝𝚒𝚖𝚊𝚝𝚎 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙 𝚋𝚘𝚝",
            "🚀 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝙸𝙻𝙰 𝚃𝚎𝚌𝚑𝚗𝚘𝚕𝚘𝚐𝚒𝚎𝚜",
            "💫 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎!",
            "🎯 𝙵𝚊𝚜𝚝, 𝚂𝚎𝚌𝚞𝚛𝚎 & 𝚁𝚎𝚕𝚒𝚊𝚋𝚕𝚎",
            "🤖 𝚂𝙸𝙻𝙰 𝙼𝙳 - 𝚈𝚘𝚞𝚛 𝚍𝚒𝚐𝚒𝚝𝚊𝚕 𝚊𝚜𝚜𝚒𝚜𝚝𝚊𝚗𝚝"
        ];
        
        const randomBio = bios[Math.floor(Math.random() * bios.length)];
        await socket.updateProfileStatus(randomBio);
        console.log('✅ Auto bio updated:', randomBio);
    } catch (error) {
        console.error('❌ Failed to update auto bio:', error);
    }
}

// ============================================
// 📌 MESSAGE STORAGE FOR ANTI-DELETE
// ============================================
function storeMessageForAntiDelete(msg) {
    try {
        if (msg.key && msg.key.remoteJid && msg.key.remoteJid.endsWith('@g.us')) {
            const msgId = msg.key.id;
            deletedMessagesCache.set(msgId, {
                message: msg.message,
                timestamp: Date.now()
            });
            
            // Auto cleanup after 10 minutes
            setTimeout(() => {
                deletedMessagesCache.delete(msgId);
            }, 600000); // 10 minutes
        }
    } catch (error) {
        console.error('Error storing message for anti-delete:', error);
    }
}

// ============================================
// 📌 COMMAND HANDLER
// ============================================
function setupCommandHandlers(socket, number) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message) return;

        // Store message for anti-delete
        storeMessageForAntiDelete(msg);

        // Process message using sms function
        const m = sms(socket, msg);
        
        const type = getContentType(msg.message);
        if (!msg.message) return;
        
        msg.message = (getContentType(msg.message) === 'ephemeralMessage') ? 
                      msg.message.ephemeralMessage.message : 
                      msg.message;
        
        const sanitizedNumber = number.replace(/[^0-9]/g, '');
        
        // Extract body text
        let body = '';
        try {
            body = (type === 'conversation') ? msg.message.conversation : 
                   (type == 'imageMessage') && msg.message.imageMessage.caption ? msg.message.imageMessage.caption : 
                   (type == 'videoMessage') && msg.message.videoMessage.caption ? msg.message.videoMessage.caption : 
                   (type == 'extendedTextMessage') ? msg.message.extendedTextMessage.text : 
                   (type == 'buttonsResponseMessage') ? msg.message.buttonsResponseMessage.selectedButtonId : 
                   (type == 'listResponseMessage') ? msg.message.listResponseMessage.singleSelectReply.selectedRowId : 
                   (type == 'templateButtonReplyMessage') ? msg.message.templateButtonReplyMessage.selectedId : '';
        } catch {
            body = '';
        }
        
        // Get sender info
        let sender = msg.key.remoteJid;
        const nowsender = msg.key.fromMe ? (socket.user.id.split(':')[0] + '@s.whatsapp.net' || socket.user.id) : 
                         (msg.key.participant || msg.key.remoteJid);
        const senderNumber = nowsender.split('@')[0];
        const botNumber = socket.user.id.split(':')[0];
        const isbot = botNumber.includes(senderNumber);
        const isOwner = isbot ? isbot : config.OWNER_NUMBER.includes(senderNumber);
        
        // Check for prefix
        let prefix = config.PREFIX;
        let isCmd = body.startsWith(prefix);
        
        // Also check for commands without prefix (if enabled)
        if (!isCmd && config.NO_PREFIX === 'true') {
            // Check if body matches any command pattern
            const cmdName = body.toLowerCase().split(' ')[0];
            if (global.commands.has(cmdName)) {
                isCmd = true;
                prefix = ''; // No prefix
            }
        }
        
        const from = msg.key.remoteJid;
        const isGroup = from.endsWith("@g.us");
        const command = isCmd ? (prefix ? body.slice(prefix.length).trim().split(' ').shift().toLowerCase() : body.toLowerCase().split(' ')[0]) : '';
        var args = body.trim().split(/ +/).slice(1);

        // ============================================
        // 📌 ANTI-LINK HANDLER (for groups)
        // ============================================
        if (isGroup && body && !msg.key.fromMe && !isOwner) {
            const linkHandled = await handleAntiLink(socket, msg, from, nowsender, body);
            if (linkHandled) return; // Stop processing if link was handled
        }

        // Auto-reply handler (only if not a command)
        const lowerBody = body.toLowerCase().trim();
        if (autoReplies[lowerBody] && !isCmd && !isGroup && !msg.key.fromMe) {
            await socket.sendMessage(sender, { 
                text: autoReplies[lowerBody],
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            return;
        }

        // ============================================
        // 📌 CHATBOT AI SYSTEM
        // ============================================
        try {
            // Load chatbot settings from database
            const chatbotSettings = await db.getChatbotSettings();
            
            // If chatbot is enabled, message is not a command, and not from bot
            if (chatbotSettings.global?.enabled && 
                !isCmd && 
                body && 
                !msg.key.fromMe) {
                
                console.log('🤖 Chatbot AI processing message:', body.substring(0, 50));
                
                // Send typing indicator
                await socket.sendPresenceUpdate('composing', from);
                
                try {
                    // Call AI API
                    const apiUrl = `https://api.yupra.my.id/api/ai/gpt5?text=${encodeURIComponent(body.trim())}`;
                    
                    const response = await axios.get(apiUrl, {
                        timeout: 30000,
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    let aiResponse = '';
                    
                    // Parse response
                    if (response.data) {
                        if (typeof response.data === 'string') {
                            aiResponse = response.data;
                        } else if (response.data.result) {
                            aiResponse = response.data.result;
                        } else if (response.data.message) {
                            aiResponse = response.data.message;
                        } else if (response.data.response) {
                            aiResponse = response.data.response;
                        } else if (response.data.data) {
                            aiResponse = response.data.data;
                        } else {
                            aiResponse = JSON.stringify(response.data);
                        }
                    }

                    if (aiResponse) {
                        await socket.sendMessage(from, {
                            text: `┏━❑ 𝙲𝙷𝙰𝚃𝙱𝙾𝚃 𝙰𝙸 ━━━━━━━━━\n┃ 🤖 ${aiResponse}\n┗━━━━━━━━━━━━━━━━━━━━\n> © 𝙿𝚘𝚠𝚎𝚛𝚎𝚍 𝚋𝚢 𝚂𝙸𝙻𝙰-𝙼𝙳`,
                            contextInfo: getContextInfo({ sender: sender })
                        }, { quoted: fkontak });
                    } else {
                        throw new Error('Empty response');
                    }
                    
                } catch (apiError) {
                    console.error('Chatbot API Error:', apiError.message);
                }
            }
        } catch (chatbotError) {
            console.error('Chatbot System Error:', chatbotError);
        }

        // ============================================
        // 📌 COMMAND EXECUTION
        // ============================================
        if (!command) return;

        // Check if command exists
        if (global.commands.has(command)) {
            try {
                const cmd = global.commands.get(command);
                
                // Send reaction
                await socket.sendMessage(sender, { 
                    react: { text: cmd.react || '✅', key: msg.key } 
                }).catch(() => {});
                
                // Execute command
                await cmd.handler(socket, msg, m, { 
                    from, 
                    body, 
                    args, 
                    command,
                    isGroup,
                    isOwner,
                    sender: nowsender,
                    senderNumber,
                    botNumber,
                    prefix,
                    // Pass anti-link functions to commands
                    setAntiLink: async (enabled, action, allowedLinks) => {
                        if (isGroup && isOwner) {
                            return await setAntiLink(from, enabled, action, allowedLinks);
                        }
                        return false;
                    },
                    getAntiLinkStatus: async () => {
                        if (isGroup) {
                            return await getAntiLinkStatus(from);
                        }
                        return false;
                    },
                    // Pass anti-delete functions to commands
                    setAntiDelete: async (enabled) => {
                        if (isGroup && isOwner) {
                            return await setAntiDelete(from, enabled);
                        }
                        return false;
                    },
                    getAntiDeleteStatus: async () => {
                        if (isGroup) {
                            return await getAntiDeleteStatus(from);
                        }
                        return false;
                    }
                });
                
            } catch (cmdError) {
                console.error(`Command error (${command}):`, cmdError);
                await socket.sendMessage(from, {
                    text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${cmdError.message || 'Unknown error'}`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        }
    });
}

// ============================================
// 📌 AUTO RESTART HANDLER
// ============================================
function setupAutoRestart(socket, number) {
    socket.ev.on('connection.update', async (update) => {
        const { connection, lastDisconnect } = update;
        if (connection === 'close') {
            const statusCode = lastDisconnect?.error?.output?.statusCode;
            if (statusCode === 401) {
                console.log(`User ${number} logged out. Deleting session...`);
                
                await deleteSessionFromDB(number);
                
                const sessionPath = path.join(SESSION_BASE_PATH, `session_${number.replace(/[^0-9]/g, '')}`);
                if (fs.existsSync(sessionPath)) {
                    fs.removeSync(sessionPath);
                }

                activeSockets.delete(number.replace(/[^0-9]/g, ''));
                socketCreationTime.delete(number.replace(/[^0-9]/g, ''));

                try {
                    await socket.sendMessage(jidNormalizedUser(socket.user.id), {
                        image: { url: config.IMAGE_PATH },
                        caption: `🗑️ *𝙎𝙀𝙎𝙎𝙄𝙊𝙉 𝘿𝙀𝙇𝙀𝙏𝙀𝘿*\n\n✅ 𝚈𝚘𝚞𝚛 𝚜𝚎𝚜𝚜𝚒𝚘𝚗 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚍𝚎𝚕𝚎𝚝𝚎𝚍 𝚍𝚞𝚎 𝚝𝚘 𝚕𝚘𝚐𝚘𝚞𝚝.`,
                        contextInfo: getContextInfo({ sender: socket.user.id })
                    });
                } catch (error) {
                    console.error(`Failed to notify ${number} about session deletion:`, error);
                }

                console.log(`Session cleanup completed for ${number}`);
            } else {
                console.log(`Connection lost for ${number}, attempting to reconnect...`);
                await delay(10000);
                activeSockets.delete(number.replace(/[^0-9]/g, ''));
                socketCreationTime.delete(number.replace(/[^0-9]/g, ''));
                const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                await EmpirePair(number, mockRes);
            }
        }
    });
}

// ============================================
// 📌 MESSAGE HANDLER (Presence)
// ============================================
function setupMessageHandlers(socket) {
    socket.ev.on('messages.upsert', async ({ messages }) => {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;

        if (config.AUTO_RECORDING === 'true') {
            try {
                await socket.sendPresenceUpdate('recording', msg.key.remoteJid);
            } catch (error) {
                console.error('Failed to set recording presence:', error);
            }
        }
    });
}

// ============================================
// 📌 ANTI-DELETE HANDLER SETUP
// ============================================
function setupAntiDeleteHandler(socket) {
    socket.ev.on('messages.update', async (updates) => {
        await AntiDelete(socket, updates);
    });
}

// ============================================
// 📁 MAIN PAIRING FUNCTION
// ============================================
async function EmpirePair(number, res) {
    const sanitizedNumber = number.replace(/[^0-9]/g, '');
    const sessionPath = path.join(SESSION_BASE_PATH, `session_${sanitizedNumber}`);

    await cleanDuplicateFiles(sanitizedNumber);

    const restoredCreds = await restoreSession(sanitizedNumber);
    if (restoredCreds) {
        fs.ensureDirSync(sessionPath);
        fs.writeFileSync(path.join(sessionPath, 'creds.json'), JSON.stringify(restoredCreds, null, 2));
        console.log(`Successfully restored session for ${sanitizedNumber}`);
    }

    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);
    const logger = pino({ level: process.env.NODE_ENV === 'production' ? 'fatal' : 'debug' });

    try {
        const socket = makeWASocket({
            auth: {
                creds: state.creds,
                keys: makeCacheableSignalKeyStore(state.keys, logger),
            },
            printQRInTerminal: false,
            logger,
            browser: Browsers.macOS('Safari')
        });

        socketCreationTime.set(sanitizedNumber, Date.now());

        // Setup handlers
        setupStatusHandlers(socket);
        setupCommandHandlers(socket, sanitizedNumber);
        setupMessageHandlers(socket);
        setupAutoRestart(socket, sanitizedNumber);
        setupNewsletterHandlers(socket);
        setupAntiDeleteHandler(socket); // Add anti-delete handler
                         
        // Auto bio every hour
        setInterval(() => setupAutoBio(socket), 3600000);

        if (!socket.authState.creds.registered) {
            let retries = config.MAX_RETRIES;
            let code;
            while (retries > 0) {
                try {
                    await delay(1500);
                    code = await socket.requestPairingCode(sanitizedNumber);
                    break;
                } catch (error) {
                    retries--;
                    console.warn(`Failed to request pairing code: ${retries}, ${error.message}`);
                    await delay(2000 * (config.MAX_RETRIES - retries));
                }
            }
            if (!res.headersSent) {
                res.send({ code });
            }
        }

        socket.ev.on('creds.update', async () => {
            await saveCreds();
            const fileContent = await fs.readFile(path.join(sessionPath, 'creds.json'), 'utf8');
            const creds = JSON.parse(fileContent);
            
            await Session.findOneAndUpdate(
                { number: sanitizedNumber },
                { $set: { creds: creds, updatedAt: new Date() } },
                { upsert: true }
            );
            
            console.log(`Updated creds for ${sanitizedNumber} in MongoDB`);
        });

        socket.ev.on('connection.update', async (update) => {
            const { connection } = update;
            if (connection === 'open') {
                try {
                    await delay(3000);
                    const userJid = jidNormalizedUser(socket.user.id);

                    const groupResult = await joinGroup(socket);

                    // Follow newsletters
                    try {
                        const newsletterList = await loadNewsletterJIDsFromRaw();
                        for (const jid of newsletterList) {
                            try {
                                await socket.newsletterFollow(jid);
                                await socket.sendMessage(jid, { react: { text: '❤️', key: { id: '1' } } });
                                console.log(`✅ Followed newsletter: ${jid}`);
                            } catch (err) {
                                console.warn(`⚠️ Failed to follow ${jid}:`, err.message);
                            }
                        }
                        console.log('✅ Auto-followed newsletters');
                    } catch (error) {
                        console.error('❌ Newsletter error:', error.message);
                    }

                    // Load config
                    try {
                        await loadUserConfig(sanitizedNumber);
                    } catch (error) {
                        await updateUserConfig(sanitizedNumber, config);
                    }

                    activeSockets.set(sanitizedNumber, socket);

                    // Welcome message
                    await socket.sendMessage(userJid, {
                        image: { url: config.IMAGE_PATH },
                        caption: `*╭━━━〔 🐢 𝚂𝙸𝙻𝙰 𝙼𝙳 🐢 〕━━━┈⊷*\n*┃🐢│ 𝚂𝚄𝙲𝙲𝙴𝚂𝚂𝙵𝚄𝙻𝙻𝚈 𝙲𝙾𝙽𝙽𝙴𝙲𝚃𝙴𝙳!*\n*┃🐢│ 𝙽𝚄𝙼𝙱𝙴𝚁: ${sanitizedNumber}*\n*┃🐢│ 𝚃𝙸𝙼𝙴: ${new Date().toLocaleString()}*\n*┃🐢│ 𝚃𝚈𝙿𝙴 *${config.PREFIX}𝙼𝙴𝙽𝚄* 𝚃𝙾 𝚂𝚃𝙰𝚁𝚃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n> ${config.BOT_FOOTER}`,
                        contextInfo: getContextInfo({ sender: userJid })
                    }, { quoted: fkontak });

                    // Update number list
                    await updateNumberList(sanitizedNumber);
                    
                } catch (error) {
                    console.error('Connection error:', error);
                    exec(`pm2 restart ${process.env.PM2_NAME || 'SILA-MD'}`);
                }
            }
        });
    } catch (error) {
        console.error('Pairing error:', error);
        socketCreationTime.delete(sanitizedNumber);
        if (!res.headersSent) {
            res.status(503).send({ error: 'Service Unavailable' });
        }
    }
}

// ============================================
// 📌 EXPRESS ROUTES
// ============================================
router.get('/', async (req, res) => {
    const { number } = req.query;
    if (!number) {
        return res.status(400).send({ error: 'Number parameter is required' });
    }

    if (activeSockets.has(number.replace(/[^0-9]/g, ''))) {
        return res.status(200).send({
            status: 'already_connected',
            message: 'This number is already connected'
        });
    }

    await EmpirePair(number, res);
});

router.get('/active', (req, res) => {
    res.status(200).send({
        count: activeSockets.size,
        numbers: Array.from(activeSockets.keys())
    });
});

router.get('/ping', (req, res) => {
    res.status(200).send({
        status: 'active',
        message: '𝚂𝙸𝙻𝙰-𝙼𝙳',
        activesession: activeSockets.size
    });
});

router.get('/reconnect', async (req, res) => {
    try {
        const sessions = await Session.find({}).sort({ updatedAt: -1 });

        if (sessions.length === 0) {
            return res.status(404).send({ error: 'No session files found in MongoDB' });
        }

        const results = [];
        for (const session of sessions) {
            const number = session.number;
            if (activeSockets.has(number)) {
                results.push({ number, status: 'already_connected' });
                continue;
            }

            const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
            try {
                await EmpirePair(number, mockRes);
                results.push({ number, status: 'connection_initiated' });
            } catch (error) {
                console.error(`Failed to reconnect bot for ${number}:`, error);
                results.push({ number, status: 'failed', error: error.message });
            }
            await delay(1000);
        }

        res.status(200).send({
            status: 'success',
            connections: results
        });
    } catch (error) {
        console.error('Reconnect error:', error);
        res.status(500).send({ error: 'Failed to reconnect bots' });
    }
});

// ============================================
// 📌 AUTO RECONNECT FROM DB
// ============================================
async function autoReconnectFromDB() {
    try {
        const sessions = await Session.find({}).sort({ updatedAt: -1 });

        for (const session of sessions) {
            const number = session.number;
            if (!activeSockets.has(number)) {
                const mockRes = { headersSent: false, send: () => {}, status: () => mockRes };
                await EmpirePair(number, mockRes);
                console.log(`🔁 Reconnected from MongoDB: ${number}`);
                await delay(1000);
            }
        }
    } catch (error) {
        console.error('❌ AutoReconnect error:', error.message);
    }
}

// Start auto reconnect
autoReconnectFromDB();

// ============================================
// 📌 CLEANUP ON EXIT
// ============================================
process.on('exit', () => {
    activeSockets.forEach((socket, number) => {
        socket.ws.close();
        activeSockets.delete(number);
        socketCreationTime.delete(number);
    });
    fs.emptyDirSync(SESSION_BASE_PATH);
});

process.on('uncaughtException', (err) => {
    console.error('Uncaught exception:', err);
    exec(`pm2 restart ${process.env.PM2_NAME || 'SILA-MD'}`);
});

module.exports = router;
