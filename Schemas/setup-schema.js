const mongoose = require('mongoose')


const reqString = {
    type: 'String',
    required: true
}

const setupSchema = mongoose.Schema({

    _id: reqString,
    CChannelId: reqString,
    EmbedMessageID: reqString
})


module.exports = mongoose.model('setup-channels' , setupSchema)
