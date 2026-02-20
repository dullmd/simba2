const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "twitter",
    alias: ["tw", "twdl", "xdl"],
    desc: "Download Twitter/X videos",
    category: "downloader",
    react: "🐦",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 TWITTER 🐢 〕❖─╮
*│ Please provide Twitter link*
*│*
*│ 📌 Usage: .twitter <url>*
*│ Example: .twitter https://twitter.com/xxx*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        if (!q.includes('twitter.com') && !q.includes('x.com')) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid Twitter/X link!*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "⏳ *Downloading...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://www.dark-yasiya-api.site/download/twitter?url=${q}`;
        const res = await axios.get(api);
        const data = res.data.result;

        if (!data) throw new Error('No data');

        const caption = `╭─❖〔 🐢 TWITTER 🐢 〕❖─╮
*│ 📝 ${data.desc || 'No description'}*
*│*
*│ 🎥 HD | SD Available*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            video: { url: data.video_hd || data.video_sd },
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to download*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
