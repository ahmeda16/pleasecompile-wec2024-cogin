require('dotenv').config()
const pg = require('pg')

const pool = new pg.Pool({
    user: process.env.AWS_DB_USER,
    password: process.env.AWS_DB_KEY,
    database: process.env.AWS_DB_DATABASE,
    host: process.env.AWS_DB_HOST,
    port: process.env.AWS_DB_PORT,
    ssl: process.env.AWS_DB_SSL
})

const createEvent = (request, response) => {
    const event_name = request.body.event_name
    const start_time = request.body.start_time
    const end_time = request.body.end_time //COULD BE NULL
    const event_date = request.body.event_date
    const private = request.body.private
    const notes = request.body.notes //COULD BE NULL

    console.log(`Creating event: ${event_name} on server`)

    pool.query(`INSERT INTO events (event_name, start_time, end_time, event_date, private, notes) VALUES ($1, $2, $3, $4, $5, $6)`,
                [event_name, start_time, end_time, event_date, private, notes], (error) => {
                    if (error){
                        console.log(`Event already exists: ${event_name} in server`)
                        response.sendStatus(400) //HTTP response of event duplicate
                        return
                        //don't throw error, because the error is expected and handled
                    }
                    console.log(`Created Event: ${event_name} created on server`)
                    response.sendStatus(201) //Event created successfully
                })
}

const readEvent = (request, response) => {
    const caregiver = request.query.caregiver
    const event_date = request.query.event_date

    if (caregiver == 0) {
        console.log(`Getting: All events on ${event_date} on server`)
        pool.query('SELECT * FROM events WHERE event_date = $1', [event_date], (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no events on server on ${event_date}`)
                response.sendStatus(204) //Events not in database
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are events on server on ${event_date}`)
                response.status(200).json(results.rows)
            }
        })
    }
    else if (caregiver == 1) {
        console.log(`Getting: Only public events on ${event_date} on server`)
        pool.query('SELECT * FROM journals WHERE event_date = $1 AND private = 0', [event_date], (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no public events on server on ${event_date}`)
                response.sendStatus(204)
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are public events on server on ${event_date}`)
                response.status(200).json(results.rows)
            }
        })
    }
}

const updateEvent = (request, response) => {
    const event_name = request.body.event_name
    const start_time = request.body.start_time
    const end_time = request.body.end_time //COULD BE NULL
    const event_date = request.body.event_date
    const private = request.body.private //COULD BE NULL
    const notes = request.body.notes

    console.log(`Updating Event: ${event_name} for date ${event_date} on server`)

    pool.query('UPDATE events SET start_time = $1, end_time = $2, private = $3, notes = $4 WHERE event_name = $5 AND event_date = $6', [start_time, end_time, private, notes, event_name, event_date], (error, results) => {
        if (error) {
            throw error //this generally should not occur, but should be handled accordingly
        }
        if (results.rowCount == 0) {
            console.log(`Event Update: Event ${event_name} for date does not exist: ${event_date} on server`)
            response.sendStatus(204)
        }
        else if (results.rowCount == 1) {
            console.log(`Event Update: Event ${event_name} for date does exist: ${event_date} on server`)
            response.sendStatus(200)
        }
    })
}

const deleteEvent = (request, response) => {
    const event_name = request.body.event_name
    const event_date = request.body.event_date

    console.log(`Deleting Event: ${event_name} for date ${event_date} on server`)

    pool.query('DELETE FROM events WHERE event_name = $1 AND event_date = $2', [event_name, event_date], (error, results) => {
        if (error) {
            throw error
        }
        if (results.rowCount == 0){
            console.log(`Event Delete: Event ${event_name} for date does not exist: ${event_date} on server`)
            response.sendStatus(204)
        }
        else if (results.rowCount == 1){
            console.log(`Deleted Event: ${event_name} for date ${event_date} on server`)
            response.sendStatus(200)
        }
    })
}

const createUser = (request, response) => {
    const individual_name = request.body.individual_name
    const username = request.body.username
    const password = request.body.password
    const caregiver = request.body.caregiver

    console.log(`Creating: user ${username} on server`)

    pool.query('INSERT INTO users (individual_name, username, password, caregiver) VALUES ($1, $2, $3, $4)', [individual_name, username, password, caregiver], (error) => {
        if (error) {
            console.log(`User already exists: ${username} on server`)
            response.sendStatus(400) //User already exists
            return
            //don't throw error, because the error is expected and handled
        }
        console.log(`Created: user ${username} on server`)
        response.sendStatus(201) //User created successfully
    })
}

