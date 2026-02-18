const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getTimestamp, formatBytes } = require('../lib/functions');
const os = require('os');

cmd({
    pattern: "alive",
    alias: ["bot", "status", "test"],
    desc: "Check if bot is alive with interactive buttons",
    category: "general",
    react: "🔮",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner, prefix, args }) => {
    try {
        // Send initial reaction
        await conn.sendMessage(from, { 
            react: { text: '🔮', key: mek.key } 
        });

        // Get system stats
        const startTime = global.socketCreationTime?.get(sender.split('@')[0]) || Date.now();
        const uptime = Math.floor((Date.now() - startTime) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const activeCount = global.activeSockets?.size || 0;

        // ============================================
        // 📌 CREATE INTERACTIVE BUTTON MESSAGE
        // ============================================
        const aliveMessage = {
            image: { url: config.IMAGE_PATH },
            caption: `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*
*┃🐢│ 𝙱𝙾𝚃: ${config.BOT_NAME}*
*┃🐢│ 𝚄𝚂𝙴𝚁: @${sender.split('@')[0]}*
*┃🐢│ 𝚄𝙿𝚃𝙸𝙼𝙴: ${hours}h ${minutes}m ${seconds}s*
*┃🐢│ 𝙼𝙴𝙼𝙾𝚁𝚈: ${usedMemory}MB / ${totalMemory}MB*
*┃🐢│ 𝙰𝙲𝚃𝙸𝚅𝙴: ${activeCount} sessions*
*┃🐢│ 𝚅𝙴𝚁𝚂𝙸𝙾𝙽: ${config.version}*
*╰━━━━━━━━━━━━━━━┈⊷*

> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        };

        // Send image with caption first
        await conn.sendMessage(from, aliveMessage, { quoted: fkontak });

        // ============================================
        // 📌 CREATE BUTTON MESSAGE (Interactive)
        // ============================================
        const buttons = [
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📋 𝙼𝙴𝙽𝚄",
                    id: `${prefix || config.PREFIX}menu`
                })
            },
            {
                name: "quick_reply",
                buttonParamsJson: JSON.stringify({
                    display_text: "📍 𝙿𝙸𝙽𝙶",
                    id: `${prefix || config.PREFIX}ping`
                })
            }
        ];

        const buttonMessage = {
            text: `*⚡ 𝚀𝚞𝚒𝚌𝚔 𝙰𝚌𝚝𝚒𝚘𝚗𝚜*\n\n𝙲𝚑𝚘𝚘𝚜𝚎 𝚊𝚗 𝚘𝚙𝚝𝚒𝚘𝚗 𝚋𝚎𝚕𝚘𝚠:`,
            footer: config.BOT_FOOTER,
            viewOnce: true,
            buttons: buttons,
            headerType: 1,
            contextInfo: getContextInfo({ sender: sender })
        };

        // Send button message
        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

        // ============================================
        // 📌 HANDLE BUTTON RESPONSES
        // ============================================
        // Note: Button responses are handled automatically by the command handler
        // because the button ID contains the command with prefix

    } catch (error) {
        console.error('Alive command error:', error);
        
        // Fallback to simple message if buttons fail
        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: `*🤖 ${config.BOT_NAME} 𝙰𝙻𝙸𝚅𝙴*\n\n𝚃𝚢𝚙𝚎 *${prefix || config.PREFIX}menu* 𝚏𝚘𝚛 𝚌𝚘𝚖𝚖𝚊𝚗𝚍𝚜\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
