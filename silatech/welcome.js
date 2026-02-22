const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "welcome",
    alias: ["wlc", "greet"],
    desc: "Manage welcome & goodbye messages",
    category: "admin",
    react: "👋",
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

        // Get current settings from database (you'll need to implement these)
        const welcomeStatus = await m.getWelcomeStatus ? await m.getWelcomeStatus() : false;
        const goodbyeStatus = await m.getGoodbyeStatus ? await m.getGoodbyeStatus() : false;
        
        // Handle sub-commands
        if (args[0]) {
            const option = args[0].toLowerCase();
            
            if (option === 'welcome') {
                if (args[1] === 'on' && m.setWelcome) {
                    await m.setWelcome(true);
                    await conn.sendMessage(from, {
                        text: `┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ━━━━━━━━━━━
┃ ✅ Welcome messages *ENABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 👋 New members will be greeted
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                        mentions: [sender],
                        contextInfo: getContextInfo({ sender: sender })
                    }, { quoted: fkontak });
                    
                    await conn.sendMessage(from, { 
                        react: { text: '✅', key: mek.key } 
                    });
                    return;
                }
                else if (args[1] === 'off' && m.setWelcome) {
                    await m.setWelcome(false);
                    await conn.sendMessage(from, {
                        text: `┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 ━━━━━━━━━━━
┃ ❌ Welcome messages *DISABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
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
            }
            else if (option === 'goodbye') {
                if (args[1] === 'on' && m.setGoodbye) {
                    await m.setGoodbye(true);
                    await conn.sendMessage(from, {
                        text: `┏━❑ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━━━━━
┃ ✅ Goodbye messages *ENABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 👋 Leaving members will be farewelled
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                        mentions: [sender],
                        contextInfo: getContextInfo({ sender: sender })
                    }, { quoted: fkontak });
                    
                    await conn.sendMessage(from, { 
                        react: { text: '✅', key: mek.key } 
                    });
                    return;
                }
                else if (args[1] === 'off' && m.setGoodbye) {
                    await m.setGoodbye(false);
                    await conn.sendMessage(from, {
                        text: `┏━❑ 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━━━━━
┃ ❌ Goodbye messages *DISABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
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
            }
            else if (option === 'status') {
                const welcomeEmoji = welcomeStatus ? '✅' : '❌';
                const goodbyeEmoji = goodbyeStatus ? '✅' : '❌';
                
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 & 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━
┃ 📊 *Current Settings:*
┃
┃ 👋 *Welcome:* ${welcomeEmoji} ${welcomeStatus ? 'ENABLED' : 'DISABLED'}
┃ 👋 *Goodbye:* ${goodbyeEmoji} ${goodbyeStatus ? 'ENABLED' : 'DISABLED'}
┃
┃ 👤 Requested by: @${sender.split('@')[0]}
┗━━━━━━━━━━━━━━━━━━━━

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

        // Create welcome/goodbye buttons
        const welcomeEmoji = welcomeStatus ? '✅' : '❌';
        const goodbyeEmoji = goodbyeStatus ? '✅' : '❌';
        
        const buttons = [
            { 
                buttonId: `.welcome welcome on`, 
                buttonText: { displayText: welcomeStatus ? '✅ WELCOME ON' : '👋 WELCOME ON' }, 
                type: 1 
            },
            { 
                buttonId: `.welcome welcome off`, 
                buttonText: { displayText: !welcomeStatus ? '❌ WELCOME OFF' : '🔴 WELCOME OFF' }, 
                type: 1 
            },
            { 
                buttonId: `.welcome goodbye on`, 
                buttonText: { displayText: goodbyeStatus ? '✅ GOODBYE ON' : '👋 GOODBYE ON' }, 
                type: 1 
            },
            { 
                buttonId: `.welcome goodbye off`, 
                buttonText: { displayText: !goodbyeStatus ? '❌ GOODBYE OFF' : '🔴 GOODBYE OFF' }, 
                type: 1 
            },
            { 
                buttonId: `.welcome status`, 
                buttonText: { displayText: '📊 CHECK STATUS' }, 
                type: 1 
            },
            { 
                buttonId: `.menu`, 
                buttonText: { displayText: '📋 MAIN MENU' }, 
                type: 1 
            }
        ];

        const messageText = `┏━❑ 𝐖𝐄𝐋𝐂𝐎𝐌𝐄 & 𝐆𝐎𝐎𝐃𝐁𝐘𝐄 ━━━━━━━
┃ 👋 Hello *${pushName || sender.split('@')[0]}*
┃
┃ 📊 *Current Settings:*
┃ 👋 Welcome: ${welcomeEmoji} ${welcomeStatus ? 'ENABLED' : 'DISABLED'}
┃ 👋 Goodbye: ${goodbyeEmoji} ${goodbyeStatus ? 'ENABLED' : 'DISABLED'}
┃
┃ 📌 *What do these do?*
┃ • *Welcome* - Greets new members when they join
┃ • *Goodbye* - Says farewell when members leave
┃
┃ 👆 *Click buttons to control*
┗━━━━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`;

        // Send message with buttons
        await conn.sendMessage(from, {
            text: messageText,
            footer: '⬇️ Click to toggle ⬇️',
            buttons: buttons,
            headerType: 1,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
        
    } catch (error) {
        console.error('Welcome command error:', error);
        reply('❌ An error occurred: ' + error.message);
    }
});
