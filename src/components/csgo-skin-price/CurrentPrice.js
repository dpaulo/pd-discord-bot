const { default: axios } = require("axios");

module.exports = (msg, args) => {
  // Send a message reply to the same text channel as the message was sent from
  msg.channel.send("Nothing coded yet, still in development, but you have passed these arguments: " + args);
};
