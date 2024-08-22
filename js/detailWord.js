import { getToken, getUserFromToken } from '../service/token.js';

// token = getToken();
// user = getUserFromToken(token);
// uid = user.userId;
// console.log("uid: " + uid);

const app = {
        fetchWord(query) {
            fetch(`http://localhost:8080/api/v1/dictionary/english/search/${query}`)
                .then(response => response.json())
                .then(result => {
                    if (result.success) {
                        this.displayData(result.data);
                    } else {
                        this.displayWords(query);
                    }
                })
                .catch(error => console.error('Error:', error));
        },

        displayData(data) {
            const contentDiv = document.getElementById('content');
            contentDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <h6>Mean of ${data.name} in English</h6>
                <a href="#" onclick="app.addToFavorites(${data.id})" style="text-decoration: none; color: #007bff;">
                    <i class="fas fa-star"></i> Add to Favorites
                </a>
            </div>`;

            let name = data.name;
            data.typeList.forEach(type => {
                contentDiv.innerHTML += `<div class="section"><h2>${name}</h2><i>${type.type}</i>`;
                contentDiv.innerHTML += '<div class="audio-icons">';

                type.pronunciationsList.forEach(pron => {
                    contentDiv.innerHTML += `
                    <span>${pron.region}: 
                        <i class="fas fa-volume-up audio-icon" onclick="app.playAudio('${pron.audio}')"></i>
                        <i style="margin-right: 10px;">/${pron.pronunciation}/</i>
                    </span>`;
                });

                contentDiv.innerHTML += '</div><ul>';

                type.definitionsList.forEach(def => {
                    let examplesArray = def.examples.split('-');
                    let formattedExamples = examplesArray.join('<br/>');
                    contentDiv.innerHTML += `<li>
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="blue" class="bi bi-box-fill" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M15.528 2.973a.75.75 0 0 1 .472.696v8.662a.75.75 0 0 1-.472.696l-7.25 2.9a.75.75 0 0 1-.557 0l-7.25-2.9A.75.75 0 0 1 0 12.331V3.669a.75.75 0 0 1 .471-.696L7.443.184l.004-.001.274-.11a.75.75 0 0 1 .558 0l.274.11.004.001zm-1.374.527L8 5.962 1.846 3.5 1 3.839v.4l6.5 2.6v7.922l.5.2.5-.2V6.84l6.5-2.6v-.4l-.846-.339Z"></path>
                    </svg>
                    <strong>${def.definition}</strong> <hr/> ${formattedExamples}</li>`;
                });
                contentDiv.innerHTML += '</ul></div>';
            });

            contentDiv.innerHTML += '<div class="section"><h3>Synonyms:</h3>';
            data.synonymsList.forEach(syn => {
                contentDiv.innerHTML += `<a href="detailWord.html?search=${syn.synonym.name}" onclick="app.fetchWord('${syn.synonym.name}')">${syn.synonym.name}</a>, `;
            });
            contentDiv.innerHTML += '</div>';

            contentDiv.innerHTML += '<div class="section"><h3>Antonyms:</h3>';
            data.antonymsList.forEach(ant => {
                contentDiv.innerHTML += `<a href="detailWord.html?search=${ant.antonym.name}" onclick="app.fetchWord('${ant.antonym.name}')">${ant.antonym.name}</a>, `;
            });
            contentDiv.innerHTML += '</div>';
        },

        displayWords(query) {
            fetch(`http://localhost:8080/api/v1/searchWord/fuzzy?keyword=${query}`)
                .then(response => response.json())
                .then(result => {
                        const messageDiv = document.getElementById('messageDiv');
                        messageDiv.innerHTML =
                            `
                            <h2 style="color:#003366">Your search terms did not match any entries.</h2>
                            <div style="display:flex; color:#003366">
                                <p>We cannot find any entries matching </p>&nbsp;<p style="font-weight: bold;"> ${query}.</p>
                            </div>
                            <p style="color:#003366">Please check you have typed the word correctly.</p>
                            <p style="color:#003366">Or, you can refer to the words below:</p>
                            <ul style="list-style-type: none; padding: 0;">
                        ${result.map(data => `
                            <li style="margin-left:10px; margin-bottom: 8px; background-color: #fff; border-bottom: 1px solid #ccc; padding-bottom: 8px;">
                                <a href="detailWord.html?search=${data.name}" 
                                   style=" color:#005599;">
                                   ${data.name}
                                </a>
                            </li>`).join('')}
                    </ul>`;
            })
            .catch(error => console.error('Error:', error));
    },

    playAudio(src) {
        const audio = new Audio(src);
        audio.play();
    },

    addToFavorites(wid) {

        const token = getToken();

        if (!token) {
            this.showMessageModal('You need to log in to add to your favorites list!');
            return;
        }

        const user = getUserFromToken(token);
        const uid = user.userId;
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "POST",
            headers: myHeaders,
            redirect: "follow"
        };
        fetch(`http://localhost:8080/api/v1/favoriteword/${uid}/${wid}`, requestOptions)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                const message = data.message;
                this.showMessageModal(message);
            })
            .catch(error => {
                console.error('Error:', error);
                this.showMessageModal('An error occurred while adding to favorites.');
            });
    },

    showMessageModal(message) {
        const modal = document.getElementById('messageModal');
        const modalMessage = document.getElementById('modalMessage');
        modalMessage.textContent = message;
        modal.style.display = 'block';
    },

    closeModal() {
        const modal = document.getElementById('messageModal');
        modal.style.display = 'none';
    },

    getQueryParameter(search) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(search);
    }
};
window.app = app;
// Khi trang được tải, kiểm tra xem có query không
document.addEventListener('DOMContentLoaded', () => {
    const search = app.getQueryParameter('search');
    if (search) {
        app.fetchWord(search);
    }
});