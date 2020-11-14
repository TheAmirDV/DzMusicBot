const mongoose = require('mongoose');
const mongoPath = 'mongodb+srv://AmirDV:09900051395AmirDV@discordbot.39wl0.mongodb.net/MusicDB?retryWrites=true&w=majority'

module.exports = async () => {

    await mongoose.connect(mongoPath, {

        useNewUrlParser : true,
        useUnifiedTopology: true
    })
    return mongoose
}