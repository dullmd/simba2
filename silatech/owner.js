const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "owner",
    alias: ["creator", "developer", "sila"],
    desc: "Show bot owner information",
    category: "general",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const vcard = 'BEGIN:VCARD\n' +
            'VERSION:3.0\n' +
            `FN:${config.OWNER_NAME}\n` +
            'ORG:𝙎𝙄𝙇𝘼 𝙏𝙚𝙘𝙝;\n' +
            `TEL;type=CELL;type=VOICE;waid=${config.OWNER_NUMBER}:+${config.OWNER_NUMBER}\n` +
            'ITEM1.URL:https://github.com/Sila-Md\n' +
            'ITEM1.X-ABLabel:GitHub\n' +
            'END:VCARD';

        await conn.sendMessage(from, {
            contacts: {
                displayName: config.OWNER_NAME,
                contacts: [{ vcard }]
            },
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            text: `👑 *${config.OWNER_NAME}*\n\n📞 wa.me/${config.OWNER_NUMBER}\n💬 Bot: ${config.BOT_NAME}\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Owner error:', error);
        await conn.sendMessage(from, {
            text: `👑 *𝙾𝚠𝚗𝚎𝚛*\n\n📞 ${config.OWNER_NUMBER}\n\n> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
