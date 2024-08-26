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
import { loadUsers, displayUsers, showUserDetail } from './user.js';
import { start } from './word_management/word-management.js';

document.addEventListener("DOMContentLoaded", function() {
    const topicLink = document.querySelector('.sidebar ul li a[href="#topic"]');
    const userLink = document.querySelector('.sidebar ul li a[href="#user"]');
    const apiLink = document.querySelector('.sidebar ul li a[href="#api"]');
    const wordLink = document.querySelector('.sidebar ul li a[href="#word"]');
    const contentWraperWordManage = document.querySelector(".content-wrapper");
    const paginationContainer = document.querySelector(".pagination-container");

    const wordLabel = document.querySelector("#word-label");
    const typeSection = document.querySelector("#type-section");
    const modalType = document.querySelector(".modal-type");
    const antonymSection = document.querySelector("#antonym-section");
    const synonymSection = document.querySelector("#synonym-section");

    const topicList = document.getElementById("topic-list");
    const userList = document.getElementById("user-list");
    const permissionList = document.getElementById("permission-list");
    const sortSelect = document.getElementById("sort");
    const directionSelect = document.getElementById("direction");
    const pagination = document.querySelector(".pagination");
    const userControls = document.getElementById("user-controls");
    const addPermissionBtn = document.getElementById("add-permission-btn");
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
    const topicWord = document.getElementById("topic-word");
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

    userLink.addEventListener("click", function(e) {
        e.preventDefault();
        resetDisplayState();
        userControls.style.display = "flex";
        userList.style.display = "block";
        breadcrumb.innerHTML = '';
        pagination.style.display = "";
        topicList.style.display = "none";
        topicWord.style.display = "none";
        loadAndDisplayUsers();
    });
    
    apiLink.addEventListener("click", function(e) {
        e.preventDefault();
        resetDisplayState();
        permissionList.style.display = "block";
        addPermissionBtn.style.display = "block";
        breadcrumb.innerHTML = '';
        pagination.style.display = "";
        topicList.style.display = "none";
        topicWord.style.display = "none";
        loadPermissionsAndDisplay();
    });

    wordLink.addEventListener("click", function(event){
        event.preventDefault();
        resetDisplayState();
        contentWraperWordManage.style.display="block";
        paginationContainer.style.display = "flex";
        topicList.style.display = "none";
        topicWord.style.display = "none";
        start(renderWordDetail);
    })

    topicLink.addEventListener("click", function(event){
        event.preventDefault();
        resetDisplayState();
        userControls.style.display = "none";
        userList.style.display = "none";
        permissionList.style.display = "none";
        addPermissionBtn.style.display = "none";
        topicList.style.display = "block";
        topicWord.style.display = "none";
        contentWraperWordManage.style.display="none";
        paginationContainer.style.display = "none";
        //reset word-detail
        wordLabel.style.display = "none"
        typeSection.style.display = "none"
        modalType.style.display = "none"
        antonymSection.style.display = "none"
        synonymSection.style.display = "none"
        pagination.style.display = "flex";
    });

    function renderWordDetail(){
        resetDisplayState();
        wordLabel.style.display = ""
        typeSection.style.display = ""
        modalType.style.display = ""
        antonymSection.style.display = ""
        synonymSection.style.display = ""
    }
    
    function resetDisplayState() {
        document.querySelector('.content').style.display = 'block';
        document.getElementById('user-detail-content').style.display = 'none';
        userControls.style.display = "none";
        userList.style.display = "none";
        permissionList.style.display = "none";
        addPermissionBtn.style.display = "none";
        pagination.style.display = "none"
        // reset word-management
        contentWraperWordManage.style.display="none";
        paginationContainer.style.display = "none";
        //reset word-detail
        wordLabel.style.display = "none"
        typeSection.style.display = "none"
        modalType.style.display = "none"
        antonymSection.style.display = "none"
        synonymSection.style.display = "none"

        //topic
        topicList.style.display = "none"
        
    }

    sortSelect.addEventListener("change", function() {
        loadAndDisplayUsers();
    });

    directionSelect.addEventListener("change", function() {
        loadAndDisplayUsers();
    });

    addPermissionBtn.addEventListener("click", function() {
        addPermissionModal.style.display = "block";
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
    
    async function loadAndDisplayUsers(page = 0) {
        try {
            const sort = sortSelect.value;
            const direction = directionSelect.value;
            const result = await loadUsers(page, sort, direction);
            const tbody = displayUsers(result.data.content, userList);
            setupPagination(result.data.totalPages, loadAndDisplayUsers);

            // Gắn sự kiện cho nút "Detail"
            tbody.addEventListener("click", function(event) {
                if (event.target.classList.contains("detail-button")) {
                    const userId = event.target.dataset.id;
                    showUserDetail(userId);
                }
            });
        } catch (error) {
            console.error('Error:', error);
        }
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
        if (event.target.classList.contains("edit-button")) {
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
        const maxPagesToShow = 3;
        let startPage = 0;
        let endPage = totalPages;
    
        // Xác định startPage và endPage để giới hạn số trang hiển thị
        if (totalPages > maxPagesToShow) {
            const half = Math.floor(maxPagesToShow / 2);
            startPage = Math.max(0, Math.min(totalPages - maxPagesToShow, currentPage - half));
            endPage = startPage + maxPagesToShow;
        }
    
        // Nút "Đầu"
        if (currentPage > 0) {
            const firstButton = document.createElement("button");
            firstButton.textContent = "«";
            firstButton.addEventListener("click", () => {
                currentPage = 0;
                callback(currentPage);
                setupPagination(totalPages, callback);
            });
            pagination.appendChild(firstButton);
        }
    
        // Nút "Trước"
        if (currentPage > 0) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "‹";
            prevButton.addEventListener("click", () => {
                currentPage--;
                callback(currentPage);
                setupPagination(totalPages, callback);
            });
            pagination.appendChild(prevButton);
        }
    
        // Tạo các nút cho các trang
        for (let i = startPage; i < endPage; i++) {
            const button = document.createElement("button");
            button.textContent = i + 1;
    
            // Đánh dấu trang hiện tại
            if (i === currentPage) {
                button.classList.add("active");
            }
    
            button.addEventListener("click", () => {
                currentPage = i;
                callback(currentPage);
                setupPagination(totalPages, callback);
            });
    
            pagination.appendChild(button);
        }
    
        // Nút "Tiếp theo"
        if (currentPage < totalPages - 1) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "›";
            nextButton.addEventListener("click", () => {
                currentPage++;
                callback(currentPage);
                setupPagination(totalPages, callback);
            });
            pagination.appendChild(nextButton);
        }
    
        // Nút "Cuối"
        if (currentPage < totalPages - 1) {
            const lastButton = document.createElement("button");
            lastButton.textContent = "»";
            lastButton.addEventListener("click", () => {
                currentPage = totalPages - 1;
                callback(currentPage);
                setupPagination(totalPages, callback);
            });
            pagination.appendChild(lastButton);
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
    loadAndDisplayUsers();
    updateNotificationIcon();
});