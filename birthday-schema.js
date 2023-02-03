const mongoose = require('mongoose')

const schema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    birthdate: {
        type: Date,
        required: true
    }
})

module.exports = mongoose.model('birthday', schema, 'birthday')