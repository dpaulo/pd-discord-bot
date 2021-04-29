const { default: axios } = require("axios");
const { MessageEmbed } = require("discord.js");

module.exports = async (BOT_PREFIX, msg, args, db) => {
  // Check if there are any arguments provided. If not, return a message asking to use commands by following hte correct template
  if (args.length <= 0) {
    return msg.channel.send("Please follow the template `" + BOT_PREFIX + "csgoprice ?{knife/gloves} ?{stattrak/souvenir} ?{np/fn/mv/ft/ww/bs} {name}`");
  }

  // Construct a URL to search for the particular item in the Steam Community Market
  const searchUrl = await constructSearchUrl(args);

  // Perform an HTTP request that returns a JSON of the Market results found
  const resSearch = await performRequest(searchUrl);

  // Check how many items were found in the Market. If the array is empty, return a message informing that nothing was found
  if (resSearch.results.length === 0) {
    return msg.channel.send("Sorry, but such item isn't available to purchase for now");
  }

  // Encode the item name by removing special symbols and replacing them.
  const encodedItemName = await encodeName(resSearch.results[0].hash_name);

  //Construct a URL for the particular item information lookup by passing the encoded name and the currency parrameter
  const itemUrl = await constructItemUrl(encodedItemName, 1); // 1 = USD, 2 = GBP, 3 = EUR

  // Perform an HTTP request that returns a JSON of the particular item information
  const resItem = await performRequest(itemUrl);

  // Initialize the database queries
  db.serialize(() => {
    // QUERY 1 (SELECT) - Get data from the database where the item name and the user, who requested it, ID match with a promise which returns the found row
    let promiseGetSkin = new Promise(async (resolve, reject) => {
      await db.get(
        "SELECT * FROM csgoPriceHistory WHERE hash_name = ? AND user_id = ?",
        [resSearch.results[0].hash_name, msg.author.id.toString()],
        (err, row) => {
          if (err) {
            reject(err.message);
          } else {
            resolve(row);
          }
        }
      );
    });

    // QUERY 2 (INSERT/UPDATE) - execute the first query and proceed after the promise resolves - Update or Insert the data depending if the item has been queries by that particular user ID or not.
    promiseGetSkin.then((res) => {
      if (!res) {
        const stmt = db.prepare(
          `INSERT INTO csgoPriceHistory (hash_name, user_id, lowest_price, median_price, last_checked) VALUES("${
            resSearch.results[0].hash_name
          }", "${msg.author.id.toString()}","${resItem.lowest_price}", "${resItem.median_price}", datetime('now'))`
        );
        stmt.run();
      } else if (res) {
        const stmt = db.prepare(
          `UPDATE csgoPriceHistory SET lowest_price = "${resItem.lowest_price}", median_price = "${
            resItem.median_price
          }", last_checked = datetime('now') WHERE hash_name = "${resSearch.results[0].hash_name}" AND user_id = "${msg.author.id.toString()}"`
        );
        stmt.run();
      }
    });
  });

  // Create and prepare the embeded message
  const embed = new MessageEmbed()
    // Set the title of the field that includes the name, the app icon and the hyperlink to the app (CS:GO)
    .setAuthor(
      "Counter Strike: Glogal Offensive",
      resSearch.results[0].app_icon,
      `https://store.steampowered.com/app/${resSearch.results[0].asset_description.appid}`
    )
    // Set the title
    .setTitle(resSearch.results[0].name)
    // Set the URL to the Community Market of that particular item (encoded name)
    .setURL(`https://steamcommunity.com/market/listings/730/${encodedItemName}`)
    // Set the thumbnail to displaye that particular item's image
    .setThumbnail("https://community.cloudflare.steamstatic.com/economy/image/" + resSearch.results[0].asset_description.icon_url)
    // Set the color of the embed
    .setColor(0xff0000)
    // Set the main content of the embed
    .setDescription("Current price - **" + resItem.lowest_price + "**\nMedian price - **" + resItem.median_price + "**");

  // Send the embed to the same channel as the message
  await msg.channel.send(embed);
};

// Encode the item name by removing the special symbols
async function encodeName(itemName) {
  return await itemName.split(" ").join("%20").split("|").join("%7C").split("™").join("%E2%84%A2").split("★").join("%E2%98%85");
}

// Perform and HTTP request using Axios using the URL provided
async function performRequest(url) {
  return await axios
    .get(url)
    .then((res) => {
      return res.data;
    })
    .catch((error) => {
      console.log(error);
    });
}

