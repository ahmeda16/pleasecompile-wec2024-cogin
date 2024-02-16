console.log('Client-side code running');


var CAREGIVER_STATUS = 0  // 0 or 1
var SELECTED_DATE = "2024-01-28"

const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ]

// ========================= MODAL =========================
const dateModal = new bootstrap.Modal(document.getElementById('dateModal'))
const newEventModal = new bootstrap.Modal(document.getElementById('newEventModal'))

const editEventBtn = document.getElementById('editAddEvent');
editEventBtn.addEventListener('click', function(e) {
    dateModal.hide();
    newEventModal.show();   
})
const createEventBtn = document.getElementById('createEventBtn');




const editEventsText = document.getElementById('eventsText');
const editJournalBtn = document.getElementById('editJournalBtn');
const editJournalText = document.getElementById('journalText');
editJournalBtn.addEventListener('click', function(e) {
    editJournalBtn.classList.toggle('btn-secondary')
    editJournalBtn.classList.toggle('btn-info')
    editJournalText.toggleAttribute('disabled')
});
function resetEditJournal() {
    if (editJournalBtn.classList.contains('btn-info')) {
        editJournalBtn.classList.toggle('btn-secondary')
        editJournalBtn.classList.toggle('btn-info')
        editJournalText.toggleAttribute('disabled')
    }
}
const dateModalTitle = document.getElementById('dateModalTitle')
const editSaveBtn = document.getElementById('editSaveJournal');


const eventsTable = document.getElementById('eventsTable');

const eventModalTitle = document.getElementById('eventModalTitle')

const weekdayButtons = document.getElementsByClassName("weekday-btn")

var noCurrentJournal = true



function selectDate(date) {
    SELECTED_DATE = date
}


for (var i = 0; i < weekdayButtons.length; i++) {
    
    weekdayButtons[i].addEventListener('click', function(e) {
        
        dateModalTitle.innerHTML = MONTHS[parseInt(SELECTED_DATE.split('-')[1]) - 1] + " " + SELECTED_DATE.split('-')[2]
        eventModalTitle.innerHTML = "New Event - " + MONTHS[parseInt(SELECTED_DATE.split('-')[1]) - 1] + " " + SELECTED_DATE.split('-')[2]
        //SELECTED_DATE = "2024-01-28"

        resetEditJournal()

        // Populate modal with this button date
        //  GET /events (caregiver, date) YYYY-MM-DD
        const requestOptions = {
            method: 'GET'
        }
        fetch(`/events?caregiver=${CAREGIVER_STATUS}&event_date=${encodeURIComponent(SELECTED_DATE)}`, requestOptions)
            .then(function (response) {
                if (response.ok) {

                    if (response.status == 200) {
                        // get event
                        // write to modal
                        //editJournalText.innerHTML = response.json
                        return response.json();
                    }
                    else if (response.status == 204) {
                        // event does not exist
                        
                    }
                    return;
                }


                throw new Error('Read Event request failed');
            })
            .then(function(json) {
                //editEventsText.innerHTML = json[0].event_name
                
                // erase table
                //for (var i = 0; i < eventsTable.rows.length - 1; i++) {
                //    eventsTable.deleteRow(1)
                //}
                eventsTable.getElementsByTagName("tbody")[0].innerHTML = eventsTable.rows[0].innerHTML;

                // add table
                for (let i in json) {
                    var row = eventsTable.insertRow(eventsTable.rows.length);
                    // row.insertCell(0).innerHTML = json[0].event_date.slice(0, 10)
                    row.insertCell(0).innerHTML = json[i].start_time
                    row.insertCell(1).innerHTML = json[i].event_name
                    row.insertCell(2).innerHTML = json[i].notes
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        
        // GET /journals (caregiver, date) YYYY-MM-DD
        fetch(`/journals?caregiver=${CAREGIVER_STATUS}&journal_date=${encodeURIComponent(SELECTED_DATE)}`, requestOptions)
            .then(function (response) {
                if (response.ok) {
                    
                    if (response.status == 200) {
                        // get event
                        // write to modal
                        return response.json();
                    }
                    else if (response.status == 204) {
                        // event does not exist
                        
                    }
                    return;
                }
                throw new Error('Read Event request failed');
            })
            .then(function (json) {
                editJournalText.value = null
                for (var i in json) {
                    editJournalText.value = json[i].journal_text
                }
            })
            .catch(function (error) {
                console.log(error);
            });
        


        // Show modal
        dateModal.show()
    });
}



// function addNewEvent() {
createEventBtn.addEventListener('click', function(e) {
    console.log("Updating journal entry")
    // POST new EVENT
    const requestOptions = {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            event_name: document.getElementById('eventNameInput').value,
            start_time: document.getElementById('eventTimeInput').value + ":00",
            end_time: document.getElementById('eventTimeInput').value + ":00",
            event_date: SELECTED_DATE,
            notes: document.getElementById('eventNotesInput').value,
            private: document.getElementById('eventHiddenInput').checked ? 1 : 0
         })
    }
    fetch('/events', requestOptions)
        .then(function (response) {
            if (response.ok) {
                if (response.status == 201) {
                    // success
                    console.log("post success")
                }
                else if (response.status == 204) {
                    // already exists

                }
                return;
            }
            throw new Error('Create request failed');
        })
        .catch(function (error) {
            console.log(error);
        });
});




editSaveBtn.addEventListener('click', function(e) {


    resetEditJournal()
    console.log("SAVING")

    // PUT to /journals
    const requestOptions = {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            journal_text: document.getElementById('journalText').value,
            journal_date: SELECTED_DATE,
            private: 0  // default public
         })
    }
    fetch('/journals', requestOptions)
        .then(function (response) {
            if (response.ok) {
                if (response.status == 201) {
                    // success
                    console.log("put success")
                }
                else if (response.status == 204) {
                    // already exists

                }
                console.log(response.status)
                return;
            }
            throw new Error('Create request failed');
        })
        .catch(function (error) {
            console.log(error);
        });
});


window.onload = function () {
    // updateDB();
    
    // update icons if there is an event

}
