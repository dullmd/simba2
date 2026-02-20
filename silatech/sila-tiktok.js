const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "tiktok",
    alias: ["tt", "ttdl", "tiktokdl"],
    desc: "Download TikTok video",
    category: "downloader",
    react: "🎵",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 TIKTOK 🐢 〕❖─╮
*│ Please provide TikTok link*
*│*
*│ 📌 Usage: .tiktok <url>*
*│ Example: .tiktok https://vm.tiktok.com/xxxx*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        if (!q.includes('tiktok.com')) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid TikTok link!*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "⏳ *Downloading...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://delirius-apiofc.vercel.app/download/tiktok?url=${q}`;
        const res = await axios.get(api);
        const data = res.data.data;

        if (!data) throw new Error('No data');

        const video = data.meta.media.find(v => v.type === 'video').org;
        const caption = `╭─❖〔 🐢 TIKTOK 🐢 〕❖─╮
*│ 👤 @${data.author.username}*
*│ 🎵 ${data.title || 'No title'}*
*│*
*│ 👍 ${data.like}  💬 ${data.comment}  🔁 ${data.share}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            video: { url: video },
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender, mentionedJid: [m.sender] })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to download*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
