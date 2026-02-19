const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const axios = require('axios');

cmd({
    pattern: "menu2",
    alias: ["buttonmenu", "bmenu"],
    desc: "Interactive button menu",
    category: "general",
    react: "🔘",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner }) => {
    try {
        const sections = [
            {
                title: "📌 𝙼𝙰𝙸𝙽 𝙼𝙴𝙽𝚄",
                rows: [
                    { title: "👑 𝙾𝚠𝚗𝚎𝚛", description: "View bot owner info", id: "owner" },
                    { title: "📋 𝙰𝚕𝚕𝙼𝚎𝚗𝚞", description: "Show all commands", id: "allmenu" },
                    { title: "🤖 𝙰𝚕𝚒𝚟𝚎", description: "Check if bot is alive", id: "alive" },
                    { title: "⚡ 𝙿𝚒𝚗𝚐", description: "Check bot speed", id: "ping" },
                    { title: "🔗 𝙶𝚎𝚝 𝙱𝚘𝚝", description: "Get your own bot", id: "getbot" }
                ]
            }
        ];

        const listMessage = {
            title: `🐢 ${config.BOT_NAME}`,
            text: `*𝙿𝚕𝚎𝚊𝚜𝚎 𝚜𝚎𝚕𝚎𝚌𝚝 𝚊𝚗 𝚘𝚙𝚝𝚒𝚘𝚗 𝚋𝚎𝚕𝚘𝚠:*\n\n> ${config.BOT_FOOTER}`,
            footer: config.BOT_FOOTER,
            buttonText: "🔘 𝙲𝙻𝙸𝙲𝙺 𝙼𝙴𝙽𝚄",
            sections
        };

        const sentMsg = await conn.sendMessage(from, listMessage, { quoted: fkontak });

        // Store message ID for button response handling
        global.menu2Messages = global.menu2Messages || new Map();
        global.menu2Messages.set(sentMsg.key.id, {
            from,
            sender,
            timestamp: Date.now()
        });

    } catch (error) {
        console.error('Menu2 error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});

// ============================================
// 📌 HANDLE BUTTON RESPONSES
// ============================================
cmd({ on: "body" }, async (conn, mek, m, { from, sender, body, isGroup }) => {
    try {
        // Check if this is a button response
        if (!mek.message?.listResponseMessage) return;

        const selectedId = mek.message.listResponseMessage.singleSelectReply.selectedRowId;
        if (!selectedId) return;

        console.log('Button clicked:', selectedId);

        // Handle each button
        switch (selectedId) {
            case 'owner':
                await handleOwnerCommand(conn, from, sender, mek);
                break;
                
            case 'allmenu':
                await handleAllMenuCommand(conn, from, sender, mek);
                break;
                
            case 'alive':
                await handleAliveCommand(conn, from, sender, mek);
                break;
                
            case 'ping':
                await handlePingCommand(conn, from, sender, mek);
                break;
                
            case 'getbot':
                await handleGetBotCommand(conn, from, sender, mek);
                break;
                
            default:
                console.log('Unknown button:', selectedId);
        }

    } catch (error) {
        console.error('Button handler error:', error);
    }
});

// ============================================
// 📌 OWNER COMMAND HANDLER
// ============================================
async function handleOwnerCommand(conn, from, sender, mek) {
    try {
        const ownerNumber = config.OWNER_NUMBER;
        const ownerName = config.OWNER_NAME || '𝐒𝐈𝐋𝐀 𝐌𝐃';
        
        const text = `*╭━━━〔 👑 𝙱𝙾𝚃 𝙾𝚆𝙽𝙴𝚁 〕━━━┈⊷*\n*┃*\n*┃ 📛 𝙽𝚊𝚖𝚎: ${ownerName}*\n*┃ 📞 𝙽𝚞𝚖𝚋𝚎𝚛: wa.me/${ownerNumber}*\n*┃*\n*┃ 💬 𝙵𝚎𝚎𝚕 𝚏𝚛𝚎𝚎 𝚝𝚘 𝚌𝚘𝚗𝚝𝚊𝚌𝚝 𝚖𝚎!*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: text,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });

    } catch (error) {
        console.error('Owner button error:', error);
    }
}

// ============================================
// 📌 ALL MENU COMMAND HANDLER
// ============================================
async function handleAllMenuCommand(conn, from, sender, mek) {
    try {
        const totalCommands = global.commands.size;
        
        // Group commands by category
        const categories = {};
        global.commands.forEach((cmd, name) => {
            if (!categories[cmd.category]) categories[cmd.category] = [];
            
            const exists = categories[cmd.category].some(c => c.pattern === cmd.pattern);
            if (!exists) {
                categories[cmd.category].push({
                    pattern: cmd.pattern,
                    react: cmd.react || '✅'
                });
            }
        });

        let menuText = `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*\n`;
        menuText += `*┃🐢│ 𝙲𝙼𝙳𝚂: ${totalCommands}*\n`;
        menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;

        for (const [cat, cmds] of Object.entries(categories)) {
            menuText += `*╭━━━〔 🐢 ${cat.toUpperCase()} 〕━━━┈⊷*\n`;
            cmds.sort((a, b) => a.pattern.localeCompare(b.pattern));
            cmds.forEach(cmd => {
                menuText += `*┃🐢│ ${cmd.react} ${cmd.pattern}*\n`;
            });
            menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;
        }

        menuText += `> ${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: menuText,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });

    } catch (error) {
        console.error('Allmenu button error:', error);
    }
}

// ============================================
// 📌 ALIVE COMMAND HANDLER
// ============================================
async function handleAliveCommand(conn, from, sender, mek) {
    try {
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

        const text = `*╭━━━〔 🤖 ${config.BOT_NAME} 🤖 〕━━━┈⊷*\n*┃*\n*┃ 🟢 𝚂𝚃𝙰𝚃𝚄𝚂: 𝙰𝚕𝚒𝚟𝚎*\n*┃ ⏰ 𝚄𝙿𝚃𝙸𝙼𝙴: ${hours}h ${minutes}m ${seconds}s*\n*┃ 💾 𝙼𝙴𝙼𝙾𝚁𝚈: ${memory}MB*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: text,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });

    } catch (error) {
        console.error('Alive button error:', error);
    }
}

// ============================================
// 📌 PING COMMAND HANDLER
// ============================================
async function handlePingCommand(conn, from, sender, mek) {
    try {
        const start = Date.now();
        
        const sent = await conn.sendMessage(from, { 
            text: '*⚡ 𝙿𝚒𝚗𝚐...*',
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });
        
        const end = Date.now();
        const latency = end - start;

        await conn.sendMessage(from, {
            text: `*╭━━━〔 ⚡ 𝙿𝙸𝙽𝙶 〕━━━┈⊷*\n*┃*\n*┃ 🏓 𝚂𝚙𝚎𝚎𝚍: ${latency}ms*\n*┃ 🕒 𝚃𝚒𝚖𝚎: ${new Date().toLocaleString()}*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender }),
            edit: sent.key
        });

    } catch (error) {
        console.error('Ping button error:', error);
    }
}

