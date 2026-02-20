const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

// ============================================
// 📌 ANIME GIRL PACK 1
// ============================================
cmd({
    pattern: "animegirl",
    desc: "Random anime girl pack 1",
    category: "anime",
    react: "🧚",
    filename: __filename
},
async (conn, mek, m, { from }) => {
    try {
        const res = await axios.get('https://api.waifu.pics/sfw/waifu');
        await conn.sendMessage(from, {
            image: { url: res.data.url },
            caption: `╭─❖〔 🐢 ANIME GIRL 🐢 〕❖─╮
*│*
*│ 🧚 Random Anime Girl*
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
// 📌 ANIME PACK (Multiple Images)
// ============================================
const animePacks = [
    {
        pattern: "anime1",
        images: [
            'https://i.waifu.pics/aD7t0Bc.jpg',
            'https://i.waifu.pics/PQO5wPN.jpg',
            'https://i.waifu.pics/5At1P4A.jpg',
            'https://i.waifu.pics/MjtH3Ha.jpg',
            'https://i.waifu.pics/QQW7VKy.jpg'
        ]
    },
    {
        pattern: "anime2",
        images: [
            'https://i.waifu.pics/0r1Bn88.jpg',
            'https://i.waifu.pics/2Xdpuov.png',
            'https://i.waifu.pics/0hx-3AP.png',
            'https://i.waifu.pics/q054x0_.png',
            'https://i.waifu.pics/4lyqRvd.jpg'
        ]
    },
    {
        pattern: "anime3",
        images: [
            'https://i.waifu.pics/gnpc_Lr.jpeg',
            'https://i.waifu.pics/P6X-ph6.jpg',
            'https://i.waifu.pics/~p5W9~k.png',
            'https://i.waifu.pics/7Apu5C9.jpg',
            'https://i.waifu.pics/OTRfON6.jpg'
        ]
    },
    {
        pattern: "anime4",
        images: [
            'https://i.waifu.pics/aGgUm80.jpg',
            'https://i.waifu.pics/i~RQhRD.png',
            'https://i.waifu.pics/94LH-aU.jpg',
            'https://i.waifu.pics/V8hvqfK.jpg',
            'https://i.waifu.pics/lMiXE7j.png'
        ]
    },
    {
        pattern: "anime5",
        images: [
            'https://i.waifu.pics/-ABlAvr.jpg',
            'https://i.waifu.pics/HNEg0-Q.png',
            'https://i.waifu.pics/3x~ovC6.jpg',
            'https://i.waifu.pics/brv-GJu.jpg',
            'https://i.waifu.pics/FWE8ggD.png'
        ]
    }
];

animePacks.forEach(pack => {
    cmd({
        pattern: pack.pattern,
        desc: `Anime pack ${pack.pattern}`,
        category: "anime",
        react: "🎴",
        filename: __filename
    },
    async (conn, mek, m, { from }) => {
        try {
            for (let img of pack.images) {
                await conn.sendMessage(from, {
                    image: { url: img },
                    caption: `╭─❖〔 🐢 ANIME PACK 🐢 〕❖─╮
*│*
*│ 🎴 ${pack.pattern.toUpperCase()}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                    contextInfo: getContextInfo({ sender: m.sender })
                }, { quoted: fkontak });
            }
        } catch (e) {
            console.error(e);
            await conn.sendMessage(from, {
                text: "❌ *Failed*",
                contextInfo: getContextInfo({ sender: m.sender })
            }, { quoted: fkontak });
        }
    });
});
