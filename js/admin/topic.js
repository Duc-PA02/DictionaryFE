import { getToken, getUserFromToken } from '../../service/token.js';
document.addEventListener("DOMContentLoaded", function() {
    const userLink = document.querySelector('.sidebar ul li a[href="#user"]');
    const settingsLink = document.querySelector('.sidebar ul li a[href="#api"]'); // Added settings link selector
    
    const wordLink = document.querySelector('.sidebar ul li a[href="#word"]');
    const contentWraperWordManage = document.querySelector(".content-wrapper");
    const paginationContainer = document.querySelector(".pagination-container");

    const wordLabel = document.querySelector("#word-label");
    const typeSection = document.querySelector("#type-section");
    const modalType = document.querySelector(".modal-type");
    const antonymSection = document.querySelector("#antonym-section");
    const synonymSection = document.querySelector("#synonym-section");

    // vnp
    const topicLink = document.querySelector('.sidebar ul li a[href="#topic"]');
    const topicList = document.getElementById("topic-list");
    const addTopicModal = document.getElementById("add-topic-modal");
    const addTopicWordModal = document.getElementById("add-topic-word-modal");
    const closeAddTopicModalBtn = document.querySelector("#add-topic-modal .close-btn");
    const closeAddTopicWordModalBtn = document.querySelector("#add-topic-word-modal .close-btn");
    const addTopicForm = document.getElementById("add-topic-form");
    const addTopicWordForm = document.getElementById("add-topic-word-form");
    const topicWord = document.getElementById("topic-word");
    const editTopicModal = document.getElementById("edit-topic-modal");
    const closeEditTopicModalBtn = document.querySelector("#edit-topic-modal .close-btn");
    const editTopicForm = document.getElementById("edit-topic-form");
    const userList = document.getElementById("user-list");
    const permissionList = document.getElementById("permission-list"); // Added permission list container
    const sortSelect = document.getElementById("sort");
    const directionSelect = document.getElementById("direction");
    const paginationT = document.querySelector(".pagination");
    const userControls = document.getElementById("user-controls");
    const addPermissionBtn = document.getElementById("add-permission-btn");
    const sidebarHeader = document.querySelector('.sidebar-header h2');
    const searchButton = document.getElementById("searchButton");
    const contentDiv = document.getElementById("contentSearchAddTopic");

    
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

    let keyword = "";
    let sortDirection = "date_ascending";

    topicLink.addEventListener("click", function(){
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
        paginationT.style.display = "flex";
        loadTopics(currentPage);
    });

    function loadTopics(pageNumber = 0){
        const token = getToken();
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/admin/topic?name=${keyword}&sortDirection=${sortDirection}&pageNumber=${pageNumber}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    displayTopics(result.data.content);
                    setupPagination(result.data.totalPages, loadTopics);
                } else {
                    console.error(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displayTopics(topics) {
        topicList.innerHTML = "";
        // Thêm phần input và button để thêm topic
        const addTopicContainer = document.createElement("div");
        addTopicContainer.classList.add("add-topic-container");

        const inputSearchGroup = document.createElement("div");
        inputSearchGroup.classList.add("input-search-group");

        const topicInput = document.createElement("input");
        topicInput.type = "text";
        topicInput.value = keyword;
        topicInput.placeholder = "Enter topic name";
        topicInput.id = "nameSearch";

        const searchButton = document.createElement("button");
        searchButton.textContent = "Search";
        searchButton.id = "searchBtn";

        inputSearchGroup.appendChild(topicInput);
        inputSearchGroup.appendChild(searchButton);

        const addTopicGroup = document.createElement("div");
        addTopicGroup.classList.add("add-topic-group");

        const addButton = document.createElement("button");
        addButton.textContent = "Add Topic";
        addButton.id = "addTopicBtn";

        //addButton.onclick = () => addTopic(topicInput.value); // Hàm thêm topic
        addButton.addEventListener("click", function() {
            addTopicModal.style.display = "block";
            document.getElementById("topic-name").value="";
        });

        const selection = document.createElement("select");
        selection.id = "topicSelection";
        // Thêm các option vào selection
        const options = ["date_ascending", "date_descending", "dictionary_asc", "dictionary_desc"];
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.textContent = optionText;
            selection.appendChild(option);
        });
        selection.value = sortDirection;

        searchButton.onclick = () => {
            currentPage = 0;
            keyword = topicInput.value;
            sortDirection = selection.value;
            loadTopics(0);
        };

        selection.addEventListener("change", () => {
            keyword = topicInput.value;
            sortDirection = selection.value;
            loadTopics(0);
        });

        // Thêm các nhóm vào container
        addTopicGroup.appendChild(addButton);
        addTopicGroup.appendChild(selection);

        addTopicContainer.appendChild(inputSearchGroup);
        addTopicContainer.appendChild(addTopicGroup);
        topicList.appendChild(addTopicContainer);
        // Tạo bảng
        const table = document.createElement("table");
        table.classList.add("topic-table");
    
        // Tạo tiêu đề bảng
        const header = table.createTHead();
        const headerRow = header.insertRow(0);
        const headers = ["ID", "Name", "Created By", "Created At", "Updated By", "Updated At", "Actions"];
        
        headers.forEach((headerText) => {
            const cell = headerRow.insertCell();
            cell.textContent = headerText;
        });
    
        // Tạo thân bảng
        const body = table.createTBody();
    
        topics.forEach(topic => {
            const row = body.insertRow();
    
            const topicIdCell = row.insertCell();
            topicIdCell.textContent = topic.id;
    
            const topicNameCell = row.insertCell();
            topicNameCell.textContent = topic.name;
    
            const createdByCell = row.insertCell();
            createdByCell.textContent = `${topic.creat_by.fullname} (${topic.creat_by.username})`;
    
            const createdAtCell = row.insertCell();
            createdAtCell.textContent = new Date(topic.creat_at).toLocaleString();
    
            const updatedByCell = row.insertCell();
            updatedByCell.textContent = topic.update_by ? `${topic.update_by.fullname} (${topic.update_by.username})` : 'N/A';
    
            const updatedAtCell = row.insertCell();
            updatedAtCell.textContent = topic.update_at ? new Date(topic.update_at).toLocaleString() : "N/A";
    
            // Tạo cột Actions
            const actionsCell = row.insertCell();
            const detailButton = document.createElement("button");
            detailButton.id= "detailTopicBtn";
            detailButton.textContent = "Detail";
            detailButton.onclick = () => showDetails(topic.id); // Thay thế bằng hàm thực hiện
            actionsCell.appendChild(detailButton);
    
            const deleteButtonTopic = document.createElement("button");
            deleteButtonTopic.id = "deleteTopicBtn";
            deleteButtonTopic.textContent = "Delete";
            //deleteButtonTopic.onclick = () => deleteTopic(topic.id); // Thay thế bằng hàm thực hiện
            deleteButtonTopic.addEventListener("click", function() {
                if (confirm("Are you sure you want to delete this topic?")) {
                    deleteTopic(topic.id);
                }
            });
            actionsCell.appendChild(deleteButtonTopic);
        });
    
        topicList.appendChild(table);
    }
    
    // Hàm giả định để xử lý chi tiết và xóa topic
    let topicIdDetail = "";
    function showDetails(topicId) {
        console.log(`Showing details for topic ID: ${topicId}`);
        userControls.style.display = "none";
        userList.style.display = "none";
        permissionList.style.display = "none";
        addPermissionBtn.style.display = "none";
        topicList.style.display = "none";
        topicWord.style.display = "block";
        paginationT.style.display = "none";
        topicIdDetail = topicId;
        loadTopicWord(topicId);
    }
    
    closeAddTopicModalBtn.addEventListener("click", function() {
        addTopicModal.style.display = "none";
    });

    addTopicForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("topic-name").value;
        const token = getToken();
        const user = getUserFromToken(token);
        const currentUsername = user.username;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);

        const raw = JSON.stringify({ "name": name });
        
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`http://localhost:8080/api/v1/admin/topic/${user.userId}`, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    console.log(result);
                    if (result.success) {
                        addTopicModal.style.display = "none";
                        loadTopics(0);
                        alert("Add topic success!"); 
                    } else {
                        alert(result.message);
                    }
                })
                .catch((error) => console.error('Error:', error));
    });

    function deleteTopic(topicId) {
        console.log(`Deleting topic ID: ${topicId}`);
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
        fetch(`http://localhost:8080/api/v1/admin/topic/${topicId}`, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    if (result.success) {
                        loadTopics(currentPage);
                    } else {
                        alert(result.message);
                    }
                })
                .catch((error) => console.error('Error:', error));
    }

    let keywordTW = "";
    let sortDirectionTW = "date_ascending";
    function loadTopicWord(topicId){
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/admin/topicword/${encodeURIComponent(topicId)}?name=${keywordTW}&sortDirection=${sortDirectionTW}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.data.length > 0) {
                    keywordTW="";
                    displayTopicWord(result.data);
                } else {
                    loadTopicsNoneWord(topicId);
                }
            })
            .catch(error => console.error('Error:', error));
    }
    function loadTopicsNoneWord(topicId){
        const token = getToken();
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/admin/topic/${topicId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    keywordTW="";
                    displayTopicWordWithNoneWord(result.data);
                } else {
                    console.error(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }
    function displayTopicWordWithNoneWord(topic){
        topicWord.innerHTML = "";
        const topicHeader = document.createElement('h3');
        topicHeader.innerHTML = `Topic: ${topic.name} <button id="editTopicBtn" style="background: none; border: none; cursor: pointer; font-size: 18px;">✏️</button>`;
        topicWord.appendChild(topicHeader);

        document.getElementById('editTopicBtn').onclick = () => {
            editTopicModal.style.display = "block";
        };
    
        // Thêm thông tin chi tiết topic
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <p id="creat_byN">Created By: ${topic.creat_by.fullname} (${topic.creat_by.username})</p>
            <p id="creat_atN">Created At: ${topic.creat_at ? new Date(topic.creat_at).toLocaleString() : "N/A"}</p>
            <p id="update_byN">Updated By: ${topic.update_by ? topic.update_by.fullname : 'N/A'} (${topic.update_by ? topic.update_by.username : 'N/A'})</p>
            <p id="update_atN">Updated At: ${topic.update_at ? new Date(topic.update_at).toLocaleString() : "N/A"}</p>
            <p id="totalWordsN">Total: 0</p>
        `;
        topicWord.appendChild(infoDiv);
        const addTopicWordContainer = document.createElement("div");
        addTopicWordContainer.classList.add("add-topic-word-container");

        const inputSearchGroup = document.createElement("div");
        inputSearchGroup.classList.add("input-search-group");

        const wordInput = document.createElement("input");
        wordInput.type = "text";
        wordInput.value = keyword;
        wordInput.placeholder = "Enter topic name";
        wordInput.id = "nameSearch";

        const searchButton = document.createElement("button");
        searchButton.textContent = "Search";
        searchButton.id = "searchTopicWordBtn";

        inputSearchGroup.appendChild(wordInput);
        inputSearchGroup.appendChild(searchButton);

        const addTopicWordGroup = document.createElement("div");
        addTopicWordGroup.classList.add("add-word-group");

        const addButton = document.createElement("button");
        addButton.textContent = "Add Word";
        addButton.id = "addTopicWoredBtn";

        //addButton.onclick = () => addTopic(topicInput.value); // Hàm thêm topic
        addButton.addEventListener("click", function() {
            addTopicWordModal.style.display = "block";
            document.getElementById("searchWordAddTopic").value = "";
        });

        const selection = document.createElement("select");
        selection.id = "topicWordSelection";
        // Thêm các option vào selection
        const options = ["date_ascending", "date_descending", "dictionary_asc", "dictionary_desc"];
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.textContent = optionText;
            selection.appendChild(option);
        });

        searchButton.onclick = () => {
            keywordTW = wordInput.value;
            sortDirectionTW = selection.value;
            loadTopicWord(topic.id, keywordTW, sortDirectionTW);
        };

        selection.addEventListener("change", () => {
            keywordTW = wordInput.value;
            sortDirectionTW = selection.value;
            loadTopicWord(topic.id, keywordTW, sortDirectionTW);
        });
        selection.value = sortDirectionTW;
        wordInput.value = keywordTW;
        // Thêm các nhóm vào container
        addTopicWordGroup.appendChild(addButton);
        addTopicWordGroup.appendChild(selection);

        addTopicWordContainer.appendChild(inputSearchGroup);
        addTopicWordContainer.appendChild(addTopicWordGroup);
        topicWord.appendChild(addTopicWordContainer);
        
    }

    closeAddTopicWordModalBtn.addEventListener("click", function() {
        addTopicWordModal.style.display = "none";
        userControls.style.display = "none";
        userList.style.display = "none";
        permissionList.style.display = "none";
        addPermissionBtn.style.display = "none";
        topicList.style.display = "none";
        topicWord.style.display = "block";
        paginationT.style.display = "none";
        loadTopicWord(topicIdDetail);
    });

    function displayTopicWord(data) {
        topicWord.innerHTML = ""; 
    
        if (data.length === 0) {
            topicWord.innerHTML = "<p>No words found for this topic.</p>";
            return;
        }
    
        const topic = data[0].topic;
    
        const topicHeader = document.createElement('h3');
        topicHeader.innerHTML = `Topic: ${topic.name} <button id="editTopicBtn" style="background: none; border: none; cursor: pointer; font-size: 18px;">✏️</button>`;
        topicWord.appendChild(topicHeader);

        document.getElementById('editTopicBtn').onclick = () => {
            editTopicModal.style.display = "block";
            document.getElementById("topic-name-edit").value=topic.name;
        };
    
        // Thêm thông tin chi tiết topic
        const infoDiv = document.createElement('div');
        infoDiv.innerHTML = `
            <p id="creat_by">Created By: ${topic.creat_by.fullname} (${topic.creat_by.username})</p>
            <p id="creat_at">Created At: ${new Date(topic.creat_at).toLocaleString()}</p>
            <p id="update_by">Updated By: ${topic.update_by ? topic.update_by.fullname : 'N/A'} (${topic.update_by ? topic.update_by.username : 'N/A'})</p>
            <p id="update_at">Updated At: ${new Date(topic.update_at).toLocaleString()}</p>
            <p id="totalWords">Total: ${data.length}</p>
        `;
        topicWord.appendChild(infoDiv);
        
        const addTopicWordContainer = document.createElement("div");
        addTopicWordContainer.classList.add("add-topic-word-container");

        const inputSearchGroup = document.createElement("div");
        inputSearchGroup.classList.add("input-search-group");

        const wordInput = document.createElement("input");
        wordInput.type = "text";
        wordInput.value = keyword;
        wordInput.placeholder = "Enter topic name";
        wordInput.id = "nameSearch";

        const searchButton = document.createElement("button");
        searchButton.textContent = "Search";
        searchButton.id = "searchTopicWordBtn";

        inputSearchGroup.appendChild(wordInput);
        inputSearchGroup.appendChild(searchButton);

        const addTopicWordGroup = document.createElement("div");
        addTopicWordGroup.classList.add("add-word-group");

        const addButton = document.createElement("button");
        addButton.textContent = "Add Word";
        addButton.id = "addTopicWoredBtn";

        //addButton.onclick = () => addTopic(topicInput.value); // Hàm thêm topic
        addButton.addEventListener("click", function() {
            addTopicWordModal.style.display = "block";
            document.getElementById("searchWordAddTopic").value = "";
        });

        const selection = document.createElement("select");
        selection.id = "topicWordSelection";
        // Thêm các option vào selection
        const options = ["date_ascending", "date_descending", "dictionary_asc", "dictionary_desc"];
        options.forEach(optionText => {
            const option = document.createElement("option");
            option.value = optionText;
            option.textContent = optionText;
            selection.appendChild(option);
        });

        searchButton.onclick = () => {
            keywordTW = wordInput.value;
            sortDirectionTW = selection.value;
            loadTopicWord(topic.id, keywordTW, sortDirectionTW);
        };

        selection.addEventListener("change", () => {
            keywordTW = wordInput.value;
            sortDirectionTW = selection.value;
            loadTopicWord(topic.id, keywordTW, sortDirectionTW);
        });
        selection.value = sortDirectionTW;
        wordInput.value = keywordTW;
        // Thêm các nhóm vào container
        addTopicWordGroup.appendChild(addButton);
        addTopicWordGroup.appendChild(selection);

        addTopicWordContainer.appendChild(inputSearchGroup);
        addTopicWordContainer.appendChild(addTopicWordGroup);
        topicWord.appendChild(addTopicWordContainer);
        
        const wordList = document.createElement('ul');
    
        // Duyệt qua danh sách từ và thêm vào danh sách
        data.forEach(item => {
            const listItem = document.createElement('li');
    
            // Tạo liên kết cho từ
            const wordLink = document.createElement('a');
            wordLink.textContent = item.word.name;
            wordLink.href = `#`;
            wordLink.onclick = (event) => {
                event.preventDefault(); // Ngăn chặn hành động mặc định
                addTopicWordModal.style.display = "block";
                document.getElementById("searchWordAddTopic").value = "";
                loadSearchWord(item.word.name);
            };
    
            // Tạo nút xóa
            const deleteButton = document.createElement('img');
            deleteButton.src = '../Image/deleteBtnF.png';
            deleteButton.alt = 'Delete';
            deleteButton.id="deleteBtnTopicWord"
            deleteButton.style.width = '20px';
            deleteButton.onclick = () => {
                deleteTopicWord(item.id);
            };
    
            // Thêm liên kết và nút xóa vào listItem
            listItem.appendChild(wordLink);
            listItem.appendChild(deleteButton);
            wordList.appendChild(listItem);
        });
    
        // Thêm danh sách từ vào container
        topicWord.appendChild(wordList);
    }

    closeEditTopicModalBtn.addEventListener("click", function() {
        editTopicModal.style.display = "none";
    });
    editTopicForm.addEventListener("submit", function(event) {
        event.preventDefault();
        const name = document.getElementById("topic-name-edit").value;
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        myHeaders.append("Authorization", `Bearer ${token}`);
        const raw = JSON.stringify({ "name": name });
        
        const requestOptions = {
            method: "PUT",
            headers: myHeaders,
            body: raw,
            redirect: "follow"
        };

        fetch(`http://localhost:8080/api/v1/admin/topic/${user.userId}/${topicIdDetail}`, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    console.log(result);
                    if (result.success) {
                        editTopicModal.style.display = "none";
                        showDetails(topicIdDetail);
                    } else {
                        alert(result.message);
                    }
                })
                .catch((error) => console.error('Error:', error));
    });

    
    function deleteTopicWord(twid){
        if (confirm("Are you sure you want to delete this word?")) {
            const myHeaders = new Headers();
            myHeaders.append("Authorization", `Bearer ${token}`);
            const requestOptions = {
                method: "DELETE",
                headers: myHeaders,
                redirect: "follow"
            };
            fetch(`http://localhost:8080/api/v1/admin/topicword/${twid}`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(result => {
                if (result.success) {
                    console.log('Topic word deleted successfully');
                    loadTopicWord(topicIdDetail, keywordTW, sortDirectionTW);
                } else {
                    console.error(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
        } else {
            console.log("Delete action canceled.");
        }
    }

    let currentPage = 0;
    function setupPagination(totalPages, callback) {
        paginationT.innerHTML = "";
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
            paginationT.appendChild(firstButton);
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
            paginationT.appendChild(prevButton);
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
    
            paginationT.appendChild(button);
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
            paginationT.appendChild(nextButton);
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
            paginationT.appendChild(lastButton);
        }
    }


    //search từ:

    searchButton.onclick = function() {
        const query = document.getElementById("searchWordAddTopic").value.trim();
        if (query) {
            loadSearchWord(query); // Gọi hàm với giá trị input
        } else {
            console.log("Please enter a search term.");
        }
    };

    function loadSearchWord(query){
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/dictionary/english/search/${encodeURIComponent(query)}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    displaySearchWord(result.data);
                } else {
                    console.error(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }

    function displaySearchWord(data){
        contentDiv.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <h6>Mean of ${data.name} in English</h6>
                    <a href="#" onclick="addWordToTheTopic(${user.userId},${topicIdDetail},${data.id})" style="text-decoration: none; color: #007bff;">
                        <i class="fas fa-star"></i> Add Word to the topic
                    </a>
                </div>`;
        let name = data.name;
        data.typeList.forEach(type => {
            contentDiv.innerHTML += `<div class="section"><h2>${name}</h2><i>${type.type}</i>`;
            contentDiv.innerHTML += '<div class="audio-icons">';
            type.pronunciationsList.forEach(pron => {
                contentDiv.innerHTML += `
                    <span>${pron.region}: 
                        <i class="fas fa-volume-up audio-icon" onclick="playAudio('${pron.audio}')"></i>
                        <i style="margin-right: 10px;">/${pron.pronunciation}/</i>
                    </span>`;
            });
            contentDiv.innerHTML += '</div>';

            contentDiv.innerHTML += '<ul>';
            type.definitionsList.forEach(def => {
                let examplesArray = def.examples.split('-');
                let formattedExamples = examplesArray.join('<br/>');
                contentDiv.innerHTML += `<li> 
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="blue" class="bi bi-box-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.004-.001.274-.11a.75.75 0 0 1 .558 0l.274.11.004.001zm-1.374.527L8 5.962 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339Z"></path>
                    </svg> 
                    <strong>${def.definition}</strong> 
                    <hr/> ${formattedExamples} 
                </li>`;
            });
            contentDiv.innerHTML += '</ul></div>';
        });
        contentDiv.innerHTML += '<div class="section"><h3>Synonyms:</h3>';
        data.synonymsList.forEach(syn => {
            contentDiv.innerHTML += `<a href="#" onclick="fetchWord('${syn.synonym.name}')">${syn.synonym.name}</a>, `;
        });
        contentDiv.innerHTML += '</div>';

        contentDiv.innerHTML += '<div class="section"><h3>Antonyms:</h3>';
        data.antonymsList.forEach(ant => {
            contentDiv.innerHTML += `<a href="#" onclick="fetchWord('${ant.antonym.name}')">${ant.antonym.name}</a>, `;
        });
        contentDiv.innerHTML += '</div>';
    }

    window.playAudio = function(src) {
        const audio = new Audio(src);
        audio.play();
    }

    window.addWordToTheTopic = function(uid, tid, wid) {
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/admin/topicword/${uid}/${tid}/${wid}`, requestOptions)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            const message = data.message;
            showMessageModal(message);
        })
        .catch(error => {
            console.error('Error:', error);
            showMessageModal('An error occurred while adding to topic.');
        });
    }
    window.showMessageModal=function(message) {
        const modal = document.getElementById('messageModal');
        const modalMessage = document.getElementById('modalMessage');
        modalMessage.textContent = message;
        modal.style.display = 'block';
    }

    window.closeModal=function() {
        const modal = document.getElementById('messageModal');
        modal.style.display = 'none';
    }
})

