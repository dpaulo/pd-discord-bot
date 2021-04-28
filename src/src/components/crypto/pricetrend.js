const client = require('discord.js')
const axios = require('axios')

module.exports = async (message) => {
    axios
    .get(`https://api.coingecko.com/api/v3/search/trending`)
    .then((res) => {
        message.channel.send("The current trending cryptocurrencies are the following: ")
      const coins = res.data.coins
      for(const index in coins)
      {
          message.channel.send(coins[index].item.name)
      }
    })
    .catch((err) => {
        console.error('ERR:', err)
    })
  }