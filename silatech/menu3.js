const { cmd } = global;
const config = require('../config');
const fs = require('fs-extra');
const path = require('path');
const moment = require("moment-timezone");
const os = require('os');

// Image ya menu
const menuImage = "https://raw.githubusercontent.com/dullmd/simba2/refs/heads/main/sila/silatz/sila_image.jpg";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02";

// FakeVCard (Imeachwa hapa kwa ajili ya quoting tu)
const fkontak = {
    "key": {
        "participant": '0@s.whatsapp.net',
        "remoteJid": '0@s.whatsapp.net',
        "fromMe": false,
        "id": "Halo"
    },
    "message": {
        "conversation": "𝚂𝙸𝙻𝙰"
    }
};

// ============================================
// 📌 GET ALL COMMANDS FROM SILATECH FOLDER
// ============================================
const getCommands = () => {
    try {
        const commandsDir = path.join(__dirname);
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));

        const commandList = [];
        files.forEach(file => {
            const name = file.replace('.js', '');
            // Exclude menu files
            if (name !== 'menu' && name !== 'menu2' && name !== 'menu3') {
                commandList.push(name);
            }
        });

        return commandList;
    } catch (e) {
        console.log("Error reading commands:", e);
        return [];
    }
};

// ============================================
// 📌 GROUP COMMANDS BY CATEGORY
// ============================================
const getCommandsByCategory = () => {
    try {
        const commandsDir = path.join(__dirname);
        const files = fs.readdirSync(commandsDir).filter(f => f.endsWith('.js'));
        
        const categories = {};
        
        files.forEach(file => {
            const name = file.replace('.js', '');
            if (name === 'menu' || name === 'menu2' || name === 'menu3') return;
            
            // Try to get category from command file
            let category = 'General';
            try {
                const commandPath = path.join(commandsDir, file);
                const commandContent = fs.readFileSync(commandPath, 'utf8');
                
                // Try different patterns for category
                const categoryMatch1 = commandContent.match(/category:\s*['"]([^'"]+)['"]/);
                const categoryMatch2 = commandContent.match(/Categorie:\s*['"]([^'"]+)['"]/);
                
                if (categoryMatch1 && categoryMatch1[1]) {
                    category = categoryMatch1[1];
                } else if (categoryMatch2 && categoryMatch2[1]) {
                    category = categoryMatch2[1];
                }
            } catch (e) {
                // Ignore errors
            }
            
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(name);
        });
        
        return categories;
    } catch (e) {
        console.log("Error reading commands by category:", e);
        return {};
    }
};

// ============================================
// 📌 MENU 3 COMMAND
// ============================================
cmd({
    pattern: "menu3",
    alias: ["help3", "commands3", "m"],
    desc: "Show bot menu with all commands",
    category: "general",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner, prefix }) => {
    try {
        // Get all commands
        const allCommands = getCommands();
        const categories = getCommandsByCategory();
        const totalCommands = allCommands.length;
        
        // Calculate uptime
        const uptime = process.uptime();
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = Math.floor(uptime % 60);
        
        // Get memory usage
        const memory = Math.round(process.memoryUsage().heapUsed / 1024 / 1024);

        // Create buttons (tatu: Get Bot, Owner, na Channel)
        const commandButtons = [
            { 
                buttonId: `${prefix}getbot`, 
                buttonText: { displayText: "🤖 𝙶𝙴𝚃 𝙱𝙾𝚃" }, 
                type: 1 
            },
            { 
                buttonId: `${prefix}owner`, 
                buttonText: { displayText: "👑 𝙾𝚆𝙽𝙴𝚁" }, 
                type: 1 
            },
            { 
                buttonId: CHANNEL_LINK, 
                buttonText: { displayText: "📢 𝙲𝙷𝙰𝙽𝙽𝙴𝙻" }, 
                type: 1,
                url: CHANNEL_LINK
            }
        ];

        // Start building menu text with your design
        let menuText = `*╭─❖〔 🐢 ${config.BOT_NAME} 🐢 〕❖─╮*\n`;
        menuText += `*│ 🐢 User : @${sender.split('@')[0]}*\n`;
        menuText += `*│ 🐢 Prefix : ${prefix || config.PREFIX || 'None'}*\n`;
        menuText += `*│ 🐢 Runtime : ${hours}h ${minutes}m ${seconds}s*\n`;
        menuText += `*│ 🐢 Memory : ${memory} MB*\n`;
        menuText += `*│ 🐢 Commands : ${totalCommands}*\n`;
        menuText += `*╰─❖〔 🐢 Stay Slow Stay Smart 🐢 〕❖─╯*\n\n`;

        // Add commands by category
        const categoryNames = Object.keys(categories).sort();
        
        for (const category of categoryNames) {
            menuText += `*╭─❖〔 🐢 ${category.toUpperCase()} 〕❖─╮*\n`;
            
            // Sort commands alphabetically
            categories[category].sort().forEach((cmd, index) => {
                menuText += `*│ 🐢 ${prefix}${cmd}*\n`;
            });
            
            menuText += `*╰─❖──────────────❖─╯*\n\n`;
        }

        // Add footer
        menuText += `> ${config.BOT_FOOTER}`;

        const buttonMessage = {
            image: { url: menuImage },
            caption: menuText,
            footer: `${config.BOT_NAME} © 2026`,
            buttons: commandButtons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [sender]
                // Removed getContextInfo to keep it simple
            }
        };

        // Send menu with fkontak
        await conn.sendMessage(from, buttonMessage, { quoted: fkontak });

        // Send reaction
        await conn.sendMessage(from, {
            react: { text: '📋', key: mek.key }
        });

    } catch (error) {
        console.error("Menu3 Command Error:", error);
        // Simple error message without design
        await conn.sendMessage(from, {
            text: `❌ Error: ${error.message}`,
            quoted: fkontak
        });
    }
});
