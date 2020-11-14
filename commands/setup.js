

const Discord = require('discord.js')
const Canvas = require('canvas');
const mongo = require('../mongo')

const SetupSchema = require('../Schemas/setup-schema');



module.exports = {

    description: "Setting Up The Music Bot To Use",
    callback: async (message, args, argsString, client, prefix) => {
        const { member, guild } = message
        const maximum = 16777215
        const minimum = 0
        const RandomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum



        const canvas = Canvas.createCanvas(700, 250);

        const ctx = canvas.getContext('2d');

        const background = await Canvas.loadImage('./background.png');

        ctx.drawImage(background, 0, 0, canvas.width, canvas.height);

        ctx.strokeStyle = '#74037b';

        ctx.strokeRect(0, 0, canvas.width, canvas.height);

        ctx.font = '60px sans-serif';
        ctx.fillStyle = '#ffffff';
        ctx.fillText('DZ Music 24/7', canvas.width / 2.5, canvas.height / 1.8);

        ctx.beginPath();
        ctx.arc(125, 125, 100, 0, Math.PI * 2, true);
        ctx.closePath();
        ctx.clip();

        const avatar = await Canvas.loadImage('./avatar.jpg')

        ctx.drawImage(avatar, 25, 25, 200, 200);

        const attachment = new Discord.MessageAttachment(canvas.toBuffer(), 'setup-image.png');








        if (!member.hasPermission('ADMINISTRATOR')) {
            const ADMINPERM = new Discord.MessageEmbed()
                .setAuthor(`You Can't Use This Command Plz Call An ADMINISTRATOR`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                .setTimestamp()
                .setColor(RandomNumber)
            message.channel.send(ADMINPERM)
            return
        }

        await mongo().then(async (mongoose) => {
            try {

                const result = await SetupSchema.find({
                    _id: guild.id
                })

                
                if (!result.length) {

                    message.guild.channels.create('𝐃𝐙 𝐌𝐔𝐒𝐈𝐂',
                        {
                            type: 'text',
                            topic: ':play_pause: Pause/Resume the song. :stop_button: Stop and empty the queue. :track_next: Skip the song. :repeat: Loop The Music :loud_sound: Volume Up. :sound: Volume Down.'
                        }).then(async channel => {
                            const SetupEmbed = new Discord.MessageEmbed()
                                .setAuthor(`Running Setup Command`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                                .setTimestamp()
                                .setColor(RandomNumber)
                                .setDescription(`**Channel DZ MUSIC Has Been Created** \n **All Music Commands Will Only Work There** \n ** Channel Name : ${channel.name}** \n`)
                            message.channel.send(SetupEmbed)

                            await channel.send(attachment)

                            const AfkEmbed = new Discord.MessageEmbed()
                                .setTitle('No Song Playing Currently')
                                .setDescription(`[Help](https://discord.js/guide) | [Help](https://discord.js/guide)`)
                                .setColor(RandomNumber)
                                .setFooter(`Default Prefix For This Server Is : ${prefix}`)
                                .setImage('https://cdn.hydra.bot/hydra_no_music.png')
                            await channel.send(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n Join A Voice Channel And Queue Songs By Name Or Url In Here.`, AfkEmbed).then(async AfkEmbed => {
                                try {
                                     await AfkEmbed.react('⏯️'),
                                        await AfkEmbed.react('⏹️'),
                                        await AfkEmbed.react('⏭️'),
                                        await AfkEmbed.react('🔁'),
                                        await AfkEmbed.react('🔊'),
                                        await AfkEmbed.react('🔉')

                                } catch (error) {
                                    console.log(error)
                                }

                                await mongo().then(async (mongoose) => {
                                    try {
                                        await new SetupSchema({
                                            _id: guild.id,
                                            CChannelId: channel.id,
                                            EmbedMessageID: AfkEmbed.id
                                        }).save()
                                    } finally {

                                    }
                                })

                            })

                        })

                } else {
                    const ChannelData = result[0].CChannelId
                    const chan = message.guild.channels.cache.get(ChannelData)

                    if (!chan) {

                        message.guild.channels.create('𝐃𝐙 𝐌𝐔𝐒𝐈𝐂',
                        {
                            type: 'text',
                            topic: ':play_pause: Pause/Resume the song. :stop_button: Stop and empty the queue. :track_next: Skip the song. :repeat: Loop The Music :loud_sound: Volume Up. :sound: Volume Down.'
                        }).then(async channel => {
                            const SetupEmbed = new Discord.MessageEmbed()
                                .setAuthor(`Running Setup Command Again`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                                .setTimestamp()
                                .setColor(RandomNumber)
                                .setDescription(`**Channel DZ MUSIC Has Been Created** \n **All Music Commands Will Only Work There** \n ** Channel Name : ${channel.name}** \n`)
                            message.channel.send(SetupEmbed)

                            await channel.send(attachment)

                            const AfkEmbed = new Discord.MessageEmbed()
                                .setTitle('No Song Playing Currently')
                                .setDescription(`[Help](https://discord.js/guide) | [Help](https://discord.js/guide)`)
                                .setColor(RandomNumber)
                                .setFooter(`Default Prefix For This Server Is : ${prefix}`)
                                .setImage('https://cdn.hydra.bot/hydra_no_music.png')
                            await channel.send(`​​                                                                                                                                                        
__**QUEUE LIST:**__ \n Join A Voice Channel And Queue Songs By Name Or Url In Here.`, AfkEmbed).then(async AfkEmbed => {
                                try {
                                    await AfkEmbed.react('⏯️'),
                                        await AfkEmbed.react('⏹️'),
                                        await AfkEmbed.react('⏭️'),
                                        await AfkEmbed.react('🔁'),
                                        await AfkEmbed.react('🔊'),
                                        await AfkEmbed.react('🔉')

                                } catch (error) {
                                    console.log(error)
                                }

                                await mongo().then(async (mongoose) => {
                                    try {
                                        await SetupSchema.findOneAndUpdate({
                                            _id: guild.id
                                        }, {
                                            _id: guild.id,
                                            CChannelId: channel.id,
                                            EmbedMessageID: AfkEmbed.id
                                        }, {
                                            upsert: true
                                        })
                                    } finally {

                                    }
                                })

                            })               
                        })
                                            

                    } else if (chan) {
                        let ExistedChannelname = message.guild.channels.cache.get(ChannelData)
                        const ExistedChannel = new Discord.MessageEmbed()
                            .setAuthor(`Channel Already Exist`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
                            .setTimestamp()
                            .setColor(RandomNumber)
                            .setDescription(`You Can Use Music Commands In Channel => ${ExistedChannelname}`)
                        message.channel.send(ExistedChannel)
                        return
                    }

                }
            } finally {
                mongoose.connection.close()
            }
        })
    }
}



















