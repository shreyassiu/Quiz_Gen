const express = require('express')
require('dotenv').config()
const bodyParser = require('body-parser')
const cors = require('cors')
const authRouter = require('./Routes/authRouter.js')
require('./Models/db.js')
const quizRouter = require('./Routes/quizRouter.js')


const app = express()
const port = 3000

app.use(cors())
app.use(bodyParser.json())


app.use("/auth",authRouter)
app.use("/Quiz",quizRouter)

app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})