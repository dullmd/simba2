const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "pinterest",
    alias: ["pin", "pins", "pindl"],
    desc: "Download from Pinterest",
    category: "downloader",
    react: "📌",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 PINTEREST 🐢 〕❖─╮
*│ Please provide Pinterest link*
*│*
*│ 📌 Usage: .pinterest <url>*
*│ Example: .pinterest https://pin.it/xxxx*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        if (!q.includes('pinterest.com') && !q.includes('pin.it')) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid Pinterest link!*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "⏳ *Downloading...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://api.giftedtech.web.id/api/download/pinterestdl?apikey=gifted&url=${encodeURIComponent(q)}`;
        const res = await axios.get(api);
        const data = res.data.result;

        if (!data) throw new Error('No data');

        const caption = `╭─❖〔 🐢 PINTEREST 🐢 〕❖─╮
*│ 📌 ${data.title || 'Pinterest Post'}*
*│*
*│ 📝 ${data.description?.substring(0, 50) || 'No description'}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        const video = data.media.find(item => item.type.includes('720p'))?.download_url;
        const image = data.media.find(item => item.type === 'Thumbnail')?.download_url;

        if (video) {
            await conn.sendMessage(from, {
                video: { url: video },
                caption: caption,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        } else if (image) {
            await conn.sendMessage(from, {
                image: { url: image },
                caption: caption,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        } else {
            throw new Error('No media found');
        }

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to download*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
