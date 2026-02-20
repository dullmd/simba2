const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { groupDB } = require('../lib/database');
const axios = require('axios');

// ============================================
// 📌 CHECK IF USER IS GROUP ADMIN
// ============================================
async function isGroupAdmin(conn, groupJid, userJid) {
    try {
        const groupMetadata = await conn.groupMetadata(groupJid);
        const participant = groupMetadata.participants.find(p => p.id === userJid);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
    }
}

// ============================================
// 📌 FORMAT SECURITY MESSAGE
// ============================================
function formatSecurityMessage(title, content, groupName = '') {
    return `╭─❖〔 🐢 ${title} 🐢 〕❖─╮
*│ 🐢 ${content}*
*│*
*│ 📛 Group : ${groupName}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 COMMAND: SECURITY MENU
// ============================================
cmd({
    pattern: "securitymenu",
    alias: ["antimenu", "secmenu"],
    desc: "Show all security & anti commands",
    category: "security",
    react: "🛡️",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        let groupName = '';
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from);
            groupName = groupMetadata.subject;
        }

        const securityMenu = `╭─❖〔 🛡️ SECURITY MENU 🛡️ 〕❖─╮
*│*
*│ 🔗 LINK PROTECTION*
*│    .antilink on/off*
*│    .antilinkgc on/off*
*│*
*│ 🗑️ DELETE PROTECTION*
*│    .antidelete on/off*
*│*
*│ 📝 WORD PROTECTION*
*│    .antibadword on/off*
*│*
*│ ⚡ SPAM PROTECTION*
*│    .antispam on/off*
*│    .antiflood on/off*
*│*
*│ 👥 FAKE PROTECTION*
*│    .antifake on/off*
*│    .antibot on/off*
*│*
*│ 📢 TAG PROTECTION*
*│    .antitagall on/off*
*│*
*│ 👑 ADMIN PROTECTION*
*│    .antipromote on/off*
*│    .antidemote on/off*
*│*
*│ 👁️ MEDIA PROTECTION*
*│    .antiviewonce on/off*
*│    .antimedia on/off*
*│*
*│ 📞 CALL PROTECTION*
*│    .anticall on/off*
*│*
*│ 🦠 VIRUS PROTECTION*
*│    .antivirus on/off*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: securityMenu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Security menu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTILINK (General Links)
// ============================================
cmd({
    pattern: "antilink",
    alias: ["antilinkgc"],
    desc: "Toggle anti-link protection",
    category: "security",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antilink!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antilink on / .antilink off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antilink: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI LINK', 
                `🔗 *Anti-Link: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antilink error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIBADWORD
// ============================================
cmd({
    pattern: "antibadword",
    alias: ["antibad", "filterwords"],
    desc: "Toggle bad word filter",
    category: "security",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antibadword!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antibadword on / .antibadword off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antibadword: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI BAD WORD', 
                `📝 *Anti-Bad Word: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antibadword error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTISPAM
// ============================================
cmd({
    pattern: "antispam",
    alias: ["antispamming"],
    desc: "Toggle anti-spam protection",
    category: "security",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antispam!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antispam on / .antispam off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antispam: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI SPAM', 
                `⚡ *Anti-Spam: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antispam error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIFAKE
// ============================================
cmd({
    pattern: "antifake",
    alias: ["fakeaccount"],
    desc: "Toggle anti-fake account protection",
    category: "security",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antifake!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antifake on / .antifake off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antifake: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI FAKE', 
                `👥 *Anti-Fake Account: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antifake error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIBOT
// ============================================
cmd({
    pattern: "antibot",
    alias: ["antibotaccount"],
    desc: "Toggle anti-bot account protection",
    category: "security",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antibot!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antibot on / .antibot off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antibot: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI BOT', 
                `🤖 *Anti-Bot Account: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antibot error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTITAGALL
// ============================================
cmd({
    pattern: "antitagall",
    alias: ["antitag"],
    desc: "Toggle anti-tagall protection",
    category: "security",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antitagall!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antitagall on / .antitagall off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antitagall: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI TAGALL', 
                `📢 *Anti-TagAll: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antitagall error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIPROMOTE
// ============================================
cmd({
    pattern: "antipromote",
    alias: ["antiprom"],
    desc: "Toggle anti-promote protection",
    category: "security",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antipromote!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antipromote on / .antipromote off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antipromote: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI PROMOTE', 
                `👑 *Anti-Promote: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antipromote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIDEMOTE
// ============================================
cmd({
    pattern: "antidemote",
    alias: ["antidem"],
    desc: "Toggle anti-demote protection",
    category: "security",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antidemote!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antidemote on / .antidemote off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antidemote: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI DEMOTE', 
                `⬇️ *Anti-Demote: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antidemote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIVIEWONCE
// ============================================
cmd({
    pattern: "antiviewonce",
    alias: ["antivo", "antivv"],
    desc: "Toggle anti-view-once protection",
    category: "security",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antiviewonce!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antiviewonce on / .antiviewonce off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antiviewonce: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI VIEW ONCE', 
                `👁️ *Anti-ViewOnce: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antiviewonce error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIMEDIA
// ============================================
cmd({
    pattern: "antimedia",
    alias: ["antifiles"],
    desc: "Toggle anti-media protection",
    category: "security",
    react: "📎",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antimedia!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antimedia on / .antimedia off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antimedia: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI MEDIA', 
                `📎 *Anti-Media: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antimedia error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIFLOOD
// ============================================
cmd({
    pattern: "antiflood",
    alias: ["antiflooding"],
    desc: "Toggle anti-flood protection",
    category: "security",
    react: "🌊",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can toggle antiflood!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antiflood on / .antiflood off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { antiflood: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI FLOOD', 
                `🌊 *Anti-Flood: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antiflood error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTICALL
// ============================================
cmd({
    pattern: "anticall",
    alias: ["blockcalls"],
    desc: "Toggle anti-call protection",
    category: "security",
    react: "📞",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner }) => {
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only bot owner can toggle anticall!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .anticall on / .anticall off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.ANTICALL = enabled;

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI CALL', 
                `📞 *Anti-Call: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, 'Bot Settings'),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Anticall error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ANTIVIRUS
// ============================================
cmd({
    pattern: "antivirus",
    alias: ["antimalware"],
    desc: "Toggle anti-virus protection",
    category: "security",
    react: "🦠",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        const isAdmin = isGroup ? await isGroupAdmin(conn, from, sender) : false;
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only admins can toggle antivirus!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .antivirus on / .antivirus off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        
        if (isGroup) {
            await groupDB.updateGroupSettings(from, { antivirus: enabled });
        } else {
            config.ANTIVIRUS = enabled;
        }

        let location = isGroup ? 'Group' : 'Bot';
        const groupName = isGroup ? (await conn.groupMetadata(from)).subject : 'Bot Settings';

        await conn.sendMessage(from, {
            text: formatSecurityMessage('ANTI VIRUS', 
                `🦠 *Anti-Virus: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `📍 *Location: ${location}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Antivirus error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
