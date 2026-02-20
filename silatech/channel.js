const { cmd } = global;
const config = require('../config');

const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02";

cmd({
    pattern: "channel",
    alias: ["ch", "newsletter"],
    desc: "Get bot channel link",
    category: "general",
    react: "📢",
    filename: __filename
}, async (conn, mek, m, { from, sender, prefix }) => {
    try {
        const text = `*╭━━━〔 📢 𝙱𝙾𝚃 𝙲𝙷𝙰𝙽𝙽𝙴𝙻 〕━━━┈⊷*\n*┃🐢│*\n*┃🐢│ 𝙵𝚘𝚕𝚕𝚘𝚠 𝚘𝚞𝚛 𝚘𝚏𝚏𝚒𝚌𝚒𝚊𝚕 𝚌𝚑𝚊𝚗𝚗𝚎𝚕:*\n*┃🐢│*\n*┃🐢│ 🔗 ${CHANNEL_LINK}*\n*┃🐢│*\n*┃🐢│ 𝙶𝚎𝚝 𝚕𝚊𝚝𝚎𝚜𝚝 𝚞𝚙𝚍𝚊𝚝𝚎𝚜, 𝚗𝚎𝚠𝚜, 𝚊𝚗𝚍 𝚊𝚗𝚗𝚘𝚞𝚗𝚌𝚎𝚖𝚎𝚗𝚝𝚜!*\n*┃🐢│*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n> ${config.BOT_FOOTER}`;

        // Create button with direct link
        const buttonMessage = {
            text: text,
            footer: `${config.BOT_NAME} © 2026`,
            buttons: [
                { 
                    buttonId: CHANNEL_LINK, 
                    buttonText: { displayText: "🔗 𝙾𝙿𝙴𝙽 𝙲𝙷𝙰𝙽𝙽𝙴𝙻" }, 
                    type: 1,
                    url: CHANNEL_LINK
                }
            ],
            headerType: 1,
            mentions: [sender]
        };

        await conn.sendMessage(from, buttonMessage, { quoted: mek });

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: '📢', key: mek.key }
        });

    } catch (error) {
        console.error('Channel command error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            mentions: [sender]
        }, { quoted: mek });
    }
});
