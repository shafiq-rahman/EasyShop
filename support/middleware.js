const isAdmin = (req, res, next) => {
    if (!req.session.isAdmin ) {
        req.flash("error","You are not authorized")
        return res.redirect("/")
    }
    next()
}

const isLoggedIn = (req, res, next) => {
    if (!res.locals.currentUser) {
        req.session.previousUrl = req.originalUrl
        req.flash("error", "Please Login to proceed")
        return res.redirect("/login")
    }
    next()
}

module.exports.isAdmin = isAdmin
module.exports.isLoggedIn = isLoggedIn