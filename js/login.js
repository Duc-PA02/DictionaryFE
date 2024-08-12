document.getElementById('login-form').addEventListener('submit', function(event) {
    event.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({ "username": username, "password": password });

    const requestOptions = {
        method: 'POST',
        headers: myHeaders,
        body: raw,
        redirect: 'follow'
    };

    fetch("http://localhost:8080/api/v1/auth/login", requestOptions)
        .then(response => response.json())
        .then(result => {
            if (result.status === "OK") {
                localStorage.setItem('token', result.data.token);
                // Redirect to user info page
                const roles = result.data.roles.map(roleObj => roleObj.role);
                if (roles.includes('admin') || roles.includes('director')) {
                    window.location.href = 'dashboard.html';
                } else if (roles.includes('user')) {
                    window.location.href = 'home.html';
                } else {
                    document.getElementById('message').textContent = "No valid role found.";
                }
            } else {
                document.getElementById('message').textContent = "Login failed: " + result.message;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            document.getElementById('message').textContent = "An error occurred. Please try again.";
        });
});

document.getElementById('register-btn').addEventListener('click', function() {
    window.location.href = 'register.html';
});

document.getElementById('forgot-password-btn').addEventListener('click', function() {
    window.location.href = "forgotPassword.html"
});
