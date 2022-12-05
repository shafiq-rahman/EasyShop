const mongoose = require("mongoose")
const Schema = mongoose.Schema

const ReviewSchema = new Schema({
    rating: Number,
    body: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: "Product"
    }
})

const Review = mongoose.model("Review", ReviewSchema)
module.exports = Review