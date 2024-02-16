console.log('Server-side code running')

//suppress the self-signed cert error
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = 0

const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const db = require('./queries')
const port = 8080

// serve files from the public directory
app.use(express.static('public'))
app.use(bodyParser.json())
app.use(
  bodyParser.urlencoded({
    extended: true,
  })
)

// serve the homepage
app.get('/', (_req, res) => {
  res.sendFile(__dirname + '/public/login.html')
})
app.get('/homepage', (_req, res) => {
  res.sendFile(__dirname + '/public/main.html')
})

app.post('/events', db.createEvent)
app.get('/events', db.readEvent)
app.put('/events', db.updateEvent)
app.delete('/events', db.deleteEvent)

app.post('/users', db.createUser)
app.get('/users', db.checkAuthorization)

app.post('/journals', db.createJournal)
app.get('/journals', db.readJournal)
app.put('/journals', db.updateJournal)

app.get('/events_table', db.readEventsTable)
app.get('/journals_table', db.readJournalsTable)

// start the express web server listening on 8080
app.listen(port, () => {
  console.log('listening on 8080')
})
