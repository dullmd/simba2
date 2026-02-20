const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getTimestamp } = require('../lib/functions');
const { groupDB, userDB } = require('../lib/database');
const ms = require('ms');

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
// 📌 GET MENTIONED OR QUOTED USER
// ============================================
function getTargetUser(mek, args) {
    if (mek.quoted) return mek.quoted.sender;
    if (mek.mentionedJid && mek.mentionedJid.length > 0) return mek.mentionedJid[0];
    if (args[0]) {
        let number = args[0].replace(/[^0-9]/g, '');
        if (number.length >= 10) return number + '@s.whatsapp.net';
    }
    return null;
}

// ============================================
// 📌 FORMAT GROUP MESSAGE
// ============================================
function formatGroupMessage(title, content, groupName = '') {
    return `╭─❖〔 🐢 ${title} 🐢 〕❖─╮
*│ 🐢 ${content}*
*│*
*│ 📛 Group : ${groupName}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 COMMAND: SLOWMODE
// ============================================
cmd({
    pattern: "slowmode",
    alias: ["slow", "antispam"],
    desc: "Toggle slow mode (cooldown between messages)",
    category: "group",
    react: "🐢",
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
                text: "❌ *Only group admins can toggle slow mode!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .slowmode on / .slowmode off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { slowmode: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('SLOW MODE', 
                `🐢 *Slow mode: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `⏱️ *Members must wait between messages*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Slowmode error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET WELCOME TEXT
// ============================================
cmd({
    pattern: "setwelcome",
    alias: ["setwelcometext"],
    desc: "Set custom welcome message",
    category: "group",
    react: "👋",
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
                text: "❌ *Only group admins can set welcome message!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const welcomeText = args.join(' ').trim();
        if (!welcomeText) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setwelcome <your welcome message>\n\nUse @user to mention the new member",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await groupDB.updateGroupSettings(from, { welcomeText: welcomeText });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('WELCOME TEXT SET', 
                `✅ *Welcome message updated*\n\n📝 *New text:*\n${welcomeText}\n\n👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setwelcome error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET GOODBYE TEXT
// ============================================
cmd({
    pattern: "setgoodbye",
    alias: ["setgoodbyetext"],
    desc: "Set custom goodbye message",
    category: "group",
    react: "👋",
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
                text: "❌ *Only group admins can set goodbye message!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const goodbyeText = args.join(' ').trim();
        if (!goodbyeText) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setgoodbye <your goodbye message>\n\nUse @user to mention the leaving member",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await groupDB.updateGroupSettings(from, { goodbyeText: goodbyeText });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('GOODBYE TEXT SET', 
                `✅ *Goodbye message updated*\n\n📝 *New text:*\n${goodbyeText}\n\n👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setgoodbye error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET RULES
// ============================================
cmd({
    pattern: "setrules",
    alias: ["addrules", "newrule"],
    desc: "Set group rules",
    category: "group",
    react: "📜",
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
                text: "❌ *Only group admins can set rules!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const rulesText = args.join(' ').trim();
        if (!rulesText) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setrules <your group rules>\n\nSeparate rules with | or new lines",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await groupDB.updateGroupSettings(from, { rules: rulesText });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('RULES SET', 
                `✅ *Group rules updated*\n\n📜 *New rules:*\n${rulesText}\n\n👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setrules error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: RULES
// ============================================
cmd({
    pattern: "rules",
    alias: ["grouprules", "viewrules"],
    desc: "View group rules",
    category: "group",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const settings = await groupDB.getGroupSettings(from);
        const rules = settings.rules || 'No rules set for this group.';
        
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 GROUP RULES 🐢 〕❖─╮
*│ 📛 ${groupName}*
*│*
${rules.split('\n').map(line => `*│ 📜 ${line}*`).join('\n')}
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Rules error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 WARN SYSTEM DATABASE
// ============================================
const warnDB = {
    async getWarns(groupId, userId) {
        const settings = await groupDB.getGroupSettings(groupId);
        return settings.warns?.[userId] || 0;
    },
    
    async addWarn(groupId, userId, reason = 'No reason') {
        const settings = await groupDB.getGroupSettings(groupId);
        if (!settings.warns) settings.warns = {};
        if (!settings.warns[userId]) settings.warns[userId] = { count: 0, reasons: [] };
        
        settings.warns[userId].count += 1;
        settings.warns[userId].reasons.push({
            reason: reason,
            time: getTimestamp(),
            by: userId
        });
        
        await groupDB.updateGroupSettings(groupId, settings);
        return settings.warns[userId].count;
    },
    
    async clearWarns(groupId, userId) {
        const settings = await groupDB.getGroupSettings(groupId);
        if (settings.warns?.[userId]) {
            delete settings.warns[userId];
            await groupDB.updateGroupSettings(groupId, settings);
        }
        return true;
    },
    
    async getWarnList(groupId) {
        const settings = await groupDB.getGroupSettings(groupId);
        return settings.warns || {};
    }
};

// ============================================
// 📌 COMMAND: WARN
// ============================================
cmd({
    pattern: "warn",
    alias: ["warning"],
    desc: "Warn a member",
    category: "group",
    react: "⚠️",
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
                text: "❌ *Only group admins can warn members!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .warn @user <reason>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const reason = args.slice(1).join(' ') || 'No reason provided';
        
        const warnCount = await warnDB.addWarn(from, targetUser, reason);
        
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 WARNING 🐢 〕❖─╮
*│ 👤 User: @${targetUser.split('@')[0]}*
*│ ⚠️ Warn: ${warnCount}*
*│ 📝 Reason: ${reason}*
*│ 👤 By: @${sender.split('@')[0]}*
*│*
*│ ⚡ Total warns: ${warnCount}/3*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

        // Auto kick if 3 warns
        if (warnCount >= 3) {
            await conn.groupParticipantsUpdate(from, [targetUser], 'remove');
            await warnDB.clearWarns(from, targetUser);
            
            await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 AUTO KICK 🐢 〕❖─╮
*│ 👤 @${targetUser.split('@')[0]}*
*│ ⚠️ Reached 3 warns*
*│ 👢 Automatically removed*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser] })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error('Warn error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: WARNLIST
// ============================================
cmd({
    pattern: "warnlist",
    alias: ["warns", "allwarns"],
    desc: "Show all warned members",
    category: "group",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isOwner }) => {
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
                text: "❌ *Only group admins can view warn list!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const warns = await warnDB.getWarnList(from);
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        if (Object.keys(warns).length === 0) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 WARNS 🐢 〕❖─╮
*│ 📛 ${groupName}*
*│*
*│ ✅ No warned members*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let warnText = `╭─❖〔 🐢 WARNS 🐢 〕❖─╮
*│ 📛 ${groupName}*
*│*
`;
        const mentions = [];
        for (const [userId, data] of Object.entries(warns)) {
            warnText += `*│ 👤 @${userId.split('@')[0]} : ${data.count} warns*\n`;
            mentions.push(userId);
        }
        warnText += `*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: warnText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: mentions })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Warnlist error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: CLEARWARN
// ============================================
cmd({
    pattern: "clearwarn",
    alias: ["removewarn", "resetwarn"],
    desc: "Clear warnings for a user",
    category: "group",
    react: "✅",
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
                text: "❌ *Only group admins can clear warnings!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .clearwarn @user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await warnDB.clearWarns(from, targetUser);

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('WARN CLEARED', 
                `✅ *Warnings cleared for @${targetUser.split('@')[0]}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Clearwarn error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: KICKALL
// ============================================
cmd({
    pattern: "kickall",
    alias: ["removeall", "cleargroup"],
    desc: "Remove all non-admin members",
    category: "group",
    react: "👢",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isOwner }) => {
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
                text: "❌ *Only group admins can kick all members!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groupMetadata = await conn.groupMetadata(from);
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        
        const membersToRemove = groupMetadata.participants
            .filter(p => p.admin === null && p.id !== botJid)
            .map(p => p.id);

        if (membersToRemove.length === 0) {
            return await conn.sendMessage(from, {
                text: "❌ *No members to remove!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: `⚠️ *Removing ${membersToRemove.length} members...*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Remove in batches of 50
        const batchSize = 50;
        for (let i = 0; i < membersToRemove.length; i += batchSize) {
            const batch = membersToRemove.slice(i, i + batchSize);
            await conn.groupParticipantsUpdate(from, batch, 'remove');
            await new Promise(r => setTimeout(r, 2000));
        }

        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('GROUP CLEANED', 
                `🧹 *Removed ${membersToRemove.length} members*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `✅ *Only admins remain*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Kickall error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ONLYADMIN
// ============================================
cmd({
    pattern: "onlyadmin",
    alias: ["adminonly"],
    desc: "Toggle admin-only mode",
    category: "group",
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
                text: "❌ *Only group admins can toggle admin-only mode!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .onlyadmin on / .onlyadmin off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        
        // Set group to announcement mode
        await conn.groupSettingUpdate(from, enabled ? 'announcement' : 'not_announcement');
        await groupDB.updateGroupSettings(from, { onlyAdmin: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('ADMIN ONLY', 
                `👑 *Admin-only mode: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `${enabled ? '🔇 Only admins can send messages' : '🔊 All members can send messages'}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Onlyadmin error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 LEVELING SYSTEM DATABASE
// ============================================
const levelDB = {
    async getLevel(groupId, userId) {
        const settings = await groupDB.getGroupSettings(groupId);
        return settings.levels?.[userId] || { xp: 0, level: 1 };
    },
    
    async addXP(groupId, userId, amount = 10) {
        const settings = await groupDB.getGroupSettings(groupId);
        if (!settings.levels) settings.levels = {};
        if (!settings.levels[userId]) settings.levels[userId] = { xp: 0, level: 1 };
        
        settings.levels[userId].xp += amount;
        
        // Level up formula: level * 100 XP
        const nextLevel = Math.floor(settings.levels[userId].xp / 100) + 1;
        if (nextLevel > settings.levels[userId].level) {
            settings.levels[userId].level = nextLevel;
            await groupDB.updateGroupSettings(groupId, settings);
            return { leveledUp: true, newLevel: nextLevel };
        }
        
        await groupDB.updateGroupSettings(groupId, settings);
        return { leveledUp: false };
    },
    
    async resetXP(groupId, userId) {
        const settings = await groupDB.getGroupSettings(groupId);
        if (settings.levels?.[userId]) {
            settings.levels[userId] = { xp: 0, level: 1 };
            await groupDB.updateGroupSettings(groupId, settings);
        }
        return true;
    }
};

// ============================================
// 📌 COMMAND: LEVELING
// ============================================
cmd({
    pattern: "leveling",
    alias: ["levels", "xp"],
    desc: "Toggle leveling system",
    category: "group",
    react: "📊",
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
                text: "❌ *Only group admins can toggle leveling!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .leveling on / .leveling off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { leveling: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('LEVELING', 
                `📊 *Leveling system: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `${enabled ? '🎮 Members gain XP by chatting' : '⏸️ XP gain paused'}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Leveling error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: RESETXP
// ============================================
cmd({
    pattern: "resetxp",
    alias: ["clearxp"],
    desc: "Reset XP for a user",
    category: "group",
    react: "🔄",
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
                text: "❌ *Only group admins can reset XP!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .resetxp @user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await levelDB.resetXP(from, targetUser);

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('XP RESET', 
                `🔄 *XP reset for @${targetUser.split('@')[0]}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Resetxp error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: DETECTEDIT
// ============================================
cmd({
    pattern: "detectedit",
    alias: ["antiedit", "trackedit"],
    desc: "Toggle edit message detection",
    category: "group",
    react: "✏️",
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
                text: "❌ *Only group admins can toggle edit detection!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .detectedit on / .detectedit off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { detectEdit: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('EDIT DETECTION', 
                `✏️ *Edit detection: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `${enabled ? '👀 Bot will detect edited messages' : '👁️ Edit detection disabled'}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Detectedit error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTOREMOVE
// ============================================
cmd({
    pattern: "autoremove",
    alias: ["cleanup", "autodel"],
    desc: "Auto-remove inactive members after X days",
    category: "group",
    react: "🧹",
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
                text: "❌ *Only group admins can set auto-remove!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const timeString = args[0]?.toLowerCase();
        if (!timeString) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autoremove 7d (7 days) / off\n\nExamples:\n.autoremove 7d\n.autoremove 30d\n.autoremove off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let days = 0;
        let enabled = false;
        
        if (timeString !== 'off') {
            const match = timeString.match(/^(\d+)d$/);
            if (!match) {
                return await conn.sendMessage(from, {
                    text: "❌ *Invalid format! Use numbers followed by 'd' (e.g., 7d)*",
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
            days = parseInt(match[1]);
            enabled = true;
        }

        await groupDB.updateGroupSettings(from, { 
            autoRemove: enabled,
            autoRemoveDays: days 
        });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('AUTO REMOVE', 
                `🧹 *Auto-remove: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `${enabled ? `⏱️ Members inactive for ${days} days will be removed` : '⏸️ Auto-remove disabled'}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autoremove error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 EDIT DETECTION HANDLER
// ============================================
cmd({ on: "messages.update" }, async (conn, update) => {
    try {
        for (const { key, update } of update) {
            if (key.remoteJid?.endsWith('@g.us') && update.message) {
                const settings = await groupDB.getGroupSettings(key.remoteJid);
                
                if (settings.detectEdit) {
                    const originalMsg = update.message;
                    const editedMsg = update.message;
                    
                    if (originalMsg && editedMsg) {
                        await conn.sendMessage(key.remoteJid, {
                            text: `╭─❖〔 🐢 EDIT DETECTED 🐢 〕❖─╮
*│ 👤 User: @${key.participant.split('@')[0]}*
*│ ✏️ Edited a message*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                            contextInfo: { mentionedJid: [key.participant] }
                        });
                    }
                }
            }
        }
    } catch (error) {
        console.error('Edit detection error:', error);
    }
});

// ============================================
// 📌 LEVELING HANDLER
// ============================================
cmd({ on: "messages.upsert" }, async (conn, { messages }) => {
    try {
        const msg = messages[0];
        if (!msg.message || msg.key.remoteJid === 'status@broadcast') return;
        
        const from = msg.key.remoteJid;
        if (!from.endsWith('@g.us')) return;
        
        const settings = await groupDB.getGroupSettings(from);
        
        if (settings.leveling && !msg.key.fromMe) {
            const sender = msg.key.participant || msg.key.remoteJid;
            
            // Add XP for sending message
            const result = await levelDB.addXP(from, sender, 10);
            
            if (result.leveledUp) {
                await conn.sendMessage(from, {
                    text: `╭─❖〔 🐢 LEVEL UP 🐢 〕❖─╮
*│ 👤 @${sender.split('@')[0]}*
*│ 📊 Reached level ${result.newLevel}!*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                    contextInfo: { mentionedJid: [sender] }
                });
            }
        }
    } catch (error) {
        console.error('Leveling handler error:', error);
    }
});
