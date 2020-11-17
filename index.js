const Discord = require('discord.js')

const client = new Discord.Client()

//const { token} = require('./config.json')

const Lyrics = require('findthelyrics')

const WOKCommands = require('wokcommands')

const Util = require('discord.js')

const LyricsFinder = require('lyrics-finder')

const mongo = require('./mongo')

const SetupSchema = require('./Schemas/setup-schema');

const ytdl = require('ytdl-core');
const { callback } = require('./commands/setup');


const queue = new Map()

const Youtube = require('simple-youtube-api');
const { util } = require('simple-youtube-api');
const { splice } = require('wokcommands/permissions');

const youtube = new Youtube(process.env.YT_API)


client.once('ready', () => {


    console.log(`${client.user.username} Is Ready For Rumble!!`)

    client.user.setPresence({activity: { type: 'PLAYING', name:'With My Commands' }, status: 'online'})
    
    new WOKCommands(client, 'commands')
    
    .setDefaultPrefix('$') 
    
    .setMongoPath('mongodb+srv://AmirDV:09900051395AmirDV@discordbot.39wl0.mongodb.net/MusicDB?retryWrites=true&w=majority')
    
    
    
    
})
client.once('message', async message => {

})


client.on('message', async (message, prefix) => {
        
    const MainPrefix = prefix
    const maximum = 16777215
    const minimum = 0
    const RandomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

await mongo().then(async (mongoose) => {
    try {
        const result = await SetupSchema.find({
        _id: message.guild.id
    })

    if(!result) {
        return
    }

    const ChannelId = await result[0].CChannelId
    const EmbedMessageId = await result[0].EmbedMessageID


    
    if(message.author.bot) {
        return
    }

    if(message.channel.id === ChannelId){

        const args = message.content
        const searchString = args
        const url = args ? args.replace(/<(.+)>/g, '$1') : ''
        const serverQueue = queue.get(message.guild.id)
        
        

        message.delete( { timeout : 1000 })
        
        
         if (message.content.toLowerCase() !== 'skip'  &&  message.content.toLowerCase() !== 'stop' && !message.content.toLowerCase().startsWith('volume') && message.content.toLowerCase() !== 'np' && message.content.toLowerCase() !== 'resume' && message.content.toLowerCase() !== 'pause' && message.content.toLowerCase() !== 'loop' && message.content.toLowerCase() !== 'lyrics') {
            const voiceChannel = message.member.voice.channel
            if(!voiceChannel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Play Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            const permissions = voiceChannel.permissionsFor(message.client.user)
            if(!permissions.has('CONNECT')) {
                const BotCPermission = new Discord.MessageEmbed()
                .setAuthor(`Lack Of Access`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`I Don't Have Enough Permission To CONNECT To The Voice Channel`)
                message.channel.send(BotCPermission).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!permissions.has('SPEAK')) {
                const BotCPermission = new Discord.MessageEmbed()
                .setAuthor(`Lack Of Access`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`I Don't Have Enough Permission To SPEAK In The Voice Channel`)
                message.channel.send(BotCPermission).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }


            try {

                var video = await youtube.getVideo(url)

            } catch {

                try {

                    var videos = await youtube.searchVideos(searchString, 1)
                    var video = await youtube.getVideoByID(videos[0].id)

                } catch {
                   
                    const NoMatch = new Discord.MessageEmbed()
                    .setAuthor(`No Match`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                    .setTimestamp()
                    .setColor(RandomNumber)
                    .setDescription(`Coudln't Find Any Match For The Music You Want!!`)
                    message.channel.send(NoMatch).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                    return
                }

            }
            const song = {
                thumbnails: video.thumbnails,
                id: video.id,
                title: Util.escapeMarkdown(video.title),
                url: `https://www.youtube.com/watch?v=${video.id}`,
                durationsecond : video.duration.seconds,
                durationminute : video.duration.minutes,
                durationhours : video.duration.hours,
                artist: video.channel.title
            }

            const Thumbnail = song.thumbnails.high.url
            
            if(!serverQueue) {
                const queueConstruct = {
                    textChannel: message.channel,
                    voiceChannel: voiceChannel,
                    connection: null,
                    songs: [],
                    volume: 100,
                    playing: true,
                    loop: false
                }
                queue.set(message.guild.id, queueConstruct)
                queueConstruct.songs.push(song)
                try {
                    var connection = await voiceChannel.join()
                    queueConstruct.connection = connection
                    play(message.guild, queueConstruct.songs[0])
                    message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                        if(!EmbedMessage) {
                            const Error = new Discord.MessageEmbed()
                            .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                            .setTimestamp()
                            .setColor(RandomNumber)
                            .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                             message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                             return
                        }

                            const StartedPlaying = new Discord.MessageEmbed()
                            .setAuthor(`[ ${song.durationhours} : ${song.durationminute} : ${song.durationsecond} ] - ${song.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${song.url}`)
                            .setColor(RandomNumber)
                            .setImage(Thumbnail)
                            .setFooter(`Music Queue : ${queueConstruct.songs.length - 1} | Volume : ${queueConstruct.volume} | Prefix : ${MainPrefix}`)
                            await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${queueConstruct.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                            try {
                                    await EmbedMessage.react('⏯️'),
                                    await EmbedMessage.react('⏹️'),
                                    await EmbedMessage.react('⏭️'),
                                    await EmbedMessage.react('🔁'),
                                    await EmbedMessage.react('🔊'),
                                    await EmbedMessage.react('🔉') 

                            } catch (error) {
                                console.log(error)
                            }
                    })

                            
                        

                } catch (error) {
                    console.log(`There Was An Error Connection To The Voice Channel:   ${error}`)
                    queue.delete(message.guild.id)
                    const Error = new Discord.MessageEmbed()
                    .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                    .setTimestamp()
                    .setColor(RandomNumber)
                    .setDescription(`There Was An Error Connection To The Voice Channel:   ${error}`)
                    message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                    return
                }
                
            } else {
            var videourl = await youtube.getVideo(serverQueue.songs[0].url)
            const Music = {
                title: Util.escapeMarkdown(videourl.title),
                url: videourl.url,
                thumbnails: videourl.thumbnails,
                durationsecond : videourl.duration.seconds,
                durationminute : videourl.duration.minutes,
                durationhours : videourl.duration.hours,
            }
            const Thumbnail = Music.thumbnails.high.url
                          
                serverQueue.songs.push(song)
                const AddedToQueue = new Discord.MessageEmbed()
                .setAuthor(`Added To Queue`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`**${song.title}** Has Been Added To The Queue`)
                message.channel.send(AddedToQueue).then(NotJoined => NotJoined.delete({ timeout : 5000 }))

                message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{

                    if(!EmbedMessage) {
                        const Error = new Discord.MessageEmbed()
                        .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                        .setTimestamp()
                        .setColor(RandomNumber)
                        .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                         message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                         return
                    }
                    const StartedPlaying = new Discord.MessageEmbed()
                        .setAuthor(`[ ${Music.durationhours} : ${Music.durationminute} : ${Music.durationsecond} ] - ${Music.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${Music.url}`)
                        .setImage(Thumbnail)
                        .setColor(RandomNumber)
                        .setFooter(`Music Queue : ${serverQueue.songs.length - 1} | Volume : ${serverQueue.volume} | Prefix : ${MainPrefix}`)
                    await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                        try {

                            await EmbedMessage.react('⏯️'),
                            await EmbedMessage.react('⏹️'),
                            await EmbedMessage.react('⏭️'),
                            await EmbedMessage.react('🔁'),
                            await EmbedMessage.react('🔊'),
                            await EmbedMessage.react('🔉')


                        } catch (error) {
                            console.log(error)
                        }
                })

                return
            }
            return undefined
   
        } else if(message.content.toLowerCase() === "skip") {

            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Skip Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.connection.dispatcher.end()
            const SkippedMusic = new Discord.MessageEmbed()
            .setAuthor(`Skipped`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Music Have Been Skipped!!`)
            message.channel.send(SkippedMusic).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if(message.content.toLowerCase() === "stop"){

            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Stop Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.songs = []
            serverQueue.connection.dispatcher.end()
            const StoppedMusic = new Discord.MessageEmbed()
            .setAuthor(`Stopped`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Music Have Been Stopped Playing!!`)
            message.channel.send(StoppedMusic).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if (message.content.toLowerCase().startsWith('volume')) {

            const Split = args.split(' ')
            Split.shift()
            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To See Volume`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if (message.content.toLowerCase() === 'volume') {
                const Volume = new Discord.MessageEmbed()
                .setAuthor(`Volume!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`The Current Volume Is: **${serverQueue.volume}**`)
                message.channel.send(Volume).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if (isNaN(Split)) {

                const NotValid = new Discord.MessageEmbed()
                .setAuthor(`Not Valid!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`Not A Valid Amount To Change Volume To`)
                message.channel.send(NotValid).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(Split < 0 || Split > 200) {
                const OutOfRange = new Discord.MessageEmbed()
                .setAuthor(`Not Valid!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`Not A Valid Amount To Change Volume To => 0-200`)
                message.channel.send(OutOfRange).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.volume = Split
            serverQueue.connection.dispatcher.setVolume(Split / 100)
            const Volume = new Discord.MessageEmbed()
            .setAuthor(`Volume`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Changed Volume To : **${Split}**`)
            message.channel.send(Volume).then(NotJoined => NotJoined.delete({ timeout : 5000 }))

            var videourl = await youtube.getVideo(serverQueue.songs[0].url)
            const Music = {
                title: Util.escapeMarkdown(videourl.title),
                url: videourl.url,
                thumbnails: videourl.thumbnails,
                durationsecond : videourl.duration.seconds,
                durationminute : videourl.duration.minutes,
                durationhours : videourl.duration.hours,
            }
            const Thumbnail = Music.thumbnails.high.url
                          

                message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                    if(!EmbedMessage) {
                        const Error = new Discord.MessageEmbed()
                        .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                        .setTimestamp()
                        .setColor(RandomNumber)
                        .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                         message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                         return
                    }
                    const StartedPlaying = new Discord.MessageEmbed()
                        .setAuthor(`[ ${Music.durationhours} : ${Music.durationminute} : ${Music.durationsecond} ] ${Music.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${Music.url}`)
                        .setImage(Thumbnail)
                        .setColor(RandomNumber)
                        .setFooter(`Music Queue : ${serverQueue.songs.length - 1} | Volume : ${serverQueue.volume} | Prefix : ${MainPrefix}`)
                    await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                        try {

                            await EmbedMessage.react('⏯️'),
                            await EmbedMessage.react('⏹️'),
                            await EmbedMessage.react('⏭️'),
                            await EmbedMessage.react('🔁'),
                            await EmbedMessage.react('🔊'),
                            await EmbedMessage.react('🔉')


                        } catch (error) {
                            console.log(error)
                        }
                })


            return undefined
            
        } else if (message.content.toLowerCase() === 'np') {
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return 
            }
            const Np = new Discord.MessageEmbed()
            .setAuthor(`Now Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Now Playing : ${serverQueue.songs[0].title}`)
            message.channel.send(Np).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if(message.content.toLowerCase() === "pause"){

            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Pause Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue.playing) {
                const Paused = new Discord.MessageEmbed()
                .setAuthor(`Already Paused!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`The Music Is Already Paused`)
                message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.playing = false 
            serverQueue.connection.dispatcher.pause()
            const Paused = new Discord.MessageEmbed()
            .setAuthor(`Paused!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Music Is Now Paused For You.`)
            message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if(message.content.toLowerCase() === "resume"){

            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Resume Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(serverQueue.playing) {
                const Paused = new Discord.MessageEmbed()
                .setAuthor(`Already Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`The Music Is Already Playing`)
                message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.playing = true 
            serverQueue.connection.dispatcher.resume()
            const Paused = new Discord.MessageEmbed()
            .setAuthor(`Resumed!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Music Is Now Resumed For You.`)
            message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if (message.content.toLowerCase() === 'loop') {
            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To Resume Music`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            serverQueue.loop = !serverQueue.loop
            const Loop = new Discord.MessageEmbed()
            .setAuthor(`Looped!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`I Have Now ${serverQueue.loop ? `**Enabled**` : `**Disabled**`} The Loop.`)
            message.channel.send(Loop).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            return undefined

        } else if (message.content.toLowerCase() === "lyrics") {


            if(!message.member.voice.channel) {
                const NotJoined = new Discord.MessageEmbed()
                .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`You Need To Be Connected To A Voice Channel To See Lyrics`)
                message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            if(!serverQueue) {
                const NothingPlaying = new Discord.MessageEmbed()
                .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`There Is Nothing Playing!!`)
                message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
            }
            var videourl = await youtube.getVideo(serverQueue.songs[0].url)
            const Music = {
                title: Util.escapeMarkdown(videourl.title),
                url: videourl.url,
                thumbnails: videourl.thumbnails,
                durationsecond : videourl.duration.seconds,
                durationminute : videourl.duration.minutes,
                durationhours : videourl.duration.hours,
                artist: videourl.channel.title
            }
         
        
            try {
                const Lyrics = await LyricsFinder(Music.artist , serverQueue.songs[0].title)
                if (!Lyrics) {
                const LyricsTextNF = new Discord.MessageEmbed()
                .setAuthor(`No Lyrics Found`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(`No Lyrics Found For The Current Song`)
                message.channel.send(LyricsTextNF).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                return
                }

                const LyricsText = new Discord.MessageEmbed()
                .setTitle(`${serverQueue.songs[0].title} - Lyrics`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
                .setDescription(Lyrics)
                if (LyricsText.description.length >= 2048)
                LyricsText.description = `${LyricsText.description.substr(0, 2045)}...`;
                return message.channel.send(LyricsText).then(NotJoined => NotJoined.delete({ timeout : 10000 })).catch(console.error);

            } catch {

            }
                

               
                
    }


}
    






    } finally {
        console.error();
    }


    async function play(guild, song) {

        const maximum = 16777215
        const minimum = 0
        const RandomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum
    
    await mongo().then(async (mongoose) => {
        try {
            const result = await SetupSchema.find({
            _id: guild.id
        })
    
        const serverQueue = queue.get(guild.id)
        const EmbedMessageId = await result[0].EmbedMessageID
    
   
        if(!song) {
            serverQueue.voiceChannel.leave()
            queue.delete(guild.id)
            message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                if(!EmbedMessage) {
                    const Error = new Discord.MessageEmbed()
                    .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                    .setTimestamp()
                    .setColor(RandomNumber)
                    .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                     message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                     return
                }
                const StartedPlaying = new Discord.MessageEmbed()
                .setTitle('No Song Playing Currently')
                .setDescription(`[Help](https://discord.js/guide) | [Help](https://discord.js/guide)`)
                .setColor(RandomNumber)
                //.setFooter(`Default Prefix For This Server Is : ${prefix}`)
                .setImage('https://cdn.hydra.bot/hydra_no_music.png')
                await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n Join A Voice Channel And Queue Songs By Name Or Url In Here.`, StartedPlaying)
                    try {
                        await EmbedMessage.react('⏯️'),
                        await EmbedMessage.react('⏹️'),
                        await EmbedMessage.react('⏭️'),
                        await EmbedMessage.react('🔁'),
                        await EmbedMessage.react('🔊'),
                        await EmbedMessage.react('🔉')
        
        
                    } catch (error) {
                        console.log(error)
                    }
            })
            return
        } 
    
    const dispatcher = serverQueue.connection.play(ytdl(song.url))
    
                .on('finish', async () => {
                    if (!serverQueue.loop) {
                        await serverQueue.songs.shift()
                    }
                    await play(guild, serverQueue.songs[0])

                    if(serverQueue.songs[0]) {
                        var videourl = await youtube.getVideo(serverQueue.songs[0].url)
                        const Music = {
                        title: Util.escapeMarkdown(videourl.title),
                        url: videourl.url,
                        thumbnails: videourl.thumbnails,
                        durationsecond : videourl.duration.seconds,
                        durationminute : videourl.duration.minutes,
                        durationhours : videourl.duration.hours,
                    }
                    const Thumbnail = Music.thumbnails.high.url
                        
            
                    
                            message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                                if(!EmbedMessage) {
                                    const Error = new Discord.MessageEmbed()
                                    .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                                    .setTimestamp()
                                    .setColor(RandomNumber)
                                    .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                                     message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                                     return
                                }
                                const StartedPlaying = new Discord.MessageEmbed()
                                    .setAuthor(`[ ${Music.durationhours} : ${Music.durationminute} : ${Music.durationsecond} ] ${Music.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${Music.url}`)
                                    .setImage(Thumbnail)
                                    .setColor(RandomNumber)
                                    .setFooter(`Music Queue : ${serverQueue.songs.length - 1} | Volume : ${serverQueue.volume} | Prefix : ${MainPrefix}`)
                                    await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                                    try {
                                        
                                        await EmbedMessage.react('⏯️'),
                                        await EmbedMessage.react('⏹️'),
                                        await EmbedMessage.react('⏭️'),
                                        await EmbedMessage.react('🔁'),
                                        await EmbedMessage.react('🔊'),
                                        await EmbedMessage.react('🔉')
                
                                    } catch (error) {
                                        console.log(error)
                                    }
                            })
                    }

            
            })

            
                
            

                .on('error', error => {
                    console.log(error)
                })
                dispatcher.setVolume(serverQueue.volume / 100)
    
    
        } finally {
            console.error();
        }
    })
    
    
    
    
}




})  

})



client.on('messageReactionAdd', async(messageReaction, user,) => {

    
    const maximum = 16777215
    const minimum = 0
    const RandomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum

    

    const member = messageReaction.message.guild.member(user)  

    await mongo().then(async (mongoose) => {
        try {

            const result = await SetupSchema.find({
                _id: messageReaction.message.guild.id
            })

            const serverQueue = queue.get(messageReaction.message.guild.id)

            


            const EmbedMessageId = await result[0].EmbedMessageID

        if (user.bot) return; // Returns When A Bot Reacted
const emoji = messageReaction._emoji.name; // The Emoji That Is On The Reaction
const ReactedMessage = messageReaction.message    

if(ReactedMessage.id === EmbedMessageId) {



if (emoji === '⏭️') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Play Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    serverQueue.connection.dispatcher.end()
    messageReaction.users.remove(user.id)
    const SkippedMusic = new Discord.MessageEmbed()
    .setAuthor(`Skipped`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
    .setTimestamp()
    .setColor(RandomNumber)
    .setDescription(`Music Have Been Skipped!!`)
    messageReaction.message.channel.send(SkippedMusic).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
    return;

} else if (emoji === '⏯️') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Resume Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(serverQueue.playing) {
        messageReaction.users.remove(user.id)
        serverQueue.playing = false 
        serverQueue.connection.dispatcher.pause()
        const Paused = new Discord.MessageEmbed()
        .setAuthor(`Paused!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`Music Is Now Paused For You.`)
        messageReaction.message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return undefined
    }
    if(!serverQueue.playing) {
        messageReaction.users.remove(user.id)
        serverQueue.playing = true 
        serverQueue.connection.dispatcher.resume()
        const Paused = new Discord.MessageEmbed()
        .setAuthor(`Resumed!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`Music Is Now Resumed For You.`)
        messageReaction.message.channel.send(Paused).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return undefined
    }    

} else if (emoji === '⏹️') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Stop Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    messageReaction.users.remove(user.id)
    serverQueue.songs = []
    serverQueue.connection.dispatcher.end()
    const StoppedMusic = new Discord.MessageEmbed()
    .setAuthor(`Stopped`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
    .setTimestamp()
    .setColor(RandomNumber)
    .setDescription(`Music Have Been Stopped Playing!!`)
    messageReaction.message.channel.send(StoppedMusic).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
    return undefined

} else if (emoji === '🔁') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Stop Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue.loop) {
        messageReaction.users.remove(user.id)
        serverQueue.loop = !serverQueue.loop
        const Loop = new Discord.MessageEmbed()
        .setAuthor(`Enabled Loop!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`I Have Now **Enabled** The Loop.`)
        messageReaction.message.channel.send(Loop).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return undefined
    }
    if(serverQueue.loop) {
        messageReaction.users.remove(user.id)
        serverQueue.loop = !serverQueue.loop
        const Loop = new Discord.MessageEmbed()
        .setAuthor(`Disabled!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`I Have Now **Disabled** The Loop.`)
        messageReaction.message.channel.send(Loop).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return undefined
    }
    

} else if (emoji === '🔊') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Stop Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(serverQueue) {
            messageReaction.users.remove(user.id)
            if(serverQueue.volume == 200) return;
            if(serverQueue.volume + 10 >= 200) serverQueue.volume = 200;
            else serverQueue.volume = serverQueue.volume + 10;
            serverQueue.connection.dispatcher.setVolume(serverQueue.volume / 100)
            const Volume = new Discord.MessageEmbed()
            .setAuthor(`Volume`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Changed Volume To : **${serverQueue.volume}**`)
            messageReaction.message.channel.send(Volume).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            
            var videourl = await youtube.getVideo(serverQueue.songs[0].url)
            const Music = {
                title: Util.escapeMarkdown(videourl.title),
                url: videourl.url,
                thumbnails: videourl.thumbnails,
                durationsecond : videourl.duration.seconds,
                durationminute : videourl.duration.minutes,
                durationhours : videourl.duration.hours,
            }
            const Thumbnail = Music.thumbnails.high.url
                          


                messageReaction.message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                    if(!EmbedMessage) {
                        const Error = new Discord.MessageEmbed()
                        .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                        .setTimestamp()
                        .setColor(RandomNumber)
                        .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                         message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                         return
                    }
                    const StartedPlaying = new Discord.MessageEmbed()
                        .setAuthor(`[ ${Music.durationhours} : ${Music.durationminute} : ${Music.durationsecond} ] ${Music.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${Music.url}`)
                        .setImage(Thumbnail)
                        .setColor(RandomNumber)
                        .setFooter(`Music Queue : ${serverQueue.songs.length - 1} | Volume : ${serverQueue.volume} | Prefix : `)
                    await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                        try {

                            await EmbedMessage.react('⏯️'),
                            await EmbedMessage.react('⏹️'),
                            await EmbedMessage.react('⏭️'),
                            await EmbedMessage.react('🔁'),
                            await EmbedMessage.react('🔊'),
                            await EmbedMessage.react('🔉')


                        } catch (error) {
                            console.log(error)
                        }
                })
            
            
            
            return undefined
        
    }
    

} else if (emoji === '🔉') {

    if(!member.voice.channel) {
        messageReaction.users.remove(user.id)
        const NotJoined = new Discord.MessageEmbed()
        .setAuthor(`Not Joined!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`You Need To Be Connected To A Voice Channel To Stop Music`)
        messageReaction.message.channel.send(NotJoined).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(!serverQueue) {
        messageReaction.users.remove(user.id)
        const NothingPlaying = new Discord.MessageEmbed()
        .setAuthor(`Not Playing!!`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
        .setTimestamp()
        .setColor(RandomNumber)
        .setDescription(`There Is Nothing Playing!!`)
        messageReaction.message.channel.send(NothingPlaying).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
        return
    }
    if(serverQueue) {
        messageReaction.users.remove(user.id)
        if(serverQueue.volume == 0) return;
        if(serverQueue.volume - 10 <= 0 ) serverQueue.volume = 0
        else serverQueue.volume = serverQueue.volume - 10;
            serverQueue.connection.dispatcher.setVolume(serverQueue.volume / 100)
            const Volume = new Discord.MessageEmbed()
            .setAuthor(`Volume`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`Changed Volume To : **${serverQueue.volume}**`)
            messageReaction.message.channel.send(Volume).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
            
            var videourl = await youtube.getVideo(serverQueue.songs[0].url)
            const Music = {
                title: Util.escapeMarkdown(videourl.title),
                url: videourl.url,
                thumbnails: videourl.thumbnails,
                durationsecond : videourl.duration.seconds,
                durationminute : videourl.duration.minutes,
                durationhours : videourl.duration.hours,
            }
            const Thumbnail = Music.thumbnails.high.url
                          


                messageReaction.message.channel.messages.fetch(EmbedMessageId).then(async EmbedMessage =>{
                    if(!EmbedMessage) {
                        const Error = new Discord.MessageEmbed()
                        .setAuthor(`An Error Occured`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                        .setTimestamp()
                        .setColor(RandomNumber)
                        .setDescription(`Couldn't Find The **Playing Embed Message** \n Plz Delete The Channel Use **Setup** Command Again`)
                         message.channel.send(Error).then(NotJoined => NotJoined.delete({ timeout : 5000 }))
                         return
                    }
                    const StartedPlaying = new Discord.MessageEmbed()
                        .setAuthor(`[ ${Music.durationhours} : ${Music.durationminute} : ${Music.durationsecond} ] ${Music.title}`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg', `${Music.url}`)
                        .setImage(Thumbnail)
                        .setColor(RandomNumber)
                        .setFooter(`Music Queue : ${serverQueue.songs.length - 1} | Volume : ${serverQueue.volume} | Prefix : `)
                    await EmbedMessage.edit(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n ${serverQueue.songs.map(song => `**-** ${song.title}`).join('\n')}`, StartedPlaying)
                        try {

                            await EmbedMessage.react('⏯️'),
                            await EmbedMessage.react('⏹️'),
                            await EmbedMessage.react('⏭️'),
                            await EmbedMessage.react('🔁'),
                            await EmbedMessage.react('🔊'),
                            await EmbedMessage.react('🔉')


                        } catch (error) {
                            console.log(error)
                        }
                })
            
            
            
            
            return undefined
        
    }
    
    
}


}



        }finally {
            console.error();
        }
    })


})


client.login(process.env.DJS_TOKEN)




