
export {}
const mongoose = require('mongoose')
const uniqueValidator = require('mongoose-unique-validator')

var ghSecretsSchema = mongoose.Schema({ iv: String, password: String }, { noId: true });

const GHRepoSchema = mongoose.Schema({
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
    secrets: {
        type: Object,
        // of: ghSecretsSchema,
        required: true,
    }

})

GHRepoSchema.plugin(uniqueValidator)

const collectionName = 'GitHubRepoInfo'
const GHModel = mongoose.model(collectionName, GHRepoSchema, collectionName)
module.exports = GHModel
