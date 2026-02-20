const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getTimestamp, formatBytes } = require('../lib/functions');
const os = require('os');
const { exec } = require('child_process');
const util = require('util');
const fs = require('fs-extra');
const path = require('path');
const axios = require('axios');

// Promisify exec
const execPromise = util.promisify(exec);

// ============================================
// 📌 FORMAT UPTIME
// ============================================
function formatUptime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// ============================================
// 📌 COMMAND: RUNTIME
// ============================================
cmd({
    pattern: "runtime",
    alias: ["rt", "botruntime"],
    desc: "Show bot runtime",
    category: "general",
    react: "⏱️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const uptime = process.uptime();
        const runtime = formatUptime(uptime);
        
        const startTime = new Date(Date.now() - (uptime * 1000));
        const startDate = startTime.toLocaleDateString();
        const startTimeStr = startTime.toLocaleTimeString();

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 RUNTIME 🐢 〕❖─╮
*│*
*│ ⏱️ Runtime: ${runtime}*
*│ 📅 Started: ${startDate}*
*│ 🕒 Time: ${startTimeStr}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Runtime error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: UPTIME
// ============================================
cmd({
    pattern: "uptime",
    alias: ["up", "botuptime"],
    desc: "Show bot uptime with system info",
    category: "general",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const uptime = process.uptime();
        const formattedUptime = formatUptime(uptime);
        
        // System info
        const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const freeMemory = Math.round(os.freemem() / 1024 / 1024);
        const cpuCores = os.cpus().length;
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        
        // Get ping
        const start = Date.now();
        await conn.sendPresenceUpdate('composing', from);
        const ping = Date.now() - start;

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 UPTIME INFO 🐢 〕❖─╮
*│*
*│ ⏱️ Uptime: ${formattedUptime}*
*│ 📶 Ping: ${ping}ms*
*│*
*│ 💻 SYSTEM INFO*
*│ 🖥️ Platform: ${platform} (${arch})*
*│ 🖧 CPU Cores: ${cpuCores}*
*│ 💾 RAM: ${usedMemory}MB / ${totalMemory}MB*
*│ 💿 Free RAM: ${freeMemory}MB*
*│ 🏠 Host: ${hostname}*
*│*
*│ 🤖 BOT INFO*
*│ 📛 Name: ${config.BOT_NAME}*
*│ 🔰 Version: ${config.version}*
*│ 👑 Owner: ${config.OWNER_NAME}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Uptime error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SCRIPT / REPO
// ============================================
cmd({
    pattern: "script",
    alias: ["repo", "sc", "github"],
    desc: "Show bot script/repository info",
    category: "general",
    react: "📜",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        // Repository links
        const repoLinks = {
            GITHUB: 'https://github.com/Sila-Md/SILA-MD',
            TELEGRAM_CHANNEL: 'https://t.me/sila_tech2',
            TELEGRAM_GROUP: 'https://t.me/sila_md',
            WHATSAPP_CHANNEL: 'https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02',
            SUPPORT_GROUP: 'https://chat.whatsapp.com/IdGNaKt80DEBqirc2ek4ks'
        };

        // Try to fetch GitHub stats
        let stars = '★';
        let forks = '⑂';
        let repoName = 'SILA-MD';
        
        try {
            const response = await axios.get(`https://api.github.com/repos/Sila-Md/SILA-MD`, {
                timeout: 5000
            });
            if (response.data) {
                stars = response.data.stargazers_count || '★';
                forks = response.data.forks_count || '⑂';
                repoName = response.data.name || 'SILA-MD';
            }
        } catch (e) {
            console.log('GitHub API error:', e.message);
        }

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 BOT SCRIPT 🐢 〕❖─╮
*│*
*│ 📦 Repository: ${repoName}*
*│ ⭐ Stars: ${stars}*
*│ 🍴 Forks: ${forks}*
*│*
*│ 🔗 LINKS*
*│*
*│ 📂 GitHub*
*│ ${repoLinks.GITHUB}*
*│ (⭐ Star & 🍴 Fork)*
*│*
*│ 📢 Telegram Channel*
*│ ${repoLinks.TELEGRAM_CHANNEL}*
*│*
*│ 👥 Telegram Group*
*│ ${repoLinks.TELEGRAM_GROUP}*
*│*
*│ 📱 WhatsApp Channel*
*│ ${repoLinks.WHATSAPP_CHANNEL}*
*│*
*│ 🆘 Support Group*
*│ ${repoLinks.SUPPORT_GROUP}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Script error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: GROUPINFO
// ============================================
cmd({
    pattern: "groupinfo2",
    alias: ["ginfo2", "infogroup2"],
    desc: "Show current group information",
    category: "general",
    react: "ℹ️",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;
        const groupDesc = groupMetadata.desc || 'No description';
        const participants = groupMetadata.participants;
        const admins = participants.filter(p => p.admin);
        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        
        // Get group creation date
        const creationDate = new Date(groupMetadata.creation * 1000);
        const created = `${creationDate.toLocaleDateString()} ${creationDate.toLocaleTimeString()}`;
        
        // Get group picture
        let groupPic;
        try {
            groupPic = await conn.profilePictureUrl(from, 'image');
        } catch {
            groupPic = config.IMAGE_PATH;
        }

        const infoText = `╭─❖〔 🐢 GROUP INFO 🐢 〕❖─╮
*│*
*│ 📛 Name: ${groupName}*
*│ 🆔 ID: ${from.split('@')[0]}*
*│ 📅 Created: ${created}*
*│*
*│ 👥 MEMBERS*
*│ 👤 Total: ${participants.length}*
*│ 👑 Admins: ${admins.length}*
*│ 🤖 Bot: @${botJid.split('@')[0]}*
*│*
*│ 👑 ADMIN LIST*
${admins.map(a => `*│ 👤 @${a.id.split('@')[0]}*`).join('\n')}
*│*
*│ 📝 Description:*
*│ ${groupDesc.substring(0, 200)}${groupDesc.length > 200 ? '...' : ''}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: groupPic },
            caption: infoText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [...admins.map(a => a.id), botJid, sender] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Groupinfo error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: USERINFO
// ============================================
cmd({
    pattern: "userinfo",
    alias: ["uinfo", "infouser"],
    desc: "Show user information",
    category: "general",
    react: "👤",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup }) => {
    try {
        // Determine target user
        let targetUser = sender;
        
        if (mek.quoted) {
            targetUser = mek.quoted.sender;
        } else if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            targetUser = mek.mentionedJid[0];
        } else if (args[0]) {
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.length >= 10) {
                targetUser = number + '@s.whatsapp.net';
            }
        }

        // Check if user exists on WhatsApp
        const [exists] = await conn.onWhatsApp(targetUser);
        if (!exists || !exists.exists) {
            return await conn.sendMessage(from, {
                text: "❌ *User not found on WhatsApp!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get user profile picture
        let userPic;
        try {
            userPic = await conn.profilePictureUrl(targetUser, 'image');
        } catch {
            userPic = config.IMAGE_PATH;
        }

        // Get user status/about
        let userStatus = 'No status';
        try {
            const status = await conn.fetchStatus(targetUser);
            userStatus = status.status || 'No status';
        } catch {
            userStatus = 'No status';
        }

        // Get user name
        let userName = targetUser.split('@')[0];
        try {
            const presence = await conn.presenceSubscribe(targetUser);
            if (presence?.name) userName = presence.name;
        } catch {}

        // Check if user is in group
        let isInGroup = false;
        let userRole = 'Member';
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === targetUser);
            isInGroup = !!participant;
            if (participant?.admin === 'admin') userRole = 'Admin';
            if (participant?.admin === 'superadmin') userRole = 'Super Admin';
        }

        const infoText = `╭─❖〔 🐢 USER INFO 🐢 〕❖─╮
*│*
*│ 👤 Name: ${userName}*
*│ 📱 Number: ${targetUser.split('@')[0]}*
*│ 🆔 JID: ${targetUser}*
*│*
*│ ℹ️ About: ${userStatus}*
*│*
*│ 📊 STATUS*
*│ 🟢 WhatsApp: ✅ Registered*
*│ 👥 In Group: ${isInGroup ? '✅ Yes' : '❌ No'}*
*│ 👑 Role: ${userRole}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: userPic },
            caption: infoText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: [targetUser, sender] 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Userinfo error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: PROFILE
// ============================================
cmd({
    pattern: "profile",
    alias: ["myprofile", "me"],
    desc: "Show your profile information",
    category: "general",
    react: "🪪",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        // Get user profile picture
        let userPic;
        try {
            userPic = await conn.profilePictureUrl(sender, 'image');
        } catch {
            userPic = config.IMAGE_PATH;
        }

        // Get user status
        let userStatus = 'No status';
        try {
            const status = await conn.fetchStatus(sender);
            userStatus = status.status || 'No status';
        } catch {
            userStatus = 'No status';
        }

        // Get user name
        let userName = mek.pushName || sender.split('@')[0];

        // Get user role in group
        let userRole = 'Member';
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from);
            const participant = groupMetadata.participants.find(p => p.id === sender);
            if (participant?.admin === 'admin') userRole = 'Admin';
            if (participant?.admin === 'superadmin') userRole = 'Super Admin';
        }

        const infoText = `╭─❖〔 🐢 YOUR PROFILE 🐢 〕❖─╮
*│*
*│ 👤 Name: ${userName}*
*│ 📱 Number: ${sender.split('@')[0]}*
*│ 🆔 JID: ${sender}*
*│*
*│ ℹ️ About: ${userStatus}*
*│*
*│ 📊 STATUS*
*│ 👑 Role: ${userRole}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: userPic },
            caption: infoText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Profile error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: CHECKID
// ============================================
cmd({
    pattern: "checkid",
    alias: ["getid", "id"],
    desc: "Get ID of user/group",
    category: "general",
    react: "🆔",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup }) => {
    try {
        let targetJid = sender;
        let targetName = 'You';

        if (mek.quoted) {
            targetJid = mek.quoted.sender;
            targetName = 'Quoted user';
        } else if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            targetJid = mek.mentionedJid[0];
            targetName = 'Mentioned user';
        } else if (args[0]) {
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.length >= 10) {
                targetJid = number + '@s.whatsapp.net';
                targetName = number;
            }
        }

        const idText = `╭─❖〔 🐢 ID INFO 🐢 〕❖─╮
*│*
*│ 👤 Target: ${targetName}*
*│ 🆔 JID: ${targetJid}*
*│*
*│ 📱 Number: ${targetJid.split('@')[0]}*
*│ 🔌 Type: ${targetJid.includes('g.us') ? 'Group' : 'User'}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: idText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetJid] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Checkid error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: LISTADMIN
// ============================================
cmd({
    pattern: "listadmin",
    alias: ["admins", "adminlist"],
    desc: "List all group admins",
    category: "general",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;
        const admins = groupMetadata.participants.filter(p => p.admin);
        const superAdmins = admins.filter(a => a.admin === 'superadmin');
        const regularAdmins = admins.filter(a => a.admin === 'admin');

        let adminText = `╭─❖〔 🐢 ADMIN LIST 🐢 〕❖─╮
*│ 📛 Group: ${groupName}*
*│ 👥 Total Admins: ${admins.length}*
*│*
`;

        if (superAdmins.length > 0) {
            adminText += `*│ 👑 SUPER ADMINS*\n`;
            superAdmins.forEach((a, i) => {
                adminText += `*│ ${i+1}. @${a.id.split('@')[0]}*\n`;
            });
            adminText += `*│*\n`;
        }

        if (regularAdmins.length > 0) {
            adminText += `*│ 👤 REGULAR ADMINS*\n`;
            regularAdmins.forEach((a, i) => {
                adminText += `*│ ${i+1}. @${a.id.split('@')[0]}*\n`;
            });
            adminText += `*│*\n`;
        }

        adminText += `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: adminText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: admins.map(a => a.id) 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Listadmin error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: LISTGROUP
// ============================================
cmd({
    pattern: "listgroup",
    alias: ["groups", "mylist"],
    desc: "List all groups bot is in",
    category: "general",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner }) => {
    try {
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Owner-only command!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groups = await conn.groupFetchAllParticipating();
        const groupList = Object.values(groups);

        if (groupList.length === 0) {
            return await conn.sendMessage(from, {
                text: "❌ *Bot is not in any groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let groupText = `╭─❖〔 🐢 GROUP LIST 🐢 〕❖─╮
*│ Total Groups: ${groupList.length}*
*│*
`;

        groupList.forEach((g, i) => {
            groupText += `*│ ${i+1}. ${g.subject}*\n`;
            groupText += `*│    ID: ${g.id.split('@')[0]}*\n`;
            groupText += `*│    Members: ${g.participants.length}*\n`;
            if (i < groupList.length - 1) groupText += `*│*\n`;
        });

        groupText += `╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(sender, {
            text: groupText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Listgroup error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: TOTALUSER
// ============================================
cmd({
    pattern: "totaluser",
    alias: ["totalusers", "usercount"],
    desc: "Get total users who have used the bot",
    category: "general",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner }) => {
    try {
        // Get from MongoDB
        const { Session } = require('mongoose').models;
        const totalUsers = await Session.countDocuments();
        
        // Get active users
        const activeUsers = global.activeSockets?.size || 0;

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 USER STATS 🐢 〕❖─╮
*│*
*│ 👥 Total Users: ${totalUsers}*
*│ 🟢 Active Now: ${activeUsers}*
*│*
*│ 📊 DATABASE*
*│ 🗄️ MongoDB: Connected*
*│ 📦 Sessions: ${totalUsers}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Totaluser error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: TOTALGROUP
// ============================================
cmd({
    pattern: "totalgroup",
    alias: ["totalgroups", "groupcount"],
    desc: "Get total groups bot is in",
    category: "general",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const groups = await conn.groupFetchAllParticipating();
        const totalGroups = Object.keys(groups).length;
        
        let totalMembers = 0;
        Object.values(groups).forEach(g => {
            totalMembers += g.participants.length;
        });

        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 GROUP STATS 🐢 〕❖─╮
*│*
*│ 👥 Total Groups: ${totalGroups}*
*│ 👤 Total Members: ${totalMembers}*
*│ 📊 Average: ${totalGroups > 0 ? Math.round(totalMembers / totalGroups) : 0} per group*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Totalgroup error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: REPORT
// ============================================
cmd({
    pattern: "report",
    alias: ["bug", "reportbug"],
    desc: "Report a bug or issue to owner",
    category: "general",
    react: "🐛",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup }) => {
    try {
        const reportText = args.join(' ').trim();
        
        if (!reportText) {
            return await conn.sendMessage(from, {
                text: `📌 *Usage:* .report <your message>\n\nExample: .report Bot not responding in group`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get user info
        const userName = mek.pushName || sender.split('@')[0];
        const groupName = isGroup ? (await conn.groupMetadata(from)).subject : 'Private Chat';
        
        // Send to owner
        const ownerJid = config.OWNER_NUMBER + '@s.whatsapp.net';
        
        const reportToOwner = `╭─❖〔 🐢 BUG REPORT 🐢 〕❖─╮
*│*
*│ 👤 Reporter: ${userName}*
*│ 📱 Number: ${sender.split('@')[0]}*
*│ 📍 Location: ${groupName}*
*│ 🆔 JID: ${sender}*
*│*
*│ 📝 Message:*
*│ ${reportText}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯`;

        await conn.sendMessage(ownerJid, {
            text: reportToOwner,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        });

        // Confirm to user
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 REPORT SENT 🐢 〕❖─╮
*│*
*│ ✅ Your report has been sent to the owner!*
*│*
*│ 📝 Message: ${reportText.substring(0, 50)}${reportText.length > 50 ? '...' : ''}*
*│*
*│ ⏱️ Time: ${new Date().toLocaleTimeString()}*
*│*
*│ ℹ️ Owner will respond soon*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Report error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
