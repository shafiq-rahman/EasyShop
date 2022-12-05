const { Product } = require("../models/product")
const User = require("../models/user")
const Review = require("../models/review")

module.exports.viewProduct = async (req, res) => {
    const { id } = req.params
    
    // Finding the user
    const cartItems = req.cookies.cartItems
    const product = await Product.findById(id)
    .populate({
        path: "reviews",
        populate: {
            path: "author"
        }
    })
    var productQty = 0
    if (cartItems) {
        for (let obj of cartItems) {
            if (obj.productId == product._id) {
                productQty = obj.productQty
            }
        }
    }
    if (res.locals.currentUser) {
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
        var addReview = 1
        for (let review of product.reviews) {
            if (res.locals.currentUser && review.author._id.equals(res.locals.currentUser._id)) {
                addReview = 0
            }
        }
        res.render("main/show", { product, reviews: product.reviews, order: user.boughtProducts, addReview, productQty })
    } else {
        res.render("main/show", { product, reviews: product.reviews, productQty})
    }
}

module.exports.postReview = async (req, res) => {
    const { productId } = req.params
    const userId = res.locals.currentUser._id
    const review = new Review(req.body.review)
    review.author = userId
    review.product = productId
    const product = await Product.findById(productId)
    const user = await User.findById(userId)
    user.myReviews.push(review)
    const newRating = Math.trunc((product.rating + review.rating) / 2)
    product.rating = newRating
    product.reviews.push(review)
    await product.save()
    await review.save()
    await user.save()
    req.flash("success", "Review added succesfully")
    res.redirect(`${req.get("referer")}`)
}

module.exports.updateReview = async (req, res) => {
    const { reviewId, productId } = req.params
    const reviewBody = req.body.review
    await Review.findByIdAndUpdate(reviewId, reviewBody)
    const product = await Product.findById(productId)
    const newRating = Math.trunc((product.rating + parseInt(reviewBody.rating,10)) / 2)
    product.rating = newRating
    await product.save()
    req.flash("success", "Review updated successfully")
    res.redirect(`${req.get("referer")}`)
}

module.exports.deleteReview = async (req, res) => {
    const { productId, reviewId } = req.params
    await Product.findByIdAndUpdate(productId, { $pull: reviewId })
    await Review.findByIdAndDelete(reviewId)
    req.flash("success", "Review deleted successfully")
    res.redirect(`${req.get("referer")}`)
}