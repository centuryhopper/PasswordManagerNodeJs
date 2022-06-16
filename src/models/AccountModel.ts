
export {}
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

const AccountSchema = mongoose.Schema({
    id : {
        type: String,
        unique: true,
        required: true,
    },
    title : {
        type: String,
        unique: true,
        required: true,
    },
    username: String,
    password: {
        type: String,
        required: true,
    },

})

AccountSchema.plugin(uniqueValidator)

const collectionName = 'AccountInfo'
const AccountModel = mongoose.model('AccountInfo', AccountSchema, collectionName)
module.exports = AccountModel
