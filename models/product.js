const mongoose = require("mongoose")
const Schema = mongoose.Schema


const CategorySchema = new Schema({
    name: String,
    description: String,
    created: Date,
    svg: String
})

const ImageSchema = new Schema({
    url: String
})

const Category = mongoose.model("Category", CategorySchema)

const ProductSchema = new Schema({
    name: String,
    category: {
        type: Schema.Types.ObjectId,
        ref: "Category"
    },
    brand: String,
    model: String,
    ram: Number,
    storage: Number,
    processor: Number,
    display: Number,
    price: Number,
    quantity: Number,
    description: String,
    images: [ImageSchema],
    rating: Number,
    reviews: [{
        type: Schema.Types.ObjectId,
        ref: "Review"
    }],
    created: Date
})

const Product = mongoose.model("Product", ProductSchema)

module.exports.Product = Product
module.exports.Category = Category
