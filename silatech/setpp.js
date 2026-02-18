const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, downloadMediaMessage } = require('../lib/functions');
const fs = require('fs-extra');
const path = require('path');
const Jimp = require('jimp');

cmd({
    pattern: "setpp",
    alias: ["setprofile", "setpic", "setphoto"],
    desc: "Set profile picture (bot/user/group)",
    category: "owner",
    react: "🖼️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner, isGroup }) => {
    try {
        // Check if user replied to an image
        if (!mek.quoted && !mek.message?.imageMessage) {
            return await conn.sendMessage(from, {
                text: `📌 *𝙷𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎 𝚜𝚎𝚝𝚙𝚙*\n\n` +
                      `1️⃣ *𝚂𝚎𝚝 𝙱𝚘𝚝 𝙿𝚛𝚘𝚏𝚒𝚕𝚎*\n` +
                      `   𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎 𝚠𝚒𝚝𝚑: .𝚜𝚎𝚝𝚙𝚙 𝚋𝚘𝚝\n\n` +
                      `2️⃣ *𝚂𝚎𝚝 𝚈𝚘𝚞𝚛 𝙿𝚛𝚘𝚏𝚒𝚕𝚎*\n` +
                      `   𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎 𝚠𝚒𝚝𝚑: .𝚜𝚎𝚝𝚙𝚙 𝚖𝚎\n\n` +
                      `3️⃣ *𝚂𝚎𝚝 𝙶𝚛𝚘𝚞𝚙 𝙿𝚛𝚘𝚏𝚒𝚕𝚎*\n` +
                      `   𝚁𝚎𝚙𝚕𝚢 𝚝𝚘 𝚊𝚗 𝚒𝚖𝚊𝚐𝚎 𝚠𝚒𝚝𝚑: .𝚜𝚎𝚝𝚙𝚙 𝚐𝚛𝚘𝚞𝚙`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Check if user is owner for bot profile
        const target = args[0]?.toLowerCase() || '';
        
        if (target === 'bot' && !isOwner) {
            return await conn.sendMessage(from, {
                text: "🚫 *𝙾𝚗𝚕𝚢 𝚋𝚘𝚝 𝚘𝚠𝚗𝚎𝚛 𝚌𝚊𝚗 𝚌𝚑𝚊𝚗𝚐𝚎 𝚋𝚘𝚝 𝚙𝚛𝚘𝚏𝚒𝚕𝚎!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (target === 'group' && !isGroup) {
            return await conn.sendMessage(from, {
                text: "🚫 *𝚃𝚑𝚒𝚜 𝚌𝚘𝚖𝚖𝚊𝚗𝚍 𝚌𝚊𝚗 𝚘𝚗𝚕𝚢 𝚋𝚎 𝚞𝚜𝚎𝚍 𝚒𝚗 𝚐𝚛𝚘𝚞𝚙𝚜!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (target === 'group' && !isOwner && !await isGroupAdmin(conn, from, sender)) {
            return await conn.sendMessage(from, {
                text: "🚫 *𝙾𝚗𝚕𝚢 𝚐𝚛𝚘𝚞𝚙 𝚊𝚍𝚖𝚒𝚗𝚜 𝚌𝚊𝚗 𝚌𝚑𝚊𝚗𝚐𝚎 𝚐𝚛𝚘𝚞𝚙 𝚙𝚛𝚘𝚏𝚒𝚕𝚎!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get the image
        let media;
        let mediaPath;
        
        try {
            if (mek.quoted) {
                media = await downloadMediaMessage(mek.quoted, 'buffer');
                mediaPath = await downloadMediaMessage(mek.quoted, `temp_pp_${Date.now()}`, true);
            } else {
                media = await downloadMediaMessage(mek, 'buffer');
                mediaPath = await downloadMediaMessage(mek, `temp_pp_${Date.now()}`, true);
            }
        } catch (error) {
            console.error('Download error:', error);
            return await conn.sendMessage(from, {
                text: "❌ *𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚍𝚘𝚠𝚗𝚕𝚘𝚊𝚍 𝚒𝚖𝚊𝚐𝚎!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (!media) {
            return await conn.sendMessage(from, {
                text: "❌ *𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚒𝚖𝚊𝚐𝚎!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Process image (resize to 640x640)
        let processedImage;
        try {
            const image = await Jimp.read(mediaPath || media);
            await image.resize(640, 640);
            processedImage = await image.getBufferAsync(Jimp.MIME_JPEG);
        } catch (error) {
            console.error('Image processing error:', error);
            processedImage = media;
        }

        // Set profile based on target
        let successMessage = '';
        
        switch (target) {
            case 'bot':
                // Update bot profile
                await conn.updateProfilePicture(conn.user.id, processedImage);
                successMessage = `✅ *𝙱𝚘𝚝 𝚙𝚛𝚘𝚏𝚒𝚕𝚎 𝚙𝚒𝚌𝚝𝚞𝚛𝚎 𝚞𝚙𝚍𝚊𝚝𝚎𝚍!*`;
                
                // Also update in config
                config.BOT_IMAGE = 'updated';
                break;

            case 'me':
                // Update user's own profile
                await conn.updateProfilePicture(sender, processedImage);
                successMessage = `✅ *𝚈𝚘𝚞𝚛 𝚙𝚛𝚘𝚏𝚒𝚕𝚎 𝚙𝚒𝚌𝚝𝚞𝚛𝚎 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚞𝚙𝚍𝚊𝚝𝚎𝚍!*`;
                break;

            case 'group':
                // Update group profile
                await conn.updateProfilePicture(from, processedImage);
                successMessage = `✅ *𝙶𝚛𝚘𝚞𝚙 𝚙𝚛𝚘𝚏𝚒𝚕𝚎 𝚙𝚒𝚌𝚝𝚞𝚛𝚎 𝚑𝚊𝚜 𝚋𝚎𝚎𝚗 𝚞𝚙𝚍𝚊𝚝𝚎𝚍!*`;
                break;

            default:
                return await conn.sendMessage(from, {
                    text: `❌ *𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚝𝚊𝚛𝚐𝚎𝚝!*\n\n𝚄𝚜𝚎: .𝚜𝚎𝚝𝚙𝚙 𝚋𝚘𝚝, .𝚜𝚎𝚝𝚙𝚙 𝚖𝚎, 𝚘𝚛 .𝚜𝚎𝚝𝚙𝚙 𝚐𝚛𝚘𝚞𝚙`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
        }

        // Clean up temp file
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        await conn.sendMessage(from, {
            image: processedImage,
            caption: `${successMessage}\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (error) {
        console.error('Setpp command error:', error);
        
        // Clean up temp file if exists
        if (mediaPath && fs.existsSync(mediaPath)) {
            fs.unlinkSync(mediaPath);
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${error.message}`,
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
    }
}
