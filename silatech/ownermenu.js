const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "ownermenu",
    alias: ["ownerpanel", "adminmenu"],
    desc: "Show all owner commands",
    category: "owner",
    react: "👑",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const senderNumber = sender.split('@')[0];
        const isUserOwner = config.OWNER_NUMBER.includes(senderNumber);
        
        if (!isUserOwner) {
            return await conn.sendMessage(from, {
                text: "❌ *This menu is only for bot owner!*",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const ownerMenu = `╭─❖〔 🐢 OWNER MENU 🐢 〕❖─╮
*│*
*│ 📢 BROADCAST COMMANDS*
*│*
*│ • .broadcast <text>*
*│   Broadcast to all chats*
*│*
*│ • .bcgroup <text>*
*│   Broadcast to all groups*
*│*
*│ 🖼️ PROFILE COMMANDS*
*│*
*│ • .setppbot*
*│   Set bot profile picture*
*│   (Reply to image)*
*│*
*│ • .setnamebot <name>*
*│   Set bot profile name*
*│*
*│ • .setbio <text>*
*│   Set bot profile bio*
*│*
*│ ⚙️ AUTO SETTINGS*
*│*
*│ • .autoread on/off*
*│   Auto read messages*
*│*
*│ • .autotyping on/off*
*│   Auto typing indicator*
*│*
*│ • .autostatusview on/off*
*│   Auto view status*
*│*
*│ • .autolike on/off*
*│   Auto like status*
*│*
*│ • .autoreact on/off*
*│   Auto react to messages*
*│*
*│ 🚫 BLOCK COMMANDS*
*│*
*│ • .block @user*
*│   Block a user*
*│*
*│ • .unblock @user*
*│   Unblock a user*
*│*
*│ 🔗 GROUP COMMANDS*
*│*
*│ • .join <link>*
*│   Join group via link*
*│*
*│ • .leave*
*│   Leave current group*
*│*
*│ 💀 SYSTEM COMMANDS*
*│*
*│ • .shutdown*
*│   Shutdown the bot*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            image: { url: config.IMAGE_PATH },
            caption: ownerMenu,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Ownermenu error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
