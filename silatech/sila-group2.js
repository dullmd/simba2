const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { groupDB } = require('../lib/database');

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
// 📌 COMMAND: PROMOTE
// ============================================
cmd({
    pattern: "promote",
    alias: ["admin", "makeadmin"],
    desc: "Promote member to admin",
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
                text: "❌ *Only group admins can promote members!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .promote @user or reply to user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetUser === botJid) {
            return await conn.sendMessage(from, {
                text: "❌ *I can't promote myself!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isTargetAdmin = await isGroupAdmin(conn, from, targetUser);
        if (isTargetAdmin) {
            return await conn.sendMessage(from, {
                text: "❌ *User is already an admin!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupParticipantsUpdate(from, [targetUser], 'promote');

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('PROMOTED', 
                `👤 *User:* @${targetUser.split('@')[0]}\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `✅ *Successfully promoted to admin*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Promote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: DEMOTE
// ============================================
cmd({
    pattern: "demote",
    alias: ["removeadmin", "unadmin"],
    desc: "Demote admin to member",
    category: "group",
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
                text: "❌ *Only group admins can demote members!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const targetUser = getTargetUser(mek, args);
        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .demote @user or reply to user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const botJid = conn.user.id.split(':')[0] + '@s.whatsapp.net';
        if (targetUser === botJid) {
            return await conn.sendMessage(from, {
                text: "❌ *I can't demote myself!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const isTargetAdmin = await isGroupAdmin(conn, from, targetUser);
        if (!isTargetAdmin) {
            return await conn.sendMessage(from, {
                text: "❌ *User is not an admin!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupParticipantsUpdate(from, [targetUser], 'demote');

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('DEMOTED', 
                `👤 *User:* @${targetUser.split('@')[0]}\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `✅ *Successfully demoted from admin*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser, sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Demote error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: LOCK LINK
// ============================================
cmd({
    pattern: "locklink",
    alias: ["lockgrouplink", "lockinvite"],
    desc: "Lock group link (prevent resetting)",
    category: "group",
    react: "🔒",
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
                text: "❌ *Only group admins can lock group link!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await groupDB.updateGroupSettings(from, { linkLocked: true });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('LINK LOCKED', 
                `🔒 *Group link has been locked*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `📌 *No one can reset the link now*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Locklink error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: UNLOCK LINK
// ============================================
cmd({
    pattern: "unlocklink",
    alias: ["unlockgrouplink", "unlockinvite"],
    desc: "Unlock group link",
    category: "group",
    react: "🔓",
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
                text: "❌ *Only group admins can unlock group link!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await groupDB.updateGroupSettings(from, { linkLocked: false });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('LINK UNLOCKED', 
                `🔓 *Group link has been unlocked*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `📌 *Link can be reset now*`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Unlocklink error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: RESET LINK
// ============================================
cmd({
    pattern: "resetlink",
    alias: ["newlink", "revoke"],
    desc: "Reset group invite link",
    category: "group",
    react: "🔄",
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
                text: "❌ *Only group admins can reset group link!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Check if link is locked
        const settings = await groupDB.getGroupSettings(from);
        if (settings.linkLocked && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *Group link is locked! Use .unlocklink first*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupRevokeInvite(from);
        const newCode = await conn.groupInviteCode(from);
        const newLink = `https://chat.whatsapp.com/${newCode}`;

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('LINK RESET', 
                `🔄 *New group link generated*\n` +
                `👤 *By:* @${sender.split('@')[0]}\n` +
                `🔗 *Link:* ${newLink}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Resetlink error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET DESCRIPTION
// ============================================
cmd({
    pattern: "setdesc",
    alias: ["setdescription", "setgroupdesc"],
    desc: "Set group description",
    category: "group",
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
                text: "❌ *Only group admins can change group description!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const newDesc = args.join(' ').trim();
        if (!newDesc) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setdesc <new description>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupUpdateDescription(from, newDesc);

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('DESCRIPTION UPDATED', 
                `📝 *New Description:*\n${newDesc}\n\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setdesc error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET NAME
// ============================================
cmd({
    pattern: "setname",
    alias: ["setgroupname", "setgname"],
    desc: "Set group name",
    category: "group",
    react: "🏷️",
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
                text: "❌ *Only group admins can change group name!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const newName = args.join(' ').trim();
        if (!newName) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setname <new group name>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (newName.length > 25) {
            return await conn.sendMessage(from, {
                text: "❌ *Group name too long! Max 25 characters*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.groupUpdateSubject(from, newName);

        await conn.sendMessage(from, {
            text: formatGroupMessage('NAME UPDATED', 
                `🏷️ *New Name:* ${newName}\n\n` +
                `👤 *By:* @${sender.split('@')[0]}`, newName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setname error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET PP GROUP
// ============================================
const Jimp = require('jimp');
const fs = require('fs-extra');

cmd({
    pattern: "setppgroup",
    alias: ["setgrouppic", "setgrouppp"],
    desc: "Set group profile picture",
    category: "group",
    react: "🖼️",
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
                text: "❌ *Only group admins can change group picture!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (!mek.quoted && !mek.message?.imageMessage) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .setppgroup*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Download image
        let mediaPath;
        if (mek.quoted) {
            mediaPath = await conn.downloadAndSaveMediaMessage(mek.quoted, `temp_pp_${Date.now()}`);
        } else {
            mediaPath = await conn.downloadAndSaveMediaMessage(mek, `temp_pp_${Date.now()}`);
        }

        // Process image
        const image = await Jimp.read(mediaPath);
        await image.resize(640, 640);
        const processedImage = await image.getBufferAsync(Jimp.MIME_JPEG);

        // Update group picture
        await conn.updateProfilePicture(from, processedImage);

        // Clean up
        if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('PICTURE UPDATED', 
                `🖼️ *Group profile picture updated*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setppgroup error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: WELCOME ON/OFF
// ============================================
cmd({
    pattern: "welcome2",
    alias: ["setwelcome2"],
    desc: "Toggle welcome message",
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
                text: "❌ *Only group admins can toggle welcome!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .welcome on / .welcome off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { welcome: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('WELCOME', 
                `👋 *Welcome messages: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Welcome error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: GOODBYE ON/OFF
// ============================================
cmd({
    pattern: "goodbye2",
    alias: ["farewell"],
    desc: "Toggle goodbye message",
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
                text: "❌ *Only group admins can toggle goodbye!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .goodbye on / .goodbye off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        await groupDB.updateGroupSettings(from, { goodbye: enabled });

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatGroupMessage('GOODBYE', 
                `👋 *Goodbye messages: ${enabled ? 'ON ✅' : 'OFF ❌'}*\n` +
                `👤 *By:* @${sender.split('@')[0]}`, groupName),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Goodbye error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 GROUP EVENTS HANDLER (Welcome & Goodbye)
// ============================================
cmd({ on: "group-participants-update" }, async (conn, update) => {
    try {
        const { id, participants, action } = update;
        
        const settings = await groupDB.getGroupSettings(id);
        
        if (action === 'add' && settings.welcome) {
            const groupMetadata = await conn.groupMetadata(id);
            const groupName = groupMetadata.subject;
            
            for (let user of participants) {
                const welcomeText = `╭─❖〔 🐢 WELCOME 🐢 〕❖─╮
*│ 🐢 Hello @${user.split('@')[0]}*
*│*
*│ 👋 Welcome to ${groupName}*
*│ 📝 Please read group rules*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

                await conn.sendMessage(id, {
                    text: welcomeText,
                    contextInfo: { mentionedJid: [user] }
                });
            }
        }
        
        if (action === 'remove' && settings.goodbye) {
            const groupMetadata = await conn.groupMetadata(id);
            const groupName = groupMetadata.subject;
            
            for (let user of participants) {
                const goodbyeText = `╭─❖〔 🐢 GOODBYE 🐢 〕❖─╮
*│ 🐢 @${user.split('@')[0]} left*
*│*
*│ 👋 We'll miss you in ${groupName}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

                await conn.sendMessage(id, {
                    text: goodbyeText,
                    contextInfo: { mentionedJid: [user] }
                });
            }
        }
    } catch (error) {
        console.error('Group events error:', error);
    }
});
