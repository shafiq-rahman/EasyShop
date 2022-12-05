const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const product = require("../controllers/product")

router.route("/:id")
    .get(catchAsync(product.viewProduct))

router.route("/:productId/review")
    .post(catchAsync(product.postReview))

router.route("/:productId/review/:reviewId")
    .put(catchAsync(product.updateReview))
    .delete(catchAsync(product.deleteReview))

module.exports = router