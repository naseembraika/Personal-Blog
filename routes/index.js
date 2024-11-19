const { auth, isLogin } = require('../middlewares')
const dashboardRouter = require('./dashboard')
const authRouter = require('./auth')
const blogRouter = require('./blog')
const apiRouter = require('./api');

module.exports = (app) => {
    app.use('/dashboard', auth, dashboardRouter)
    app.use('/auth', isLogin, authRouter)
    app.use('/api', apiRouter)
    app.use('/blog', blogRouter)
}