import { getToken, getUserFromToken } from '../service/token.js';
const token = getToken();
const user = getUserFromToken(token);
let currentSortDirection = 'dictionary_asc';
let sortDirection = "";
let userId = user.userId;
console.log(userId);
let keyword = "";
let favoritewords = [];
document.getElementById('searchInput').addEventListener('input', function() {
    keyword = this.value; // Cập nhật giá trị keyword
    sortDirection = document.getElementById('sortSelect').value; // Lấy giá trị sắp xếp
    fetchFavoriteWords(userId, keyword, sortDirection); // Gọi hàm fetch
});

async function fetchFavoriteWords(userId, keyword, sortDirection = 'id') {
    const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
    const response = await fetch(`http://localhost:8080/api/v1/favoriteword/${userId}?name=${keyword}&sortDirection=${sortDirection}`,requestOptions);
    const result = await response.json();
    if (result.success) {
        favoritewords = result.data;
        displayFavoriteWords(favoritewords, sortDirection);
    } else {
        favoritewords = [];
        displayFavoriteWords(favoritewords, sortDirection);
    }
}

function displayFavoriteWords(words, sortDirection) {
    const container = document.getElementById('favoriteWordsContainer');
    container.innerHTML = '';

    const totalContainer = document.createElement('div');
    totalContainer.style.display = 'flex';
    totalContainer.style.justifyContent = 'space-between';
    totalContainer.style.alignItems = 'center';

    const totalElement = document.createElement('h4');
    totalElement.textContent = `Total: ${words.length}`;

    const selectAllContainer = document.createElement('div');
    selectAllContainer.style.display = 'flex';
    selectAllContainer.style.alignItems = 'center';

    const sortContainer = document.createElement('div');
    const sortLabel = document.createElement('label');
    sortLabel.setAttribute('for', 'sortSelect');

    const sortSelect = document.createElement('select');
    sortSelect.id = 'sortSelect';

    const optionDateASC = document.createElement('option');
    optionDateASC.value = 'date_ascending';
    optionDateASC.textContent = 'date_ascending';

    const optionDateDESC = document.createElement('option');
    optionDateDESC.value = 'date_descending';
    optionDateDESC.textContent = 'date_descending';

    const optionDicASC = document.createElement('option');
    optionDicASC.value = 'dictionary_asc';
    optionDicASC.textContent = 'dictionary_asc';

    const optionDicDESC = document.createElement('option');
    optionDicDESC.value = 'dictionary_desc';
    optionDicDESC.textContent = 'dictionary_desc';

    sortSelect.appendChild(optionDateASC);
    sortSelect.appendChild(optionDateDESC);
    sortSelect.appendChild(optionDicASC);
    sortSelect.appendChild(optionDicDESC);
    
    // Đặt giá trị cho dropdown
    sortSelect.value = sortDirection;

    // Lắng nghe sự kiện thay đổi
    sortSelect.addEventListener('change', (event) => {
        sortDirection = event.target.value; // Lưu lại tùy chọn hiện tại
        fetchFavoriteWords(userId, keyword, sortDirection);
    });

    sortContainer.appendChild(sortLabel);
    sortContainer.appendChild(sortSelect);

    const deleteAllText = document.createElement('span');
    deleteAllText.textContent = 'Delete All:';
    deleteAllText.style.marginLeft = '30px';

    const deleteAllIcon = document.createElement('img');
    deleteAllIcon.src = '../Image/deleteBtnF.png';
    deleteAllIcon.alt = 'Delete All';
    deleteAllIcon.className = 'delete-all-icon';
    deleteAllIcon.onclick = async () => {
            if (confirm("Are you sure you want to delete all favorite word?")) {
                const myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                const requestOptions = {
                    method: "DELETE",
                    headers: myHeaders,
                    redirect: "follow"
                };
                const response = await fetch(`http://localhost:8080/api/v1/favoriteword/delete_all/${userId}`, requestOptions);
                if (response.ok) {
                    fetchFavoriteWords(userId, keyword, currentSortDirection); // Gọi lại với tùy chọn hiện tại
                } else {
                    alert('Failed to delete the word.');
                }
            }
        };
    

    selectAllContainer.appendChild(sortContainer);
    selectAllContainer.appendChild(deleteAllText);
    selectAllContainer.appendChild(deleteAllIcon);
    
    totalContainer.appendChild(totalElement);
    totalContainer.appendChild(selectAllContainer);
    container.appendChild(totalContainer);
    
    words.forEach(word => {
        const wordContainer = document.createElement('div');
        wordContainer.className = 'word-container';

        const wordElement = document.createElement('button');
        wordElement.className = 'word-item';
        wordElement.textContent = word.words.name;
        wordElement.onclick = () => {
            window.location.href = `detailWord.html?search=${encodeURIComponent(word.words.name)}`;
        };

        const deleteIcon = document.createElement('img');
        deleteIcon.src = '../Image/deleteBtnF.png';
        deleteIcon.alt = 'Delete';
        deleteIcon.className = 'delete-icon';
        deleteIcon.onclick = async () => {
            if (confirm("Are you sure you want to delete this favorite word?")) {
                const id = word.id;
                const myHeaders = new Headers();
                myHeaders.append("Authorization", `Bearer ${token}`);
                const requestOptions = {
                    method: "DELETE",
                    headers: myHeaders,
                    redirect: "follow"
                };
                const response = await fetch(`http://localhost:8080/api/v1/favoriteword/${id}`, requestOptions);
                if (response.ok) {
                    fetchFavoriteWords(userId, keyword, currentSortDirection); // Gọi lại với tùy chọn hiện tại
                } else {
                    alert('Failed to delete the word.');
                }
            }
        };

        wordContainer.appendChild(wordElement);
        wordContainer.appendChild(deleteIcon);
        container.appendChild(wordContainer);
    });
}
fetchFavoriteWords(userId, keyword, currentSortDirection);