const { adams } = require('../Ibrahim/adams');

// Enhanced phone number analysis
function getEnhancedPhoneInfo(phoneNumber) {
    let cleanNumber = phoneNumber.replace(/[^\d+]/g, '');
    
    // Remove + if present
    if (cleanNumber.startsWith('+')) {
        cleanNumber = cleanNumber.substring(1);
    }

    // Comprehensive country codes with detailed info
    const countryCodes = {
        '254': { 
            country: 'Kenya', 
            region: 'East Africa',
            capital: 'Nairobi',
            timezone: 'EAT (UTC+3)',
            currency: 'KES',
            carriers: {
                '70': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '71': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '72': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '74': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '75': { name: 'Airtel', type: 'GSM', tech: '2G/3G/4G' },
                '76': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '77': { name: 'Telkom', type: 'GSM', tech: '3G/4G' },
                '78': { name: 'Airtel', type: 'GSM', tech: '2G/3G/4G' },
                '79': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '11': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' },
                '10': { name: 'Safaricom', type: 'GSM', tech: '2G/3G/4G/5G' }
            }
        },
        '1': { 
            country: 'United States/Canada', 
            region: 'North America',
            timezone: 'Multiple (EST/PST/MST/CST)',
            currency: 'USD/CAD'
        },
        '44': { 
            country: 'United Kingdom', 
            region: 'Europe',
            timezone: 'GMT (UTC+0)',
            currency: 'GBP'
        },
        '91': { 
            country: 'India', 
            region: 'South Asia',
            timezone: 'IST (UTC+5:30)',
            currency: 'INR'
        },
        '234': { 
            country: 'Nigeria', 
            region: 'West Africa',
            timezone: 'WAT (UTC+1)',
            currency: 'NGN'
        },
        // Add more countries as needed
    };

    // Find country code
    let countryInfo = null;
    let countryCode = '';
    
    for (let len = 1; len <= 3; len++) {
        const code = cleanNumber.substring(0, len);
        if (countryCodes[code]) {
            countryInfo = countryCodes[code];
            countryCode = code;
            break;
        }
    }

    // Enhanced carrier analysis
    let carrierInfo = null;
    if (countryInfo?.carriers) {
        const networkCode = cleanNumber.substring(countryCode.length, countryCode.length + 2);
        carrierInfo = countryInfo.carriers[networkCode];
    }

    // Number validation patterns
    const isValidFormat = validateNumberFormat(cleanNumber, countryCode);
    
    return {
        original: phoneNumber,
        cleaned: cleanNumber,
        countryCode: countryCode,
        countryInfo: countryInfo,
        carrierInfo: carrierInfo,
        isValid: countryInfo !== null && isValidFormat,
        format: countryCode ? `+${countryCode} ${formatNumber(cleanNumber, countryCode)}` : cleanNumber,
        numberType: getNumberType(cleanNumber, countryCode)
    };
}

function validateNumberFormat(number, countryCode) {
    const patterns = {
        '254': /^254[17]\d{8}$/, // Kenya: 254 + (7 or 1) + 8 digits
        '1': /^1[2-9]\d{9}$/, // US/Canada
        '44': /^44[1-9]\d{8,9}$/, // UK
        '91': /^91[6-9]\d{9}$/, // India
        '234': /^234[7-9]\d{9}$/ // Nigeria
    };
    
    return patterns[countryCode] ? patterns[countryCode].test(number) : true;
}

function formatNumber(number, countryCode) {
    const remaining = number.substring(countryCode.length);
    
    switch(countryCode) {
        case '254': // Kenya: 254 7XX XXX XXX
            return remaining.replace(/(\d{1})(\d{2})(\d{3})(\d{3})/, '$1$2 $3 $4');
        case '1': // US/Canada: 1 XXX XXX XXXX
            return remaining.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
        default:
            return remaining;
    }
}

function getNumberType(number, countryCode) {
    if (countryCode === '254') {
        const prefix = number.substring(3, 5);
        if (['70', '71', '72', '74', '76', '79'].includes(prefix)) return 'Mobile';
        if (['11', '10'].includes(prefix)) return 'Fixed Line';
        return 'Mobile';
    }
    return 'Mobile'; // Default assumption
}

