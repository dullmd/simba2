const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "textmenu",
    alias: ["tmenu", "tools"],
    desc: "Show all text tools commands",
    category: "texttools",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const textMenu = `╭─❖〔 🐢 TEXT TOOLS MENU 🐢 〕❖─╮
*│*
*│ 🔄 .reverse <text>*
*│    Reverse text*
*│*
*│ ⬆️ .uppercase <text>*
*│    Convert to UPPERCASE*
*│*
*│ ⬇️ .lowercase <text>*
*│    Convert to lowercase*
*│*
*│ ✨ .fancy <style> <text>*
*│    Fancy text (styles 1-5)*
*│*
*│ 0️⃣1️⃣ .binary <text>*
*│    Convert to binary*
*│*
*│ 🔐 .base64 <text>*
*│    Convert to Base64*
*│*
*│ 🔓 .decode64 <base64>*
*│    Decode Base64*
*│*
*│ 📻 .morse <text>*
*│    Convert to Morse code*
*│*
*│ 📡 .unmorse <morse>*
*│    Convert Morse to text*
*│*
*│ 🔢 .count <text>*
*│    Count chars/words/lines*
*│*
*│ ✂️ .readmore <limit> <text>*
*│    Truncate long text*
*│*
*│ 🔁 .repeat <count> <text>*
*│    Repeat text*
*│*
*│ ✂️ .shorten <text>*
*│    Remove extra spaces*
*│*
*│ 🏷️ .nickname @user*
*│    Get user nickname*
*│*
*│ 🏷️ .tagmsg <text>*
*│    Tag a message*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: textMenu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        console.error('Textmenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
