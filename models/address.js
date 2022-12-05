const mongoose = require("mongoose")
const Schema = mongoose.Schema

const AddressSchema = new Schema({
    firstname: String,
    lastname: String,
    mobile: Number,
    phone: Number,
    firstline: String,
    secondline: String,
    landmark: String,
    city: String,
    pincode: Number,
    state: String
})

const Address = mongoose.model("Address", AddressSchema)
module.exports = Address