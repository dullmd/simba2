const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, getTimestamp } = require('../lib/functions');
const fs = require('fs-extra');
const path = require('path');
const moment = require("moment-timezone");

// Image ya menu
const menuImage = "https://files.catbox.moe/36vahk.png";
const CHANNEL_LINK = "https://whatsapp.com/channel/0029VbBG4gfISTkCpKxyMH02";

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
            // Exclude menu files if needed
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
                const categoryMatch = commandContent.match(/category:\s*['"]([^'"]+)['"]/);
                if (categoryMatch && categoryMatch[1]) {
                    category = categoryMatch[1];
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
    alias: ["help3", "commands3"],
    desc: "Show bot menu with buttons",
    category: "general",
    react: "📋",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner, prefix }) => {
    try {
        // Get all commands
        const allCommands = getCommands();
        const categories = getCommandsByCategory();
        const categoryNames = Object.keys(categories);

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

        // Generate commands list with nice formatting
        let commandsText = '';
        
        if (categoryNames.length > 1) {
            // Show by categories
            for (const category of categoryNames.sort()) {
                commandsText += `┏━❑ *${category.toUpperCase()}* ━━━━━━━━━\n`;
                categories[category].sort().forEach((cmd, index) => {
                    commandsText += `┃ ${index + 1}. ${prefix}${cmd}\n`;
                });
                commandsText += `┗━━━━━━━━━━━━━━━━━━━━\n\n`;
            }
        } else {
            // Simple list if no categories
            commandsText += `┏━❑ *𝙰𝙻𝙻 𝙲𝙾𝙼𝙼𝙰𝙽𝙳𝚂* ━━━━━━━━━\n`;
            allCommands.sort().forEach((cmd, index) => {
                commandsText += `┃ ${index + 1}. ${prefix}${cmd}\n`;
            });
            commandsText += `┗━━━━━━━━━━━━━━━━━━━━\n`;
        }

        const buttonMessage = {
            image: { url: menuImage },
            caption: `┏━❑ *𝚂𝙸𝙻𝙰-𝙼𝙳 𝙼𝙴𝙽𝚄* ━━━━━━━━━
┃ 🤖 *Bot Name:* ${config.BOT_NAME}
┃ ⏰ *Time:* ${moment().tz("Africa/Nairobi").format("DD/MM/YYYY HH:mm")}
┃ 📊 *Total Cmds:* ${allCommands.length}
┃ 👤 *User:* @${sender.split('@')[0]}
┗━━━━━━━━━━━━━━━━━━━━

${commandsText}

━━━━━━━━━━━━━━━━━━━━
> ${config.BOT_FOOTER}`,
            footer: `${config.BOT_NAME} © 2026`,
            buttons: commandButtons,
            headerType: 4,
            contextInfo: {
                mentionedJid: [sender],
                forwardingScore: 999,
                isForwarded: true,
                forwardedNewsletterMessageInfo: {
                    newsletterJid: config.NEWSLETTER_JIDS[0] || '120363402325089913@newsletter',
                    newsletterName: `© ${config.BOT_NAME}`,
                    serverMessageId: 143,
                }
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
        await conn.sendMessage(from, {
            text: `┏━❑ *𝙴𝚁𝚁𝙾𝚁* ━━━━━━━━━
┃ ❌ ${error.message}
┗━━━━━━━━━━━━━━━━━━━━
> ${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
