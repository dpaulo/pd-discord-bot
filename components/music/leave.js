module.exports = async (msg, args) => {
        const vc = msg.member.voice.channel;
 
        if(!vc) return msg.channel.send("You need to be in a voice channel to use this command!");
        await vc.leave();
        await msg.channel.send('Leaving channel :smiling_face_with_tear:')
 
    }
  
