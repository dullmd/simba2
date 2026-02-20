const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');
const { getAntiLinkStatus, getAntiLinkMode, setAntiLinkStatus } = require('../lib/antilink');

cmd({
    pattern: "antilink2",
    alias: ["antilink2"],
    desc: "Toggle anti-link feature in group",
    category: "security",
    react: "🔗",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup, isOwner, prefix }) => {
    try {
        // Check if in group
        if (!isGroup) {
            return await conn.sendMessage(from, {
                text: `❌ *This command can only be used in groups!*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Check if user is admin or owner
        const groupMetadata = await conn.groupMetadata(from);
        const isAdmin = groupMetadata.participants.find(p => p.id === sender)?.admin === 'admin' || 
                       groupMetadata.participants.find(p => p.id === sender)?.admin === 'superadmin';
        
        if (!isAdmin && !isOwner) {
            return await conn.sendMessage(from, {
                text: `❌ *Only group admins can use this command!*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const currentStatus = getAntiLinkStatus(from);
        const currentMode = getAntiLinkMode(from);
        const action = args[0]?.toLowerCase();

        // If no args, show status with buttons
        if (!action) {
            const buttons = [
                { 
                    buttonId: `${prefix}antilink on`, 
                    buttonText: { displayText: '✅ ON' }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antilink off`, 
                    buttonText: { displayText: '❌ OFF' }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antilink delete`, 
                    buttonText: { displayText: '🗑️ DELETE' }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antilink warn`, 
                    buttonText: { displayText: '⚠️ WARN' }, 
                    type: 1 
                },
                { 
                    buttonId: `${prefix}antilink kick`, 
                    buttonText: { displayText: '👢 KICK' }, 
                    type: 1 
                }
            ];

            const caption = `🔗 *ANTI-LINK SETTINGS*\n\n` +
                           `Status: ${currentStatus ? '✅ ON' : '❌ OFF'}\n` +
                           `Mode: ${currentMode.toUpperCase()}\n\n` +
                           `Choose option below:\n\n` +
                           `${config.BOT_FOOTER}`;

            await conn.sendMessage(from, { 
                text: caption, 
                footer: config.BOT_FOOTER,
                buttons: buttons,
                headerType: 1,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
            return;
        }

        let newStatus = currentStatus;
        let newMode = currentMode;
        let statusText = '';

        if (action === 'on') {
            newStatus = true;
            statusText = '𝙴𝙽𝙰𝙱𝙻𝙴𝙳 ✅';
        } else if (action === 'off') {
            newStatus = false;
            statusText = '𝙳𝙸𝚂𝙰𝙱𝙻𝙴𝙳 ❌';
        } else if (action === 'delete' || action === 'warn' || action === 'kick') {
            newStatus = true;
            newMode = action;
            statusText = `Mode set to ${action.toUpperCase()} ${action === 'delete' ? '🗑️' : action === 'warn' ? '⚠️' : '👢'}`;
        } else {
            return await conn.sendMessage(from, {
                text: `❌ *Invalid option! Use on/off/delete/warn/kick*\n\n${config.BOT_FOOTER}`,
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Save settings
        setAntiLinkStatus(from, newStatus, newMode);

        await conn.sendMessage(from, {
            text: `🔗 *ANTI-LINK UPDATED*\n\n` +
                  `Status: ${newStatus ? '✅ ON' : '❌ OFF'}\n` +
                  `Mode: ${newMode.toUpperCase()}\n` +
                  `Group: ${groupMetadata.subject}\n` +
                  `By: @${sender.split('@')[0]}\n\n` +
                  `${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
        }, { quoted: fkontak });

        await conn.sendMessage(from, {
            react: { text: newStatus ? '✅' : '❌', key: mek.key }
        });

    } catch (error) {
        console.error('Antilink command error:', error);
        await conn.sendMessage(from, {
            text: `❌ *Error:* ${error.message}\n\n${config.BOT_FOOTER}`,
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    }
});
