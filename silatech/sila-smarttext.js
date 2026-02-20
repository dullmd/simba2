const { cmd } = global;
const config = require('../config');
const { fkontak, getContextInfo } = require('../lib/functions');

// ============================================
// 📌 TEXT TRANSFORMATION FUNCTIONS
// ============================================

// Reverse text
function reverseText(text) {
    return text.split('').reverse().join('');
}

// Uppercase
function uppercaseText(text) {
    return text.toUpperCase();
}

// Lowercase
function lowercaseText(text) {
    return text.toLowerCase();
}

// Fancy text converter (multiple styles)
function fancyText(text, style = 1) {
    const fancyMap = {
        1: { // Bold
            'A': '𝗔', 'B': '𝗕', 'C': '𝗖', 'D': '𝗗', 'E': '𝗘', 'F': '𝗙', 'G': '𝗚', 'H': '𝗛', 'I': '𝗜',
            'J': '𝗝', 'K': '𝗞', 'L': '𝗟', 'M': '𝗠', 'N': '𝗡', 'O': '𝗢', 'P': '𝗣', 'Q': '𝗤', 'R': '𝗥',
            'S': '𝗦', 'T': '𝗧', 'U': '𝗨', 'V': '𝗩', 'W': '𝗪', 'X': '𝗫', 'Y': '𝗬', 'Z': '𝗭',
            'a': '𝗮', 'b': '𝗯', 'c': '𝗰', 'd': '𝗱', 'e': '𝗲', 'f': '𝗳', 'g': '𝗴', 'h': '𝗵', 'i': '𝗶',
            'j': '𝗷', 'k': '𝗸', 'l': '𝗹', 'm': '𝗺', 'n': '𝗻', 'o': '𝗼', 'p': '𝗽', 'q': '𝗾', 'r': '𝗿',
            's': '𝘀', 't': '𝘁', 'u': '𝘂', 'v': '𝘃', 'w': '𝘄', 'x': '𝘅', 'y': '𝘆', 'z': '𝘇'
        },
        2: { // Italic
            'A': '𝘈', 'B': '𝘉', 'C': '𝘊', 'D': '𝘋', 'E': '𝘌', 'F': '𝘍', 'G': '𝘎', 'H': '𝘏', 'I': '𝘐',
            'J': '𝘑', 'K': '𝘒', 'L': '𝘓', 'M': '𝘔', 'N': '𝘕', 'O': '𝘖', 'P': '𝘗', 'Q': '𝘘', 'R': '𝘙',
            'S': '𝘚', 'T': '𝘛', 'U': '𝘜', 'V': '𝘝', 'W': '𝘞', 'X': '𝘟', 'Y': '𝘠', 'Z': '𝘡',
            'a': '𝘢', 'b': '𝘣', 'c': '𝘤', 'd': '𝘥', 'e': '𝘦', 'f': '𝘧', 'g': '𝘨', 'h': '𝘩', 'i': '𝘪',
            'j': '𝘫', 'k': '𝘬', 'l': '𝘭', 'm': '𝘮', 'n': '𝘯', 'o': '𝘰', 'p': '𝘱', 'q': '𝘲', 'r': '𝘳',
            's': '𝘴', 't': '𝘵', 'u': '𝘶', 'v': '𝘷', 'w': '𝘸', 'x': '𝘹', 'y': '𝘺', 'z': '𝘻'
        },
        3: { // Bold Italic
            'A': '𝘼', 'B': '𝘽', 'C': '𝘾', 'D': '𝘿', 'E': '𝙀', 'F': '𝙁', 'G': '𝙂', 'H': '𝙃', 'I': '𝙄',
            'J': '𝙅', 'K': '𝙆', 'L': '𝙇', 'M': '𝙈', 'N': '𝙉', 'O': '𝙊', 'P': '𝙋', 'Q': '𝙌', 'R': '𝙍',
            'S': '𝙎', 'T': '𝙏', 'U': '𝙐', 'V': '𝙑', 'W': '𝙒', 'X': '𝙓', 'Y': '𝙔', 'Z': '𝙕',
            'a': '𝙖', 'b': '𝙗', 'c': '𝙘', 'd': '𝙙', 'e': '𝙚', 'f': '𝙛', 'g': '𝙜', 'h': '𝙝', 'i': '𝙞',
            'j': '𝙟', 'k': '𝙠', 'l': '𝙡', 'm': '𝙢', 'n': '𝙣', 'o': '𝙤', 'p': '𝙥', 'q': '𝙦', 'r': '𝙧',
            's': '𝙨', 't': '𝙩', 'u': '𝙪', 'v': '𝙫', 'w': '𝙬', 'x': '𝙭', 'y': '𝙮', 'z': '𝙯'
        },
        4: { // Monospace
            'A': '𝙰', 'B': '𝙱', 'C': '𝙲', 'D': '𝙳', 'E': '𝙴', 'F': '𝙵', 'G': '𝙶', 'H': '𝙷', 'I': '𝙸',
            'J': '𝙹', 'K': '𝙺', 'L': '𝙻', 'M': '𝙼', 'N': '𝙽', 'O': '𝙾', 'P': '𝙿', 'Q': '𝚀', 'R': '𝚁',
            'S': '𝚂', 'T': '𝚃', 'U': '𝚄', 'V': '𝚅', 'W': '𝚆', 'X': '𝚇', 'Y': '𝚈', 'Z': '𝚉',
            'a': '𝚊', 'b': '𝚋', 'c': '𝚌', 'd': '𝚍', 'e': '𝚎', 'f': '𝚏', 'g': '𝚐', 'h': '𝚑', 'i': '𝚒',
            'j': '𝚓', 'k': '𝚔', 'l': '𝚕', 'm': '𝚖', 'n': '𝚗', 'o': '𝚘', 'p': '𝚙', 'q': '𝚚', 'r': '𝚛',
            's': '𝚜', 't': '𝚝', 'u': '𝚞', 'v': '𝚟', 'w': '𝚠', 'x': '𝚡', 'y': '𝚢', 'z': '𝚣'
        },
        5: { // Small Caps
            'A': 'ᴀ', 'B': 'ʙ', 'C': 'ᴄ', 'D': 'ᴅ', 'E': 'ᴇ', 'F': 'ғ', 'G': 'ɢ', 'H': 'ʜ', 'I': 'ɪ',
            'J': 'ᴊ', 'K': 'ᴋ', 'L': 'ʟ', 'M': 'ᴍ', 'N': 'ɴ', 'O': 'ᴏ', 'P': 'ᴘ', 'Q': 'ǫ', 'R': 'ʀ',
            'S': 's', 'T': 'ᴛ', 'U': 'ᴜ', 'V': 'ᴠ', 'W': 'ᴡ', 'X': 'x', 'Y': 'ʏ', 'Z': 'ᴢ',
            'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ғ', 'g': 'ɢ', 'h': 'ʜ', 'i': 'ɪ',
            'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ', 'q': 'ǫ', 'r': 'ʀ',
            's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x', 'y': 'ʏ', 'z': 'ᴢ'
        }
    };
    
    const map = fancyMap[style] || fancyMap[1];
    let result = '';
    for (let char of text) {
        result += map[char] || char;
    }
    return result;
}

