const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getTimestamp, formatBytes } = require('../lib/functions');
const os = require('os');

cmd({
    pattern: "menu",
    alias: ["help", "silamenu", "allmenu"],
    desc: "Show all available commands",
    category: "general",
    react: "🤖",
    filename: __filename
}, async (conn, mek, m, { from, sender, isOwner, prefix }) => {
    try {
        const totalCommands = global.commands.size;
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);
        
        // Group commands by category
        const categories = {};
        
        // Collect all commands by their pattern (not alias)
        global.commands.forEach((cmd, name) => {
            // Only show the main pattern, not aliases
            if (!categories[cmd.category]) categories[cmd.category] = [];
            
            // Check if this command's pattern is already in the list
            const exists = categories[cmd.category].some(c => c.pattern === cmd.pattern);
            if (!exists) {
                categories[cmd.category].push({
                    pattern: cmd.pattern,
                    react: cmd.react || '✅',
                    desc: cmd.desc || ''
                });
            }
        });

        let menuText = `*╭━━━〔 🐢 ${config.BOT_NAME} 🐢 〕━━━┈⊷*\n`;
        menuText += `*┃🐢│ 𝚄𝚂𝙴𝚁: @${sender.split('@')[0]}*\n`;
        menuText += `*┃🐢│ 𝙿𝚁𝙴𝙵𝙸𝚇: ${prefix || config.PREFIX || '𝙽𝚘 𝙿𝚛𝚎𝚏𝚒𝚡'}*\n`;
        menuText += `*┃🐢│ 𝚄𝙿𝚃𝙸𝙼𝙴: ${hours}h ${minutes}m ${seconds}s*\n`;
        menuText += `*┃🐢│ 𝙼𝙴𝙼𝙾𝚁𝚈: ${memory}MB*\n`;
        menuText += `*┃🐢│ 𝙲𝙼𝙳𝚂: ${totalCommands}*\n`;
        menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;

        // Add categories
        const categoryOrder = ['general', 'group', 'owner', 'downloader', 'fun', 'ai'];
        
        for (const cat of categoryOrder) {
            if (categories[cat] && categories[cat].length > 0) {
                menuText += `*╭━━━〔 🐢 ${cat.toUpperCase()} 〕━━━┈⊷*\n`;
                
                // Sort commands alphabetically
                categories[cat].sort((a, b) => a.pattern.localeCompare(b.pattern));
                
                categories[cat].forEach(cmd => {
                    menuText += `*┃🐢│ ${cmd.react} ${cmd.pattern}*\n`;
                });
                menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;
            }
        }

        // Add any remaining categories not in order
        for (const [cat, cmds] of Object.entries(categories)) {
            if (!categoryOrder.includes(cat)) {
                menuText += `*╭━━━〔 🐢 ${cat.toUpperCase()} 〕━━━┈⊷*\n`;
                categories[cat].sort((a, b) => a.pattern.localeCompare(b.pattern));
                categories[cat].forEach(cmd => {
                    menuText += `*┃🐢│ ${cmd.react} ${cmd.pattern}*\n`;
                });
                menuText += `*╰━━━━━━━━━━━━━━━┈⊷*\n\n`;
            }
        }

        menuText += `> ${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: menuText,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });
        
    } catch (error) {
        console.error('Menu command error:', error);
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
