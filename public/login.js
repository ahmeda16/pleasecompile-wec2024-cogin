
// login elements
const usernameInput = document.getElementById('usernameInput');
const passwordInput = document.getElementById('passwordInput');
const loginBtn = document.getElementById('loginBtn');
const errorToast = document.getElementById('errorToast');

function displayErrorToast() {
    var toastElList = [].slice 
            .call(document.querySelectorAll('.toast')); 
        var toastList = toastElList.map(function (toastEl) { 
            return new bootstrap.Toast(toastEl) 
        }) 
        toastList.forEach(toast => toast.show())
}

loginBtn.addEventListener('click', function (event) {
    // Overwrite form button default behaviour
    event.preventDefault();

    usernameText = usernameInput.value;
    passwordText = passwordInput.value;

    if (!usernameText || !passwordText){
        console.log("Missing input");
        displayErrorToast();
    }
    else{

        const requestOptions = {
            method: 'GET'
        }
        fetch(`/users?username=${usernameText}&password=${passwordText}`, requestOptions)
            .then(function (response) {
                if (response.status == 200){
					window.location.href='main.html'
                }
				else if (response.status == 401){
					// incorrect username or password
					console.log("Username & password pair do not exist within database.");
                    displayErrorToast();
				}
				else{
					// server issue
					console.log("Server Error.");
				}
            })
    }
})