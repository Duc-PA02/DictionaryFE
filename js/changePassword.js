import { getToken, getUserFromToken } from '../service/token.js';

document.addEventListener('DOMContentLoaded', function() {
    const token = getToken();
    if (!token) {
        alert('No token found, please login first.');
        window.location.href = 'login.html';
        return;
    }

    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);
    myHeaders.append("Content-Type", "application/json");

    const changePasswordForm = document.getElementById('change-password-form');

    changePasswordForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;

        if (newPassword !== confirmPassword) {
            document.getElementById('update-message').textContent = "New passwords do not match.";
            document.getElementById('update-message').style.color = "red";
            return;
        }

        const data = {
            currentPassword: currentPassword,
            newPassword: newPassword
        };

        fetch("http://localhost:8080/api/v1/user/change-password", {
            method: 'POST',
            headers: myHeaders,
            body: JSON.stringify(data),
            redirect: 'follow'
        })
        .then(response => response.json().then(data => ({ status: response.status, body: data })))
        .then(result => {
            const updateMessage = document.getElementById('update-message');
            if (result.status === 200 && result.body.status === "OK") {
                updateMessage.textContent = "Password changed successfully!";
                updateMessage.style.color = "green";
            } else {
                updateMessage.textContent = "Failed to change password: " + result.body.message;
                updateMessage.style.color = "red";
            }
        })
        .catch(error => {
            console.error('Error:', error);
            const updateMessage = document.getElementById('update-message');
            updateMessage.textContent = "An error occurred. Please try again.";
            updateMessage.style.color = "red";
        });
    });

    document.getElementById('back-button').addEventListener('click', function() {
        window.location.href = 'userInfo.html';
    });
});
