const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { getAntiDeleteSettings, updateAntiDeleteSettings } = require('../lib/antidel');

cmd({
    pattern: "antidel",
    alias: ["antidelete", "ad"],
    desc: "Toggle anti-delete feature (DM/Group/All)",
    category: "owner",
    react: "🗑️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isOwner, prefix }) => {
    try {
        // Check if owner
        if (!isOwner) {
            return await conn.sendMessage(from, {
                text: `❌ *Only bot owner can use this command!*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Get current settings
        const settings = getAntiDeleteSettings();
        const action = args[0]?.toLowerCase();

        // If no args, show status with buttons
        if (!action) {
            const buttons = [
                { 
                    buttonId: `${prefix}antidel dm`, 
                    buttonText: { displayText: `📱 DM ${settings.global.dm ? '✅' : '❌'}` }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antidel group`, 
                    buttonText: { displayText: `👥 GROUP ${settings.global.group ? '✅' : '❌'}` }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antidel all`, 
                    buttonText: { displayText: `🌐 ALL ${settings.global.all ? '✅' : '❌'}` }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antidel inbox`, 
                    buttonText: { displayText: `📥 INBOX` }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antidel original`, 
                    buttonText: { displayText: `📍 ORIGINAL` }, 
                    type: 1 
                }
            ];

            const caption = `🗑️ *ANTI-DELETE SETTINGS*\n\n` +
                           `📱 DM : ${settings.global.dm ? '✅ ON' : '❌ OFF'}\n` +
                           `👥 GROUP : ${settings.global.group ? '✅ ON' : '❌ OFF'}\n` +
                           `🌐 ALL : ${settings.global.all ? '✅ ON' : '❌ OFF'}\n` +
                           `📍 Path : ${settings.path === 'inbox' ? '📥 Owner Inbox' : '📍 Original Chat'}\n\n` +
                           `Choose option below:\n\n` +
                           `${config.BOT_FOOTER}`;

            await conn.sendMessage(sender, { 
                text: caption, 
                footer: config.BOT_FOOTER,
                buttons: buttons,
                headerType: 1,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            return;
        }

        let statusText = '';
        let updated = false;

        if (action === 'dm' || action === 'group' || action === 'all') {
            updated = updateAntiDeleteSettings(action, !settings.global[action]);
            statusText = `${action.toUpperCase()} ${!settings.global[action] ? '𝙴𝙽𝙰𝙱𝙻𝙴𝙳 ✅' : '𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳 ❌'}`;
        } else if (action === 'inbox') {
            updated = updateAntiDeleteSettings('path', 'inbox');
            statusText = 'Path set to 📥 Owner Inbox';
        } else if (action === 'original') {
            updated = updateAntiDeleteSettings('path', 'original');
            statusText = 'Path set to 📍 Original Chat';
        } else {
            return await conn.sendMessage(sender, {
                text: `❌ *Invalid option! Use: dm/group/all/inbox/original*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (updated) {
            const newSettings = getAntiDeleteSettings();
            
            await conn.sendMessage(sender, {
                text: `🗑️ *ANTI-DELETE UPDATED*\n\n` +
                      `${statusText}\n\n` +
                      `📱 DM : ${newSettings.global.dm ? '✅ ON' : '❌ OFF'}\n` +
                      `👥 GROUP : ${newSettings.global.group ? '✅ ON' : '❌ OFF'}\n` +
                      `🌐 ALL : ${newSettings.global.all ? '✅ ON' : '❌ OFF'}\n` +
                      `📍 Path : ${newSettings.path === 'inbox' ? '📥 Owner Inbox' : '📍 Original Chat'}\n\n` +
                      `${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });

            await conn.sendMessage(sender, {
                react: { text: '✅', key: mek.key }
            });
        }

    } catch (error) {
        console.error('Antidel command error:', error);
        await conn.sendMessage(sender, {
            text: `❌ *Error:* ${error.message}\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
