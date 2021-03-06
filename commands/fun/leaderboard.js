const mongoose = require("mongoose");
const mongoUrl = require("../..//tokens.json").mongodb;
const posts = require("../..//models/post.js"); // eslint-disable-line no-unused-vars
const users = require("../..//models/profiles.js");
const { invisible } = require("../../data/colors.json");
const { loading, currencyEmoji } = require("../../data/emojis.json");
const Discord = require("discord.js");

mongoose.connect(mongoUrl, {
  useNewUrlParser: true
});

module.exports = {
  name: "leaderboard",
  description: "View the people with the most money.",
  cooldown: "5",
  async execute (client, message, args) { // eslint-disable-line no-unused-vars
    const msg = await message.channel.send(`${loading} Fetching leaderboard...`);

    users.find().sort([["bytes", "descending"]]).exec(async (err, res) => {
      if (err) console.log(err);
      const lb = [];

      for (var i = 0; i < 10; i++) {
        try {
          const u = await client.fetchUser(res[i].authorID);
          lb.push(`**${i+1}.** ${u.tag} - ${currencyEmoji} **${res[i].bytes}** ${client.settings.currency}`);
        } catch (e) {} // eslint-disable-line no-empty
      }

      const embed = new Discord.RichEmbed()
        .setAuthor("Global Leaderboard", client.user.avatarURL)
        .setDescription(`${lb.join("\n")}`)
        .setTimestamp()
        .setColor(invisible);
      msg.edit(embed);
    });
  },
};