// ============================================
// 📌 GET BOT COMMAND HANDLER (Auto Pair)
// ============================================
async function handleGetBotCommand(conn, from, sender, mek) {
    try {
        const userNumber = sender.split('@')[0];
        
        // Send initial message
        await conn.sendMessage(from, {
            text: `*╭━━━〔 🔗 𝙶𝙴𝚃 𝚈𝙾𝚄𝚁 𝙱𝙾𝚃 〕━━━┈⊷*\n*┃*\n*┃ 📱 𝙽𝚞𝚖𝚋𝚎𝚛: ${userNumber}*\n*┃*\n*┃ ⏳ 𝙶𝚎𝚗𝚎𝚛𝚊𝚝𝚒𝚗𝚐 𝚢𝚘𝚞𝚛 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎...*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });

        // Call pairing API
        const apiUrl = `https://simba2.onrender.com/code?number=${userNumber}`;
        const response = await axios.get(apiUrl, { timeout: 30000 });
        
        if (!response.data || !response.data.code) {
            throw new Error('No pairing code received');
        }

        const pairCode = response.data.code;

        // Create interactive message with copy button
        const messageWithButton = {
            text: `*╭━━━〔 ✅ 𝙿𝙰𝙸𝚁𝙸𝙽𝙶 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙴 〕━━━┈⊷*\n*┃*\n*┃ 🔑 𝚈𝚘𝚞𝚛 𝙿𝚊𝚒𝚛𝚒𝚗𝚐 𝙲𝚘𝚍𝚎:*\n*┃*\n*┃ 📋 ${pairCode}*\n*┃*\n*┃ 📝 𝙷𝚘𝚠 𝚝𝚘 𝚞𝚜𝚎:*\n*┃ 1. 𝙾𝚙𝚎𝚗 𝚆𝚑𝚊𝚝𝚜𝙰𝚙𝚙*\n*┃ 2. 𝙶𝚘 𝚝𝚘 𝙻𝚒𝚗𝚔𝚎𝚍 𝙳𝚎𝚟𝚒𝚌𝚎𝚜*\n*┃ 3. 𝙲𝚕𝚒𝚌𝚔 \"𝙻𝚒𝚗𝚔 𝚊 𝙳𝚎𝚟𝚒𝚌𝚎\"*\n*┃ 4. 𝙴𝚗𝚝𝚎𝚛 𝚝𝚑𝚎 𝚌𝚘𝚍𝚎 𝚊𝚋𝚘𝚟𝚎*\n*┃*\n*┃ ⏰ 𝙲𝚘𝚍𝚎 𝚎𝚡𝚙𝚒𝚛𝚎𝚜 𝚒𝚗 5 𝚖𝚒𝚗𝚞𝚝𝚎𝚜*\n*┃*\n*╰━━━━━━━━━━━━━━━┈⊷*\n\n${config.BOT_FOOTER}`,
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

        await conn.sendMessage(from, messageWithButton, { quoted: mek });

        // Send code separately for easy copying
        await conn.sendMessage(from, {
            text: `📋 *𝙲𝚘𝚙𝚢 𝚢𝚘𝚞𝚛 𝚌𝚘𝚍𝚎:* ${pairCode}`,
            contextInfo: getContextInfo({ sender: sender })
        });

    } catch (error) {
        console.error('GetBot button error:', error);
        
        let errorMessage = '𝙵𝚊𝚒𝚕𝚎𝚍 𝚝𝚘 𝚐𝚎𝚗𝚎𝚛𝚊𝚝𝚎 𝚙𝚊𝚒𝚛𝚒𝚗𝚐 𝚌𝚘𝚍𝚎';
        if (error.response) {
            errorMessage = `𝚂𝚎𝚛𝚟𝚎𝚛 𝚎𝚛𝚛𝚘𝚛: ${error.response.status}`;
        } else if (error.request) {
            errorMessage = '𝙽𝚘 𝚛𝚎𝚜𝚙𝚘𝚗𝚜𝚎 𝚏𝚛𝚘𝚖 𝚜𝚎𝚛𝚟𝚎𝚛';
        }

        await conn.sendMessage(from, {
            text: `❌ *𝙴𝚛𝚛𝚘𝚛:* ${errorMessage}\n\n𝙿𝚕𝚎𝚊𝚜𝚎 𝚝𝚛𝚢 𝚊𝚐𝚊𝚒𝚗 𝚕𝚊𝚝𝚎𝚛.`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: mek });
    }
}
