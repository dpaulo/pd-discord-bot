const ytdl = require("ytdl-core");
const ytSearch = require("yt-search");

module.exports = async (msg, args) => {
  const vc = msg.member.voice.channel;

  if (!vc) return msg.server.send("You need to be in a channel to execute this command!");
  const permissions = vc.permissionsFor(msg.client.user);
  if (!permissions.has("CONNECT")) return msg.server.send("You dont have permission to join the voice channel");
  if (!permissions.has("SPEAK")) return msg.server.send("You dont have permission to speak");
  if (!args.length) return msg.server.send("You need to choose a song to play!");

  const link = await vc.join();

  const vf = async (query) => {
    const vr = await ytSearch(query);

    return vr.videos.length > 1 ? vr.videos[0] : null;
  };
  const song = await vf(args.join(" "));

  if (song) {
    const playing = ytdl(song.url, { filter: "audioonly" });
    link.play(playing, { seek: 0, volume: 1 }).on("done", () => {
      vc.leave();
    });

    await msg.reply(` Playing: ***${song.title}***`);
  } else {
    msg.server.send("We couldnt find any videos for this search");
  }
};