// Binary converter
function textToBinary(text) {
    return text.split('').map(char => {
        return char.charCodeAt(0).toString(2).padStart(8, '0');
    }).join(' ');
}

// Binary to text
function binaryToText(binary) {
    return binary.split(' ').map(bin => {
        return String.fromCharCode(parseInt(bin, 2));
    }).join('');
}

// Base64 encode
function base64Encode(text) {
    return Buffer.from(text).toString('base64');
}

// Base64 decode
function base64Decode(text) {
    try {
        return Buffer.from(text, 'base64').toString('utf-8');
    } catch {
        return 'Invalid Base64';
    }
}

// Morse code maps
const morseMap = {
    'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.', 'G': '--.', 'H': '....',
    'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..', 'M': '--', 'N': '-.', 'O': '---', 'P': '.--.',
    'Q': '--.-', 'R': '.-.', 'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
    'Y': '-.--', 'Z': '--..',
    '0': '-----', '1': '.----', '2': '..---', '3': '...--', '4': '....-', '5': '.....',
    '6': '-....', '7': '--...', '8': '---..', '9': '----.',
    '.': '.-.-.-', ',': '--..--', '?': '..--..', '!': '-.-.--', ' ': '/'
};

const reverseMorseMap = Object.fromEntries(
    Object.entries(morseMap).map(([k, v]) => [v, k])
);

