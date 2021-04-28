const Discord = require("discord.js");
const axios = require("axios");



module.exports = async (message) => {
    const [command, ...args] = message.content.split(' ');
    // Getting data from price empire api
    const [curCurrency, vsCurrency] = args;
    try {
        const { data } = await axios.get('https://public-api.pricempire.com/api/meta/getCurrencyRates');
        var c = data[curCurrency]
        var v = data[vsCurrency]
        var result = v / c
        result
        // checking if data exists if not throw error
        if (!data[curCurrency] || !data[vsCurrency]) throw Error();
        return message.channel.send(` the current exchange rate of ${curCurrency} to ${vsCurrency} per 1 ${curCurrency} you will recieve ${result} ${vsCurrency}`)
    }
    catch (err) {
        //error message telling the user to properly enter the command is properly entered
        return message.channel.send(`Please make sure you correctly format the command and currencies, for example: $compare USD GBP`)


    }
};