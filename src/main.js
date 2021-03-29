require("dotenv").config();
const Discord = require("discord.js");
const config = require("../config.json");
const CurrentCsgoPrice = require("./components/csgo-skin-price/CurrentPrice");

// Making the actual client of the bot
const client = new Discord.Client();

// The prefix located inside config.json that is used to call the bot commands
const BOT_PREFIX = config.botPrefix;

// The commands available in the bot, located inside config.json
const COMMAND_CHECK = config.commandCheck;
const COMMAND_CSGO_PRICE = config.commandCsgoPrice;

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

  if (command === COMMAND_CSGO_PRICE) {
    CurrentCsgoPrice(msg, args);
  }
});

// Log in and authorize our bot with the Access Token from the .env variable
client.login(process.env.BOT_TOKEN);
