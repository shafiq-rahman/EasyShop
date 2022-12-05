const mongoose = require("mongoose")
const Schema = mongoose.Schema

const StatusSchema = new Schema({
    name: String
})

const OrderSchema = new Schema({
    products: [{
        productId: {
            type: Schema.Types.ObjectId,
            ref: "Product"
        },
        productQty: Number,
        productPrice: Number
    }],
    orderedOn: Date,
    status: {
        type: String,
        enum : ["Ordered","Shipped","Out for Delivery","Delivered"]
    },
    customer: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    totalItems: Number,
    totalPrice: Number,
    delivery: Date,
    shipping:Number,
    address: {
        type: Schema.Types.ObjectId,
        ref: "Address",
    },
    payment: {
        type: Schema.Types.ObjectId,
        ref: "Payment",
    }
})

const Order = mongoose.model("Order", OrderSchema)

module.exports = Order