const checkAuthorization = (request, response) => {
    const username = request.query.username
    const password = request.query.password

    console.log(`Authorizing: user ${username} on server`)

    pool.query('SELECT * FROM users WHERE username = $1 AND password = $2', [username, password], (error, results) => {
        if (error) {
            throw error //this generally should not occur, but should be handled accordingly
        }
        if (results.rowCount == 0) {
            console.log(`Authorization failure: user ${username} on server`)
            response.sendStatus(401)
        }
        else if (results.rowCount == 1) {
            console.log(`Authorization success: user ${username} on server`)
            response.status(200).json(results.rows)
        }
    })
}

const createJournal = (request, response) => {
    const journal_text = request.body.journal_text
    const journal_date = request.body.journal_date
    const private = request.body.private

    console.log(`Creating: journal for date ${journal_date} on server`)

    pool.query('INSERT INTO journals (journal_text, journal_date, private) VALUES ($1, $2, $3)', [journal_text, journal_date, private], (error) => {
        if (error) {
            console.log(`Journal entry for date already exists: ${journal_date} on server`)
            response.sendStatus(400) //Journal entry for date already exists
            return
            //don't throw error, because the error is expected and handled
        }
        console.log(`Created: journal for date ${journal_date} on server`)
        response.sendStatus(201) //Journal created successfully
    })
}

const readJournal = (request, response) => {
    const caregiver = request.query.caregiver
    const journal_date = request.query.journal_date

    if (caregiver == 0) {
        console.log(`Getting: Journal on ${journal_date} on server`)
        pool.query('SELECT * FROM journals WHERE journal_date = $1', [journal_date], (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there is no journal on server on ${journal_date}`)
                response.sendStatus(204) //Journal not in database
            }
            else if (results.rowCount == 1) {
                console.log(`Read complete: there is a journal on server on ${journal_date}`)
                response.status(200).json(results.rows)
            }
        })
    }
    else if (caregiver == 1) {
        console.log(`Getting: Public journal on ${journal_date} on server`)
        pool.query('SELECT * FROM journals WHERE journal_date = $1 AND private = 0', [journal_date], (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there is no public journal on server on ${journal_date}`)
                response.sendStatus(204) //Journal not in database
            }
            else if (results.rowCount == 1) {
                console.log(`Read complete: there is a public journal on server on ${journal_date}`)
                response.status(200).json(results.rows)
            }
        })
    }
}

const updateJournal = (request, response) => {
    const journal_text = request.body.journal_text
    const journal_date = request.body.journal_date
    const private = request.body.private

    console.log(`Updating: journal for date ${journal_date} on server`)
    
    pool.query('UPDATE journals SET journal_text = $1, private = $2 WHERE journal_date = $3', [journal_text, private, journal_date], (error, results) => {
        if (error) {
            throw error //this generally should not occur, but should be handled accordingly
        }
        if (results.rowCount == 0) {
            console.log(`Update failed: journal for date ${journal_date} does not exist on server`)
            response.sendStatus(204)
        }
        else if (results.rowCount == 1) {
            console.log(`Update complete: journal for date ${journal_date} on server`)
            response.sendStatus(200)
        }
    })
}

const readEventsTable = (request, response) => {
    const caregiver = request.query.caregiver

    if (caregiver == 0) {
        console.log(`Getting entire events table from server`)
        pool.query('SELECT * FROM events', (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no events on server`)
                response.sendStatus(204)
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are events on server`)
                response.status(200).json(results.rows)
            }
        })
    }
    else if (caregiver == 1) {
        console.log(`Getting only public events table from server`)
        pool.query('SELECT * FROM events WHERE private = 0', (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no public events on server`)
                response.sendStatus(204)
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are public events on server`)
                response.status(200).json(results.rows)
            }
        })
    }
}

const readJournalsTable = (request, response) => {
    const caregiver = request.query.caregiver

    if (caregiver == 0) {
        console.log(`Getting entire journals table from server`)
        pool.query('SELECT * FROM journals', (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no journals on server`)
                response.sendStatus(204)
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are journals on server`)
                response.status(200).json(results.rows)
            }
        })
    }
    else if (caregiver == 1) {
        console.log(`Getting only public journals table from server`)
        pool.query('SELECT * FROM journals WHERE private = 0', (error, results) => {
            if (error) {
                throw error //this generally should not occur, but should be handled accordingly
            }
            if (results.rowCount == 0) {
                console.log(`Read failed: there are no public journals on server`)
                response.sendStatus(204)
            }
            else if (results.rowCount >= 1) {
                console.log(`Read complete: there are public journals on server`)
                response.status(200).json(results.rows)
            }
        })
    }
}

module.exports = {
    createEvent,
    readEvent,
    updateEvent,
    deleteEvent,
    createUser,
    checkAuthorization,
    createJournal,
    readJournal,
    updateJournal,
    readEventsTable,
    readJournalsTable,
}