function textToMorse(text) {
    return text.toUpperCase().split('').map(char => {
        return morseMap[char] || char;
    }).join(' ');
}

function morseToText(morse) {
    return morse.split(' ').map(code => {
        return reverseMorseMap[code] || code;
    }).join('');
}

// Count characters, words, lines
function countText(text) {
    const chars = text.length;
    const words = text.trim().split(/\s+/).filter(w => w.length > 0).length;
    const lines = text.split('\n').length;
    const spaces = (text.match(/\s/g) || []).length;
    const letters = (text.match(/[a-zA-Z]/g) || []).length;
    const numbers = (text.match(/[0-9]/g) || []).length;
    
    return { chars, words, lines, spaces, letters, numbers };
}

// Read more (truncate with ...)
function readMore(text, limit = 100) {
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
}

// Repeat text
function repeatText(text, count = 5) {
    count = Math.min(count, 20); // Max 20 times
    return Array(count).fill(text).join('\n');
}

// Shorten text (remove extra spaces)
function shortenText(text) {
    return text.replace(/\s+/g, ' ').trim();
}

// Get user nickname
async function getNickname(conn, userJid) {
    try {
        const [user] = await conn.onWhatsApp(userJid);
        if (user?.exists) {
            const profile = await conn.profilePictureUrl(userJid, 'image').catch(() => null);
            const name = userJid.split('@')[0];
            return { name, exists: true, profile };
        }
    } catch {}
    return { name: userJid.split('@')[0], exists: false };
}

