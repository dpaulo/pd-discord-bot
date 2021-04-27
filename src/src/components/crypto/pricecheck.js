const client = require('discord.js')
const axios = require('axios')

module.exports = async (message) => {
        const [command, ...args] = message.content.split(' ');
        console.log(args)
        if (args.length !== 2) {
            message.channel.send('You must provide the crypto and the currency to compare with!');
            console.log(args.length)
          } else {
            const [coin, vsCurrency] = args;
            try {
              // Get crypto price from coingecko API
              const { data } = await axios.get(
                `https://api.coingecko.com/api/v3/simple/price?ids=${coin}&vs_currencies=${vsCurrency}`
              );
      
              // Check if data exists
              if (!data[coin][vsCurrency]) throw Error();
      
              return message.channel.send(
                `The current price of 1 ${coin} = ${data[coin][vsCurrency]} ${vsCurrency}`
              );
            } catch (err) {
              return message.channel.send('Please check your inputs. For example: $price bitcoin usd');
            }
          }
}
