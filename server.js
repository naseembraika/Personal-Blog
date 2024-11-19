require('dotenv').config()
const { createServer } = require('http')
const app = require('./app')

const server = createServer(app);

server.listen(process.env.PORT)