// ============================================
// 📌 FORMAT OUTPUT
// ============================================
function formatOutput(title, result, original = '', note = '') {
    return `╭─❖〔 🐢 ${title} 🐢 〕❖─╮
*│*
*│ 📥 Input:*
*│ ${original || 'No input'}*
*│*
*│ 📤 Output:*
*│ ${result}*
${note ? `*│*\n*│ 📌 Note: ${note}*` : ''}
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;
}

// ============================================
// 📌 REVERSE TEXT
// ============================================
cmd({
    pattern: "reverse",
    alias: ["rev"],
    desc: "Reverse text",
    category: "texttools",
    react: "🔄",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .reverse <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = reverseText(text);
        await conn.sendMessage(from, {
            text: formatOutput('REVERSE', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 UPPERCASE
// ============================================
cmd({
    pattern: "uppercase",
    alias: ["upper", "caps"],
    desc: "Convert to UPPERCASE",
    category: "texttools",
    react: "⬆️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .uppercase <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = uppercaseText(text);
        await conn.sendMessage(from, {
            text: formatOutput('UPPERCASE', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 LOWERCASE
// ============================================
cmd({
    pattern: "lowercase",
    alias: ["lower"],
    desc: "Convert to lowercase",
    category: "texttools",
    react: "⬇️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .lowercase <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = lowercaseText(text);
        await conn.sendMessage(from, {
            text: formatOutput('LOWERCASE', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 FANCY TEXT (Multiple Styles)
// ============================================
cmd({
    pattern: "fancy",
    alias: ["style", "fancytext"],
    desc: "Convert to fancy text (1-5)",
    category: "texttools",
    react: "✨",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let style = 1;
        let text = args.join(' ');
        
        // Check if first argument is a number (style)
        if (args[0] && !isNaN(args[0]) && args[0] >= 1 && args[0] <= 5) {
            style = parseInt(args[0]);
            text = args.slice(1).join(' ');
        }
        
        text = text || (mek.quoted?.text || '');
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .fancy <style 1-5> <text>\n\n*Styles:*\n1. Bold\n2. Italic\n3. Bold Italic\n4. Monospace\n5. Small Caps",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = fancyText(text, style);
        const styleNames = ['Bold', 'Italic', 'Bold Italic', 'Monospace', 'Small Caps'];
        
        await conn.sendMessage(from, {
            text: formatOutput(`FANCY (${styleNames[style-1]})`, result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 BINARY
// ============================================
cmd({
    pattern: "binary",
    alias: ["bin", "toBinary"],
    desc: "Convert text to binary",
    category: "texttools",
    react: "0️⃣1️⃣",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .binary <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = textToBinary(text);
        await conn.sendMessage(from, {
            text: formatOutput('BINARY', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 BASE64
// ============================================
cmd({
    pattern: "base64",
    alias: ["b64", "encode64"],
    desc: "Convert text to Base64",
    category: "texttools",
    react: "🔐",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .base64 <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = base64Encode(text);
        await conn.sendMessage(from, {
            text: formatOutput('BASE64', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 DECODE64
// ============================================
cmd({
    pattern: "decode64",
    alias: ["deb64", "decodebase64"],
    desc: "Decode Base64 to text",
    category: "texttools",
    react: "🔓",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .decode64 <base64> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = base64Decode(text);
        await conn.sendMessage(from, {
            text: formatOutput('DECODE64', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 MORSE
// ============================================
cmd({
    pattern: "morse",
    alias: ["tomorse"],
    desc: "Convert text to Morse code",
    category: "texttools",
    react: "📻",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .morse <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = textToMorse(text);
        await conn.sendMessage(from, {
            text: formatOutput('MORSE', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 UNMORSE
// ============================================
cmd({
    pattern: "unmorse",
    alias: ["frommorse"],
    desc: "Convert Morse code to text",
    category: "texttools",
    react: "📡",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .unmorse <morse code> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = morseToText(text);
        await conn.sendMessage(from, {
            text: formatOutput('UNMORSE', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 COUNT
// ============================================
cmd({
    pattern: "count",
    alias: ["textcount", "counttext"],
    desc: "Count characters, words, lines",
    category: "texttools",
    react: "🔢",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .count <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const counts = countText(text);
        const result = `Characters: ${counts.chars}
Words: ${counts.words}
Lines: ${counts.lines}
Spaces: ${counts.spaces}
Letters: ${counts.letters}
Numbers: ${counts.numbers}`;
        
        await conn.sendMessage(from, {
            text: formatOutput('TEXT COUNT', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 READMORE
// ============================================
cmd({
    pattern: "readmore",
    alias: ["truncate", "shorten"],
    desc: "Truncate long text",
    category: "texttools",
    react: "✂️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let limit = 100;
        let text = args.join(' ');
        
        // Check if first argument is a number (limit)
        if (args[0] && !isNaN(args[0])) {
            limit = parseInt(args[0]);
            text = args.slice(1).join(' ');
        }
        
        text = text || (mek.quoted?.text || '');
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .readmore <limit> <text>\nExample: .readmore 50 Long text here...",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = readMore(text, limit);
        await conn.sendMessage(from, {
            text: formatOutput('READ MORE', result, text, `Limit: ${limit} chars`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 REPEAT
// ============================================
cmd({
    pattern: "repeat",
    alias: ["rep"],
    desc: "Repeat text multiple times",
    category: "texttools",
    react: "🔁",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        let count = 5;
        let text = args.join(' ');
        
        // Check if first argument is a number (count)
        if (args[0] && !isNaN(args[0])) {
            count = parseInt(args[0]);
            text = args.slice(1).join(' ');
        }
        
        text = text || (mek.quoted?.text || '');
        
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .repeat <count> <text>\nExample: .repeat 3 Hello",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = repeatText(text, count);
        await conn.sendMessage(from, {
            text: formatOutput('REPEAT', result, text, `Repeated ${count} times`),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 SHORTEN
// ============================================
cmd({
    pattern: "shorten",
    alias: ["trim", "clean"],
    desc: "Remove extra spaces",
    category: "texttools",
    react: "✂️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        const text = args.join(' ') || (mek.quoted?.text || '');
        if (!text) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* .shorten <text> or reply to message",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const result = shortenText(text);
        await conn.sendMessage(from, {
            text: formatOutput('SHORTENED', result, text),
            contextInfo: getContextInfo({ sender: sender })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 NICKNAME
// ============================================
cmd({
    pattern: "nickname",
    alias: ["nick", "name"],
    desc: "Get user's nickname/name",
    category: "texttools",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args, isGroup }) => {
    try {
        let targetUser = sender;
        
        // Check for mentioned user
        if (mek.mentionedJid && mek.mentionedJid.length > 0) {
            targetUser = mek.mentionedJid[0];
        } else if (args[0]) {
            let number = args[0].replace(/[^0-9]/g, '');
            if (number.length >= 10) {
                targetUser = number + '@s.whatsapp.net';
            }
        } else if (mek.quoted) {
            targetUser = mek.quoted.sender;
        }
        
        const userInfo = await getNickname(conn, targetUser);
        
        let groupName = '';
        if (isGroup) {
            const groupMetadata = await conn.groupMetadata(from);
            groupName = groupMetadata.subject;
        }
        
        const result = `👤 *User:* @${targetUser.split('@')[0]}
📛 *Name:* ${userInfo.name}
✅ *Exists on WA:* ${userInfo.exists ? 'Yes' : 'No'}
${isGroup ? `📛 *Group:* ${groupName}` : ''}`;

        await conn.sendMessage(from, {
            text: formatOutput('NICKNAME', result, '', ''),
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [targetUser] })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});

// ============================================
// 📌 TAGMSG
// ============================================
cmd({
    pattern: "tagmsg",
    alias: ["tagtext", "mark"],
    desc: "Tag a message with custom text",
    category: "texttools",
    react: "🏷️",
    filename: __filename
}, async (conn, mek, m, { from, sender, args }) => {
    try {
        if (!mek.quoted) {
            return await conn.sendMessage(from, {
                text: "📌 *Usage:* Reply to a message with .tagmsg <your text>",
                contextInfo: getContextInfo({ sender: sender })
            }, { quoted: fkontak });
        }
        
        const tagText = args.join(' ') || '📌 Tagged Message';
        const quotedText = mek.quoted.text || 'No text content';
        
        const result = `📌 *${tagText}*
        
╭─❖〔 🐢 TAGGED MESSAGE 🐢 〕❖─╮
*│*
*│ 💬 ${quotedText}*
*│*
*│ 👤 From: @${mek.quoted.sender.split('@')[0]}*
*│ 🏷️ Tag: ${tagText}*
*│*
╰─❖〔 🐢 𝙰𝚕𝚠𝚊𝚢𝚜 𝚊𝚝 𝚢𝚘𝚞𝚛 𝚜𝚎𝚛𝚟𝚒𝚌𝚎 🐢 〕❖─╯

${config.BOT_FOOTER}`;

        await conn.sendMessage(from, {
            text: result,
            contextInfo: getContextInfo({ sender: sender, mentionedJid: [mek.quoted.sender] })
        }, { quoted: fkontak });
    } catch (error) {
        await conn.sendMessage(from, { text: `❌ Error: ${error.message}` }, { quoted: fkontak });
    }
});
