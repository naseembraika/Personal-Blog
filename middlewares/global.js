const cookieParser = require('cookie-parser')
const methodOverride = require('method-override')
const expressLayouts = require('express-ejs-layouts');

module.exports = (app, express) => {
    app.set('view engine', 'ejs');
    app.set('layout', 'dashboard/main.ejs');

    app.use(expressLayouts)
    app.use(cookieParser())
    app.use(express.json())
    app.use(express.static('public'))
    app.use(methodOverride('_method'))
    app.use(express.urlencoded({ extended: true }))
    app.use((req, res, next) => {
        if (req.url.split('/')[1] == 'blog') app.set('layout', 'layouts/blog.ejs');
        if (req.url.split('/')[1] == 'dashboard') app.set('layout', 'layouts/dashboard.ejs');
        if (req.url.split('/')[1] == 'auth') app.set('layout', 'layouts/auth.ejs');
        next();
    })
}