module.exports.getCategoryList = category =>  {
    var categoryList = []
    for (object of category) {
        categoryList.push(object.name)
    }
    return categoryList
}

module.exports.getCartDetails = (cartItems) => {
    let cartDetails = {}
    cartDetails.subtotal = 0
    cartDetails.totalItems = 0
    for (let item of cartItems) {
        cartDetails.subtotal += item.productQty * item.price
        cartDetails.totalItems += item.productQty
    }
    return cartDetails
}

module.exports.calculateDate = (fromPincode,toPincode) => {
    if (toPincode >= 600000 && toPincode <= 660000) {
        const distance = Math.abs(fromPincode - toPincode)
        var days, fees
        if (distance >= 20000) {
            days = 10
            fees = 200
        } else if (distance >= 15000) {
            days = 8
            fees = 160
        } else if (distance >= 10000) {
            fees = 140
            days = 7
        } else if (distance >= 5000) {
            fees = 120
            days = 6
        } else if (distance >= 1000) {
            fees = 100
            days = 5
        } else {
            fees = 80
            days = 3
        }
        const delivery = new Date(Date.now() + days * 24 * 60 * 60 * 1000)
        const deliveryDetails = { date: delivery.toDateString(), fees }
        console.log(deliveryDetails)
        return deliveryDetails
    }
}