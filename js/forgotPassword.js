document.addEventListener('DOMContentLoaded', function() {
    const forgotPasswordForm = document.getElementById('forgot-password-form');
    const step1Message = document.getElementById('step-1-message');
    const step2Message = document.getElementById('step-2-message');
    const step1 = document.getElementById('step-1');
    const step2 = document.getElementById('step-2');
    const backButton = document.getElementById('back-button');

    // Handle sending the reset password code
    document.getElementById('send-code-button').addEventListener('click', function() {
        const email = document.getElementById('email').value;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({ email });

        fetch("http://localhost:8080/api/v1/auth/forgot-password", {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "OK") {
                step1.style.display = 'none';
                step2.style.display = 'block';
                backButton.style.display = 'block';
            } else {
                step1Message.textContent = `Failed to send code: ${result.message}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            step1Message.textContent = "An error occurred. Please try again.";
        });
    });

    // Handle resetting the password
    document.getElementById('reset-password-button').addEventListener('click', function() {
        const code = document.getElementById('code').value;
        const newPassword = document.getElementById('new-password').value;

        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");

        const raw = JSON.stringify({ code, password: newPassword });

        fetch("http://localhost:8080/api/v1/auth/reset-password", {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "OK") {
                window.location.href = 'login.html';
            } else {
                step2Message.textContent = `Failed to reset password: ${result.message}`;
            }
        })
        .catch(error => {
            console.error('Error:', error);
            step2Message.textContent = "An error occurred. Please try again.";
        });
    });

    // Handle back button click
    backButton.addEventListener('click', function() {
        window.location.href = 'login.html';
    });
});
