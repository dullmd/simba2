const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "aimenu",
    alias: ["aihelp", "aicmds"],
    desc: "Show all AI-related commands",
    category: "ai",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const aiMenu = `╭─❖〔 🐢 AI MENU 🐢 〕❖─╮
*│*
*│ 🤖 *AI CHAT COMMANDS*
*│*
*│ 💬 .ai <message>*
*│    Rule-based AI chat*
*│*
*│ 🔄 .autoreply on/off*
*│    Toggle auto AI replies*
*│*
*│ 📝 .generatebio*
*│    Generate random bio*
*│*
*│ 🏷️ .generatename*
*│    Generate random name*
*│*
*│ 💪 .motivation*
*│    Get motivational quote*
*│*
*│ ❤️ .lovequote*
*│    Get romantic quote*
*│*
*│ 🥺 .sadquote*
*│    Get sad/emotional quote*
*│*
*│ 👾 .hackerquote*
*│    Get hacker-style quote*
*│*
*│ 😏 .pickup*
*│    Get pickup line*
*│*
*│ 💭 .advice*
*│    Get life advice*
*│*
*│ 📌 .fact*
*│    Get random fact*
*│*
*│ 📜 .history*
*│    Get historical fact*
*│*
*│ 📖 .define <word>*
*│    Define a word*
*│*
*│ 🧮 .calculate <expr>*
*│    Calculate math expression*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: aiMenu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Aimenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
