var pageContainer = document.querySelector(".pagination-container");
var wordContainer = document.querySelector("#section-word");
var addWordBtn = document.querySelector(".add-word-btn");
var searcWord = document.querySelector(".search-word");
var wordResult = document.querySelector(".result-search")
let totalPage = 0;
var limit = 15;
var minpage = 1;
var maxpage = 10;
var currentPage = 1;
let lastId = 0;
let firstID = 0;

function start() {
    renderPage();

    addWordBtn.addEventListener("click", function(event){
        window.location.href = "add_word.html"
    })
    searcWord.addEventListener("input", async function(event){
        var lsWord = await fetchWordByName(event.target.value);
        // renderResultSearch(lsWord);
        console.log(lsWord);
        renderResultSearch(lsWord);
    })
}
{/* <div class="search-container"></div> */}
async function fetchWordByName(wordName) {
    console.log("test" + /[!@#$%^&*(),.?":{}|<>\\\/]/.test(wordName))
    if(wordName != "" && /[!@#$%^&*(),.?":{}|<>\\\/]/.test(wordName)===false ){
        var apiURL = `http://localhost:8080/api/v1/words?name=${wordName}`;

        const response = await fetch(apiURL);
        const data = await response.json();
        if (!response.ok) {
            return []
            // throw new Error(`HTTP error! Status: ${response.status}`);
        }
        console.log(data)    
        return data;
    }
    return []
    
   
}

function renderResultSearch(words){
    wordResult.innerHTML = "";
    if(words.length > 0) {
        words.forEach(word => {
            var wordItem = document.createElement("li");
            var url = document.createElement("a");
            url.setAttribute("href",`http://127.0.0.1:5500/Dict-frontend/template/admin/word_management/word_detail.html?id=${word.id}`);
            var wordName = document.createElement("div")
            wordName.innerHTML = word.name;
            url.appendChild(wordName);
            wordItem.appendChild(url);
            wordResult.appendChild(wordItem);
        })
    }
    
}

async function getPage() {
    var apiURL = `http://localhost:8080/api/v1/words/page?page=${currentPage - 1}&limit=${limit}`;

    const response = await fetch(apiURL);
    const data = await response.json();

    totalPage = data.totalPages;
   
    firstID = data.content[0].id;
    lastId = data.content[data.content.length - 1].id;

    renderWords(data.content);
}

function renderWords(words) {
    var htmls = "";
    words.forEach(word => {
        htmls += `<a href = "word_detail.html?id=${word.id}" class="word-item"><label for="id">${word.id}</label><div class="name">${word.name}</div></a>`;
    });
    wordContainer.innerHTML = htmls;
    // setUpWordListener();
}

// function setUpWordListener(){
//     const words = wordContainer.getElementsByClassName("word-item");
//     Array.of(words).forEach(word => {
//         word.addEventListener("click", word => {
            
//         })
//     })
// }

async function renderPage() {
    await getPage(); // Ensure data is fetched before rendering the page

    var htmls = "";
    htmls += "<div class='previous page'>prev</div>";

    for (let i = minpage; i <= Math.min(minpage + 9, totalPage); i++) {
        htmls += `<div class='page ${i === currentPage ? 'active' : ''}'>${i}</div>`;
    }

    htmls += "<div class='next page'>next</div>";
    pageContainer.innerHTML = htmls;

    setupPaginationListeners();
}

function setupPaginationListeners() {
    const pages = pageContainer.getElementsByClassName("page");

    Array.from(pages).forEach(page => {
        page.addEventListener("click", function () {
            const pageText = this.innerText;

            if (pageText === "prev" && currentPage > 1) {
                currentPage--;
            } else if (pageText === "next" && currentPage < totalPage) {
                currentPage++;
            } else if (!isNaN(parseInt(pageText))) {
                currentPage = parseInt(pageText);
            }

            adjustMinPage();
            renderPage();
        });
    });
}

function adjustMinPage() {
    if (currentPage < minpage) {
        minpage = currentPage;
    } else if (currentPage >= minpage + 10 && minpage + 10 <= totalPage) {
        minpage = currentPage - 9;
    }
}

start();
