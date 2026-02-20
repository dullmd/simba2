const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo, sleep } = require('../lib/functions');
const crypto = require('crypto');

// ============================================
// 📌 FORMAT MINI TOOLS MESSAGE
// ============================================
function formatToolsMessage(title, content) {
    return `╭─❖〔 🐢 ${title} 🐢 〕❖─╮
*│ 🐢 ${content}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 COMMAND: CALCULATOR
// ============================================
cmd({
    pattern: "calc",
    alias: ["calculator", "math"],
    desc: "Simple calculator",
    category: "tools",
    react: "🧮",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const expression = args.join(' ').trim();
        if (!expression) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('CALCULATOR', 
                    `Usage: .calc 5+5\n` +
                    `Example: .calc 10*2\n` +
                    `Support: + - * / %`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Sanitize input - only allow numbers and basic operators
        if (!/^[0-9+\-*/%.() ]+$/.test(expression)) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('CALCULATOR', '❌ Invalid characters! Only numbers and + - * / % allowed'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        try {
            const result = eval(expression);
            await conn.sendMessage(from, {
                text: formatToolsMessage('CALCULATOR', 
                    `📝 *Expression:* ${expression}\n` +
                    `✅ *Result:* ${result}`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        } catch (e) {
            await conn.sendMessage(from, {
                text: formatToolsMessage('CALCULATOR', '❌ Invalid expression!'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

    } catch (error) {
        console.error('Calc error:', error);
    }
});

// ============================================
// 📌 COMMAND: PERCENTAGE
// ============================================
cmd({
    pattern: "percentage",
    alias: ["percent", "pct"],
    desc: "Calculate percentage",
    category: "tools",
    react: "📊",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (args.length < 2) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('PERCENTAGE', 
                    `Usage: .percentage 50 200\n` +
                    `Example: .percentage 20 100 (20% of 100 = 20)`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const percent = parseFloat(args[0]);
        const total = parseFloat(args[1]);

        if (isNaN(percent) || isNaN(total)) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('PERCENTAGE', '❌ Please enter valid numbers!'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const result = (percent / 100) * total;
        const whatPercent = (percent / total) * 100;

        await conn.sendMessage(from, {
            text: formatToolsMessage('PERCENTAGE', 
                `📊 *${percent}% of ${total}* = ${result}\n` +
                `📈 *${percent} is ${whatPercent.toFixed(2)}% of ${total}*`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Percentage error:', error);
    }
});

// ============================================
// 📌 COMMAND: RANDOM NUMBER
// ============================================
cmd({
    pattern: "randomnumber",
    alias: ["randnum", "randomnum"],
    desc: "Generate random number",
    category: "tools",
    react: "🎲",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let min = 1, max = 100;

        if (args.length >= 2) {
            min = parseInt(args[0]);
            max = parseInt(args[1]);
        } else if (args.length === 1) {
            max = parseInt(args[0]);
        }

        if (isNaN(min) || isNaN(max)) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('RANDOM NUMBER', 
                    `Usage: .randomnumber [min] [max]\n` +
                    `Example: .randomnumber 1 100`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        if (min > max) [min, max] = [max, min];

        const random = Math.floor(Math.random() * (max - min + 1)) + min;

        await conn.sendMessage(from, {
            text: formatToolsMessage('RANDOM NUMBER', 
                `🎲 *Range:* ${min} - ${max}\n` +
                `✅ *Result:* ${random}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Randomnumber error:', error);
    }
});

