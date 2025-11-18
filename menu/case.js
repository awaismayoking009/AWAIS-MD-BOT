// This function receives 'sock' and 'msg' from index.js
// 'opts' contains additional info like: { isGroup, isFromMe, text, jid }

const handleCommand = async (sock, msg, opts) => {
  try {
    // 1. Extract message content and JID
    const text = opts.text; 
    const jid = opts.jid;
    
    // 2. Set the command prefix (default to '!' if not set in settings)
    const prefix = global.settings.prefix || '!'; 
    
    // 3. Ignore messages sent by the bot itself
    if (opts.isFromMe) return; 
    
    // 4. Parse Command and Arguments
    const isCommand = text.startsWith(prefix);
    if (!isCommand) return; // Not a command
    
    const args = text.slice(prefix.length).trim().split(/ +/).filter(s => s.length > 0);
    const cmd = args.shift()?.toLowerCase();
    const fullArgs = args.join(' ');
    
    // 5. Ignore if no command name is found
    if (!cmd) return; 

    // 6. Log the command execution for debugging
    console.log(`[COMMAND] Executed: ${cmd} by ${msg.key.participant || jid}`);

    // --- Main Command Switch Case ---

    switch (cmd) {
      
      case 'menu':
      case 'help':
        {
          const helpMessage = `
*╭━━━「 👑 AWAIS BOT MENU 👑 」━━━╮*

*GENERAL COMMANDS:*
  ${prefix}menu  - Shows this menu.
  ${prefix}ping  - Checks bot latency/speed.

*GROUP COMMANDS:*
  ${prefix}tagall  - Tags all group members (Admin only).
  ${prefix}antilink on/off  - Toggles the anti-link feature (Admin only).

*OWNER COMMANDS:*
  ${prefix}setprefix [char] - Sets a new command prefix.
  ${prefix}broadcast [msg] - Sends a message to all groups.
  
*╰━━━「 𝐏𝐎𝐖𝐄𝐑𝐄𝐃 𝐁𝐘 𝐀𝐖𝐀𝐈𝐒 」━━━╯*
          `;
          await sock.sendMessage(jid, { text: helpMessage });
        }
        break;

      case 'ping':
        {
          const start = Date.now();
          // Send a message to measure RTT (Round Trip Time)
          const sentMsg = await sock.sendMessage(jid, { text: 'Ping...' });
          const end = Date.now();
          const latency = end - start;
          
          await sock.sendMessage(jid, { text: `🚀 Pong! Latency: *${latency}ms*` }, { quoted: sentMsg });
        }
        break;
        
      case 'tagall':
        // Example Group Command
        if (!opts.isGroup) {
            await sock.sendMessage(jid, { text: `❌ This command can only be used in groups.` });
            return;
        }
        
        // You should add an Admin check here for security
        const metadata = await sock.groupMetadata(jid);
        const members = metadata.participants.map(p => p.id);
        
        await sock.sendMessage(jid, { 
            text: `📢 *${fullArgs || '📣 Calling everyone! 📣'}*\n\n` + members.map(m => `@${m.split('@')[0]}`).join('\n'), 
            mentions: members 
        });
        break;

      case 'setprefix':
        // Example Owner Command
        // Check if the sender is the owner
        if (msg.key.participant !== global.owner) {
            await sock.sendMessage(jid, { text: `❌ This command is restricted to the Bot Owner.` });
            return;
        }
        
        // Check for valid arguments
        if (!fullArgs || fullArgs.length > 1) {
             await sock.sendMessage(jid, { text: `⚠️ Usage: ${prefix}setprefix # (Use only one character)` });
             return;
        }
        
        // TODO: You must add logic here to save the new prefix to your settings file (e.g., settings.json)
        global.settings.prefix = fullArgs;
        await sock.sendMessage(jid
