const { Product } = require("../models/product")
const User = require("../models/user")
const Address = require("../models/address")
const Order = require("../models/orders")
const Payment = require("../models/payment")
const { calculateDate } = require("../support/helpers")
module.exports.viewCart = (req, res) => {
    const cartItems = req.cookies.cartItems
    res.render("shop/cart", { cartItems, cartDetails: res.locals.cartDetails })
}

module.exports.removeItem = (req, res) => {
    const { productId } = req.params
    var cartItems = req.cookies.cartItems
    cartItems = cartItems.filter(obj => obj.productId !== productId)
    res.clearCookie("cartItems")
    if (cartItems.length) {
        res.cookie("cartItems", cartItems)
    }
    req.flash("success", "Product removed from cart")
    res.redirect("/checkout/cart")
}

module.exports.viewShipment = async (req, res) => {
    const cartItems = req.cookies.cartItems
    //Getting the user detail
    const userId = res.locals.currentUser._id
    // Finding the user
    const user = await User.findById(userId).populate("addresses")
    res.render("shop/checkout", { cartItems, cartDetails: res.locals.cartDetails, addresses: user.addresses })
}

module.exports.postShipment = async (req, res) => {
    const address = await Address.findById(req.body.addressId)
    // var cartDetails = res.locals.cartDetails
    const deliveryDetails = calculateDate(600054, address.pincode)
    req.session.date = deliveryDetails.date
    console.log(res.locals.currentUser.boughtProducts.length)
    console.log(res.locals.currentUser.boughtProducts)
    if (!res.locals.currentUser.boughtProducts.length) {
        console.log("yes")
        req.session.fees = 0
    } else {
        req.session.fees = deliveryDetails.fees
    }
    // req.session.fees = deliveryDetails.fees
    // req.session.cartDetails = cartDetails
    console.log(req.session.fees)
    req.session.address = address
    // res.cookie("address",address)
    res.redirect("/checkout/payment")
}

module.exports.viewPayment = (req, res) => {
    const cartItems = req.cookies.cartItems
    res.render("shop/payment", { cartItems, cartDetails: res.locals.cartDetails })
}
module.exports.postPayment = async (req, res) => {

    //Gettting cart Items
    const cartItems = req.cookies.cartItems
    //Getting the user detail
    const userId = res.locals.currentUser._id
    // Finding the user
    const currentUser = await User.findById(userId)
    var boughtProducts = []
    var flag = 0
    //Checking product availability
    for (item of cartItems) {
        const purchasedProduct = await Product.findById(item.productId)
        if (purchasedProduct.quantity - item.productQty < 0) {
            item.productQty = purchasedProduct.quantity
            flag = 1
        }
    }

    //Redirecting to cart page
    if (flag) {
        req.flash("error", "Some cart items have been updated")
        res.cookie("cartItems", cartItems)
        res.redirect("/checkout/cart")
    }

    //Writing to DB
    for (item of cartItems) {
        const purchasedProduct = await Product.findById(item.productId)
        const newProductQty = purchasedProduct.quantity - item.productQty
        purchasedProduct.quantity = newProductQty
        await purchasedProduct.save()
        boughtProducts.push({ productId: item.productId, productQty: item.productQty, productPrice: purchasedProduct.price })
    }
    const cartDetails = res.locals.cartDetails

    console.log(boughtProducts)
    //Creating order
    const order = new Order({
        products: boughtProducts,
        orderedOn: new Date(),
        status: "Ordered",
        customer: userId,
        totalItems: cartDetails.totalItems,
        totalPrice: cartDetails.grandTotal,
        shipping: cartDetails.fees,
        delivery: cartDetails.date
    })
    const address = req.session.address
    const paymentDetails = req.body.payment
    //check card details then proceed
    



    var payment
    if (!paymentDetails.billing.localeCompare("shipping")) {
        payment = new Payment({
            fullname: address.firstname + " " + address.lastname,
            address: (address.firstline + " " + address.secondline + " " + address.landmark),
            city: address.city,
            nameoncard: paymentDetails.nameoncard,
            cardnumber: paymentDetails.cardnumber,
            expirymonth: paymentDetails.expirymonth,
            expiryyear: paymentDetails.expiryyear
        })
    } else {
        payment = new Payment(paymentDetails)
    }

    order.payment = payment
    order.address = address
    delete req.session.address
    await order.save()
    await payment.save()
    currentUser.boughtProducts.push(order)
    await currentUser.save()
    res.redirect(`/checkout/confirm/${order._id}`)
}

module.exports.confirmOrder = async (req, res) => {
    const { orderId } = req.params
    res.clearCookie("cartItems")
    const order = await Order.findById(orderId)
    const ordernum = orderId.slice(0, 10).toUpperCase()
    res.render("shop/confirm", { order, ordernum, name: res.locals.currentUser.name, order })
}