import { port } from '../js/header.js';
import { getToken, getUserFromToken } from '../service/token.js';


class SearchBarComponent extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <link rel="stylesheet" href="../css/searchAutocomplete.css">
            <div class="search-bar-container">
                <!-- MENU HAMBURGER -->
                <div class="menu-hamburger" id="menu-hamburger">
                    <div class="bar"></div>
                    <div class="bar"></div>
                    <div class="bar"></div>
                </div>
                <!-- MENU XỔ XUỐNG -->
                <div id="menu" class="menu">
                    <div class="menu-header">
                        <img src="../Image/logo.png" alt="Logo" />
                        <span class="title">Dictionary</span>
                    </div>
                    <ul>
                        <li><a href="detailWord.html">Dictionary</a></li>
                        <li><a href="translate.html">Translate</a></li>
                        <li><a href="chatAI.html">ChatAI</a></li>
                        <li><a href="favoriteWord.html" id="favoriteWordLink">View favorite</a></li>
                        <li><a href="userTopic.html" id="topicLinkUser">Topic</a></li>
                        <li><a href="https://www.messenger.com/t/318840944656645">Support</a></li>
                        <!-- Thêm các liên kết khác nếu cần -->
                    </ul>
                </div>
                <!----------------------------------->
                <div class="search-bar">
                    <input id="search-input" type="search" placeholder="Search English">
                    <button type="button" id="search-button">
                        <img src="../Image/search-icon.png" alt="Search" class="search-icon">
                    </button>
                    <div id="dropdown-container">
                        <ul id="search-results" class="dropdown-list"></ul>
                        <div class="history-label">History</div>
                        <ul id="history-results" class="dropdown-list"></ul>
                    </div>
                </div>
            </div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.querySelector('#menu-hamburger').addEventListener('click', this.toggleMenu.bind(this));
        document.addEventListener('click', this.closeMenuIfClickedOutside.bind(this));

        this.shadowRoot.querySelector('#search-input').addEventListener('input', this.onSearchInput.bind(this));
        this.shadowRoot.querySelector('#search-input').addEventListener('keydown', this.onSearchKeydown.bind(this));
        this.shadowRoot.querySelector('#search-button').addEventListener('click', this.onSearchButtonClick.bind(this));
        this.shadowRoot.querySelector('#search-results').addEventListener('click', this.onSearchResultClick.bind(this));

        if (getToken()) {
            this.userId = getUserFromToken().userId;
        } else {
            this.userId = null;
        } // ID người dùng cho API lịch sử
        this.currentFocus = -1; // Biến để theo dõi mục được chọn hiện tại
        this.searchData = []; // Biến để lưu trữ dữ liệu tìm kiếm

        this.searchAbortController = null; // Để hủy yêu cầu tìm kiếm trước đó
        this.historyAbortController = null; // Để hủy yêu cầu lịch sử trước đó


        const urlParams = new URLSearchParams(window.location.search);
        const searchQuery = urlParams.get('search');
        if (searchQuery) {
            this.shadowRoot.querySelector('#search-input').value = searchQuery;
        }
    }

    toggleMenu() {
        const menu = this.shadowRoot.querySelector('#menu');
        menu.classList.toggle('show');
    }

    closeMenuIfClickedOutside(event) {
        const menu = this.shadowRoot.querySelector('#menu');
        const hamburger = this.shadowRoot.querySelector('#menu-hamburger');
        const insideComponent = this.contains(event.target) || this.shadowRoot.contains(event.target);

        if (!insideComponent && !hamburger.contains(event.target)) {
            menu.classList.remove('show');
        }
    }

    onSearchInput() {

        const query = this.shadowRoot.querySelector('#search-input').value;

        // Kiểm tra nếu query có chứa ký tự đặc biệt
        const specialCharPattern = /[^a-zA-Z0-9\s]/;

        if (query.length > 0 && specialCharPattern.test(query) == false) {
            this.fetchSearchResults(query);
            this.fetchHistoryResults(query);
        } else {
            // Hủy yêu cầu API đang chạy
            if (this.searchAbortController) {
                this.searchAbortController.abort();
            }
            if (this.historyAbortController) {
                this.historyAbortController.abort();
            }
            this.clearDropdown();
        }
    }

    onSearchKeydown(e) {
        const items = this.shadowRoot.querySelectorAll('li');
        if (e.key === 'ArrowDown') {
            this.currentFocus++;
            this.addActive(items);
        } else if (e.key === 'ArrowUp') {
            this.currentFocus--;
            this.addActive(items);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (this.currentFocus > -1) {
                if (items) {
                    const selectedItem = items[this.currentFocus];
                    this.clearDropdown();
                    this.performSearch(selectedItem.textContent, selectedItem.dataset.id);
                }
            } else {
                this.performSearch(this.shadowRoot.querySelector('#search-input').value);
                this.clearDropdown();
            }
        }
    }

    addActive(items) {
        if (!items || items.length === 0) return false;
        this.removeActive(items);
        if (this.currentFocus >= items.length) this.currentFocus = 0;
        if (this.currentFocus < 0) this.currentFocus = items.length - 1;
        items[this.currentFocus].classList.add('autocomplete-active');
        items[this.currentFocus].scrollIntoView({ behavior: "smooth", block: "nearest" }); // Đảm bảo mục được chọn luôn hiển thị
    }

    onSearchButtonClick() {
        this.performSearch(this.shadowRoot.querySelector('#search-input').value);
        this.clearDropdown();
    }

    onSearchResultClick(e) {
        if (e.target.tagName === 'LI') {
            const selectedItem = e.target;
            this.clearDropdown();
            this.performSearch(selectedItem.textContent, selectedItem.dataset.id);
        }
    }

    addActive(items) {
        if (!items) return false;
        this.removeActive(items);
        if (this.currentFocus >= items.length) this.currentFocus = 0;
        if (this.currentFocus < 0) this.currentFocus = items.length - 1;
        items[this.currentFocus].classList.add('autocomplete-active');
    }

    removeActive(items) {
        for (let i = 0; i < items.length; i++) {
            items[i].classList.remove('autocomplete-active');
        }
    }

    clearDropdown() {
        this.shadowRoot.querySelector('#search-results').innerHTML = '';
        this.shadowRoot.querySelector('#history-results').innerHTML = '';
        this.shadowRoot.querySelector('#dropdown-container').style.display = 'none';
        this.shadowRoot.querySelector('.history-label').style.display = 'none';
        this.shadowRoot.querySelector('#search-input').classList.remove('dropdown-visible');
        this.currentFocus = -1; // Reset lại vị trí hiện tại
    }

    fetchSearchResults(query) {
        if (this.searchAbortController) {
            this.searchAbortController.abort(); // Hủy yêu cầu trước đó
        }
        this.searchAbortController = new AbortController();

        const requestOptions = {
            method: "GET",
            signal: this.searchAbortController.signal,
            redirect: "follow"
        };

        fetch(`http://localhost:${port}/api/v1/searchWord/keyword?keyword=${query}&limit=7`, requestOptions)
            .then(response => response.json())
            .then(data => {
                this.searchData = data;
                this.displaySearchResults(data);
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Error:', error);
                }
            });
    }

    fetchHistoryResults(query) {
        if (this.historyAbortController) {
            this.historyAbortController.abort(); // Hủy yêu cầu trước đó
        }
        this.historyAbortController = new AbortController();

        const requestOptions = {
            method: "GET",
            signal: this.historyAbortController.signal,
            redirect: "follow"
        };

        fetch(`http://localhost:${port}/api/v1/searchWord/user?userId=${this.userId}&keyword=${query}&limit=3`, requestOptions)
            .then(response => response.json())
            .then(data => {
                if (data == null) {
                    this.clearDropdown();
                } else {
                    this.displayHistoryResults(data);
                }
            })
            .catch(error => {
                if (error.name !== 'AbortError') {
                    console.error('Error:', error);
                }
            });
    }

    displaySearchResults(results) {
        const searchResults = this.shadowRoot.querySelector('#search-results');
        searchResults.innerHTML = '';
        results.forEach(result => {
            const li = document.createElement('li');
            li.textContent = result.name;
            li.dataset.id = result.id;
            li.addEventListener('click', () => {
                this.clearDropdown();
                this.performSearch(result.name, result.id);
            });
            searchResults.appendChild(li);
        });
        this.checkDropdownDisplay();
    }

    displayHistoryResults(results) {
        const historyResults = this.shadowRoot.querySelector('#history-results');
        const historyLabel = this.shadowRoot.querySelector('.history-label');
        historyResults.innerHTML = '';
        if (results.length > 0) {
            historyLabel.style.display = 'block';
            results.forEach(result => {
                const li = document.createElement('li');
                li.textContent = result.name;
                li.dataset.id = result.id;
                li.addEventListener('click', () => {
                    this.clearDropdown();
                    this.performSearch(result.name, result.id);
                });
                historyResults.appendChild(li);
            });
        } else {
            historyLabel.style.display = 'none';
        }
        this.checkDropdownDisplay();
    }

    checkDropdownDisplay() {
        const dropdownContainer = this.shadowRoot.querySelector('#dropdown-container');
        const searchResults = this.shadowRoot.querySelector('#search-results');
        const historyResults = this.shadowRoot.querySelector('#history-results');
        const searchInput = this.shadowRoot.querySelector('#search-input');

        if (searchResults.innerHTML !== '' || historyResults.innerHTML !== '') {
            dropdownContainer.style.display = 'block';
            searchInput.classList.add('dropdown-visible');
        } else {
            this.clearDropdown();
        }
    }

    performSearch(query, id) {
        if (query.trim() !== '') {
            const found = this.searchData.find(item => item.name.toLowerCase() === query.toLowerCase());
            if (found || id) {
                const searchId = found ? found.id : id;
                this.updateURL(query);
                this.saveSearchHistory(searchId);
            } else {
                this.updateURL(query);
            }
        }
    }

    saveSearchHistory(wordId) {
        const raw = JSON.stringify({
            userId: this.userId,
            wordId: wordId
        });

        const requestOptions = {
            method: "POST",
            body: raw,
            redirect: "follow"
        };

        fetch(`http://localhost:${port}/api/v1/searchWord/save?userId=${this.userId}&wordId=${wordId}`, requestOptions)
            .then(response => response.text())
            .then(result => console.log('History saved:', result))
            .catch(error => console.error('Error:', error));
    }

    updateURL(query) {
        const newURL = `detailWord.html?search=${encodeURIComponent(query)}`;
        window.location.href = newURL;
    }
}

customElements.define('search-bar-component', SearchBarComponent);
const favoriteLink = this.shadowRoot.querySelector('#favoriteWordLink');
favoriteLink.addEventListener('click', (event) => {
    const token = getToken(); // Hàm lấy token
    if (!token) {
        event.preventDefault(); // Ngăn chặn điều hướng
        alert('Bạn cần đăng nhập để xem mục yêu thích.');
    }
});