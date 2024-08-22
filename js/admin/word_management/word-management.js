import { getToken, getUserFromToken } from '../../../service/token.js';
import { renderAddWord } from './add-word.js';
var pageContainer = document.querySelector(".pagination-container");
const contentWraperWordManage = document.querySelector(".content-wrapper");
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
let token = '';
function start(callback) {
    contentWraperWordManage.style.display="block";
    pageContainer.style.display = "flex";
    // callback()
    token = getToken();
    if(token === null || token === ''){
        window.location.href = 'http://127.0.0.1:5502/template/login.html';
    }
    renderPage(callback);

    addWordBtn.addEventListener("click", function(event){
        // window.location.href = "add_word.html"
        callback();
        renderAddWord("add_word");
    })
    searcWord.addEventListener("input", async function(event){
        var lsWord = await fetchWordByName(event.target.value);
        // renderResultSearch(lsWord);
        console.log(lsWord);
        renderResultSearch(lsWord, callback);
    })
}
{/* <div class="search-container"></div> */}
async function fetchWordByName(wordName) {
    console.log("test" + /[!@#$%^&*(),.?":{}|<>\\\/]/.test(wordName))
    if(wordName != "" && /[!@#$%^&*(),.?":{}|<>\\\/]/.test(wordName)===false ){
        var apiURL = `http://localhost:8080/api/v1/admin/words?name=${wordName}`;

        const response = await fetch(apiURL, {
                method: 'GET', // or 'POST', 'PUT', etc.
                headers: {
                    'Authorization': `Bearer ${token}`, // Add token to the Authorization header
                    'Content-Type': 'application/json',
                    // Add other headers if needed
                }
        });
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

function renderResultSearch(words,callback){
    wordResult.innerHTML = "";
    if(words.length > 0) {
        words.forEach(word => {
            var wordItem = document.createElement("li");
            var url = document.createElement("div");
            url.setAttribute("href",`word_detail.html?id=${word.id}`);
            var wordName = document.createElement("div")
            wordName.innerHTML = word.name;
            url.appendChild(wordName);
            wordItem.appendChild(url);
            wordResult.appendChild(wordItem);
            wordItem.addEventListener("click", function(event){
                callback();
                renderAddWord("detail", word.id);
            })
        })
    }
    
}

async function getPage(callback) {
    var apiURL = `http://localhost:8080/api/v1/admin/words/page?page=${currentPage - 1}&limit=${limit}`;
   
    const response = await fetch(apiURL, {
        method: 'GET', // or 'POST', 'PUT', etc.
        headers: {
            'Authorization': `Bearer ${token}`, // Add token to the Authorization header
            'Content-Type': 'application/json',
            // Add other headers if needed
        }
    });
    const data = await response.json();
    if(data.status === 401){
        console.log("call")
        window.location.href = 'http://127.0.0.1:5502/template/login.html';
    } 
    totalPage = data.totalPages;
   
    firstID = data.content[0].id;
    lastId = data.content[data.content.length - 1].id;

    renderWords(data.content, callback);
}

function renderWords(words, callback) {
    var htmls = "";
    words.forEach(word => {
        htmls += `<div  class="word-item"><label for="id">${word.id}</label><div class="name">${word.name}</div></div>`;
    });
    wordContainer.innerHTML = htmls;
    setUpWordListener(callback);
}

function setUpWordListener(callback){
    const wordsItem = wordContainer.querySelectorAll(".word-item");
    wordsItem.forEach(word=>{
        word.addEventListener("click", function(event){
            callback();
            renderAddWord("detail", word.querySelector("label").innerHTML)
        })
    })
}

async function renderPage(callback) {
    await getPage(callback); // Ensure data is fetched before rendering the page

    var htmls = "";
    htmls += "<div class='previous page'>prev</div>";

    for (let i = minpage; i <= Math.min(minpage + 9, totalPage); i++) {
        htmls += `<div class='page ${i === currentPage ? 'active' : ''}'>${i}</div>`;
    }

    htmls += "<div class='next page'>next</div>";
    pageContainer.innerHTML = htmls;

    setupPaginationListeners(callback);
}

function setupPaginationListeners(callback) {
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
            renderPage(callback);
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

// start();
export {start}
