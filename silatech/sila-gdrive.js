const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "gdrive",
    alias: ["gd", "googledrive"],
    desc: "Download Google Drive files",
    category: "downloader",
    react: "📁",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 GDRIVE 🐢 〕❖─╮
*│ Please provide GDrive link*
*│*
*│ 📌 Usage: .gdrive <url>*
*│ Example: .gdrive https://drive.google.com/xxx*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        if (!q.includes('drive.google.com')) {
            return await conn.sendMessage(from, {
                text: "❌ *Invalid Google Drive link!*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "⏳ *Fetching...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `https://api.fgmods.xyz/api/downloader/gdrive?url=${q}&apikey=mnp3grlZ`;
        const res = await axios.get(api);
        const data = res.data.result;

        if (!data) throw new Error('No data');

        const caption = `╭─❖〔 🐢 GDRIVE 🐢 〕❖─╮
*│ 📁 ${data.fileName}*
*│ 📏 ${(data.size / 1048576).toFixed(2)} MB*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            document: { url: data.downloadUrl },
            fileName: data.fileName,
            mimetype: data.mimetype,
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
