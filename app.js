//Requiring all dependencies
const express = require("express")
const app = express()
const path = require("path")
const ejsMate = require("ejs-mate")
const mongoose = require("mongoose")
const passport = require("passport")
const LocalStrategy = require("passport-local")
const session = require("express-session")
const flash = require("connect-flash")
const methodOverride = require("method-override")
const { Product, Category } = require("./models/product")
const User = require("./models/user")
const cookies = require("cookie-parser")
const catchAsync = require("./utils/catchAsync")
//Getting routers
const adminRoutes = require("./routes/admin")
const checkoutRoutes = require("./routes/checkout")
const userRoutes = require("./routes/user")
const productRoutes = require("./routes/product")

//Setting up the dependencies
app.engine("ejs", ejsMate)
app.set("views", path.join(__dirname, "views"))
app.set("view engine", "ejs")
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, "public")))
app.use(methodOverride("_method"))
app.use(cookies())

//Setting the session
const sessionConfig = {
    name: "session",
    secret: "asf353rd@%$JN@",
    resave: false,
    saveUninitialized: true,
    cookie: {
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        httpOnly: true
    }
}

app.use(flash())
app.use(session(sessionConfig))
app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate()))
passport.serializeUser(User.serializeUser())
passport.deserializeUser(User.deserializeUser())

//Listening to port
app.listen(4040, () => {
    console.log("LISTENING TO PORT 4040")
})

//Connecting to MongoDB
const dbUrl = "mongodb://localhost:27017/easyshop"
mongoose.connect(dbUrl)
    .then(() => {
        console.log("MONGO CONNECTION ESTABLISHED")
    })
    .catch(() => {
        console.log("MONGO CONNECTION FAILED!!")
    })

//Middleware
app.use((req, res, next) => {
    res.locals.success = req.flash("success")
    res.locals.error = req.flash("error")
    res.locals.currentUser = req.user
    res.locals.isAdmin = req.session.isAdmin
    const cartItems = req.cookies.cartItems || []
    var cartDetails = getCartDetails(cartItems)
    cartDetails.date = req.session.date || new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    cartDetails.fees = req.session.fees
    cartDetails.grandTotal = cartDetails.subtotal + cartDetails.fees
    res.locals.cartDetails = cartDetails
    next()
})

app.get("/", catchAsync(async (req, res) => {
    const categories = await Category.find({})
    const samsung = await Product.find({ brand: "Samsung", quantity: {$gt: 0} }).limit(5)
    const apple = await Product.find({ brand: "Apple", quantity: {$gt: 0} }).limit(5)
    res.render("main/home", { samsung, apple, categories })
}))


//Route handling
app.use("/admin", adminRoutes)
app.use("/checkout", checkoutRoutes)
app.use("/user", userRoutes)
app.use("/product", productRoutes)

//Error handling middleware
app.use((err, req, res, next) => {
    console.log(err)
    res.render("main/error")
})

//Category page
app.get("/category/:name", catchAsync(async (req, res) => {
    const { name } = req.params
    const filters = req.query
    console.log(filters.brand)
    const category = await Category.find({ name: name })
    const brands = await Product.find({category: category[0]._id}).distinct("brand")
    var allProducts
    if (filters.brand) {
        const filterbrands = filters.brand.split(",")
        allProducts = await Product.find({ category: category[0]._id, brand: filterbrands })
        res.send({ products: allProducts })
    } else {
        allProducts = await Product.find({ category: category[0]._id })
        res.render("main/category", { products: allProducts, category: category[0], brands })
    }
}))

//Category page
// app.get("/category/:name/search", catchAsync(async (req, res) => {
//     const { name } = req.params
//     const searchTerm = req.query.term
//     const category = await Category.find({ name: name })
//     const allProducts = await Product.find({ $and: [{ category: category[0]._id }, { name: { "$regex": searchTerm, "$options": "i" } }] })
//     const brands = await Product.find({category: category[0]._id}).distinct("brand")
//     const available = allProducts.filter(product => product.quantity > 0)
//     const outOfStock = allProducts.filter(product => product.quantity == 0)
//     res.render("main/category", { products: available, category: category[0], outOfStock ,brands})
// }))

app.get("/category/:name/search",  catchAsync(async (req, res) => {
    const searchTerm = req.query.term
    const {name} = req.params
    const category = await Category.find({ name: name })
    const allProducts = await Product.find({ $and: [{ category: category[0]._id }, { name: { "$regex": searchTerm, "$options": "i" } }] })
    const allRatings = await Product.find({ $and: [{ category: category[0]._id }, { name: { "$regex": searchTerm, "$options": "i" } }] }, { rating: 1 })
    console.log(allRatings)
    res.send({ products: allProducts, allRatings })
}))

//Account access routes
app.get("/login", (req, res) => {
    res.locals.previous
    res.render("user/login")
})

