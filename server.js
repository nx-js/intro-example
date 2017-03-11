'use strict'

const express = require('express')
const compression = require('compression')
const app = express()

app.use(compression())
app.use(express.static(__dirname))
app.use((req, res) => res.sendFile(__dirname + '/index.html'))

app.listen(3001)
