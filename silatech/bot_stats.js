const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const os = require('os');

cmd({
    pattern: "bot_stats",
    alias: ["stats", "system"],
    desc: "Show detailed bot statistics",
    category: "general",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const usedMemory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        const totalMemory = Math.round(os.totalmem() / 1024 / 1024);
        const freeMemory = Math.round(os.freemem() / 1024 / 1024);
        const cpuCount = os.cpus().length;
        const cpuModel = os.cpus()[0].model;
        const platform = os.platform();
        const arch = os.arch();
        const hostname = os.hostname();
        const uptime = os.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        const activeCount = global.activeSockets?.size || 0;
        const commandCount = global.commands?.size || 0;

        const statsText = `*╭━━━〔 🐢 𝚂𝚈𝚂𝚃𝙴𝙼 𝚂𝚃𝙰𝚃𝚂 〕━━━┈⊷*
*┃🐢│*
*┃🐢│ 💾 𝚁𝙰𝙼 𝚄𝚜𝚊𝚐𝚎*
*┃🐢│ ├ 𝚄𝚜𝚎𝚍: ${usedMemory} MB*
*┃🐢│ ├ 𝙵𝚛𝚎𝚎: ${freeMemory} MB*
*┃🐢│ └ 𝚃𝚘𝚝𝚊𝚕: ${totalMemory} MB*
*┃🐢│*
*┃🐢│ 🖥️ 𝙲𝙿𝚄 𝙸𝚗𝚏𝚘*
*┃🐢│ ├ 𝙼𝚘𝚍𝚎𝚕: ${cpuModel.substring(0, 30)}...*
*┃🐢│ └ 𝙲𝚘𝚛𝚎𝚜: ${cpuCount}*
*┃🐢│*
*┃🐢│ 🌐 𝙿𝚕𝚊𝚝𝚏𝚘𝚛𝚖*
*┃🐢│ ├ 𝙾𝚂: ${platform}*
*┃🐢│ ├ 𝙰𝚛𝚌𝚑: ${arch}*
*┃🐢│ └ 𝙷𝚘𝚜𝚝: ${hostname}*
*┃🐢│*
*┃🐢│ 🤖 𝙱𝚘𝚝 𝚂𝚝𝚊𝚝𝚜*
*┃🐢│ ├ 𝙰𝚌𝚝𝚒𝚟𝚎 𝚂𝚎𝚜𝚜𝚒𝚘𝚗𝚜: ${activeCount}*
*┃🐢│ ├ 𝙲𝚘𝚖𝚖𝚊𝚗𝚍𝚜: ${commandCount}*
*┃🐢│ └ 𝚂𝚢𝚜𝚝𝚎𝚖 𝚄𝚙𝚝𝚒𝚖𝚎: ${hours}h ${minutes}m ${seconds}s*
*┃🐢│*
*╰━━━━━━━━━━━━━━━┈⊷*

> ${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: statsText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Stats error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
