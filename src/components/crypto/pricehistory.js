const client = require("discord.js");
const axios = require("axios");

module.exports = async (message) => {
  const [command, ...args] = message.content.split(" ");
  if (args.length !== 2) {
    message.reply("You must provide the crypto and the date in this format dd-mm-yyyy");
    console.log(args.length);
  } else {
    const [coin, date] = args;
    try {
      // Get crypto price from coingecko API
      const { data } = await axios.get(`https://api.coingecko.com/api/v3/coins/${coin}/history?date=${date}&localization=false`);
      const cost = data.market_data.current_price.usd;
      return message.reply(`The price of 1 ${coin} on ${date} was $ ${cost}`);
    } catch (err) {
      return message.reply("Please check your inputs. For example: $coinhistory bitcoin date(dd-mm-yyy)");
    }
  }
};
