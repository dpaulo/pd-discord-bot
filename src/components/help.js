module.exports = async (BOT_PREFIX, msg) => {
  return msg.channel.send(
    `Here is the full list of the commands I accept (? = OPTIONAL):` +
      `\n\n**Counter-Strike: Global Offensive**:\n\`${BOT_PREFIX}csgoprice ?{knife/gloves} ?{stattrak/souvenir} ?{np/fn/mv/ft/ww/bs} {name}\`\n\`${BOT_PREFIX}csgotrend ?{knife/gloves} ?{stattrak/souvenir} ?{np/fn/mv/ft/ww/bs} {name}\`\n\`${BOT_PREFIX}csgoinv {CustomURL}\` or \`${BOT_PREFIX}csgoinv {SteamID}\`` +
      `\n\n**Cryptocurrency**:\n\`${BOT_PREFIX}coinprice {cryptocurrency} {currency}\`\n\`${BOT_PREFIX}cointrend\`\n\`${BOT_PREFIX}coinhistory {cryptocurrency} {date(dd-mm-yyy)}\`` +
      `\n\n**Exchange Rates**:\n\`${BOT_PREFIX}compare {currency} {currency to compare}\`\n\`${BOT_PREFIX}convert {amount} {currency from} {currency to}\`` +
      `\n\n**Music Player**:\n\`${BOT_PREFIX}play {song name}\` or \`${BOT_PREFIX}play {YouTube URL}\`\n\`${BOT_PREFIX}leave\``
  );
};
