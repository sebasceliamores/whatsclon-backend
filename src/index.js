/* eslint-disable no-undef */
const express = require('express')
const { createServer } = require('http')
const cors = require('cors')

const passport = require('passport')
const notFound = require('./middleware/notFound')
const handleErrors = require('./middleware/handleErrors')
const app = express()
const session = require('express-session')

const socketMiddleware = require('./sockets')

const userExtractor = require('./middleware/userExtractor')
const httpServer = createServer(app)

//sockets
socketMiddleware(httpServer)

require('dotenv').config()
require('./passport/google')
require('./database/mongo')

app.use(cors())

app.use(express.json())
app.use(express.urlencoded({ extended: true }))

app.set('trust proxy', 1) // trust first proxy
app.use(
	session({
		secret: 'keyboard cat',
		resave: false,
		saveUninitialized: true,
		cookie: { secure: true },
	})
)
app.use(passport.initialize())
app.use(passport.session())

// routes
app.get('/', (request, response) => {
	response.send('Hello World!')
})

app.use(require('./routes/auth'))
//app.use(userExtractor)
app.use(require('./routes/users'))
app.use(require('./routes/contact'))
app.use(require('./routes/chats'))
app.use(require('./routes/messages'))
app.use(require('./routes/sockets'))

// Middleware Not Found 404
app.use(notFound)

app.use(handleErrors)

const PORT = process.env.PORT || 3001
const server = httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`)
})

module.exports = { app, server }
