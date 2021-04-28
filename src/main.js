require("dotenv").config();
const Discord = require("discord.js");
const config = require("../config.json");
const CsgoSteamMarketPrice = require("./components/csgo-item-price/MarketPrice");
const CsgoSteamMarketTrend = require("./components/csgo-item-price/MarketTrend");
const CsgoSteamMarketInventory = require("./components/csgo-item-price/InventoryValue");
const CoinPrices = require("./components/crypto/pricecheck")
const CoinTrend = require("./components/crypto/pricetrend")
const CoinHistory = require("./components/crypto/pricehistory")
const CoinPrices = require("./components/crypto/pricecheck")
const Compare = require("./components/exchange-rates/compare");
const sqlite3 = require("sqlite3").verbose();
const db = new sqlite3.Database(config.dbName);

// Making the actual client of the bot
const client = new Discord.Client();

// The prefix located inside config.json that is used to call the bot commands
const BOT_PREFIX = config.botPrefix;

// The commands available in the bot, located inside config.json
const COMMAND_CHECK = config.commandCheck;
const COMMAND_CSGO_PRICE = config.commandCsgoPrice;
const COMMAND_CSGO_TREND = config.commandCsgoTrend;
const COMMAND_CSGO_INVENTORY = config.commandCsgoInventory;
const COMMAND_COIN_PRICE = config.commandCoinPrice;
const COMMAND_COIN_TREND = config.commandCoinTrend;
const COMMAND_COIN_HISTORY = config.commandCoinHistory;
const COMMAND_COMPARE = config.commandCompare;
const COMMAND_CONVERT = config.commandConvert;

// Once the bot is ready, log a message to the console saying that the bot has successfully started and connectedstart
client.once("ready", () => {
  console.log(`${client.user.tag} is online!`);
});

// Event hook that is triggered when a message is being sent to the server
client.on("message", async (msg) => {
  // If the message does not contain the bot prefix or was send by the bot itself, return as there's nothing to do with it and should be ignored.
  // If the message contains the prefix, continue checking whick command it was.
  if (!msg.content.startsWith(BOT_PREFIX) || msg.author.bot) return;

  // Get the command + arguments passed after the bot prefix.
  const args = msg.content.slice(BOT_PREFIX.length).split(/ +/);

  // To separate arguments and the command itself, use shift() to get the first element of our command + arguments input and make it lowercase.
  // This also removes the command from the args variable leaving only the arguments there.
  const command = args.shift().toLowerCase();

  // The command used to perform a general check if the bot is working and is responsive, kind of an indicator response
  if (command === COMMAND_CHECK) {
    // Put checkmark react on the message with the command to indicate that the bot is working
    msg.react("❤️");
  }

  // The command used to check the current price of a particular CS:GO item and save/update the results into the database for the Trend lookup later on
  if (command === COMMAND_CSGO_PRICE) {
    CsgoSteamMarketPrice(BOT_PREFIX, msg, args, db);
  }

  // The command used to check the price change from the last time the item has been checked. This command only gets the results from database, doesn't save them
  if (command === COMMAND_CSGO_TREND) {
    CsgoSteamMarketTrend(BOT_PREFIX, msg, args, db);
  }

  // The command used to calculate Steam User's CS:GO inventory value by providing a CustomURL or their Steam ID as an argument
  if (command === COMMAND_CSGO_INVENTORY) {
    CsgoSteamMarketInventory(BOT_PREFIX, msg, args);
  }

  if (command === COMMAND_COIN_PRICE) {
    CoinPrices(msg);
  }
  if (command === COMMAND_COIN_TREND) {
    CoinTrend(msg);
  }
  if (command === COMMAND_COIN_HISTORY) {
    CoinHistory(msg);
  }
  
  if (command === COMMAND_COMPARE) {
    Compare(msg);
  }
  if (command === COMMAND_CONVERT) {
    Convert(msg);
});

// Log in and authorize our bot with the Access Token from the .env variable
client.login(process.env.BOT_TOKEN);