adams({
    nomCom: "track",
    aliases: ["phoneinfo", "lookup", "analyze"],
    categorie: "Info",
    reaction: "🔍",
    nomFichier: __filename
}, async (dest, zk, commandeOptions) => {
    const { ms, repondre, arg, msgRepondu } = commandeOptions;

    let phoneNumber = '';
    let isGroupAnalysis = false;

    // Check if it's a group
    const isGroup = dest.endsWith('@g.us');

    // Get phone number
    if (msgRepondu && !arg[0]) {
        const quotedSender = ms.message?.extendedTextMessage?.contextInfo?.participant;
        if (quotedSender) {
            phoneNumber = quotedSender.split('@')[0];
            isGroupAnalysis = true;
        } else {
            return repondre("❌ Could not extract number from the replied message.");
        }
    } else if (arg[0]) {
        phoneNumber = arg.join('').replace(/\s/g, '');
    } else {
        return repondre(`🔍 *ENHANCED PHONE TRACKER*\n\n*Usage:*\n• Reply to message: \`track\`\n• Manual: \`track 254727716045\`\n\n⚠️ *Educational Purpose Only*`);
    }

    try {
        await repondre("🔍 *Deep Analysis in Progress...*\n\n📡 Gathering network information...\n🌍 Checking geographical data...\n📱 Analyzing phone details...");

        const phoneInfo = getEnhancedPhoneInfo(phoneNumber);

        if (!phoneInfo.isValid) {
            return repondre(`❌ *Invalid or Unrecognized Number*\n\n*Input:* ${phoneNumber}\n\nPlease provide a valid international number.`);
        }

        // Enhanced response for groups vs DM
        let responseText = "";
        
        if (isGroup && isGroupAnalysis) {
            // Limited info in groups for privacy
            responseText = "🔍 *GROUP ANALYSIS RESULTS*\n";
            responseText += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
            responseText += "📱 *BASIC INFO*\n";
            responseText += `*Number:* ${phoneInfo.format}\n`;
            responseText += `*Country:* ${phoneInfo.countryInfo.country}\n`;
            responseText += `*Region:* ${phoneInfo.countryInfo.region}\n`;
            
            if (phoneInfo.carrierInfo) {
                responseText += `*Network:* ${phoneInfo.carrierInfo.name}\n`;
            }
            
            responseText += "\n🔒 *Limited info shown in groups for privacy*";
        } else {
            // Full detailed analysis for DM
            responseText = "🔍 *COMPREHENSIVE PHONE ANALYSIS*\n";
            responseText += "━━━━━━━━━━━━━━━━━━━━━━\n\n";
            
            responseText += "📱 *PHONE DETAILS*\n";
            responseText += `*Original Input:* ${phoneInfo.original}\n`;
            responseText += `*Formatted:* ${phoneInfo.format}\n`;
            responseText += `*Number Type:* ${phoneInfo.numberType}\n`;
            responseText += `*Valid Format:* ✅ Verified\n\n`;
            
            responseText += "🌍 *GEOGRAPHICAL INFO*\n";
            responseText += `*Country:* ${phoneInfo.countryInfo.country}\n`;
            responseText += `*Region:* ${phoneInfo.countryInfo.region}\n`;
            responseText += `*Country Code:* +${phoneInfo.countryCode}\n`;
            
            if (phoneInfo.countryInfo.capital) {
                responseText += `*Capital:* ${phoneInfo.countryInfo.capital}\n`;
            }
            if (phoneInfo.countryInfo.timezone) {
                responseText += `*Timezone:* ${phoneInfo.countryInfo.timezone}\n`;
            }
            if (phoneInfo.countryInfo.currency) {
                responseText += `*Currency:* ${phoneInfo.countryInfo.currency}\n`;
            }
            
            if (phoneInfo.carrierInfo) {
                responseText += "\n📡 *NETWORK DETAILS*\n";
                responseText += `*Carrier:* ${phoneInfo.carrierInfo.name}\n`;
                responseText += `*Network Type:* ${phoneInfo.carrierInfo.type}\n`;
                responseText += `*Technology:* ${phoneInfo.carrierInfo.tech}\n`;
            }

            // Add WhatsApp specific info if available
            try {
                const waProfile = await getWhatsAppProfile(phoneNumber, zk);
                if (waProfile) {
                    responseText += "\n💬 *WHATSAPP INFO*\n";
                    responseText += `*Profile Name:* ${waProfile.name || 'Not available'}\n`;
                    responseText += `*About:* ${waProfile.status || 'Not available'}\n`;
                    responseText += `*Profile Picture:* ${waProfile.hasPhoto ? 'Available' : 'Not set'}\n`;
                }
            } catch (error) {
                responseText += "\n💬 *WHATSAPP INFO*\n";
                responseText += `*Status:* Account exists\n`;
            }

            responseText += "\n⚠️ *DISCLAIMER*\n";
            responseText += "This analysis shows publicly available information only.\n";
            responseText += "No private data, location, or personal info is accessed.\n";
            responseText += "*For educational purposes only.*\n";
        }
        
        responseText += "\n━━━━━━━━━━━━━━━━━━━━━━\n";
        responseText += "> © BWM-XMD Enhanced Tracker";

        await zk.sendMessage(dest, {
            text: responseText,
            contextInfo: {
                externalAdReply: {
                    title: `📱 ${phoneInfo.countryInfo.country} Analysis`,
                    body: `${phoneInfo.format} • ${phoneInfo.carrierInfo?.name || 'Unknown Carrier'}`,
                    mediaType: 1,
                    thumbnailUrl: "https://files.catbox.moe/sd49da.jpg",
                    sourceUrl: "https://bwmxmd.online",
                    renderLargerThumbnail: false,
                    showAdAttribution: true,
                }
            }
        }, { quoted: ms });

    } catch (error) {
        console.error("Error in enhanced track command:", error);
        await repondre(`❌ *Analysis Failed*\n\nError: ${error.message}\n\nPlease try with a different number.`);
    }
});

// Helper function to get WhatsApp profile info (if accessible)
async function getWhatsAppProfile(phoneNumber, zk) {
    try {
        const jid = phoneNumber + '@s.whatsapp.net';
        
        // Try to get profile info
        const profile = await zk.fetchProfile(jid);
        
        let hasPhoto = false;
        try {
            await zk.profilePictureUrl(jid);
            hasPhoto = true;
        } catch (e) {
            hasPhoto = false;
        }

        return {
            name: profile?.name,
            status: profile?.status,
            hasPhoto: hasPhoto
        };
    } catch (error) {
        return null;
    }
}
