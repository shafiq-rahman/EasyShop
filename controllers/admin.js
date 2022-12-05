const { Product, Category } = require("../models/product")
const User = require("../models/user")
const Order = require("../models/orders")
const { getCategoryList } = require("../support/helpers")

module.exports.viewDashboard = async (req, res) => {
    const adminData = {}
    adminData.noOfOrders = await Order.find().count()
    adminData.noOfProducts = await Product.find().count()
    adminData.noOfCategories = await Category.find().count()
    const noOfCustomers = await User.find().count()
    const orders = await Order.find({}).sort({ _id: -1 }).populate("customer").limit(5)
    adminData.noOfCustomers = noOfCustomers == 1 ? 0 : (noOfCustomers - 1)
    res.render("admin/dashboard", { orders, adminData })
}

module.exports.viewProducts = async (req, res) => {
    const products = await Product.find({}).populate("category")
    const categories = await Category.find({})
    res.render("admin/products", { products, categoryList: categories })
}

module.exports.newProduct = async (req, res) => {
    const product = new Product(req.body.product)
    product.images = [{ url: req.body.product.images }]
    product.rating = 0
    await product.save()
    res.redirect(`${req.get("referer")}`)
}

module.exports.editProductForm = async (req, res) => {
    const category = await Category.find()
    const { productId } = req.params
    const product = await Product.findById(productId)
    res.render("admin/editProduct", { product, categoryList: category })
}

module.exports.updateProduct = async (req, res) => {
    const { productId } = req.params
    const newProduct = req.body.product
    newProduct.images = [{ url: req.body.product.images }]
    await Product.findByIdAndUpdate(productId, newProduct)
    res.redirect("/admin/products")
}

module.exports.deleteProduct = async (req, res) => {
    const { productId } = req.params
    await Product.findByIdAndDelete(productId)
    res.redirect(`${req.get("referer")}`)
}

module.exports.viewCategory = async (req, res) => {
    const categories = await Category.find()
    res.render("admin/category", { categories })
}

module.exports.editCategoryForm = async (req, res) => {
    const { categoryId } = req.params
    const category = await Category.findById(categoryId)
    res.render("admin/editCategory", { category })
}

module.exports.updateCategory = async (req, res) => {
    const { categoryId } = req.params
    const newCategory = req.body.category
    await Category.findByIdAndUpdate(categoryId, newCategory)
    res.redirect("/admin/category")
}

module.exports.newCategory = async (req, res) => {
    const category = new Category(req.body.category)
    category.created = new Date()
    category.svg = "<path d=\"M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z\"/><path d=\"M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z\"/>"
    await category.save()
    res.redirect(`${req.get("referer")}`)
}

module.exports.deleteCategory = async (req, res) => {
    const { categoryId } = req.params
    await Category.findByIdAndDelete(categoryId)
    res.redirect(`${req.get("referer")}`)
}

module.exports.viewOrders = async (req, res) => {
    const orders = await Order.find({ "status": { "$ne": "Delivered" } }).sort({ _id: -1 }).populate("customer")
    const delivered = await Order.find().where("status").equals("Delivered").sort({ _id: -1 }).populate("customer")
    const result = await Order.aggregate([{ $group: { _id: null, revenue: { $sum: "$totalPrice" } } }])
    if (result[0]) {
        res.render("admin/order", { orders, revenue: result[0].revenue, delivered })
    } else {
        res.render("admin/order", { orders, delivered })
    }
}

module.exports.viewOrderDetails = async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId)
        .populate({
            path: "products",
            populate: {
                path: "productId",
            }
        })
        .populate("address")
        .populate("payment")
    res.render("admin/orderdetails", { order, product: order.products })
}

module.exports.updateOrder = async (req, res) => {
    const { orderId } = req.params
    const order = await Order.findById(orderId)
    const status = req.body.status
    var delivery
    if (status.localeCompare("Delivered") == 0) {
        delivery = new Date()
    } else {
        delivery = new Date(new Date(order.orderedOn) + (10 * 24 * 60 * 60 * 1000))
        const ordered = new Date(order.orderedOn)
        const date = ordered.setDate(ordered.getDate() + 10)
        delivery = new Date(date)
    }
    await Order.findByIdAndUpdate(orderId, { status, delivery })
    res.redirect(`${req.get("referer")}`)
}