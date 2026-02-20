const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "praytime",
    alias: ["prayer", "salah", "ptime"],
    desc: "Get prayer times for a city",
    category: "information",
    react: "🕌",
    filename: __filename
},
async (conn, mek, m, { from, q, sender }) => {
    try {
        const city = q || "bhakkar";

        const api = `https://api.nexoracle.com/islamic/prayer-times?city=${city}`;
        const res = await axios.get(api);
        const data = res.data;

        if (data.status !== 200) throw new Error('API error');

        const times = data.result.items[0];
        const weather = data.result.today_weather;
        const location = data.result.city;

        const caption = `╭─❖〔 🐢 PRAYER TIMES 🐢 〕❖─╮
*│ 📍 ${location}, ${data.result.country}*
*│*
*│ 🌅 Fajr  : ${times.fajr}*
*│ 🌄 Shurooq: ${times.shurooq}*
*│ ☀️ Dhuhr : ${times.dhuhr}*
*│ 🌇 Asr   : ${times.asr}*
*│ 🌆 Maghrib: ${times.maghrib}*
*│ 🌃 Isha  : ${times.isha}*
*│*
*│ 🧭 Qibla : ${data.result.qibla_direction}°*
*│ 🌡️ Temp  : ${weather.temperature}°C*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: 'https://telegra.ph/file/1ece2e0281513c05d20ee.jpg' },
            caption: caption,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: "❌ *Failed to fetch prayer times*",
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
