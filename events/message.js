const fs = require("fs");
const Discord = require("discord.js");
const cooldowns = new Discord.Collection();
const db = require("quick.db");

module.exports = class {
  constructor (client) {
    this.client = client;
  }
  
  async run (message) {
    if (message.author.bot) return;
    if (message.channel.type === "text") {
      if (!message.channel.permissionsFor(message.guild.me).missing("SEND_MESSAGES")) return;
    }

    if (message.content.startsWith("wii ")) return message.channel.send("The prefix has been changed to `e.`");
    if (!message.channel.guild) return message.channel.send("I can't execute commands inside DMs! Please run this command in a server.");

    const mPrefix = new RegExp(`^<@!?${this.client.user.id}> `);
    const fPrefix = message.content.match(mPrefix) ? message.content.match(mPrefix)[0] : this.client.settings.pre;
    if (message.content.toLowerCase().indexOf(fPrefix) !== 0) return;
    const args = message.content.slice(fPrefix.length).trim().split(/ +/g);

    const command = args.shift().toLowerCase();
    const cmd = this.client.commands.get(command) || this.client.commands.find(c => c.aliases && c.aliases.includes(command));
    if (!cmd) {
      if (fs.existsSync(`./commands/${command}.js`)) {
        try {
          const commandFile = require(`./commands/${command}.js`);
          if (commandFile) commandFile.run(this.client, message, args);
        } catch (error) {
          console.error(error);
          message.reply("There was an error trying to execute that command!");
        }
      }
      return;
    }

    db.add(`botMessages.${this.client.user.id}`, 1);
    db.add(`${cmd.name}.${this.client.user.id}`, 1);
    
    if (cmd && !message.guild && cmd.guildOnly) return message.channel.send("I can't execute that command inside DMs!. Please run this command in a server.");
    if (cmd && !args.length && cmd.args === true) return message.channel.send(`You didn't provide any arguments ${message.author}.\nCorrect Usage: \`${fPrefix}${cmd.name} ${cmd.usage}\``);

    if (!cooldowns.has(command.name)) {
      cooldowns.set(command.name, new Discord.Collection());
    }
  
    const now = Date.now();
    const timestamps = cooldowns.get(command.name);
    const cooldownAmount = cmd.cooldown * 100;

    if (!this.client.settings.mods.includes(message.author.id)) {
      if (!timestamps.has(message.author.id)) {
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }
      else {
        const expirationTime = timestamps.get(message.author.id) + cooldownAmount;
        if (now < expirationTime) {
          const timeLeft = (expirationTime - now) / 1000;
          return message.reply(`Please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${cmd.name}\` command.`);
        }
        timestamps.set(message.author.id, now);
        setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);
      }
    }
  
    try {
      cmd.execute(this.client, message, args);
    } catch (e) {
      console.error(e);
      message.reply("There was an error trying to execute that command!");
    }
  }
};
  