import { getToken, getUserFromToken } from '../service/token.js';
let keyword = "";
let currentSortDirection = 'date_ascending';
let sortDirection = "";
const token = getToken();
const user = getUserFromToken(token);
document.getElementById('searchInput').addEventListener('input', function() {
    keyword = this.value; // Cập nhật giá trị keyword
    sortDirection = document.getElementById('sortSelect').value; // Lấy giá trị sắp xếp
    fetchTopics(keyword, sortDirection); // Gọi hàm fetch
});
let topics = [];
async function fetchTopics(keyword, sortDirection = 'date_ascending', pageNumber=0) {
    const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
    const response = await fetch(`http://localhost:8080/api/v1/user/topic?name=${keyword}&sortDirection=${sortDirection}&pageNumber=${pageNumber}`, requestOptions);
    const result = await response.json();
    if (result.success) {
        topics = result.data.content;
        displayTopics(topics);
        setupPaginationTopic(result.data.totalPages, fetchTopics);
    } else {
        console.error(result.message);
    }
}

function displayTopics(topics) {
    const container = document.getElementById('topicsContainer');
    container.innerHTML = '';
    document.getElementById('totalTopics').textContent = `Total: ${topics.length}`;

    topics.forEach(topic => {
        const topicContainer = document.createElement('div');
        topicContainer.className = 'topic-container';

        const topicElement = document.createElement('button');
        topicElement.className = 'topic-item';
        topicElement.textContent = topic.name;
        topicElement.onclick = () => {
            window.location.href = `userTopicWord.html?tid=${encodeURIComponent(topic.id)}`;
        };

        topicContainer.appendChild(topicElement);
        container.appendChild(topicContainer);
    });
}

function sortTopics() {
    sortDirection = document.getElementById('sortSelect').value;
    fetchTopics(keyword, sortDirection);
}
fetchTopics(keyword,currentSortDirection);

// Gán hàm vào window để có thể truy cập từ HTML
window.sortTopics = sortTopics;
const pagination = document.querySelector(".pagination");
let currentPage = 0;
    function setupPaginationTopic(totalPages, callback) {
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
                callback(keyword,currentSortDirection,currentPage);
                setupPaginationTopic(totalPages, callback);
            });
            pagination.appendChild(firstButton);
        }
    
        // Nút "Trước"
        if (currentPage > 0) {
            const prevButton = document.createElement("button");
            prevButton.textContent = "‹";
            prevButton.addEventListener("click", () => {
                currentPage--;
                callback(keyword,currentSortDirection,currentPage);
                setupPaginationTopic(totalPages, callback);
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
                callback(keyword,currentSortDirection,currentPage);
                setupPaginationTopic(totalPages, callback);
            });
    
            pagination.appendChild(button);
        }
    
        // Nút "Tiếp theo"
        if (currentPage < totalPages - 1) {
            const nextButton = document.createElement("button");
            nextButton.textContent = "›";
            nextButton.addEventListener("click", () => {
                currentPage++;
                callback(keyword,currentSortDirection,currentPage);
                setupPaginationTopic(totalPages, callback);
            });
            pagination.appendChild(nextButton);
        }
    
        // Nút "Cuối"
        if (currentPage < totalPages - 1) {
            const lastButton = document.createElement("button");
            lastButton.textContent = "»";
            lastButton.addEventListener("click", () => {
                currentPage = totalPages - 1;
                callback(keyword,currentSortDirection,currentPage);
                setupPaginationTopic(totalPages, callback);
            });
            pagination.appendChild(lastButton);
        }
    }