import { getToken } from '../../service/token.js';
import { loadPermissions } from './permission.js';

let currentPermissionPage = 0;

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
            const user = result.data;
            const rolesData = await loadRoles(); // Load all roles
            const permissionsData = await fetchAllPermissions(currentPermissionPage); // Load all permissions
            
            displayUserDetailModal(user, rolesData.data, permissionsData);
        } else {
            alert(result.message || "Failed to fetch user details");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while fetching user details");
    }
}

export function displayUserDetailModal(user, allRoles, allPermissions) {
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
        <span>User / Detail</span>
    `;

    // Populate user detail content
    userDetailContent.innerHTML = `
        <img src="${user.avatar || 'https://via.placeholder.com/100'}" alt="Avatar" class="user-avatar">
        <p><strong>Username:</strong> ${user.username}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>Full Name:</strong> ${user.fullname}</p>
        <p><strong>Date of Birth:</strong> ${user.dateOfBirth}</p>
        <p><strong>Gender:</strong> ${user.gender}</p>
        <p><strong>Status:</strong> 
            <select id="user-status">
                <option value="active" ${user.status === 'active' ? 'selected' : ''}>ACTIVE</option>
                <option value="inactive" ${user.status === 'inactive' ? 'selected' : ''}>INACTIVE</option>
                <option value="none" ${user.status === 'none' ? 'selected' : ''}>NONE</option>
            </select>
        </p>
        <p><strong>Created At:</strong> ${formatDate(user.createdAt)}</p>
        <p><strong>Updated At:</strong> ${formatDate(user.updatedAt)}</p>
        <h3>Roles:</h3>
        <table id="role-table">
            <thead>
                <tr>
                    <th></th>
                    <th>Role Name</th>
                    <th>Permissions</th>
                </tr>
            </thead>
            <tbody>
                ${renderRoleTableRows(allRoles, user.roles)}
            </tbody>
        </table>
        <div id="role-permission-details" style="display:none;">
            <h3>Role Permissions</h3>
            <div id="role-permission-list"></div>
        </div>
        <h3>Permissions:</h3>
        <div id="permission-list">${renderPermissionsWithPagination(allPermissions, user.permissions)}</div>
        <div id="pagination-controls">
            <button id="prev-permission-page" class="pagination-button">Previous</button>
            <span id="current-permission-page"></span>
            <button id="next-permission-page" class="pagination-button">Next</button>
        </div>
        <button id="update-user" class="update-button">Update</button>
    `;

    currentPermissionPage = 0;

    // Render permissions và cập nhật thông tin phân trang
    if (allPermissions && allPermissions.content) {
        // document.getElementById('permission-list').innerHTML = renderPermissionsWithPagination(allPermissions, user.permissions);
        updatePaginationInfo(allPermissions);
    } else {
        console.error('No permissions data available');
    }

    // Add event listener for back button
    document.getElementById('back-to-users').addEventListener('click', function(e) {
        e.preventDefault();
        content.style.display = 'block';
        userDetailContent.style.display = 'none';
        breadcrumb.innerHTML = '';
    });

    // Add event listener for update button
    document.getElementById('update-user').addEventListener('click', async function() {
        const updatedRoles = Array.from(document.querySelectorAll('#role-table input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));
        const updatedPermissions = Array.from(document.querySelectorAll('#permission-list input[type="checkbox"]:checked')).map(cb => parseInt(cb.value));

        await updateUserDetails(user.id, document.getElementById('user-status').value, updatedRoles, updatedPermissions);
    });

    // Event listener cho role detail buttons
    document.querySelectorAll('.role-detail-button').forEach(button => {
        button.addEventListener('click', function() {
            const roleId = parseInt(this.dataset.roleId);
            console.log('Role ID:', roleId); // Kiểm tra roleId khi click

            const role = allRoles.find(r => r.id === roleId);
            if (role) {
                const rolePermissionList = role.permissions.map(p => `<li>${p.method} ${p.path}</li>`).join('');
                document.getElementById('role-permission-list').innerHTML = `<ul>${rolePermissionList}</ul>`;
                document.getElementById('role-permission-details').style.display = "block";
            } else {
                console.error('Role not found.');
            }
        });
    });   
}


// Function to render checkboxes for roles
function renderRoleTableRows(allRoles, userRoles) {
    const userRoleIds = userRoles.map(role => role.id);
    return allRoles.map(role => `
        <tr>
            <td>
                <input type="checkbox" value="${role.id}" ${userRoleIds.includes(role.id) ? 'checked' : ''}>
            </td>
            <td>${role.role}</td>
            <td>
                <ul>
                    ${role.permissions.map(p => `<li>${p.name}</li>`).join('')}
                </ul>
            </td>
        </tr>
    `).join('');
}

// Function to render checkboxes for permissions
function renderPermissionsWithPagination(permissionsData, userPermissions) {
    if (!permissionsData || !Array.isArray(permissionsData.content)) {
        console.error('Invalid permissions data');
        return '';
    }

    const userPermissionIds = userPermissions.map(p => p.id);

    return permissionsData.content.map(permission => `
        <div class="permission-item">
            <label>
                <input type="checkbox" value="${permission.id}" ${userPermissionIds.includes(permission.id) ? 'checked' : ''}>
                ${permission.name}
            </label>
        </div>
    `).join('');
}

function updatePaginationInfo(permissionsData) {
    const currentPageSpan = document.getElementById('current-permission-page');
    const prevButton = document.getElementById('prev-permission-page');
    const nextButton = document.getElementById('next-permission-page');

    if (currentPageSpan && prevButton && nextButton) {
        currentPageSpan.textContent = currentPermissionPage + 1; // Hiển thị từ 1
        prevButton.disabled = currentPermissionPage === 0;
        nextButton.disabled = currentPermissionPage === permissionsData.totalPages - 1;
    } else {
        console.error('Pagination elements not found');
    }
}

export async function loadRoles() {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://localhost:8080/api/v1/admin/role", requestOptions);
        const rolesData = await response.json();
        
        console.log('Roles Data:', rolesData); // Thêm log để kiểm tra dữ liệu trả về
        
        if (rolesData.status !== "OK" || !Array.isArray(rolesData.data)) {
            throw new Error('Roles data is not in the expected format');
        }

        return rolesData;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export async function fetchAllPermissions(page = 0) {
    try {
        const response = await loadPermissions(page); // Truyền `page` vào hàm loadPermissions
        const permissionsData = response.data; // Truy cập trường data
        console.log('Permissions Data:', permissionsData);

        // Kiểm tra xem permissionsData có cấu trúc như mong đợi không
        if (permissionsData && permissionsData.content && Array.isArray(permissionsData.content)) {
            return {
                content: permissionsData.content,
                totalPages: permissionsData.totalPages || 1 // Giả định ít nhất một trang
            };
        } else {
            throw new Error('Permissions data is not in the expected format');
        }
    } catch (error) {
        console.error('Error fetching permissions:', error);
        throw error;
    }
}

// Hàm update chi tiết người dùng
async function updateUserDetails(userId, status, roleIds, permissionIds) {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify({
        status: status,
        roleIds: roleIds.map(id => parseInt(id)),
        permissionIds: permissionIds.map(id => parseInt(id))
    });

    const requestOptions = {
        method: "PATCH",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/user/${userId}`, requestOptions);
        const result = await response.json();

        if (result.status === "OK") {
            alert("User details updated successfully!");
            // Reload user details or perform any necessary actions
        } else {
            alert("Failed to update user details. Please try again.");
        }
    } catch (error) {
        console.error('Error:', error);
        alert("An error occurred while updating user details.");
    }
}

function formatDate(dateArray) {
    const [year, month, day, hour, minute, second] = dateArray;
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:${second.toString().padStart(2, '0')}`;
}