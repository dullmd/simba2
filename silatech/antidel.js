const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "antidel",
    alias: ["antidelete", "antid"],
    desc: "Manage anti-delete settings",
    category: "admin",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, isGroup, isAdmins, isOwner, args, reply, sender, pushName }) => {
    try {
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: "❌ This command can only be used in groups!",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        if (!isAdmins && !isOwner) {
            return await conn.sendMessage(from, {
                text: "❌ You need to be an admin to use this command!",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get current status
        const currentStatus = await m.getAntiDeleteStatus ? await m.getAntiDeleteStatus() : false;
        
        // If args are provided, handle the command directly
        if (args[0]) {
            const option = args[0].toLowerCase();
            
            if (option === 'on' && m.setAntiDelete) {
                await m.setAntiDelete(true);
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄 ━━━━━━━━━
┃ ✅ Anti-Delete has been *ENABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 🗑️ Deleted messages will be reported
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                    mentions: [sender],
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                
                // React to the button press
                await conn.sendMessage(from, { 
                    react: { text: '✅', key: mek.key } 
                });
                return;
            } 
            else if (option === 'off' && m.setAntiDelete) {
                await m.setAntiDelete(false);
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄 ━━━━━━━━━
┃ ❌ Anti-Delete has been *DISABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 🗑️ Deleted messages will NOT be reported
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                    mentions: [sender],
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                
                await conn.sendMessage(from, { 
                    react: { text: '❌', key: mek.key } 
                });
                return;
            }
            else if (option === 'status') {
                const status = currentStatus ? '✅ *ENABLED*' : '❌ *DISABLED*';
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄 ━━━━━━━━━
┃ 📊 *Current Status:* ${status}
┃ 👤 Requested by: @${sender.split('@')[0]}
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                    mentions: [sender],
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                
                await conn.sendMessage(from, { 
                    react: { text: '📊', key: mek.key } 
                });
                return;
            }
        }

        // Create buttons with command IDs
        const buttons = [
            { 
                buttonId: `.antidel on`, 
                buttonText: { displayText: currentStatus ? '✅ ALREADY ON' : '🔛 TURN ON' }, 
                type: 1 
            },
            { 
                buttonId: `.antidel off`, 
                buttonText: { displayText: !currentStatus ? '❌ ALREADY OFF' : '🔴 TURN OFF' }, 
                type: 1 
            },
            { 
                buttonId: `.antidel status`, 
                buttonText: { displayText: '📊 CHECK STATUS' }, 
                type: 1 
            },
            { 
                buttonId: `.menu`, 
                buttonText: { displayText: '📋 MAIN MENU' }, 
                type: 1 
            }
        ];

        const statusEmoji = currentStatus ? '✅' : '❌';
        const statusText = currentStatus ? 'ENABLED' : 'DISABLED';
        
        const messageText = `┏━❑ 𝐀𝐍𝐓𝐈-𝐃𝐄𝐋𝐄𝐓𝐄 ━━━━━━━━━
┃ 👋 Hello *${pushName || sender.split('@')[0]}*
┃
┃ 🗑️ *Current Status:* ${statusEmoji} ${statusText}
┃
┃ 📌 *What is Anti-Delete?*
┃ When enabled, the bot will detect and
┃ report any deleted messages in this group.
┃
┃ ⚙️ *How to use:*
┃ • Click the buttons below to control
┃ • Each button sends a command
┃ • Bot will react and respond
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`;

        // Send message with buttons
        await conn.sendMessage(from, {
            text: messageText,
            footer: '⬇️ Click buttons to control ⬇️',
            buttons: buttons,
            headerType: 1,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
        
    } catch (error) {
        console.error('AntiDelete command error:', error);
        reply('❌ An error occurred: ' + error.message);
    }
});
