const mongoose = require("mongoose")
const Schema = mongoose.Schema

const CardSchema = new Schema({
    nameOnCard: String,
    cardNum: Number,
    expiryMonth: Number,
    expiryYear: Number,
    cvv:String
})

const Card = mongoose.model("Card", CardSchema)
module.exports = Card