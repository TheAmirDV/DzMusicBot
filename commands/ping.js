const { DiscordAPIError } = require("discord.js");

const Discord = require('discord.js')

const client = new Discord.Client();

const talkedRecently = new Set();



module.exports = {

    description : "Ping The Bot",
    callback:  (message) => {

            const maximum = 16777215
            const minimum = 0
            const RandomNumber = Math.floor(Math.random() * (maximum - minimum + 1)) + minimum 

        message.delete({ timeout : 5000})
        if (talkedRecently.has(message.author.id)) {
            const TalkedRecentlyEmbed = new Discord.MessageEmbed()
            .setAuthor(`Chill Plz`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
            .setTimestamp()
            .setColor(RandomNumber)
            .setDescription(`**You Are Cooldowned Wait 3 Second Then Use The Command Again**\n`)
            message.channel.send(TalkedRecentlyEmbed).then(message => message.delete({ timeout : 5000 }))
            return
          }else {
            
              const PingEmbed = new Discord.MessageEmbed()
              .setAuthor(`Running Ping Command`, 'https://cdn.discordapp.com/attachments/727509077441380433/773553428529414184/download.jpg')
              .setTimestamp()
              .setColor(RandomNumber)
              .setDescription(`**🏓API Latency   :   ${Math.round(client.ws.ping)} **`)
              message.channel.send(PingEmbed).then(Ping => Ping.delete({ timeout : 5000 }))
              talkedRecently.add(message.author.id);
              setTimeout(() => {
              talkedRecently.delete(message.author.id);
              }, 10000);
           
            
          }
        
          

            

        
         
        
    }
}