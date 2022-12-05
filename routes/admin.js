const express = require("express")
const router = express.Router()
const catchAsync = require("../utils/catchAsync")
const { isAdmin } = require("../support/middleware")
const admin = require("../controllers/admin")

router.route("/dashboard")
    .get(isAdmin, catchAsync(admin.viewDashboard))

router.route("/products")
    .get(isAdmin, catchAsync(admin.viewProducts))
    .post(isAdmin, catchAsync(admin.newProduct))

router.route("/products/:productId")
    .get(isAdmin, catchAsync(admin.editProductForm))
    .put(isAdmin, catchAsync(admin.updateProduct))
    .delete(isAdmin, catchAsync(admin.deleteProduct))

router.route("/category")
    .get(isAdmin, catchAsync(admin.viewCategory))
    .post(isAdmin, catchAsync(admin.newCategory))

router.route("/category/:categoryId")
    .get(isAdmin, catchAsync(admin.editCategoryForm))
    .put(isAdmin, catchAsync(admin.updateCategory))
    .delete(isAdmin, catchAsync(admin.deleteCategory))

router.route("/order")
    .get(isAdmin, catchAsync(admin.viewOrders))

router.route("/order/:orderId")
    .get(isAdmin, catchAsync(admin.viewOrderDetails))
    .post(isAdmin, catchAsync(admin.updateOrder))

module.exports = router
    