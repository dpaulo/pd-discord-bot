const { default: axios } = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = async (BOT_PREFIX, msg, args) => {
  // Check if there are any arguments provided. If not, return a message asking to use commands by following hte correct template
  if (args.length <= 0) {
    return msg.channel.send("Please follow the template `" + BOT_PREFIX + "csgoinv {CustomURL}` or `" + BOT_PREFIX + "csgoinv {SteamID}`");
  }

  // Construct a URL to get the inventory of a particular user
  const inventoryUrl = await constructInvUrl(args[0]);

  // Perform an HTTP request that returns a JSON of inventory items
  const resInventory = await performRequest(inventoryUrl);

  // If an error occured and the inventory haven't been returned or the request was unsuccessful, return by sending an error message
  if (typeof resInventory == "undefined" || !resInventory.success) {
    return msg.channel.send(
      resInventory
        ? resInventory.Error
        : "Sorry, but the user cannot be found or the query has failed, so can't get their inventory. Make sure that the profile exists and its inventory is public."
    );
  }

  // Construst the Player Profile's Summary URL for the request afterwards by providng the CustomURL or the SteamID
  const playerSummariesUrl = await constructPlayerSummariesUrl(args[0]);
  // Add a short delay between requests to avoid being blocked due to a high volume of requests
  await sleep(500);

  // Perform an HTTP request that returns a JSON of the Player Profile Summary
  const resPlayerSummaries = await performRequest(playerSummariesUrl);

  // Send a message that everything was fine since the start of the execution now and it's calculating the total value of the inventory
  msg.channel.send("Calculating, please wait 🔄");

  // Calculate the inventory value by providing the inventory itself
  const inventoryValue = await calculateInventoryValue(resInventory);

  // If the inventory value has been returned as null, that means an error occured and the user should retry later on
  if (inventoryValue == null) {
    return msg.channel.send("Calculation failed, please try again later ⏰");
  }

  // Create and prepare the embeded message
  const embed = new MessageEmbed()
    // Set the title of the field that includes the player name
    .setAuthor(resPlayerSummaries.response.players[0].personaname)
    // Set the title
    .setTitle("Steam Profile")
    // Set the URL that is a hyperlink to the player's profile
    .setURL("https://steamcommunity.com/profiles/" + resPlayerSummaries.response.players[0].steamid)
    .setThumbnail(resPlayerSummaries.response.players[0].avatarfull)
    // Set the color of the embed
    .setColor(0xff0000)
    // Set the main content of the embed
    .setDescription("CS:GO inventory stats:")
    .addFields(
      {
        name: "Value",
        value: "$" + inventoryValue.total_value,
        inline: true,
      },
      {
        name: "Items Checked",
        value: inventoryValue.checked_items ? inventoryValue.checked_items : "Unknown",
        inline: true,
      }
    );

  // Send the embed to the same channel as the message
  await msg.channel.send(embed);
};

async function performRequest(url) {
  return await axios
    .get(url)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log(error.response);
    });
}

// Decode the item name by adding the special symbols
async function decodeName(itemName) {
  return await itemName.split("&#39").join("'").split("\u2605").join("★").split("\u2122").join("™");
}

// Construct the Player Inventory URL by passing in the CustomURL or SteamID
async function constructInvUrl(userNameOrID) {
  // Regular Expression to check if only the numbers are provided
  const regexOnlyNumbers = new RegExp("^[0-9]*$");

  // Check if only the numbers have been passed and if the number count is 17 (that determines if the CustomURL or SteamID was provided)
  if (userNameOrID.length === 17 && regexOnlyNumbers.test(userNameOrID)) {
    return `https://steamcommunity.com/profiles/${userNameOrID}/inventory/json/730/2`; // Get player CSGO inventory BY ID, 730 - CSGO ID, 2 - context ID
  } else {
    return `https://steamcommunity.com/id/${userNameOrID}/inventory/json/730/2`; // Get player CSGO inventory BY CUSTOMURL
  }
}

async function constructPlayerSummariesUrl(userNameOrID) {
  // Regular Expression to check if only the numbers are provided
  const regexOnlyNumbers = new RegExp("^[0-9]*$");

  // Check if only the numbers have been passed and if the number count is 17 (that determines if the CustomURL or SteamID was provided)
  if (userNameOrID.length === 17 && regexOnlyNumbers.test(userNameOrID)) {
    return `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_WEB_API_KEY}&steamids=${userNameOrID}`; // Get player CSGO inventory BY ID, 730 - CSGO ID, 2 - context ID
  } else {
    // Fetch the user ID
    const fetchedUserID = await performRequest(
      `http://api.steampowered.com/ISteamUser/ResolveVanityURL/v0001/?key=${process.env.STEAM_WEB_API_KEY}&vanityurl=${userNameOrID}`
    );
    return `http://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.STEAM_WEB_API_KEY}&steamids=${fetchedUserID.response.steamid}`; // Get player CSGO inventory BY CUSTOMURL
  }
}

// Calculate the Player CS:GO Inventory total value by passing the inventory of a player.
async function calculateInventoryValue(inventoryList) {
  let totalValue = 0;
  let totalItems = [];

  // Get the full list of all the CS:GO available items and their price information from CSGOBackpack Public API
  const allItemsList = await performRequest("http://csgobackpack.net/api/GetItemsList/v2/");

  // Loop through each of the items in the Player Inventory
  for (itemInv in inventoryList.rgDescriptions) {
    // Loop through each of the items in the Fetched CS:GO items list
    for (itemList in allItemsList.items_list) {
      // Decode the item name
      const decodedName = await decodeName(allItemsList.items_list[itemList].name);

      // Check if a particular item in the inventory has a match on the All Items List. If yes, sum it in and add to the checked items array
      if (inventoryList.rgDescriptions[itemInv].market_hash_name == decodedName && allItemsList.items_list[itemList].price) {
        totalItems.push(allItemsList.items_list[itemList]);
        totalValue += allItemsList.items_list[itemList].price["7_days"].median;
      }
    }
  }

  // Return the number of checked items and the total calculated Player Inventory value in JSON format
  return { checked_items: totalItems.length, total_value: totalValue.toFixed(2) };
}

// Sleep for the specified amount of time and resolve the promise after that
function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