// ============================================
// 📌 COMMAND: PASSWORD GENERATOR
// ============================================
cmd({
    pattern: "password",
    alias: ["genpass", "generatepass"],
    desc: "Generate random password",
    category: "tools",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let length = 8;
        if (args[0]) length = parseInt(args[0]);

        if (isNaN(length) || length < 4 || length > 50) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('PASSWORD', 
                    `Usage: .password [length]\n` +
                    `Example: .password 10\n` +
                    `Note: Length must be 4-50`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        const lowercase = 'abcdefghijklmnopqrstuvwxyz';
        const numbers = '0123456789';
        const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

        const allChars = uppercase + lowercase + numbers + symbols;
        
        let password = '';
        password += uppercase[Math.floor(Math.random() * uppercase.length)];
        password += lowercase[Math.floor(Math.random() * lowercase.length)];
        password += numbers[Math.floor(Math.random() * numbers.length)];
        password += symbols[Math.floor(Math.random() * symbols.length)];

        for (let i = 4; i < length; i++) {
            password += allChars[Math.floor(Math.random() * allChars.length)];
        }

        // Shuffle password
        password = password.split('').sort(() => 0.5 - Math.random()).join('');

        await conn.sendMessage(from, {
            text: formatToolsMessage('PASSWORD GENERATOR', 
                `🔐 *Length:* ${length}\n` +
                `✅ *Password:* \`${password}\``),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Password error:', error);
    }
});

// ============================================
// 📌 COMMAND: UUID GENERATOR
// ============================================
cmd({
    pattern: "uuid",
    alias: ["generateuuid", "genuuid"],
    desc: "Generate UUID v4",
    category: "tools",
    react: "🆔",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const uuid = crypto.randomUUID();

        await conn.sendMessage(from, {
            text: formatToolsMessage('UUID GENERATOR', 
                `🆔 *UUID v4:*\n\`${uuid}\``),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('UUID error:', error);
    }
});

// ============================================
// 📌 COMMAND: COLOR CODE
// ============================================
cmd({
    pattern: "colorcode",
    alias: ["randomcolor", "randcolor"],
    desc: "Generate random color code",
    category: "tools",
    react: "🎨",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        const randomHex = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
        
        // Convert hex to RGB
        const r = parseInt(randomHex.slice(1, 3), 16);
        const g = parseInt(randomHex.slice(3, 5), 16);
        const b = parseInt(randomHex.slice(5, 7), 16);
        
        const rgb = `rgb(${r}, ${g}, ${b})`;

        await conn.sendMessage(from, {
            text: formatToolsMessage('COLOR CODE', 
                `🎨 *HEX:* ${randomHex}\n` +
                `🌈 *RGB:* ${rgb}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Colorcode error:', error);
    }
});

// ============================================
// 📌 COMMAND: HEX CONVERTER
// ============================================
cmd({
    pattern: "hex",
    alias: ["tohex", "hexconvert"],
    desc: "Convert text to hex",
    category: "tools",
    react: "🔢",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('HEX CONVERTER', 
                    `Usage: .hex <text>\n` +
                    `Example: .hello world`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const hex = Buffer.from(text, 'utf8').toString('hex');

        await conn.sendMessage(from, {
            text: formatToolsMessage('HEX CONVERTER', 
                `📝 *Text:* ${text}\n` +
                `🔢 *Hex:* ${hex}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Hex error:', error);
    }
});

// ============================================
// 📌 COMMAND: ASCII ART
// ============================================
cmd({
    pattern: "ascii",
    alias: ["asciiart", "textart"],
    desc: "Convert text to ASCII art",
    category: "tools",
    react: "🎭",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('ASCII ART', 
                    `Usage: .ascii <text>\n` +
                    `Example: .ascii SILA`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        // Simple ASCII art generator
        const asciiArt = text.split('').map(char => {
            const ascii = char.charCodeAt(0);
            return `${char} = ${ascii}`;
        }).join('\n');

        await conn.sendMessage(from, {
            text: formatToolsMessage('ASCII ART', 
                `📝 *Text:* ${text}\n\n${asciiArt}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('ASCII error:', error);
    }
});

// ============================================
// 📌 COMMAND: CHARACTER COUNT
// ============================================
cmd({
    pattern: "charcount",
    alias: ["char", "countchar"],
    desc: "Count characters in text",
    category: "tools",
    react: "🔤",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('CHARACTER COUNT', 
                    `Usage: .charcount <text>\n` +
                    `Example: .charcount Hello world`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const charCount = text.length;
        const charWithoutSpaces = text.replace(/\s/g, '').length;

        await conn.sendMessage(from, {
            text: formatToolsMessage('CHARACTER COUNT', 
                `📝 *Text:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                `📊 *Total characters:* ${charCount}\n` +
                `📊 *Without spaces:* ${charWithoutSpaces}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Charcount error:', error);
    }
});

// ============================================
// 📌 COMMAND: WORD COUNT
// ============================================
cmd({
    pattern: "wordcount",
    alias: ["word", "countword"],
    desc: "Count words in text",
    category: "tools",
    react: "📝",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('WORD COUNT', 
                    `Usage: .wordcount <text>\n` +
                    `Example: .wordcount Hello world`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const words = text.split(/\s+/).filter(w => w.length > 0);
        const wordCount = words.length;

        await conn.sendMessage(from, {
            text: formatToolsMessage('WORD COUNT', 
                `📝 *Text:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                `📊 *Total words:* ${wordCount}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Wordcount error:', error);
    }
});

// ============================================
// 📌 COMMAND: LINE COUNT
// ============================================
cmd({
    pattern: "linecount",
    alias: ["line", "countline"],
    desc: "Count lines in text",
    category: "tools",
    react: "📏",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('LINE COUNT', 
                    `Usage: .linecount <text>\n` +
                    `Example: .linecount line1\\nline2`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const lines = text.split('\n');
        const lineCount = lines.length;

        await conn.sendMessage(from, {
            text: formatToolsMessage('LINE COUNT', 
                `📝 *Text preview:* ${lines[0].substring(0, 30)}${lines[0].length > 30 ? '...' : ''}\n` +
                `📊 *Total lines:* ${lineCount}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Linecount error:', error);
    }
});

// ============================================
// 📌 COMMAND: LENGTH
// ============================================
cmd({
    pattern: "length",
    alias: ["len", "strlen"],
    desc: "Get string length",
    category: "tools",
    react: "📐",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ').trim();
        if (!text) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('LENGTH', 
                    `Usage: .length <text>\n` +
                    `Example: .length Hello world`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        await conn.sendMessage(from, {
            text: formatToolsMessage('LENGTH', 
                `📝 *Text:* ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}\n` +
                `📏 *Length:* ${text.length}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Length error:', error);
    }
});

// ============================================
// 📌 COMMAND: TIMER
// ============================================
const activeTimers = new Map();

cmd({
    pattern: "timer",
    alias: ["settimer"],
    desc: "Set a timer (in seconds)",
    category: "tools",
    react: "⏲️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (args.length < 1) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('TIMER', 
                    `Usage: .timer <seconds>\n` +
                    `Example: .timer 10`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 1 || seconds > 3600) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('TIMER', '❌ Please enter valid seconds (1-3600)'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const timerId = Date.now().toString();
        const endTime = Date.now() + (seconds * 1000);

        activeTimers.set(timerId, { endTime, from, sender });

        await conn.sendMessage(from, {
            text: formatToolsMessage('TIMER', 
                `⏲️ *Timer set for ${seconds} seconds*\n` +
                `🆔 *ID:* ${timerId}\n` +
                `⏰ *Ends at:* ${new Date(endTime).toLocaleTimeString()}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Start timer
        setTimeout(async () => {
            if (activeTimers.has(timerId)) {
                await conn.sendMessage(from, {
                    text: formatToolsMessage('TIMER', 
                        `⏰ *TIME'S UP!*\n\n` +
                        `⏲️ *Timer finished*\n` +
                        `👤 *For:* @${sender.split('@')[0]}`),
                    contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
                }, { quoted: fkontak });
                
                // Play sound/notification
                await conn.sendMessage(from, { 
                    react: { text: '⏰', key: mek.key } 
                });

                activeTimers.delete(timerId);
            }
        }, seconds * 1000);

    } catch (error) {
        console.error('Timer error:', error);
    }
});

// ============================================
// 📌 COMMAND: REMIND
// ============================================
const activeReminders = new Map();

cmd({
    pattern: "remind",
    alias: ["reminder", "remindme"],
    desc: "Set a reminder",
    category: "tools",
    react: "🔔",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (args.length < 2) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('REMINDER', 
                    `Usage: .remind <time> <message>\n` +
                    `Time format: 5m (minutes), 10s (seconds), 1h (hours)\n` +
                    `Example: .remind 5m Drink water`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const timeStr = args[0].toLowerCase();
        const message = args.slice(1).join(' ');

        // Parse time
        let seconds = 0;
        if (timeStr.endsWith('s')) {
            seconds = parseInt(timeStr.slice(0, -1));
        } else if (timeStr.endsWith('m')) {
            seconds = parseInt(timeStr.slice(0, -1)) * 60;
        } else if (timeStr.endsWith('h')) {
            seconds = parseInt(timeStr.slice(0, -1)) * 3600;
        } else {
            seconds = parseInt(timeStr);
        }

        if (isNaN(seconds) || seconds < 1 || seconds > 86400) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('REMINDER', '❌ Invalid time! Max 24 hours'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const reminderId = Date.now().toString();
        const remindTime = Date.now() + (seconds * 1000);

        activeReminders.set(reminderId, { remindTime, from, sender, message });

        await conn.sendMessage(from, {
            text: formatToolsMessage('REMINDER', 
                `🔔 *Reminder set!*\n\n` +
                `⏰ *Time:* ${timeStr}\n` +
                `📝 *Message:* ${message}\n` +
                `🆔 *ID:* ${reminderId}`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        // Start reminder
        setTimeout(async () => {
            if (activeReminders.has(reminderId)) {
                await conn.sendMessage(from, {
                    text: formatToolsMessage('REMINDER', 
                        `🔔 *REMINDER!*\n\n` +
                        `📝 *${message}*\n` +
                        `👤 *For:* @${sender.split('@')[0]}`),
                    contextInfo: getContextInfo({ sender: sender, mentionedJid: [sender] })
                }, { quoted: fkontak });

                activeReminders.delete(reminderId);
            }
        }, seconds * 1000);

    } catch (error) {
        console.error('Remind error:', error);
    }
});

// ============================================
// 📌 COMMAND: COUNTDOWN
// ============================================
const activeCountdowns = new Map();

cmd({
    pattern: "countdown",
    alias: ["cd"],
    desc: "Start a countdown timer",
    category: "tools",
    react: "⏳",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (args.length < 1) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('COUNTDOWN', 
                    `Usage: .countdown <seconds>\n` +
                    `Example: .countdown 10`),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const seconds = parseInt(args[0]);
        if (isNaN(seconds) || seconds < 1 || seconds > 60) {
            return await conn.sendMessage(from, {
                text: formatToolsMessage('COUNTDOWN', '❌ Please enter valid seconds (1-60)'),
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }

        const countdownId = Date.now().toString();
        let remaining = seconds;

        const countdownMsg = await conn.sendMessage(from, {
            text: formatToolsMessage('COUNTDOWN', 
                `⏳ *Countdown: ${remaining} seconds*`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

        const interval = setInterval(async () => {
            remaining--;
            
            if (remaining <= 0) {
                clearInterval(interval);
                activeCountdowns.delete(countdownId);
                
                await conn.sendMessage(from, {
                    text: formatToolsMessage('COUNTDOWN', 
                        `⏰ *TIME'S UP!*\n\n` +
                        `🎉 *Countdown finished!*`),
                    contextInfo: getContextInfo({ sender: sender })
                }, { quoted: fkontak });
            } else {
                await conn.sendMessage(from, {
                    text: formatToolsMessage('COUNTDOWN', 
                        `⏳ *Countdown: ${remaining} seconds*`),
                    contextInfo: getContextInfo({ sender: sender })
                }, { edit: countdownMsg.key });
            }
        }, 1000);

        activeCountdowns.set(countdownId, { interval, remaining });

    } catch (error) {
        console.error('Countdown error:', error);
    }
});

// ============================================
// 📌 COMMAND: STOP COUNTDOWN
// ============================================
cmd({
    pattern: "stopcountdown",
    alias: ["stopcd"],
    desc: "Stop active countdown",
    category: "tools",
    react: "⏹️",
    filename: __filename
}, async (conn, mek, m, { from, sender }) => {
    try {
        let stopped = 0;
        
        for (const [id, data] of activeCountdowns.entries()) {
            if (data.from === from) {
                clearInterval(data.interval);
                activeCountdowns.delete(id);
                stopped++;
            }
        }

        await conn.sendMessage(from, {
            text: formatToolsMessage('COUNTDOWN', 
                `⏹️ *Stopped ${stopped} countdown(s)*`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });

    } catch (error) {
        console.error('Stopcountdown error:', error);
    }
});
