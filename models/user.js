const mongoose = require("mongoose")
const passportLocalMongoose = require("passport-local-mongoose")
const Schema = mongoose.Schema

const UserSchema = new Schema({
    name: String,
    username: String,
    boughtProducts: [{
        type: Schema.Types.ObjectId,
        ref: "Order"
    }],
    email: {
        type: String,
        unique: true
    },
    phone: Number,
    addresses: [{
        type: Schema.Types.ObjectId,
        ref: "Address"
    }],
    payment: {
        type: Schema.Types.ObjectId,
        ref: "Payment"
    },   
    myReviews: [{
        type: Schema.Types.ObjectId,
        ref :"Review"
    }]
})

UserSchema.plugin(passportLocalMongoose)

const User = mongoose.model("User", UserSchema)
module.exports = User

// const ContactSchema = new Schema({
//     doorNum: Number,
//     street: String,

// })