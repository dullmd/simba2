const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

cmd({
    pattern: "antilink",
    alias: ["antil", "linkguard"],
    desc: "Manage anti-link settings",
    category: "admin",
    react: "🔗",
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

        // Get current status and settings
        const currentStatus = await m.getAntiLinkStatus ? await m.getAntiLinkStatus() : false;
        const settings = await m.getAntiLinkSettings ? await m.getAntiLinkSettings() : { action: 'delete', warnCount: 3 };
        const currentAction = settings.action || 'delete';
        const warnCount = settings.warnCount || 3;
        
        // Handle sub-commands
        if (args[0]) {
            const option = args[0].toLowerCase();
            
            // Handle main on/off/status
            if (option === 'on' && m.setAntiLink) {
                await m.setAntiLink(true, currentAction, settings.allowedLinks || []);
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ ✅ Anti-Link has been *ENABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 🔗 Links will be deleted/blocked
┃ ⚙️ Action: *${currentAction.toUpperCase()}*
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
            else if (option === 'off' && m.setAntiLink) {
                await m.setAntiLink(false);
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ ❌ Anti-Link has been *DISABLED*
┃ 👤 Admin: @${sender.split('@')[0]}
┃ 🔗 Links are now allowed
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
                const actionEmoji = currentAction === 'delete' ? '🗑️' : currentAction === 'warn' ? '⚠️' : '👢';
                
                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ 📊 *Current Status:* ${status}
┃ ⚙️ *Action:* ${actionEmoji} ${currentAction.toUpperCase()}
┃ ⚠️ *Warn Limit:* ${warnCount}
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
            
            // Handle action sub-commands
            else if (option === 'action') {
                if (args[1]) {
                    const action = args[1].toLowerCase();
                    if (['delete', 'warn', 'kick'].includes(action) && m.setAntiLink) {
                        await m.setAntiLink(currentStatus, action, settings.allowedLinks || []);
                        
                        const actionEmoji = action === 'delete' ? '🗑️' : action === 'warn' ? '⚠️' : '👢';
                        await conn.sendMessage(from, {
                            text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ ⚙️ Action changed to: ${actionEmoji} *${action.toUpperCase()}*
┃ 👤 Admin: @${sender.split('@')[0]}
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                            mentions: [sender],
                            contextInfo: getContextInfo({ sender: sender })
                        }, { quoted: fkontak });
                        
                        await conn.sendMessage(from, { 
                            react: { text: '⚙️', key: mek.key } 
                        });
                        return;
                    }
                }
                
                // Show action selection buttons
                const actionButtons = [
                    { 
                        buttonId: `.antilink action delete`, 
                        buttonText: { displayText: currentAction === 'delete' ? '✅ DELETE (Current)' : '🗑️ DELETE' }, 
                        type: 1 
                    },
                    { 
                        buttonId: `.antilink action warn`, 
                        buttonText: { displayText: currentAction === 'warn' ? '✅ WARN (Current)' : '⚠️ WARN' }, 
                        type: 1 
                    },
                    { 
                        buttonId: `.antilink action kick`, 
                        buttonText: { displayText: currentAction === 'kick' ? '✅ KICK (Current)' : '👢 KICK' }, 
                        type: 1 
                    },
                    { 
                        buttonId: `.antilink`, 
                        buttonText: { displayText: '🔙 BACK' }, 
                        type: 1 
                    }
                ];

                await conn.sendMessage(from, {
                    text: `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ ⚙️ *Select Action Type:*
┃
┃ 🗑️ *DELETE* - Just delete the message
┃ ⚠️ *WARN* - Delete + warn user
┃ 👢 *KICK* - Delete + kick after ${warnCount} warns
┃
┃ 👤 Current: *${currentAction.toUpperCase()}*
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`,
                    footer: '⬇️ Choose action ⬇️',
                    buttons: actionButtons,
                    headerType: 1,
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
                return;
            }
        }

        // Create main buttons
        const statusEmoji = currentStatus ? '✅' : '❌';
        const statusText = currentStatus ? 'ENABLED' : 'DISABLED';
        const actionEmoji = currentAction === 'delete' ? '🗑️' : currentAction === 'warn' ? '⚠️' : '👢';
        
        const mainButtons = [
            { 
                buttonId: `.antilink on`, 
                buttonText: { displayText: currentStatus ? '✅ ALREADY ON' : '🔛 TURN ON' }, 
                type: 1 
            },
            { 
                buttonId: `.antilink off`, 
                buttonText: { displayText: !currentStatus ? '❌ ALREADY OFF' : '🔴 TURN OFF' }, 
                type: 1 
            },
            { 
                buttonId: `.antilink status`, 
                buttonText: { displayText: '📊 CHECK STATUS' }, 
                type: 1 
            },
            { 
                buttonId: `.antilink action`, 
                buttonText: { displayText: `⚙️ ACTION (${actionEmoji})` }, 
                type: 1 
            },
            { 
                buttonId: `.menu`, 
                buttonText: { displayText: '📋 MAIN MENU' }, 
                type: 1 
            }
        ];

        const messageText = `┏━❑ 𝐀𝐍𝐓𝐈-𝐋𝐈𝐍𝐊 ━━━━━━━━━
┃ 👋 Hello *${pushName || sender.split('@')[0]}*
┃
┃ 🔗 *Current Status:* ${statusEmoji} ${statusText}
┃ ⚙️ *Current Action:* ${actionEmoji} ${currentAction.toUpperCase()}
┃ ⚠️ *Warn Limit:* ${warnCount}
┃
┃ 📌 *What is Anti-Link?*
┃ When enabled, the bot will detect and
┃ block links according to the action set.
┃
┃ ⚙️ *Actions:*
┃ • DELETE - Just delete the message
┃ • WARN - Delete + warn user
┃ • KICK - Delete + kick after ${warnCount} warns
┃
┃ 👆 *Click buttons to control*
┗━━━━━━━━━━━━━━━━━

${config.BOT_FOOTER}`;

        // Send message with buttons
        await conn.sendMessage(from, {
            text: messageText,
            footer: '⬇️ Click buttons to control ⬇️',
            buttons: mainButtons,
            headerType: 1,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
        
    } catch (error) {
        console.error('AntiLink command error:', error);
        reply('❌ An error occurred: ' + error.message);
    }
});
