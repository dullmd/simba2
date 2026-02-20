const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 GARL (LOLI)
// ============================================
cmd({
    pattern: "garl",
    alias: ["loli"],
    desc: "Random loli image",
    category: "anime",
    react: "😎",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.lolicon.app/setu/v2?num=1&r18=0&tag=lolicon');
        await conn.sendMessage(from, {
            image: { url: res.data.data[0].urls.original },
            caption: `╭─❖〔 🐢 LOLI 🐢 〕❖─╮
*│*
*│ 😎 Random Loli Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 WAIFU
// ============================================
cmd({
    pattern: "waifu",
    alias: ["imgwaifu"],
    desc: "Random waifu image",
    category: "anime",
    react: "💫",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/waifu');
        await conn.sendMessage(from, {
            image: { url: res.data.url },
            caption: `╭─❖〔 🐢 WAIFU 🐢 〕❖─╮
*│*
*│ 💫 Random Waifu Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 NEKO
// ============================================
cmd({
    pattern: "neko",
    alias: ["imgneko"],
    desc: "Random neko image",
    category: "anime",
    react: "😺",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/neko');
        await conn.sendMessage(from, {
            image: { url: res.data.url },
            caption: `╭─❖〔 🐢 NEKO 🐢 〕❖─╮
*│*
*│ 😺 Random Neko Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 MEGUMIN
// ============================================
cmd({
    pattern: "megumin",
    alias: ["imgmegumin"],
    desc: "Random megumin image",
    category: "anime",
    react: "💥",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/megumin');
        await conn.sendMessage(from, {
            image: { url: res.data.url },
            caption: `╭─❖〔 🐢 MEGUMIN 🐢 〕❖─╮
*│*
*│ 💥 Random Megumin Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 MAID
// ============================================
cmd({
    pattern: "maid",
    alias: ["imgmaid"],
    desc: "Random maid image",
    category: "anime",
    react: "👗",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.im/search/?included_tags=maid');
        await conn.sendMessage(from, {
            image: { url: res.data.images[0].url },
            caption: `╭─❖〔 🐢 MAID 🐢 〕❖─╮
*│*
*│ 👗 Random Maid Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 AWOO
// ============================================
cmd({
    pattern: "awoo",
    alias: ["imgawoo"],
    desc: "Random awoo image",
    category: "anime",
    react: "🐺",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/awoo');
        await conn.sendMessage(from, {
            image: { url: res.data.url },
            caption: `╭─❖〔 🐢 AWOO 🐢 〕❖─╮
*│*
*│ 🐺 Random Awoo Image*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed*",
            contextInfo: getContextInfo({ sender: m.sender })
        }, { quoted: fkontak });
    }
});
