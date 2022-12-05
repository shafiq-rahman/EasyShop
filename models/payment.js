const mongoose = require("mongoose")
const Schema = mongoose.Schema

const PaymentSchema = new Schema({
    fullname: String,
    address: String,
    email: String,
    city: String,
    nameoncard: String,
    cardnumber: String,
    expirymonth: String,
    expiryyear: String
})

const Payment = mongoose.model("Payment", PaymentSchema)
module.exports = Payment