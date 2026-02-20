const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "groupmenu",
    alias: ["gmenu", "grpmenu"],
    desc: "Show all group management commands",
    category: "group",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        const groupMenu = `╭─❖〔 🐢 GROUP MENU 🐢 〕❖─╮
*│*
*│ 👥 ADMIN COMMANDS*
*│*
*│ 👑 .promote @user*
*│    Promote member to admin*
*│*
*│ ⬇️ .demote @user*
*│    Demote admin to member*
*│*
*│ 🔒 .locklink*
*│    Lock group link*
*│*
*│ 🔓 .unlocklink*
*│    Unlock group link*
*│*
*│ 🔄 .resetlink*
*│    Reset group invite link*
*│*
*│ 📝 .setdesc <text>*
*│    Set group description*
*│*
*│ 🏷️ .setname <text>*
*│    Set group name*
*│*
*│ 🖼️ .setppgroup*
*│    Set group profile picture*
*│    (Reply to image)*
*│*
*│ 👋 .welcome on/off*
*│    Toggle welcome message*
*│*
*│ 👋 .goodbye on/off*
*│    Toggle goodbye message*
*│*
*│ 🔗 .link*
*│    Get group invite link*
*│*
*│ 🔇 .mute*
*│    Close group (admins only)*
*│*
*│ 🔊 .unmute*
*│    Open group (all members)*
*│*
*│ ➕ .add <number>*
*│    Add member to group*
*│*
*│ 👢 .kick @user*
*│    Remove member from group*
*│*
*│ 📋 .tagall*
*│    Mention all members*
*│*
*│ ℹ️ .groupinfo*
*│    Show group information*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        let caption = groupMenu;
        
        // If in group, add group name
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from);
            const groupName = groupMetadata.subject;
            caption = `╭─❖〔 🐢 GROUP MENU 🐢 〕❖─╮
*│ 📛 Group: ${groupName}*
*│ 👥 Members: ${groupMetadata.participants.length}*
${groupMenu.split('\n').slice(1).join('\n')}`;
        }

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: caption,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Groupmenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: TAGALL
// ============================================
cmd({
    pattern: "tagall",
    alias: ["mentionall", "everyone"],
    desc: "Mention all group members",
    category: "group",
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

        // Check if user is admin or owner
        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Only group admins can use tagall!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groupMetadata = await conn.groupMetadata(from);
        const participants = groupMetadata.participants;
        const groupName = groupMetadata.subject;
        
        const mentions = participants.map(p => p.id);
        const message = args.join(' ') || '📢 *Attention everyone!*';

        const tagallText = `╭─❖〔 🐢 TAGALL 🐢 〕❖─╮
*│ 📛 Group: ${groupName}*
*│ 👥 Members: ${participants.length}*
*│ ${message}:*
${participants.map(p => `*│ 👤 @${p.id.split('@')[0]}*`).join('\n')}
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: tagallText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: mentions 
            })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Tagall error:', error);
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
    pattern: "groupinfo",
    alias: ["ginfo", "infogroup"],
    desc: "Show group information",
    category: "group",
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
        
        // Get group settings from database
        const { groupDB } = require('../lib/database');
        const settings = await groupDB.getGroupSettings(from);
        
        const groupPic = await conn.profilePictureUrl(from, 'image').catch(() => config.IMAGE_PATH);

        const infoText = `╭─❖〔 🐢 GROUP INFO 🐢 〕❖─╮
*│*
*│ 📛 Name: ${groupName}*
*│ 🆔 ID: ${from.split('@')[0]}*
*│ 👥 Members: ${participants.length}*
*│ 👑 Admins: ${admins.length}*
*│ 📅 Created: ${new Date(groupMetadata.creation * 1000).toLocaleDateString()}*
*│*
*│ ⚙️ SETTINGS*
*│ 🔒 Link Lock: ${settings.linkLocked ? '✅ ON' : '❌ OFF'}*
*│ 👋 Welcome: ${settings.welcome ? '✅ ON' : '❌ OFF'}*
*│ 👋 Goodbye: ${settings.goodbye ? '✅ ON' : '❌ OFF'}*
*│*
*│ 📝 Description:*
*│ ${groupDesc.substring(0, 100)}${groupDesc.length > 100 ? '...' : ''}*
*│*
*│ 👑 Admins List:*
${admins.map(a => `*│ 👤 @${a.id.split('@')[0]}*`).join('\n')}
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: groupPic },
            caption: infoText,
            contextInfo: getContextInfo({ 
                sender: sender, 
                mentionedJid: admins.map(a => a.id) 
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

// Helper function to check if user is group admin
async function isGroupAdmin(conn, groupJid, userJid) {
    try {
        const groupMetadata = await conn.groupMetadata(groupJid);
        const participant = groupMetadata.participants.find(p => p.id === userJid);
        return participant?.admin === 'admin' || participant?.admin === 'superadmin';
    } catch {
        return false;
;
    }
}
