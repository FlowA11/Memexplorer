module.exports = {
  name: "donate",
  description: "Link to donate for the bot",
  async execute (client, message, args) { // eslint-disable-line no-unused-vars
    return message.channel.send("Donate: https://memexplorer.com/donate");
  },  
};