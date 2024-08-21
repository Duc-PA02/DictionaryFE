import { getToken, getUserFromToken } from '../../service/token.js';
import { updateNotificationIcon } from './notification.js';

let currentPermissionId = null;

export async function loadPermissions(page = 0, size = 10) {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/permission?page=${page}&size=${size}`, requestOptions);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export function displayPermissions(permissions, permissionList) {
    permissionList.innerHTML = "";

    const table = document.createElement("table");
    table.className = "permission-table";
    table.innerHTML = `
        <thead>
            <tr>
                <th>Name</th>
                <th>Method</th>
                <th>Path</th>
                <th>Actions</th>
            </tr>
        </thead>
        <tbody></tbody>
    `;
    permissionList.appendChild(table);

    const tbody = table.querySelector("tbody");
    permissions.forEach(permission => {
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${permission.name}</td>
            <td>${permission.method}</td>
            <td>${permission.path}</td>
            <td class="permission-actions">
                <button class="edit-button" data-id="${permission.id}">Edit</button>
                <button class="delete-button" data-id="${permission.id}">Delete</button>
            </td>
        `;
        tbody.appendChild(row);
    });
}

export async function addPermission(name, method, path, username) {
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify({
        name: name,
        method: method,
        path: path
    });

    const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch("http://localhost:8080/api/v1/admin/permission", requestOptions);
        const result = await response.json();

        if (result.status === "OK") {
            // Tạo thông báo và lưu vào localStorage
            const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
            const notification = {
                message: `Permission added: ${result.data.name} - ${result.data.method} ${result.data.path}`,
                username: username,
                timestamp: new Date().toISOString(),
                read: false
            };
            notifications.push(notification);
            localStorage.setItem("notifications", JSON.stringify(notifications));

            // Cập nhật biểu tượng thông báo
            updateNotificationIcon();
        }

        return result;
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export async function editPermission(permissionId, updatedPermission, username) {
    if (!permissionId || isNaN(permissionId)) {
        throw new Error('ID permission không hợp lệ');
    }
    const token = getToken();
    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");
    myHeaders.append("Authorization", `Bearer ${token}`);

    const raw = JSON.stringify(updatedPermission);

    const requestOptions = {
        method: "PUT",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/permission/${permissionId}`, requestOptions);
        const result = await response.json();

        if (result.status === "OK") {
            // Create notification and save to localStorage
            const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
            const notification = {
                message: `Permission updated: ${result.data.name} - ${result.data.method} ${result.data.path}`,
                username: username,
                timestamp: new Date().toISOString(),
                read: false
            };
            notifications.push(notification);
            localStorage.setItem("notifications", JSON.stringify(notifications));

            // Update notification icon
            updateNotificationIcon();
            
            return result;
        } else {
            throw new Error(result.message || 'Failed to update permission');
        }
    } catch (error) {
        console.error('Error:', error);
        throw error;
    }
}

export async function deletePermission(permissionId) {
    const token = getToken();
    const user = getUserFromToken(token);
    const currentUsername = user.username;
    const myHeaders = new Headers();
    myHeaders.append("Authorization", `Bearer ${token}`);

    const requestOptions = {
        method: "DELETE",
        headers: myHeaders,
        redirect: "follow"
    };

    try {
        const response = await fetch(`http://localhost:8080/api/v1/admin/permission/${permissionId}`, requestOptions);
        const result = await response.json();

        const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
        
        if (response.ok) {
            notifications.push({
                username: currentUsername,
                message: `Permission deleted successfully: ${permissionId}`,
                timestamp: new Date().toISOString(),
                read: false
            });
            localStorage.setItem("notifications", JSON.stringify(notifications));
            updateNotificationIcon();
            return { success: true, message: "Permission deleted successfully" };
        } else if (response.status === 404) {
            notifications.push({
                username: currentUsername,
                message: `Permission with id ${permissionId} not found`,
                timestamp: new Date().toISOString(),
                read: false
            });
            localStorage.setItem("notifications", JSON.stringify(notifications));
            updateNotificationIcon();
            return { success: false, message: `Permission with id ${permissionId} not found` };
        } else {
            notifications.push({
                username: currentUsername,
                message: `Failed to delete permission: ${result.message}`,
                timestamp: new Date().toISOString(),
                read: false
            });
            localStorage.setItem("notifications", JSON.stringify(notifications));
            updateNotificationIcon();
            return { success: false, message: result.message };
        }
    } catch (error) {
        console.error('Error:', error);
        return { success: false, message: "An error occurred while deleting the permission" };
    }
}

export function setCurrentPermissionId(id) {
    currentPermissionId = id ? parseInt(id, 10) : null;
}

export function getCurrentPermissionId() {
    return currentPermissionId;
}