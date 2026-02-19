const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { generateWAMessageFromContent, prepareWAMessageMedia } = require('@whiskeysockets/baileys');
const os = require('os');

// Helper function to format runtime
function runtime(seconds) {
    const days = Math.floor(seconds / (3600 * 24));
    const hours = Math.floor((seconds % (3600 * 24)) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    
    return `${days}d ${hours}h ${minutes}m ${secs}s`;
}

// Helper function for fancy text (bold)
function fancy(text) {
    return text;
}

cmd({
    pattern: "alive",
    alias: ["ping", "status", "runtime", "uptime"],
    desc: "Show bot status with sliding cards and music",
    category: "general",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender, pushName, args, command, prefix }) => {
    try {
        // Get user's original WhatsApp name
        let userName = pushName;
        if (!userName) {
            try {
                const contact = await conn.getContact(sender);
                userName = contact?.name || contact?.pushname || sender.split('@')[0];
            } catch {
                userName = sender.split('@')[0];
            }
        }

        // Prepare audio media (same audio for all cards)
        const audioUrl = 'https://files.catbox.moe/98k75b.jpeg'; // Replace with actual audio URL if you have
        let audioMedia;
        try {
            audioMedia = await prepareWAMessageMedia(
                { audio: { url: audioUrl }, mimetype: 'audio/mpeg' },
                { upload: conn.waUploadToServer }
            );
        } catch (e) {
            console.error('Failed to load audio:', e);
            audioMedia = null;
        }

        // Calculate ping
        const messageTimestamp = mek.messageTimestamp ? mek.messageTimestamp * 1000 : Date.now();
        const ping = Date.now() - messageTimestamp;

        // Uptime
        const uptime = runtime(process.uptime());

        // Memory
        const memory = process.memoryUsage();
        const memoryUsed = Math.round(memory.heapUsed / 1024 / 1024);

        // Create cards
        const cards = [];

        // Card 1: Ping
        cards.push({
            body: { text: fancy(
                `━━━━━━━━━━━━━━━━━━\n` +
                `   🏓 *PING*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `📶 Response Time: *${ping}ms*\n\n` +
                `🤖 Bot is responsive.`
            ) },
            footer: { text: fancy(config.BOT_FOOTER) },
            header: audioMedia ? {
                hasMediaAttachment: true,
                audioMessage: audioMedia.audioMessage
            } : {
                title: fancy(config.BOT_NAME),
                hasMediaAttachment: false
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔄 Refresh",
                        id: `${prefix}alive`
                    })
                }]
            }
        });

        // Card 2: Alive
        cards.push({
            body: { text: fancy(
                `━━━━━━━━━━━━━━━━━━\n` +
                `   🤖 *ALIVE*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `✨ Bot Name: ${config.BOT_NAME}\n` +
                `👑 Developer: ${config.OWNER_NAME}\n` +
                `📦 Version: ${config.version || '2.0.0'}\n\n` +
                `✅ I'm alive and ready!`
            ) },
            footer: { text: fancy(config.BOT_FOOTER) },
            header: audioMedia ? {
                hasMediaAttachment: true,
                audioMessage: audioMedia.audioMessage
            } : {
                title: fancy(config.BOT_NAME),
                hasMediaAttachment: false
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔄 Refresh",
                        id: `${prefix}alive`
                    })
                }]
            }
        });

        // Card 3: Runtime
        cards.push({
            body: { text: fancy(
                `━━━━━━━━━━━━━━━━━━\n` +
                `   ⏱️ *RUNTIME*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `🕐 Uptime: *${uptime}*\n` +
                `💾 Memory: *${memoryUsed} MB*\n\n` +
                `Bot has been running for ${uptime}.`
            ) },
            footer: { text: fancy(config.BOT_FOOTER) },
            header: audioMedia ? {
                hasMediaAttachment: true,
                audioMessage: audioMedia.audioMessage
            } : {
                title: fancy(config.BOT_NAME),
                hasMediaAttachment: false
            },
            nativeFlowMessage: {
                buttons: [{
                    name: "quick_reply",
                    buttonParamsJson: JSON.stringify({
                        display_text: "🔄 Refresh",
                        id: `${prefix}alive`
                    })
                }]
            }
        });

        // Build interactive message
        const interactiveMessage = {
            body: { text: fancy(
                `━━━━━━━━━━━━━━━━━━\n` +
                `   📊 *BOT STATUS DASHBOARD*\n` +
                `━━━━━━━━━━━━━━━━━━\n\n` +
                `👋 Hello, *${userName}*!\n` +
                `Swipe to view details.`
            ) },
            footer: { text: fancy("◀️ Slide left/right for more info ▶️") },
            header: {
                title: fancy(config.BOT_NAME),
                hasMediaAttachment: false
            },
            carouselMessage: {
                cards: cards
            }
        };

        // Send as regular interactive message
        const messageContent = { interactiveMessage };
        const waMessage = generateWAMessageFromContent(from, messageContent, {
            userJid: conn.user.id,
            upload: conn.waUploadToServer
        });
        await conn.relayMessage(from, waMessage.message, { messageId: waMessage.key.id });

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: '✅', key: mek.key }
        });

    } catch (e) {
        console.error("Alive error:", e);
        // Fallback plain text
        const uptime = runtime(process.uptime());
        const text = `🏓 *PING:* ${Date.now() - (mek.messageTimestamp * 1000)}ms\n🤖 *ALIVE:* Bot is online\n⏱️ *RUNTIME:* ${uptime}\n\n${config.BOT_FOOTER}`;
        await conn.sendMessage(from, { 
            text: text,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
