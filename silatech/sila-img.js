const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "img",
    alias: ["pinterest", "image", "searchpin"],
    react: "🚀",
    desc: "Search and download Pinterest images",
    category: "fun",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const query = args.join(" ");
        if (!query) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ ❌ Please provide a search query*
*│*
*│ 📝 Usage: .img <keywords>*
*│ Example: .img beautiful nature*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Send searching message
        const searchingMsg = await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ 🔎 Searching images for:*
*│ 📝 ${query}*
*│*
*│ ⏳ Please wait...*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Fetch images from API
        const url = `https://api.diioffc.web.id/api/search/pinterest?query=${encodeURIComponent(query)}`;
        const response = await axios.get(url);

        if (!response.data || !response.data.result || response.data.result.length === 0) {
            return await conn.sendMessage(from, {
                text: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ ❌ No results found for:*
*│ 📝 ${query}*
*│*
*│ 🔍 Try another keyword*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const results = response.data.result;
        
        // Randomly select 5 images
        const selectedImages = results.sort(() => 0.5 - Math.random()).slice(0, 5);
        
        let currentIndex = 0;
        let totalImages = selectedImages.length;

        // Function to send image with navigation buttons
        const sendImageWithButtons = async (index) => {
            const image = selectedImages[index];
            
            // Create navigation buttons
            const buttons = [];
            
            // Previous button (if not first)
            if (index > 0) {
                buttons.push({
                    buttonId: `img_prev_${query}_${index - 1}`,
                    buttonText: { displayText: '⬅️ PREV' },
                    type: 1
                });
            }
            
            // Next button (if not last)
            if (index < totalImages - 1) {
                buttons.push({
                    buttonId: `img_next_${query}_${index + 1}`,
                    buttonText: { displayText: 'NEXT ➡️' },
                    type: 1
                });
            }

            const buttonMessage = {
                image: { url: image.src },
                caption: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ 🔍 Query: ${query}*
*│ 🖼️ Image: ${index + 1}/${totalImages}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            };

            // If there are buttons, add them
            if (buttons.length > 0) {
                const buttonMessageWithButtons = {
                    image: { url: image.src },
                    caption: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ 🔍 Query: ${query}*
*│ 🖼️ Image: ${index + 1}/${totalImages}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                    viewOnce: true,
                    buttons: buttons,
                    headerType: 4
                };
                
                await conn.sendMessage(from, buttonMessageWithButtons, { quoted: fkontak });
            } else {
                await conn.sendMessage(from, buttonMessage, { quoted: fkontak });
            }
        };

        // Send first image
        await sendImageWithButtons(currentIndex);

    } catch (error) {
        console.error('Image command error:', error);
        await conn.sendMessage(from, {
            text: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ ❌ Error: ${error.message}*
*│*
*│ 🔄 Please try again later*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 BUTTON RESPONSE HANDLER
// ============================================
cmd({ on: "buttons-response" }, async (conn, mek, m) => {
    try {
        const buttonId = mek.message?.buttonsResponseMessage?.selectedButtonId;
        if (!buttonId) return;

        // Check if it's our image navigation button
        if (buttonId.startsWith('img_prev_') || buttonId.startsWith('img_next_')) {
            const parts = buttonId.split('_');
            const action = parts[1]; // prev or next
            const query = parts.slice(2, -1).join('_');
            const index = parseInt(parts[parts.length - 1]);

            // Fetch images again
            const url = `https://api.diioffc.web.id/api/search/pinterest?query=${encodeURIComponent(query)}`;
            const response = await axios.get(url);

            if (!response.data || !response.data.result || response.data.result.length === 0) {
                return await conn.sendMessage(mek.key.remoteJid, {
                    text: "❌ No results found",
                }, { quoted: fkontak });
            }

            const results = response.data.result;
            const selectedImages = results.sort(() => 0.5 - Math.random()).slice(0, 5);
            
            // Create navigation buttons
            const buttons = [];
            
            if (index > 0) {
                buttons.push({
                    buttonId: `img_prev_${query}_${index - 1}`,
                    buttonText: { displayText: '⬅️ PREV' },
                    type: 1
                });
            }
            
            if (index < selectedImages.length - 1) {
                buttons.push({
                    buttonId: `img_next_${query}_${index + 1}`,
                    buttonText: { displayText: 'NEXT ➡️' },
                    type: 1
                });
            }

            const buttonMessage = {
                image: { url: selectedImages[index].src },
                caption: `╭─❖〔 🐢 IMAGE SEARCH 🐢 〕❖─╮
*│*
*│ 🔍 Query: ${query}*
*│ 🖼️ Image: ${index + 1}/${selectedImages.length}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`,
                viewOnce: true,
                buttons: buttons,
                headerType: 4
            };

            await conn.sendMessage(mek.key.remoteJid, buttonMessage, { quoted: fkontak });
        }
    } catch (error) {
        console.error('Button response error:', error);
    }
});
