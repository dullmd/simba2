const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "getbot",
    alias: ["pair", "bot"],
    desc: "Get your own bot pairing code",
    category: "general",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const userNumber = sender.split('@')[0];
        
        // Check if user provided a different number
        let targetNumber = userNumber;
        if (args[0]) {
            targetNumber = args[0].replace(/[^0-9]/g, '');
            if (targetNumber.length < 10) {
                return await conn.sendMessage(from, {
                    text: `❌ *𝙸𝚗𝚟𝚊𝚕𝚒𝚍 𝚗𝚞𝚖𝚋𝚎𝚛!*\n\n𝚄𝚜𝚎: .getbot <𝚗𝚞𝚖𝚋𝚎𝚛>\n𝙴𝚡𝚊𝚖𝚙𝚕𝚎: .getbot 255712345678`,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            }
        }

        // Send initial message
        await conn.sendMessage(from, {
            text: `*╭━━━〔 🔗 𝙶𝙴𝚃 𝚈𝙾𝚄𝚁 𝙱𝙾𝚃 〕━━━┈⊷*\n*┃*\n*┃ 📱 𝙽𝚞𝚖𝚋𝚎𝚛: ${targetNumber}*\n*┃*\n*┃ ⏳ 𝙶𝚎𝚗𝚎𝚛𝚊𝚝𝚒𝚗𝚐 𝚢𝚘𝚞𝚛 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎...*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Call pairing API
        const apiUrl = `https://simba2.onrender.com/code?number=${targetNumber}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!response.data || !response.data.code) {
            throw new Error('No pairing code received');
        }

        const pairCode = response.data.code;

        // Send the code with copy button
        const copyButton = {
            text: `*╭━━━〔 ✅ 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙴 〕━━━┈⊷*\n*┃*\n*┃ 🔑 *𝚈𝙾𝚄𝚁 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙳𝙴:*\n*┃*\n*┃ 📋 *${pairCode}*\n*┃*\n*┃ 📝 *𝙷𝙾𝚆 𝚃𝙾 𝚄𝚂𝙴:*\n*┃ 1. 𝙾𝚙𝚎𝚗 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙*\n*┃ 2. 𝙶𝚘 𝚝𝚘 𝙻𝚒𝚗𝚔𝚎𝚍 𝙳𝚎𝚟𝚒𝚌𝚎𝚜*\n*┃ 3. 𝙲𝚕𝚒𝚌𝚔 \"𝙻𝚒𝚗𝚔 𝚊 𝙳𝚎𝚟𝚒𝚌𝚎\"*\n*┃ 4. 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚌𝚘𝚍𝚎 𝚊𝚋𝚘𝚟𝚎*\n*┃*\n*┃ ⏰ 𝙲𝚘𝚍𝚎 𝚎𝚡𝚙𝚒𝚛𝚎𝚜 𝚒𝚗 5 𝚖𝚒𝚗𝚞𝚝𝚎𝚜*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: {
                ...getContextInfo({ sender: sender }),
                externalAdReply: {
                    title: `📋 𝙲𝚕𝚒𝚌𝚔 𝚝𝚘 𝙲𝚘𝚙𝚢 𝙲𝚘𝚍𝚎`,
                    body: `${pairCode}`,
                    mediaType: 1,
                    previewType: 0,
                    thumbnailUrl: config.IMAGE_PATH,
                    sourceUrl: `https://simba2.onrender.com`,
                    renderLargerThumbnail: false,
                }
            }
        };

        await conn.sendMessage(from, copyButton, { quoted: fkontak });

        // Send code separately as text for easy copying
        await conn.sendMessage(from, {
            text: `📋 *𝙲𝚘𝚙𝚢 𝚌𝚘𝚍𝚎:* ${pairCode}`,
            contextInfo: getContextInfo({ sender: sender })
        });

    } catch (error) {
        console.error('Getbot command error:', error);
        
        let errorMessage = '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎';
        if (error.response) {
            errorMessage = `𝚂𝚎𝚛𝚟𝚎𝚛 𝚎𝚛𝚛𝚘𝚛: ${error.response.status}`;
        } else if (error.code === 'ECONNABORTED') {
            errorMessage = '𝚁𝚎𝚚𝚞𝚎𝚜𝚝 𝚝𝚒𝚖𝚎𝚍 𝚘𝚞𝚝';
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${errorMessage}\n\n𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛.`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