app.post("/login", passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }), catchAsync(async (req, res) => {
    if (req.body.username === 'admin') {
        req.session.isAdmin = true
        res.locals.isAdmin = true
        res.locals.currentUser = req.user
        req.flash("success", "You have been logged in succesfully!")
        res.redirect("/admin/dashboard")
    } else {
        const redirectUrl = req.session.previousUrl || `/user/dashboard`
        res.locals.currentUser = req.user
        req.flash("success", "You have been logged in succesfully!")
        delete req.session.previousUrl
        res.redirect(redirectUrl)
    }
}))

app.get("/logout", (req, res) => {
    delete req.session.isAdmin
    req.logOut()
    res.redirect("/")
})

app.get("/signup", (req, res) => {
    res.render("user/signup")
})

app.post("/signup", async (req, res, next) => {
    try {
        const { name, username, email, phone, password } = req.body
        if (req.body.username === 'admin') {
            req.session.isAdmin = true
            res.redirect("/admin/dashboard")
        }
        res.locals.currentUser = req.user
        const newUser = new User({ name, username, email, phone })
        const registeredUser = await User.register(newUser, password)
        req.login(registeredUser, (err) => {
            if (err) {
                next(err)
            }
            res.redirect("/user/dashboard")
        })
    } catch (err) {
        req.flash("error", err.message)
        res.redirect("/signup")
    }
})

//Managing cart products
app.post("/addCart/:productId", catchAsync(async (req, res) => {
    const { productId } = req.params
    const productQty = parseInt(req.body.productQty) || 1
    var cartItems = req.cookies.cartItems || []
    const product = await Product.findById(productId)
    var returnObject = {}
    if (product) {
        returnObject = await addToCart(cartItems, product, productQty)
    }
    res.cookie("cartItems", returnObject.cartItems)
    if (returnObject.flash) {
        req.flash("error", "Some cart items have been updated")
    } else {
        req.flash("success", "Product added to cart succesfully <a href=\"/checkout/cart\" class=\" ms-auto alert-link\">View Cart</a>")
    }
    var cartDetails = getCartDetails(cartItems)
    res.locals.cartDetails = cartDetails
    res.redirect(`${req.get("referer")}`)
}))

//Managing cart products
app.put("/addCart/change/:productId", (async (req, res) => {
    const { productId } = req.params
    const productQty = parseInt(req.body.productQty)
    var cartItems = req.cookies.cartItems || []
    const product = await Product.findById(productId)
    var returnObject = {}
    if (product) {
        returnObject = await addToCart(cartItems, product, productQty, change = true)
    }
    res.cookie("cartItems", returnObject.cartItems)
    if (returnObject.flash) {
        req.flash("error", "Some cart items have been updated")
    }
    var cartDetails = getCartDetails(cartItems)
    res.locals.cartDetails = cartDetails
    req.flash("success", "Cart items updated successfully")
    res.redirect(`${req.get("referer")}`)
}))

async function addToCart(cartItems, product, productQty, change = false) {

    var productflag = 0, newflag = 1
    if (cartItems.length) {
        for (item of cartItems) {
            if (item.productId == product._id) {
                if (change) {
                    item.productQty = productQty
                } else {
                    item.productQty += productQty
                }
                newflag = 0
            }
        }
        if (newflag) {
            cartItems.push({ productId: product._id, name: product.name, images: product.images, productQty, price: product.price })
        }
    } else {
        cartItems.push({ productId: product._id, name: product.name, images: product.images, productQty, price: product.price })
    }
    for (item of cartItems) {
        const purchasedProduct = await Product.findById(item.productId)
        if (purchasedProduct.quantity - item.productQty < 0) {
            item.productQty = purchasedProduct.quantity
            productflag = 1
        }
    }
    const returnObject = { cartItems, flash: productflag }
    return returnObject
}

function isLoggedIn(req, res, next) {
    if (!res.locals.currentUser) {
        req.session.previousUrl = req.originalUrl
        if (req.originalUrl.includes("buynow")) {
            req.session.previousUrl = req.get("referer")
        }
        req.flash("error", "Please Login to proceed")
        return res.redirect("/login")
    }
    next()
}

app.post("/buynow/:productId", isLoggedIn, catchAsync(async (req, res) => {
    const { productId } = req.params
    const productQty = parseInt(req.body.productQty) || 1
    var cartItems = req.cookies.cartItems || []
    var product = await Product.findById(productId)
    var returnObject = {}
    if (product) {
        returnObject = await addToCart(cartItems, product, productQty)
    }
    res.cookie("cartItems", returnObject.cartItems)
    if (returnObject.flash) {
        req.flash("error", "Some cart items have been updated")
    }
    var cartDetails = getCartDetails(cartItems)
    res.locals.cartDetails = cartDetails
    res.redirect("/checkout/cart")
}))

function getCartDetails(cartItems) {
    let cartDetails = {}
    cartDetails.subtotal = 0
    cartDetails.totalItems = 0
    for (let item of cartItems) {
        cartDetails.subtotal += item.productQty * item.price
        cartDetails.totalItems += item.productQty
    }
    
    return cartDetails
}
