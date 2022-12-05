const User = require("../models/user")
const Address = require("../models/address")
const Order = require("../models/orders")


module.exports.viewDashboard = async (req, res) => {
    const user = await User.findById(res.locals.currentUser._id)
    res.render("user/dashboard", { user })
}
module.exports.viewOrder = async (req, res) => {
    const user = await User.findById(res.locals.currentUser._id)
        .populate({
            path: "boughtProducts",
            populate: {
                path: "products",
                populate: {
                    path: "productId"
                }
            }
        })
    res.render("user/orders", { user, orders : user.boughtProducts.reverse() })
}

module.exports.viewOrderDetails = async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId).populate("address").populate("payment")
        .populate({
            path: "products",
            populate: {
                path: "productId"
            }
        })
    console.log(order)
    res.render("user/orderdetails", { order })
}

module.exports.editUser = async (req, res) => {
    const user = await User.findById(res.locals.currentUser._id)
    res.render("user/editUser", { user })
}

module.exports.updateUser = async (req, res) => {
    const user = await User.findByIdAndUpdate(res.locals.currentUser._id, {name: req.body.name, email: req.body.email, phone: req.body.phone })
    res.redirect("/user/dashboard")
}

module.exports.viewAllAddress = async (req, res) => {
    const user = await User.findById(res.locals.currentUser._id).populate("addresses")
    res.render("user/address", { user, addresses: user.addresses })
}

module.exports.newAddress =  async (req, res) => {
    const address = new Address(req.body.address)
    const userId = res.locals.currentUser._id
    const currentUser = await User.findById(userId)
    currentUser.addresses.push(address)
    await address.save()
    await currentUser.save()
    res.redirect(`${req.get("referer")}`)
}
module.exports.editAddressForm = async (req, res) => {
    const { addressId } = req.params
    const address = await Address.findById(addressId)
    const fulladdress = address.city + " " + address.state + " " + "India"
    console.log(fulladdress)
    res.render("user/editAddress", { address })
}

module.exports.updateAddress = async (req, res) => {
    const { addressId } = req.params
    const address = req.body.address
    // const url = encodeURIComponent("user.addresses[0]") https://api.mapbox.com/geocoding/v5/mapbox.places/
    await Address.findByIdAndUpdate(addressId, req.body.address)
    req.flash("success", "Address updated successfully")
    res.redirect("/user/address")
}

module.exports.deleteAddress = async (req, res) => {
    const { addressId } = req.params
    const userId = res.locals.currentUser._id
    const currentUser = await User.findById(userId)
    currentUser.addresses.remove(addressId)
    await currentUser.save()
    res.redirect(`${req.get("referer")}`)
}

module.exports.viewReviews = async (req, res) => { 
    const user = await User.findById(res.locals.currentUser._id)
        .populate({
        path: "myReviews",
        populate: {
            path: "product"
        }
    })
    res.render("user/reviews", { reviews: user.myReviews })
}