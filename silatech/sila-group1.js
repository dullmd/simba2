const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

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
// 📌 COMMAND: MUTE GROUP (Close)
// ============================================
cmd({
    pattern: "mute",
    alias: ["close", "groupclose"],
    desc: "Close group (only admins can send messages)",
    category: "group",
    react: "🔒",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupSettingUpdate(from, 'announcement');
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 🔒 𝙶𝚁𝙾𝚄𝙿 𝙼𝚄𝚃𝙴𝙳 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙶𝚛𝚘𝚞𝚙: ${groupName}*\n*┃ 👤 𝙱𝚢: @${sender.split('@')[0]}*\n*┃*\n*┃ 🔇 𝙾𝚗𝚕𝚢 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚜𝚎𝚗𝚍 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜 𝚗𝚘𝚠*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Mute command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: UNMUTE GROUP (Open)
// ============================================
cmd({
    pattern: "unmute",
    alias: ["open", "groupopen"],
    desc: "Open group (all members can send messages)",
    category: "group",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚞𝚜𝚎 𝚝𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupSettingUpdate(from, 'not_announcement');
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 🔓 𝙶𝚁𝙾𝚄𝙿 𝚄𝙽𝙼𝚄𝚃𝙴𝙳 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙶𝚛𝚘𝚞𝚙: ${groupName}*\n*┃ 👤 𝙱𝚢: @${sender.split('@')[0]}*\n*┃*\n*┃ 🔊 𝙰𝚕𝚕 𝚖𝚎𝚖𝚋𝚎𝚛𝚜 𝚌𝚊𝚗 𝚜𝚎𝚗𝚍 𝚖𝚎𝚜𝚜𝚊𝚐𝚎𝚜 𝚗𝚘𝚠*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Unmute command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: GROUP LINK
// ============================================
cmd({
    pattern: "link",
    alias: ["grouplink", "invitelink"],
    desc: "Get group invite link",
    category: "group",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚐𝚎𝚝 𝚐𝚛𝚘𝚞𝚙 𝚕𝚒𝚗𝚔!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const inviteCode = await conn.groupInviteCode(from);
        const inviteLink = `https://chat.whatsapp.com/${inviteCode}`;
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;
        const memberCount = groupMetadata.participants.length;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 🔗 𝙶𝚁𝙾𝚄𝙿 𝙻𝙸𝙽𝙺 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙽𝚊𝚖𝚎: ${groupName}*\n*┃ 👥 𝙼𝚎𝚖𝚋𝚎𝚛𝚜: ${memberCount}*\n*┃ 🔗 𝙻𝚒𝚗𝚔:*\n*┃ ${inviteLink}*\n*┃*\n*┃ 👤 𝚁𝚎𝚚𝚞𝚎𝚜𝚝𝚎𝚍 𝚋𝚢: @${sender.split('@')[0]}*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

        await conn.sendMessage(sender, {
            text: `🔗 *𝙶𝚛𝚘𝚞𝚙 𝙻𝚒𝚗𝚔:* ${inviteLink}`,
            contextInfo: getContextInfo({ sender: sender })
        });

    } catch (error) {
        console.error('Link command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: ADD MEMBER
// ============================================
cmd({
    pattern: "add",
    alias: ["addmember"],
    desc: "Add member to group",
    category: "group",
    react: "➕",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚊𝚍𝚍 𝚖𝚎𝚖𝚋𝚎𝚛𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (args.length === 0) {
            return await conn.sendMessage(from, {
                text: `📌 *𝚄𝚜𝚊𝚐𝚎:* .𝚊𝚍𝚍 <𝚗𝚞𝚖𝚋𝚎𝚛>\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚊𝚍𝚍 255712345678`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let number = args[0].replace(/[^0-9]/g, '');
        if (number.startsWith('0')) {
            number = '255' + number.slice(1);
        } else if (!number.startsWith('255')) {
            number = '255' + number;
        }
        
        const userJid = number + '@s.whatsapp.net';

        const [exists] = await conn.onWhatsApp(userJid);
        if (!exists || !exists.exists) {
            return await conn.sendMessage(from, {
                text: `❌ *𝚃𝚑𝚎 𝚗𝚞𝚖𝚋𝚎𝚛 ${number} 𝚒𝚜 𝚗𝚘𝚝 𝚘𝚗 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙!*`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupParticipantsUpdate(from, [userJid], 'add');
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 ➕ 𝙼𝙴𝙼𝙱𝙴𝚁 𝙰𝙳𝙳𝙴𝙳 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙶𝚛𝚘𝚞𝚙: ${groupName}*\n*┃ 👤 𝙰𝚍𝚍𝚎𝚍: @${userJid.split('@')[0]}*\n*┃ 👤 𝙱𝚢: @${sender.split('@')[0]}*\n*┃*\n*┃ ✅ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚊𝚍𝚍𝚎𝚍 𝚝𝚘 𝚐𝚛𝚘𝚞𝚙*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [userJid, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Add command error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('not-authorized')) {
            errorMessage = '𝙱𝚘𝚝 𝚒𝚜 𝚗𝚘𝚝 𝚊𝚞𝚝𝚑𝚘𝚛𝚒𝚣𝚎𝚍 𝚝𝚘 𝚊𝚍𝚍 𝚖𝚎𝚖𝚋𝚎𝚛𝚜';
        } else if (error.message.includes('group-full')) {
            errorMessage = '𝙶𝚛𝚘𝚞𝚙 𝚒𝚜 𝚏𝚞𝚕𝚕';
        } else if (error.message.includes('privacy')) {
            errorMessage = '𝚄𝚜𝚎𝚛\'𝚜 𝚙𝚛𝚒𝚟𝚊𝚌𝚢 𝚜𝚎𝚝𝚝𝚒𝚗𝚐𝚜 𝚙𝚛𝚎𝚟𝚎𝚗𝚝 𝚊𝚍𝚍𝚒𝚗𝚐';
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚊𝚍𝚍 𝚖𝚎𝚖𝚋𝚎𝚛*\n\n𝙴𝚛𝚛𝚘𝚛: ${errorMessage}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: KICK MEMBER
// ============================================
cmd({
    pattern: "kick",
    alias: ["remove", "ban"],
    desc: "Remove member from group",
    category: "group",
    react: "👢",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isAdmin = await isGroupAdmin(conn, from, sender);
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚔𝚒𝚌𝚔 𝚖𝚎𝚖𝚋𝚎𝚛𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: `📌 *𝚄𝚜𝚊𝚐𝚎:* .𝚔𝚒𝚌𝚔 <𝚗𝚞𝚖𝚋𝚎𝚛> 𝚘𝚛 𝚛𝚎𝚙𝚕𝚢 𝚝𝚘 𝚞𝚜𝚎𝚛\n\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .𝚔𝚒𝚌𝚔 255712345678`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetUser === botJid) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙸 𝚌𝚊𝚗'𝚝 𝚔𝚒𝚌𝚔 𝚖𝚢𝚜𝚎𝚕𝚏!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isTargetAdmin = await isGroupAdmin(conn, from, targetUser);
        if (isTargetAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙲𝚊𝚗𝚗𝚘𝚝 𝚔𝚒𝚌𝚔 𝚊𝚗𝚘𝚝𝚑𝚎𝚛 𝚊𝚍𝚖𝚒𝚗!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupParticipantsUpdate(from, [targetUser], 'remove');
        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 👢 𝙼𝙴𝙼𝙱𝙴𝚁 𝙺𝙸𝙲𝙺𝙴𝙳 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙶𝚛𝚘𝚞𝚙: ${groupName}*\n*┃ 👤 𝙺𝚒𝚌𝚔𝚎𝚍: @${targetUser.split('@')[0]}*\n*┃ 👤 𝙱𝚢: @${sender.split('@')[0]}*\n*┃*\n*┃ ✅ 𝚂𝚞𝚌𝚌𝚎𝚜𝚜𝚏𝚞𝚕𝚕𝚢 𝚛𝚎𝚖𝚘𝚟𝚎𝚍 𝚏𝚛𝚘𝚖 𝚐𝚛𝚘𝚞𝚙*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Kick command error:', error);
        
        let errorMessage = error.message;
        if (error.message.includes('not-authorized')) {
            errorMessage = '𝙱𝚘𝚝 𝚒𝚜 𝚗𝚘𝚝 𝚊𝚞𝚝𝚑𝚘𝚛𝚒𝚣𝚎𝚍 𝚝𝚘 𝚔𝚒𝚌𝚔 𝚖𝚎𝚖𝚋𝚎𝚛𝚜';
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚔𝚒𝚌𝚔 𝚖𝚎𝚖𝚋𝚎𝚛*\n\n𝙴𝚛𝚛𝚘𝚛: ${errorMessage}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
