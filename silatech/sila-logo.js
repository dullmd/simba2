const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, fetchJson } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "logo",
    alias: ["logomaker", "makelogo"],
    desc: "Create beautiful logos",
    category: "tools",
    react: "🎨",
    filename: __filename
},
async (conn, mek, m, { from, q, sender }) => {
    try {
        if (!q) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 LOGO MAKER 🐢 〕❖─╮
*│ Please provide text for logo*
*│*
*│ 📌 Usage: .logo <text>*
*│ Example: .logo SILA MD*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const menu = `╭─❖〔 🐢 LOGO STYLES 🐢 〕❖─╮
*│*
*│ 1 ➠ Black Pink*
*│ 2 ➠ Black Pink 2*
*│ 3 ➠ Silver 3D*
*│ 4 ➠ Naruto*
*│ 5 ➠ Digital Glitch*
*│ 6 ➠ Pixel Glitch*
*│ 7 ➠ Comic Style*
*│ 8 ➠ Neon Light*
*│ 9 ➠ Free Bear*
*│10 ➠ Devil Wings*
*│11 ➠ Sad Girl*
*│12 ➠ Leaves*
*│13 ➠ Dragon Ball*
*│14 ➠ Handwritten*
*│15 ➠ Neon Light*
*│16 ➠ 3D Castle*
*│17 ➠ Frozen*
*│18 ➠ 3D Balloons*
*│19 ➠ Colourful Paint*
*│20 ➠ American Flag*
*│*
*│ 📝 Text: ${q}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

*Reply with number 1-20*

${config.BOT_FOOTER}`;

        const sent = await conn.sendMessage(from, {
            text: menu,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const logoUrls = {
            '1': "https://en.ephoto360.com/create-a-blackpink-style-logo-with-members-signatures-810.html",
            '2': "https://en.ephoto360.com/online-blackpink-style-logo-maker-effect-711.html",
            '3': "https://en.ephoto360.com/create-glossy-silver-3d-text-effect-online-802.html",
            '4': "https://en.ephoto360.com/naruto-shippuden-logo-style-text-effect-online-808.html",
            '5': "https://en.ephoto360.com/create-digital-glitch-text-effects-online-767.html",
            '6': "https://en.ephoto360.com/create-pixel-glitch-text-effect-online-769.html",
            '7': "https://en.ephoto360.com/create-online-3d-comic-style-text-effects-817.html",
            '8': "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
            '9': "https://en.ephoto360.com/free-bear-logo-maker-online-673.html",
            '10': "https://en.ephoto360.com/neon-devil-wings-text-effect-online-683.html",
            '11': "https://en.ephoto360.com/write-text-on-wet-glass-online-589.html",
            '12': "https://en.ephoto360.com/create-typography-status-online-with-impressive-leaves-357.html",
            '13': "https://en.ephoto360.com/create-dragon-ball-style-text-effects-online-809.html",
            '14': "https://en.ephoto360.com/handwritten-text-on-foggy-glass-online-680.html",
            '15': "https://en.ephoto360.com/create-colorful-neon-light-text-effects-online-797.html",
            '16': "https://en.ephoto360.com/create-a-3d-castle-pop-out-mobile-photo-effect-786.html",
            '17': "https://en.ephoto360.com/create-a-frozen-christmas-text-effect-online-792.html",
            '18': "https://en.ephoto360.com/beautiful-3d-foil-balloon-effects-for-holidays-and-birthday-803.html",
            '19': "https://en.ephoto360.com/create-3d-colorful-paint-text-effect-online-801.html",
            '20': "https://en.ephoto360.com/free-online-american-flag-3d-text-effect-generator-725.html"
        };

        conn.ev.on('messages.upsert', async (event) => {
            const msg = event.messages[0];
            if (!msg.message || !msg.message.extendedTextMessage) return;

            const replyId = msg.message.extendedTextMessage.contextInfo?.stanzaId;
            if (replyId !== sent.key.id) return;

            const choice = msg.message.extendedTextMessage.text.trim();
            
            if (!logoUrls[choice]) {
                return await conn.sendMessage(from, {
                    text: "❌ *Invalid choice! Reply with 1-20*",
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }

            await conn.sendMessage(from, {
                text: "🎨 *Creating your logo...*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            try {
                const api = `https://api-pink-venom.vercel.app/api/logo?url=${logoUrls[choice]}&name=${q}`;
                const res = await axios.get(api);
                const imgUrl = res.data.result.download_url;

                const caption = `╭─❖〔 🐢 LOGO CREATED 🐢 〕❖─╮
*│ ✨ Text: ${q}*
*│ 🎨 Style: ${choice}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

                await conn.sendMessage(from, {
                    image: { url: imgUrl },
                    caption: caption,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });

            } catch (e) {
                console.error(e);
                await conn.sendMessage(from, {
                    text: "❌ *Failed to create logo*",
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        });

    } catch (e) {
        console.error(e);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${e.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
