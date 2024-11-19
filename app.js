const express = require('express')
const middlewares = require('./middlewares')
const routes = require('./routes')
const createError = require('http-errors')

global.createError = createError;

const app = express();

process.on('unhandledRejection', (reason) => {
    console.log('Unhandled Rejection', reason);
    process.exit(1);
})


middlewares.global(app, express);

routes(app);

app.use((req, res, next) => {
    res.redirect('/blog');
})

app.use((err, req, res, next) => {
    res.status(err.statusCode || 500).json({
        status: false,
        statusCode: err.statusCode,
        message: err.message
    })
})
module.exports = app;