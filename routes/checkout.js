const express = require("express")
const router = express.Router()
const { isLoggedIn } = require("../support/middleware")
const catchAsync = require("../utils/catchAsync")
const checkout = require("../controllers/checkout")
router.route("/cart")
    .get(checkout.viewCart)

router.route("/cart/:productId")
    .get(checkout.removeItem)

router.route("/shipment")
    .get(isLoggedIn, catchAsync(checkout.viewShipment))
    .post(isLoggedIn, catchAsync(checkout.postShipment))

router.route("/payment")
    .get(isLoggedIn, checkout.viewPayment)
    .post(isLoggedIn, catchAsync(checkout.postPayment))

router.route("/confirm/:orderId")
    .get(isLoggedIn, catchAsync(checkout.confirmOrder))

module.exports = router