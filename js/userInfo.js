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

    // Fetch user information
    fetch("http://localhost:8080/api/v1/user/me", {
        method: 'GET',
        headers: myHeaders,
        redirect: 'follow'
    })
    .then(response => response.json())
    .then(result => {
        if (result.status === "OK") {
            const userInfo = result.data;
            document.getElementById('username').value = userInfo.username;
            document.getElementById('email').value = userInfo.email;
            document.getElementById('fullname').value = userInfo.fullname;
            document.getElementById('dateOfBirth').value = userInfo.dateOfBirth;
            document.getElementById('avatar-preview').src = userInfo.avatar;
            document.getElementById('avatar-preview').style.display = 'block';

            const gender = userInfo.gender.toUpperCase();
            if (["MALE", "FEMALE", "OTHER"].includes(gender)) {
                document.getElementById('gender').value = gender;
            } else {
                console.error('Invalid gender value:', userInfo.gender);
            }

            // Save initial values
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
        } else {
            console.error("Failed to load user information: " + result.message);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

    // Edit button click handler
    document.getElementById('edit-button').addEventListener('click', function() {
        document.querySelectorAll('#user-info-form input:not(#username), #user-info-form select').forEach(input => {
            input.disabled = false;
        });
        document.getElementById('edit-button').style.display = 'none';
        document.getElementById('save-button').style.display = 'block';
        document.getElementById('change-avatar-button').style.display = 'block';
        document.getElementById('back-button').style.display = 'block';
    });

    // Function to format date to YYYY-MM-DD
    function formatDate(date) {
        const d = new Date(date);
        let month = '' + (d.getMonth() + 1);
        let day = '' + d.getDate();
        const year = d.getFullYear();

        if (month.length < 2) month = '0' + month;
        if (day.length < 2) day = '0' + day;

        return [year, month, day].join('-');
    }

    // Save button click handler
    document.getElementById('user-info-form').addEventListener('submit', function(event) {
        event.preventDefault();

        const email = document.getElementById('email').value;
        const fullname = document.getElementById('fullname').value;
        const dateOfBirth = document.getElementById('dateOfBirth').value;
        const gender = document.getElementById('gender').value;

        console.log("Data being sent: ", { email, fullname, dateOfBirth, gender });

        const data = {
            email: email,
            fullname: fullname,
            date_of_birth: formatDate(dateOfBirth), // Format date before sending
            gender: gender
        };

        const userId = getUserFromToken().userId;

        fetch(`http://localhost:8080/api/v1/user/update/${userId}`, {
            method: 'PUT',
            headers: myHeaders,
            body: JSON.stringify(data),
            redirect: 'follow'
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "OK") {
                console.log("User information updated successfully!");
            } else {
                console.error("Update failed: " + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });

        document.querySelectorAll('#user-info-form input, #user-info-form select').forEach(input => {
            input.disabled = true;
        });
        document.getElementById('edit-button').style.display = 'block';
        document.getElementById('save-button').style.display = 'none';
        document.getElementById('change-avatar-button').style.display = 'none';
        document.getElementById('back-button').style.display = 'none';
    });

    // Change avatar button click handler
    document.getElementById('change-avatar-button').addEventListener('click', function() {
        document.getElementById('avatar').click();
    });

    // Handle avatar file input change
    document.getElementById('avatar').addEventListener('change', function(event) {
        const fileInput = event.target;
        const formdata = new FormData();
        formdata.append("avatar", fileInput.files[0]);

        const userId = getUserFromToken().userId;

        fetch(`http://localhost:8080/api/v1/user/${userId}/avatar`, {
            method: 'PUT',
            headers: { "Authorization": `Bearer ${token}` },
            body: formdata,
            redirect: 'follow'
        })
        .then(response => response.json())
        .then(result => {
            if (result.status === "OK") {
                document.getElementById('avatar-preview').src = URL.createObjectURL(fileInput.files[0]);
            } else {
                console.error("Failed to update avatar: " + result.message);
            }
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });

    // Back button click handler
    document.getElementById('back-button').addEventListener('click', function() {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));

        if (userInfo) {
            document.getElementById('username').value = userInfo.username;
            document.getElementById('email').value = userInfo.email;
            document.getElementById('fullname').value = userInfo.fullname;
            document.getElementById('dateOfBirth').value = userInfo.dateOfBirth;
            document.getElementById('avatar-preview').src = userInfo.avatar;
            const gender = userInfo.gender.toUpperCase();
            if (["MALE", "FEMALE", "OTHER"].includes(gender)) {
                document.getElementById('gender').value = gender;
            } else {
                console.error('Invalid gender value:', userInfo.gender);
            }

            document.querySelectorAll('#user-info-form input, #user-info-form select').forEach(input => {
                input.disabled = true;
            });
            document.getElementById('edit-button').style.display = 'block';
            document.getElementById('save-button').style.display = 'none';
            document.getElementById('change-avatar-button').style.display = 'none';
            document.getElementById('back-button').style.display = 'none';
        }
    });

    // Change password button click handler
    document.getElementById('change-password-button').addEventListener('click', function() {
        window.location.href = 'changePassword.html';
    });
});
