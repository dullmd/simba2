const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "dog",
    alias: ["dogs", "puppy"],
    desc: "Random dog image",
    category: "fun",
    react: "🐶",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://dog.ceo/api/breeds/image/random');
        
        await conn.sendMessage(from, {
            image: { url: res.data.message },
            caption: `╭─❖〔 🐢 DOG 🐢 〕❖─╮
*│*
*│ 🐶 Random Dog Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
        
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to fetch dog image*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
