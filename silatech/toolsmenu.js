const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "toolsmenu",
    alias: ["tmenu", "minitools"],
    desc: "Show all mini tools commands",
    category: "tools",
    react: "🛠️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const toolsMenu = `╭─❖〔 🐢 MINI TOOLS MENU 🐢 〕❖─╮
*│*
*│ 🧮 .calc 5+5*
*│    Simple calculator*
*│*
*│ 📊 .percentage 50 200*
*│    Calculate percentage*
*│*
*│ 🎲 .randomnumber 1 100*
*│    Generate random number*
*│*
*│ 🔐 .password 10*
*│    Generate random password*
*│*
*│ 🆔 .uuid*
*│    Generate UUID v4*
*│*
*│ 🎨 .colorcode*
*│    Generate random color*
*│*
*│ 🔢 .hex text*
*│    Convert text to hex*
*│*
*│ 🎭 .ascii text*
*│    Show ASCII codes*
*│*
*│ 🔤 .charcount text*
*│    Count characters*
*│*
*│ 📝 .wordcount text*
*│    Count words*
*│*
*│ 📏 .linecount text*
*│    Count lines*
*│*
*│ 📐 .length text*
*│    Get string length*
*│*
*│ ⏲️ .timer 10*
*│    Set a timer*
*│*
*│ 🔔 .remind 5m message*
*│    Set a reminder*
*│*
*│ ⏳ .countdown 10*
*│    Start countdown*
*│*
*│ ⏹️ .stopcountdown*
*│    Stop countdown*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: toolsMenu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Toolsmenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
