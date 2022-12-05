const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const { isLoggedIn } = require("../support/middleware")
const user = require("../controllers/user")

router.route("/dashboard")
    .get(isLoggedIn, catchAsync(user.viewDashboard))

router.route("/orders")
    .get(isLoggedIn, catchAsync(user.viewOrder))

router.route("/orders/:orderId")
    .get(isLoggedIn, catchAsync(user.viewOrderDetails))

router.route("/editaccount")
    .get(isLoggedIn, catchAsync(user.editUser))
    .put(isLoggedIn, catchAsync(user.updateUser))

router.route("/address")
    .get(isLoggedIn, catchAsync(user.viewAllAddress))
    .post(isLoggedIn, catchAsync(user.newAddress))

router.route("/address/:addressId")
    .get(isLoggedIn, catchAsync(user.editAddressForm))
    .put(isLoggedIn, catchAsync(user.updateAddress))
    .delete(isLoggedIn, catchAsync(user.deleteAddress))
    
router.route("/reviews")
    .get(isLoggedIn, catchAsync(user.viewReviews))

module.exports = router