const Discord = require('discord.js')

const client = new Discord.Client();



module.exports = {

    description : "Uptime",
    callback:  (message) => { 


        if(message.author.id === '684841916680110168') {

            let seconds = Math.floor(message.client.uptime / 1000);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);
            let days = Math.floor(hours / 24);

            seconds %= 60;
            minutes %= 60;
            hours %= 24;

            const Uptime = new Discord.MessageEmbed()
            .setAuthor(`Chill Plz`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor('RANDOM')
            .setDescription(`Uptime: \`${days} day(s),${hours} hours, ${minutes} minutes, ${seconds} seconds\``)
            message.channel.send(Uptime).then(message => message.delete({ timeout : 10000 }))
            return

        }
    }
}