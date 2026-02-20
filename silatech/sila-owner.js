const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, downloadMediaMessage } = require('../lib/functions');
const { userDB } = require('../lib/database');
const fs = require('fs-extra');
const path = require('path');
const Jimp = require('jimp');
const { exec } = require('child_process');

// ============================================
// 📌 CHECK IF USER IS OWNER
// ============================================
function isOwner(senderNumber) {
    return config.OWNER_NUMBER.includes(senderNumber.replace(/[^0-9]/g, ''));
}

// ============================================
// 📌 FORMAT OWNER MESSAGE
// ============================================
function formatOwnerMessage(title, content) {
    return `╭─❖〔 🐢 OWNER ${title} 🐢 〕❖─╮
*│*
*│ ${content}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 COMMAND: BROADCAST (To All Chats)
// ============================================
cmd({
    pattern: "broadcast",
    alias: ["bc", "broadcastall"],
    desc: "Broadcast message to all chats",
    category: "owner",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, body }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let message = args.join(' ').trim();
        let mediaType = null;
        let mediaBuffer = null;

        // Check if there's quoted media
        if (mek.quoted) {
            const quotedMsg = mek.quoted;
            if (quotedMsg.imageMessage) {
                mediaType = 'image';
                mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer');
                message = quotedMsg.imageMessage.caption || message;
            } else if (quotedMsg.videoMessage) {
                mediaType = 'video';
                mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer');
                message = quotedMsg.videoMessage.caption || message;
            } else if (quotedMsg.audioMessage) {
                mediaType = 'audio';
                mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer');
                message = quotedMsg.audioMessage.caption || message;
            }
        }

        if (!message && !mediaBuffer) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .broadcast <message> or reply to media",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get all chats
        const chats = Object.keys(conn.chats).filter(id => 
            !id.includes('status') && 
            !id.includes('newsletter') &&
            !id.includes('broadcast')
        );

        await conn.sendMessage(from, {
            text: formatOwnerMessage('BROADCAST', 
                `📢 *Broadcasting to ${chats.length} chats*\n⏳ *Please wait...*`)
        }, { quoted: fkontak });

        let success = 0;
        let failed = 0;

        const broadcastText = `╭─❖〔 🐢 BROADCAST MESSAGE 🐢 〕❖─╮
*│*
*│ ${message}*
*│*
╰─❖〔 🐢 𝙵𝚛𝚘𝚖: ${config.BOT_NAME} 🐢 〕❖─╯`;

        for (const chat of chats) {
            try {
                if (mediaType === 'image') {
                    await conn.sendMessage(chat, {
                        image: mediaBuffer,
                        caption: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                } else if (mediaType === 'video') {
                    await conn.sendMessage(chat, {
                        video: mediaBuffer,
                        caption: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                } else if (mediaType === 'audio') {
                    await conn.sendMessage(chat, {
                        audio: mediaBuffer,
                        mimetype: 'audio/mp4',
                        contextInfo: getContextInfo({ sender: sender })
                    });
                } else {
                    await conn.sendMessage(chat, {
                        text: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                }
                success++;
            } catch (e) {
                failed++;
            }
            await new Promise(r => setTimeout(r, 500)); // Delay to avoid spam
        }

        await conn.sendMessage(from, {
            text: formatOwnerMessage('BROADCAST COMPLETE', 
                `✅ *Success: ${success} chats*\n❌ *Failed: ${failed} chats*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Broadcast error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: BROADCAST TO GROUPS ONLY
// ============================================
cmd({
    pattern: "bcgroup",
    alias: ["bcgroups", "broadcastgroup"],
    desc: "Broadcast message to all groups",
    category: "owner",
    react: "👥",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let message = args.join(' ').trim();
        let mediaType = null;
        let mediaBuffer = null;

        if (mek.quoted) {
            const quotedMsg = mek.quoted;
            if (quotedMsg.imageMessage) {
                mediaType = 'image';
                mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer');
                message = quotedMsg.imageMessage.caption || message;
            } else if (quotedMsg.videoMessage) {
                mediaType = 'video';
                mediaBuffer = await downloadMediaMessage(quotedMsg, 'buffer');
                message = quotedMsg.videoMessage.caption || message;
            }
        }

        if (!message && !mediaBuffer) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .bcgroup <message> or reply to media",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get all groups
        const groups = Object.keys(conn.chats).filter(id => id.endsWith('@g.us'));

        await conn.sendMessage(from, {
            text: formatOwnerMessage('GROUP BROADCAST', 
                `📢 *Broadcasting to ${groups.length} groups*\n⏳ *Please wait...*`)
        }, { quoted: fkontak });

        let success = 0;
        let failed = 0;

        const broadcastText = `╭─❖〔 🐢 GROUP BROADCAST 🐢 〕❖─╮
*│*
*│ ${message}*
*│*
╰─❖〔 🐢 𝙵𝚛𝚘𝚖: ${config.BOT_NAME} 🐢 〕❖─╯`;

        for (const group of groups) {
            try {
                if (mediaType === 'image') {
                    await conn.sendMessage(group, {
                        image: mediaBuffer,
                        caption: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                } else if (mediaType === 'video') {
                    await conn.sendMessage(group, {
                        video: mediaBuffer,
                        caption: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                } else {
                    await conn.sendMessage(group, {
                        text: broadcastText,
                        contextInfo: getContextInfo({ sender: sender })
                    });
                }
                success++;
            } catch (e) {
                failed++;
            }
            await new Promise(r => setTimeout(r, 500));
        }

        await conn.sendMessage(from, {
            text: formatOwnerMessage('BROADCAST COMPLETE', 
                `✅ *Groups: ${success}/${groups.length}*\n❌ *Failed: ${failed}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Bcgroup error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET BOT PROFILE PICTURE
// ============================================
cmd({
    pattern: "setppbot",
    alias: ["setbotpp", "setbotpic"],
    desc: "Set bot profile picture",
    category: "owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (!mek.quoted && !mek.message?.imageMessage) {
            return await conn.sendMessage(from, {
                text: "📌 *Reply to an image with .setppbot*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Download image
        let mediaPath;
        if (mek.quoted) {
            mediaPath = await downloadMediaMessage(mek.quoted, `temp_botpp_${Date.now()}`, true);
        } else {
            mediaPath = await downloadMediaMessage(mek, `temp_botpp_${Date.now()}`, true);
        }

        // Process image
        const image = await Jimp.read(mediaPath);
        await image.resize(640, 640);
        const processedImage = await image.getBufferAsync(Jimp.MIME_JPEG);

        // Update bot profile
        await conn.updateProfilePicture(conn.user.id, processedImage);

        // Clean up
        if (fs.existsSync(mediaPath)) fs.unlinkSync(mediaPath);

        await conn.sendMessage(from, {
            text: formatOwnerMessage('PROFILE UPDATED', 
                `✅ *Bot profile picture has been updated*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setppbot error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET BOT NAME
// ============================================
cmd({
    pattern: "setnamebot",
    alias: ["setbotname", "setbotnama"],
    desc: "Set bot profile name",
    category: "owner",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const newName = args.join(' ').trim();
        if (!newName) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setnamebot <new name>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (newName.length > 25) {
            return await conn.sendMessage(from, {
                text: "❌ *Name too long! Max 25 characters*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.updateProfileName(newName);
        config.BOT_NAME = newName;

        await conn.sendMessage(from, {
            text: formatOwnerMessage('NAME UPDATED', 
                `✅ *Bot name changed to:*\n${newName}`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setnamebot error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SET BOT BIO
// ============================================
cmd({
    pattern: "setbio",
    alias: ["setstatus", "setbotbio"],
    desc: "Set bot profile bio/status",
    category: "owner",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const newBio = args.join(' ').trim();
        if (!newBio) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .setbio <new bio>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.updateProfileStatus(newBio);

        await conn.sendMessage(from, {
            text: formatOwnerMessage('BIO UPDATED', 
                `✅ *Bot bio changed to:*\n${newBio}`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Setbio error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTO READ ON/OFF
// ============================================
cmd({
    pattern: "autoread",
    alias: ["autoreadmsg"],
    desc: "Toggle auto read messages",
    category: "owner",
    react: "👁️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autoread on / .autoread off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.AUTO_READ = enabled ? 'true' : 'false';
        await userDB.updateUserSettings('global', { autoRead: enabled });

        await conn.sendMessage(from, {
            text: formatOwnerMessage('AUTO READ', 
                `👁️ *Auto Read: ${enabled ? 'ON ✅' : 'OFF ❌'}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autoread error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTO TYPING ON/OFF
// ============================================
cmd({
    pattern: "autotyping",
    alias: ["autotype"],
    desc: "Toggle auto typing indicator",
    category: "owner",
    react: "⌨️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autotyping on / .autotyping off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.AUTO_TYPING = enabled ? 'true' : 'false';
        await userDB.updateUserSettings('global', { autoTyping: enabled });

        await conn.sendMessage(from, {
            text: formatOwnerMessage('AUTO TYPING', 
                `⌨️ *Auto Typing: ${enabled ? 'ON ✅' : 'OFF ❌'}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autotyping error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTO STATUS VIEW ON/OFF
// ============================================
cmd({
    pattern: "autostatusview",
    alias: ["autoview", "viewstatus"],
    desc: "Toggle auto view status",
    category: "owner",
    react: "📱",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autostatusview on / .autostatusview off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.AUTO_VIEW_STATUS = enabled ? 'true' : 'false';
        await userDB.updateUserSettings('global', { autoViewStatus: enabled });

        await conn.sendMessage(from, {
            text: formatOwnerMessage('AUTO STATUS VIEW', 
                `📱 *Auto View Status: ${enabled ? 'ON ✅' : 'OFF ❌'}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autostatusview error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTO LIKE ON/OFF
// ============================================
cmd({
    pattern: "autolike",
    alias: ["autolikestatus"],
    desc: "Toggle auto like on status",
    category: "owner",
    react: "❤️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autolike on / .autolike off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.AUTO_LIKE_STATUS = enabled ? 'true' : 'false';
        await userDB.updateUserSettings('global', { autoLikeStatus: enabled });

        await conn.sendMessage(from, {
            text: formatOwnerMessage('AUTO LIKE', 
                `❤️ *Auto Like Status: ${enabled ? 'ON ✅' : 'OFF ❌'}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autolike error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: AUTO REACT ON/OFF
// ============================================
cmd({
    pattern: "autoreact",
    alias: ["autoreaction"],
    desc: "Toggle auto react to messages",
    category: "owner",
    react: "⚡",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const action = args[0]?.toLowerCase();
        if (!action || (action !== 'on' && action !== 'off')) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .autoreact on / .autoreact off",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const enabled = action === 'on';
        config.AUTO_REACT = enabled ? 'true' : 'false';
        await userDB.updateUserSettings('global', { autoReact: enabled });

        await conn.sendMessage(from, {
            text: formatOwnerMessage('AUTO REACT', 
                `⚡ *Auto React: ${enabled ? 'ON ✅' : 'OFF ❌'}*`)
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Autoreact error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: BLOCK USER
// ============================================
cmd({
    pattern: "block",
    alias: ["blockuser"],
    desc: "Block a user",
    category: "owner",
    react: "🚫",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let targetUser = null;
        
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

        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .block @user or reply to user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (targetUser === conn.user.id) {
            return await conn.sendMessage(from, {
                text: "❌ *I can't block myself!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.updateBlockStatus(targetUser, 'block');

        await conn.sendMessage(from, {
            text: formatOwnerMessage('BLOCKED', 
                `🚫 *User @${targetUser.split('@')[0]} has been blocked*`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Block error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: UNBLOCK USER
// ============================================
cmd({
    pattern: "unblock",
    alias: ["unblockuser"],
    desc: "Unblock a user",
    category: "owner",
    react: "✅",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        let targetUser = null;
        
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

        if (!targetUser) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .unblock @user or reply to user",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.updateBlockStatus(targetUser, 'unblock');

        await conn.sendMessage(from, {
            text: formatOwnerMessage('UNBLOCKED', 
                `✅ *User @${targetUser.split('@')[0]} has been unblocked*`),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Unblock error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: JOIN GROUP
// ============================================
cmd({
    pattern: "join",
    alias: ["joingroup"],
    desc: "Join a group via invite link",
    category: "owner",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const link = args[0];
        if (!link) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .join <group invite link>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const inviteCodeMatch = link.match(/chat\.whatsapp\.com\/([a-zA-Z0-9]+)/);
        if (!inviteCodeMatch) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid group invite link!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const inviteCode = inviteCodeMatch[1];
        const response = await conn.groupAcceptInvite(inviteCode);

        if (response?.gid) {
            await conn.sendMessage(from, {
                text: formatOwnerMessage('JOINED GROUP', 
                    `✅ *Successfully joined group*\n🆔 *ID:* ${response.gid}`)
            }, { quoted: fkontak });
        } else {
            throw new Error('Failed to join group');
        }

    } catch (error) {
        console.error('Join error:', error);
        let errorMessage = error.message;
        if (error.message.includes('not-authorized')) {
            errorMessage = 'Bot is not authorized to join (possibly banned)';
        } else if (error.message.includes('conflict')) {
            errorMessage = 'Bot is already a member of the group';
        } else if (error.message.includes('gone')) {
            errorMessage = 'Group invite link is invalid or expired';
        }
        await conn.sendMessage(from, {
            text: `❌ *Failed to join group*\nError: ${errorMessage}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: LEAVE GROUP
// ============================================
cmd({
    pattern: "leave",
    alias: ["leavegroup", "exit"],
    desc: "Leave current group",
    category: "owner",
    react: "👋",
    filename: __filename
}, async (conn, mek, m, { from, sender, isGroup }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ *This command can only be used in groups!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const groupMetadata = await conn.groupMetadata(from);
        const groupName = groupMetadata.subject;

        await conn.sendMessage(from, {
            text: formatOwnerMessage('LEAVING GROUP', 
                `👋 *Goodbye ${groupName}!*\nBot is leaving now...`)
        }, { quoted: fkontak });

        await new Promise(r => setTimeout(r, 2000));
        await conn.groupLeave(from);

    } catch (error) {
        console.error('Leave error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COMMAND: SHUTDOWN BOT
// ============================================
cmd({
    pattern: "shutdown",
    alias: ["stop", "kill"],
    desc: "Shutdown the bot",
    category: "owner",
    react: "💀",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const senderNumber = sender.split('@')[0];
        if (!isOwner(senderNumber)) {
            return await conn.sendMessage(from, {
                text: "❌ *This command is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: formatOwnerMessage('SHUTDOWN', 
                `💀 *Bot is shutting down...*\n👋 *Goodbye!*`)
        }, { quoted: fkontak });

        await new Promise(r => setTimeout(r, 2000));
        
        // Close all connections
        process.exit(0);

    } catch (error) {
        console.error('Shutdown error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
