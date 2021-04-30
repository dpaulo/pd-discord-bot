const Discord = require("discord.js");
const axios = require("axios");

module.exports = async (message) => {
  const [command, ...args] = message.content.split(" ");
  //converting the parameters into their respective constants
  const [amount, curCurrency, vsCurrency] = args;
  try {
    //getting data from the price empire api
    const { data } = await axios.get("https://public-api.pricempire.com/api/meta/getCurrencyRates");
    var x = data[curCurrency];
    var y = data[vsCurrency];
    // small calculation for the conversion of one currency to another
    var result = (amount / x) * y;
    //rounding up to 2 decimal places to show how much money you would currently make
    result = result.toFixed(2);
    // checking if all 3 parameters were properly entered if not throw error
    if (!data[curCurrency] || !data[vsCurrency] || isNaN(result) == true) throw Error();
    return message.channel.send(`The amount of ${amount} ${curCurrency} converted to ${vsCurrency} is ${result} ${vsCurrency} `);
  } catch (err) {
    //error message telling the user to properly enter the command is properly entered
    return message.channel.send(`Please check you have correctly formatted the command and currencies, for example: $convert 100 USD GBP`);
  }
};
