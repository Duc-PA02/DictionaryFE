import { getToken } from '../../service/token.js';

export async function loadUsers(page = 0, sort = 'username', direction = 'asc') {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    return await fetch(`http://localhost:8080/api/v1/admin/user?sort=${sort}&direction=${direction}&page=${page}`, requestOptions)
        .then(response => response.json())
        .catch(error => {
            console.error('Error:', error);
            throw error;
        });
}

export function displayUsers(users, userList) {
    userList.innerHTML = "";

    const table = document.createElement("table");
    table.className = "user-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Avatar</th>
                <th>Username</th>
                <th>FullName</th>
                <th>Status</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    userList.appendChild(table);

    const tbody = table.querySelector("tbody");
    users.forEach(user => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td><img src="${user.avatar ? user.avatar : 'https://via.placeholder.com/50'}" alt="Avatar" class="user-avatar"></td>
            <td>${user.username}</td>
            <td>${user.fullname}</td>
            <td>${user.status ? user.status : 'N/A'}</td>
            <td class="user-actions">
                <button class="detail-button" data-id="${user.id}">Detail</button>
            </td>
        `;
        tbody.appendChild(row);
    });

    return tbody;
}

export async function showUserDetail(userId) {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/user/${userId}`, requestOptions);
        const result = await response.json();

        if (result.status === "OK") {
            displayUserDetailModal(result.data);
        } else {
            alert(result.message || "Failed to fetch user details");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while fetching user details");
    }
}

export function displayUserDetailModal(user) {
    const mainContentArea = document.getElementById('main-content-area');
    const content = mainContentArea.querySelector('.content');
    const userDetailContent = document.getElementById('user-detail-content');
    const breadcrumb = document.getElementById('breadcrumb');

    // Hide main content and show user detail
    content.style.display = 'none';
    userDetailContent.style.display = 'block';

    // Update breadcrumb
    breadcrumb.innerHTML = `
        <a href="#" id="back-to-users"><i class="fas fa-arrow-left"></i></a>
        <span>Users / Detail</span>
    `;

    // Populate user detail content
    userDetailContent.innerHTML = `
        <h2>User Details</h2>
        <img src="${user.avatar || 'https://via.placeholder.com/100'}" alt="Avatar" class="user-avatar">
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Full Name:</strong> ${user.fullname}</p>
        <p><strong>Date of Birth:</strong> ${user.dateOfBirth}</p>
        <p><strong>Gender:</strong> ${user.gender}</p>
        <p><strong>Status:</strong> ${user.status}</p>
        <p><strong>Created At:</strong> ${formatDate(user.createdAt)}</p>
        <p><strong>Updated At:</strong> ${formatDate(user.updatedAt)}</p>
        <h3>Roles:</h3>
        <ul>
            ${user.roles.map(role => `
                <li>
                    ${role.role}
                    <ul>
                        ${role.permissions.map(perm => `
                            <li>${perm.name} (${perm.method} ${perm.path})</li>
                        `).join('')}
                    </ul>
                </li>
            `).join('')}
        </ul>
        <h3>Additional Permissions:</h3>
        <ul>
            ${user.permissions.map(perm => `
                <li>${perm.name} (${perm.method} ${perm.path})</li>
            `).join('')}
        </ul>
    `;

    // Add event listener for back button
    document.getElementById('back-to-users').addEventListener('click', function(e) {
        e.preventDefault();
        content.style.display = 'block';
        userDetailContent.style.display = 'none';
        breadcrumb.innerHTML = '';
    });
}

function formatDate(dateArray) {
    const [year, month, day, hour, minute, second] = dateArray;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}