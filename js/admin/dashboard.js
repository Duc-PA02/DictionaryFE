import { getToken, getUserFromToken } from '../../service/token.js';
import { updateNotificationIcon, displayNotifications } from './notification.js';
import { 
    loadPermissions, 
    displayPermissions, 
    addPermission,
    editPermission, 
    deletePermission, 
    setCurrentPermissionId,
    getCurrentPermissionId 
} from './permission.js';

document.addEventListener("DOMContentLoaded", function() {
    const userLink = document.querySelector('.sidebar ul li a[href="#user"]');
    const settingsLink = document.querySelector('.sidebar ul li a[href="#api"]'); // Added settings link selector
    const userList = document.getElementById("user-list");
    const permissionList = document.getElementById("permission-list"); // Added permission list container
    const sortSelect = document.getElementById("sort");
    const directionSelect = document.getElementById("direction");
    const pagination = document.querySelector(".pagination");
    const userControls = document.getElementById("user-controls");
    const addPermissionModal = document.getElementById("add-permission-modal");
    const closeAddModalBtn = document.querySelector("#add-permission-modal .close-btn");
    const closeEditModalBtn = document.querySelector("#edit-permission-modal .close-btn");
    const addPermissionForm = document.getElementById("add-permission-form");
    const logoutLink = document.querySelector('.sidebar ul li a[href="#logout"]');
    const editPermissionModal = document.getElementById("edit-permission-modal");
    const editPermissionForm = document.getElementById("edit-permission-form");
    const editPermissionNameInput = document.getElementById("edit-permission-name");
    const editPermissionMethodInput = document.getElementById("edit-permission-method");
    const editPermissionPathInput = document.getElementById("edit-permission-path");
    const sidebarHeader = document.querySelector('.sidebar-header h2');
    const bellIcon = document.querySelector('.fa-bell');
    let currentPage = 0;
    
    // Set default sort and direction
    sortSelect.value = 'username';
    directionSelect.value = 'asc';

    const token = getToken();
    const user = getUserFromToken(token); // Giả sử getUserFromToken() trả về một đối tượng chứa thông tin người dùng

    if (user && user.username) {
        sidebarHeader.textContent = user.username;
    } else {
        sidebarHeader.textContent = "Guest"; // Trường hợp không có user, hiển thị mặc định là "Guest"
    }

    userLink.addEventListener("click", function() {
        userControls.style.display = "flex";
        permissionList.style.display = "none";
        userList.style.display = "block";
        addPermissionBtn.style.display = "none";
        loadUsers();
    });

    settingsLink.addEventListener("click", function() {
        userControls.style.display = "none";
        userList.style.display = "none";
        permissionList.style.display = "block";
        loadPermissionsAndDisplay();
    });

    sortSelect.addEventListener("change", function() {
        loadUsers();
    });

    directionSelect.addEventListener("change", function() {
        loadUsers();
    });

    // Sự kiện click để đóng modal edit
    closeEditModalBtn.addEventListener("click", function() {
        editPermissionModal.style.display = "none";
    });

    closeAddModalBtn.addEventListener("click", function() {
        addPermissionModal.style.display = "none";
    });

    window.addEventListener("click", function(event) {
        const notificationList = document.getElementById("notification-list");
        if (!event.target.closest('.fa-bell') && !event.target.closest('.notification-list')) {
            notificationList.style.display = "none";
        }else if (event.target == addPermissionModal) {
            addPermissionModal.style.display = "none";
        } else if (event.target == editPermissionModal){
            editPermissionModal.style.display = "none";
        }
    });

    function loadUsers(page = 0) {
        currentPage = page;
        const sort = sortSelect.value;
        const direction = directionSelect.value;
        const token = getToken();
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);

        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };

        fetch(`http://localhost:8080/api/v1/admin/user?sort=${sort}&direction=${direction}&page=${page}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                displayUsers(result.data.content);
                setupPagination(result.data.totalPages, loadUsers);
            })
            .catch(error => console.error('Error:', error));
    }

    function displayUsers(users) {
        userList.innerHTML = "";
    
        const table = document.createElement("table");
        table.className = "user-table";
        table.innerHTML = `
            <thead>
                <tr>
                    <th>Avatar</th>
                    <th>Username</th>
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
                <td>${user.status ? user.status : 'N/A'}</td>
                <td class="user-actions">
                    <button class="detail-button" data-id="${user.id}">Detail</button>
                </td>
            `;
            tbody.appendChild(row);
        });
    
        // Gắn sự kiện cho nút "Detail"
        tbody.addEventListener("click", function(event) {
            if (event.target.classList.contains("detail-button")) {
                const userId = event.target.dataset.id;
                // Thực hiện hành động khi nhấn vào nút "Detail"
                showUserDetail(userId);
            }
        });
    }
    

    async function loadPermissionsAndDisplay(page = 0) {
        try {
            const result = await loadPermissions(page);
            displayPermissions(result.data.content, permissionList);
            setupPagination(result.data.totalPages, loadPermissionsAndDisplay);
        } catch (error) {
            console.error('Error:', error);
        }
    }
    
    addPermissionForm.addEventListener("submit", async function(event) {
        event.preventDefault();
        const name = document.getElementById("permission-name").value;
        const method = document.getElementById("permission-method").value;
        const path = document.getElementById("permission-path").value;
    
        const token = getToken();
        const user = getUserFromToken(token);
        const username = user ? user.username : 'Unknown';
    
        try {
            const result = await addPermission(name, method, path, username);
            if (result.status === "OK") {
                addPermissionModal.style.display = "none";
                loadPermissionsAndDisplay();
                alert("Add Permission successfully!");
                addPermissionForm.reset();
            } else {
                console.error('Error:', result);
                alert("Failed to add permission. Please try again.");
            }
        } catch (error) {
            console.error('Error:', error);
            alert("An error occurred. Please try again.");
        }
    });
    
    // edit permission
    editPermissionForm.addEventListener("submit", function(event) {
        event.preventDefault();
        
        const currentId = getCurrentPermissionId();
        if (!currentId || isNaN(currentId)) {
            alert("Không có quyền nào được chọn để chỉnh sửa hoặc ID không hợp lệ");
            return;
        }
    
        const updatedPermission = {
            name: editPermissionNameInput.value,
            method: editPermissionMethodInput.value,
            path: editPermissionPathInput.value
        };
    
        const token = getToken();
        const user = getUserFromToken(token);
        const username = user ? user.username : 'Unknown';
    
        editPermission(currentId, updatedPermission, username)
            .then(result => {
                if (result.status === "OK") {
                    editPermissionModal.style.display = "none";
                    loadPermissionsAndDisplay();
                    alert("Permission updated successfully!");
                } else {
                    console.error('Error:', result);
                    alert("Failed to update permission. Please try again.");
                }
            })
            .catch(error => {
                console.error('Error:', error);
                alert("An error occurred while updating the permission.");
            });
    });
    
    // delete permission
    function deletePermissionHandler(permissionId) {
        if (confirm("Are you sure you want to delete this permission?")) {
            deletePermission(permissionId)
                .then(result => {
                    if (result.success) {
                        loadPermissionsAndDisplay();
                        alert(result.message);
                    } else {
                        alert(result.message);
                        if (result.message.includes("not found")) {
                            // Nếu permission không tồn tại, vẫn nên tải lại danh sách
                            loadPermissionsAndDisplay();
                        }
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    alert("An error occurred while deleting the permission.");
                });
        }
    }

    permissionList.addEventListener("click", function(event) {
        if (event.target.classList.contains("add-permission-btn")) {
            addPermissionModal.style.display = "block";
        }
        else if (event.target.classList.contains("edit-button")) {
            const permissionId = event.target.dataset.id;
            const permissionRow = event.target.closest('tr');
            const permissionName = permissionRow.cells[0].textContent;
            const permissionMethod = permissionRow.cells[1].textContent;
            const permissionPath = permissionRow.cells[2].textContent;
    
            setCurrentPermissionId(permissionId);
            document.getElementById("edit-permission-name").value = permissionName;
            document.getElementById("edit-permission-method").value = permissionMethod;
            document.getElementById("edit-permission-path").value = permissionPath;
            document.getElementById("edit-permission-modal").style.display = "block";
        } else if (event.target.classList.contains("delete-button")) {
            const permissionId = event.target.dataset.id;
            deletePermissionHandler(permissionId);
        }
    });

    function setupPagination(totalPages, callback) {
        pagination.innerHTML = "";
        for (let i = 0; i < totalPages; i++) {
            const button = document.createElement("button");
            button.textContent = i + 1;
            button.addEventListener("click", () => callback(i));
            pagination.appendChild(button);
        }
    }  
    
    logoutLink.addEventListener("click", function(event) {
        event.preventDefault(); // Ngăn chặn hành vi mặc định của link
    
        // Xóa token từ localStorage
        localStorage.removeItem('token');
    
        // Chuyển hướng về trang home.html
        window.location.href = 'home.html';
    });

    bellIcon.addEventListener("click", function() {
        displayNotifications(user);
    });

    loadUsers();
    updateNotificationIcon();
});
