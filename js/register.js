document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('register-form');
    const backToLoginBtn = document.getElementById('back-to-login-btn');

    if (registerForm) {
        registerForm.addEventListener('submit', function(event) {
            event.preventDefault();

            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const email = document.getElementById('email').value;
            const fullname = document.getElementById('fullname').value;
            const gender = document.getElementById('gender').value.toLowerCase(); // Ensure gender is in lowercase

            const myHeaders = new Headers();
            myHeaders.append("Content-Type", "application/json");

            const raw = JSON.stringify({ 
                username: username, 
                password: password, 
                email: email, 
                fullname: fullname, 
                gender: gender 
            });

            const requestOptions = {
                method: 'POST',
                headers: myHeaders,
                body: raw,
                redirect: 'follow'
            };

            fetch("http://localhost:8080/api/v1/auth/register", requestOptions)
                .then(response => {
                    if (!response.ok) {
                        return response.json().then(err => {
                            throw new Error(err.message);
                        });
                    }
                    return response.json();
                })
                .then(result => {
                    const messageElement = document.getElementById('message');
                    if (result.status === "CREATED") { // Update this condition
                        window.location.href = 'login.html';
                    } else {
                        messageElement.textContent = "Registration failed: " + result.message;
                        messageElement.style.color = "red";
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    document.getElementById('message').textContent = "An error occurred. Please try again.";
                    document.getElementById('message').style.color = "red";
                });
        });
    } else {
        console.error('Element with ID "register-form" not found.');
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', function() {
            window.location.href = 'login.html';
        });
    } else {
        console.error('Element with ID "back-to-login-btn" not found.');
    }
});
