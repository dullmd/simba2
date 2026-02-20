const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "apk",
    alias: ["apkdl", "app"],
    desc: "Download APK from Aptoide",
    category: "downloader",
    react: "📦",
    filename: __filename
},
async (conn, mek, m, { from, q }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 APK DOWNLOADER 🐢 〕❖─╮
*│ Please provide app name*
*│*
*│ 📌 Usage: .apk <app name>*
*│ Example: .apk whatsapp*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: "⏳ *Searching...*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

        const api = `http://ws75.aptoide.com/api/7/apps/search/query=${q}/limit=1`;
        const res = await axios.get(api);
        const app = res.data.datalist.list[0];

        if (!app) throw new Error('Not found');

        const size = (app.size / 1048576).toFixed(2);
        const caption = `╭─❖〔 🐢 APK FOUND 🐢 〕❖─╮
*│ 📦 ${app.name}*
*│ 📏 ${size} MB*
*│ 📦 ${app.package}*
*│ 👤 ${app.developer.name}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            document: { url: app.file.path_alt },
            fileName: `${app.name}.apk`,
            mimetype: "application/vnd.android.package-archive",
            caption: caption,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *App not found*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
