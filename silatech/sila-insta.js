const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "insta",
    alias: ["ig", "igdl", "reel"],
    desc: "Download Instagram post/reel",
    category: "downloader",
    react: "📸",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 INSTAGRAM 🐢 〕❖─╮
*│ Please provide Instagram link*
*│*
*│ 📌 Usage: .insta <url>*
*│ Example: .insta https://www.instagram.com/p/xxxx*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        if (!q.includes('instagram.com')) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid Instagram link!*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        const api = `https://delirius-apiofc.vercel.app/download/igv2?url=${q}`;
        const res = await axios.get(api);
        const data = res.data.data;

        if (!data) throw new Error('No data');

        const caption = `╭─❖〔 🐢 INSTAGRAM 🐢 〕❖─╮
*│ 👤 @${data.username}*
*│ ❤️ ${data.likes}  💬 ${data.comments}*
*│*
*│ 📝 ${data.caption?.substring(0, 50) || 'No caption'}...*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        for (let media of data.download) {
            if (media.type === 'image') {
                await conn.sendMessage(from, {
                    image: { url: media.url },
                    caption: caption,
                    contextInfo: getContextInfo({ sender: m.sender })
                }, { quoted: fkontak });
            } else {
                await conn.sendMessage(from, {
                    video: { url: media.url },
                    caption: caption,
                    contextInfo: getContextInfo({ sender: m.sender })
                }, { quoted: fkontak });
            }
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to download*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