// Construct the Search URL by passing in the arguments of the command
async function constructSearchUrl(args) {
  const baseUrl = "https://steamcommunity.com/market/search/render/?query=";
  const countParam = "&count=2";
  const searchDescriptionParam = "&search_descriptions=0";
  const sortColumnParam = "&sort_column=price";
  const sortDirectionParam = "&sort_dir=asc";
  const appIDParam = "&appid=730";
  const renderParam = "&norender=1";

  // Special Categories, as by default a normal, default item is being queried
  const baseTagParam = "&category_730_Quality%5B%5D=tag";
  const knifeGlovesTagValue = "_unusual";
  const stattrakTagValue = "_strange";
  const souvenirTagValue = "_tournament";

  // Item's Quality parameter
  const baseQualityParam = "&category_730_Exterior%5B%5D=tag_WearCategory";
  const npQualityValue = "NA";
  const fnQualityValue = "0";
  const mvQualityValue = "1";
  const ftQualityValue = "2";
  const wwQualityValue = "3";
  const bsQualityValue = "4";

  // Construct the query by filtering the arguments and only returning the ones that specify the item's actual name (not category, type, quality, etc.)
  let query = await args.filter((arg) => {
    arg.toString().toLowerCase();

    return (
      arg !== "st" &&
      arg !== "stattrak" &&
      arg !== "sv" &&
      arg !== "souvenir" &&
      arg !== "np" &&
      arg !== "not-painted" &&
      arg !== "not" &&
      arg !== "painted" &&
      arg !== "fn" &&
      arg !== "factory-new" &&
      arg !== "factory" &&
      arg !== "new" &&
      arg !== "mv" &&
      arg !== "minimal-wear" &&
      arg !== "minimal" &&
      arg !== "wear" &&
      arg !== "ft" &&
      arg !== "factory-new" &&
      arg !== "factory" &&
      arg !== "new" &&
      arg !== "ww" &&
      arg !== "well-worn" &&
      arg !== "well" &&
      arg !== "worn" &&
      arg !== "bs" &&
      arg !== "battle-scarred" &&
      arg !== "battle" &&
      arg !== "scarred"
    );
  });

  // Replace all the , symbols to encoded whitespaces after parsing the array to a string
  query = await query.toString().split(",").join("%20");

  // Define the final Base URL
  let fullUrl = baseUrl + query + countParam + searchDescriptionParam + sortColumnParam + sortDirectionParam + appIDParam + renderParam;

  // Add the base category paremeter to the final URL
  fullUrl = fullUrl + baseTagParam;

  // Determine the actual category and append it to the final URL
  if (args.includes("knife") || args.includes("gloves")) {
    fullUrl = fullUrl + knifeGlovesTagValue;
  }

  if (args.includes("st") || args.includes("stattrak")) {
    fullUrl = fullUrl + stattrakTagValue;
  }

  if (args.includes("sv") || args.includes("souvenir")) {
    fullUrl = fullUrl + souvenirTagValue;
  }

  // Determine the quality if specified and append it to the final URL
  if (args.includes("np") || args.includes("not-painted") || args.includes("not") || args.includes("painted")) {
    fullUrl = fullUrl + baseQualityParam + npQualityValue;
  }

  if (args.includes("fn") || args.includes("factory-new") || args.includes("factory") || args.includes("new")) {
    fullUrl = fullUrl + baseQualityParam + fnQualityValue;
  }

  if (args.includes("mv") || args.includes("minimal-wear") || args.includes("minimal") || args.includes("wear")) {
    fullUrl = fullUrl + baseQualityParam + mvQualityValue;
  }

  if (args.includes("ft") || args.includes("field-tested") || args.includes("field") || args.includes("tested")) {
    fullUrl = fullUrl + baseQualityParam + ftQualityValue;
  }

  if (args.includes("ww") || args.includes("well-worn") || args.includes("well") || args.includes("worn")) {
    fullUrl = fullUrl + baseQualityParam + wwQualityValue;
  }

  if (args.includes("bs") || args.includes("battle-scarred") || args.includes("battle") || args.includes("scarred")) {
    fullUrl = fullUrl + baseQualityParam + bsQualityValue;
  }

  return fullUrl;
}

// Construct the specific item's query URL by passing the item's encoded name and the currency parameter
function constructItemUrl(encodedItemName, currency) {
  const baseUrl = "https://steamcommunity.com/market/priceoverview/";
  const currencyParam = "?currency=";
  const currentyValue = currency;
  const appIDParam = "&appid=730";
  const itemNameParam = "&market_hash_name=";
  const itemNameValue = encodedItemName;

  return baseUrl + currencyParam + currentyValue + appIDParam + itemNameParam + itemNameValue;
}
