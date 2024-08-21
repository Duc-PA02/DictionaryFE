let currentSortDirection = 'date_ascending';
    let keyword = "";
    let sortDirection = "";

    document.getElementById('searchInput').addEventListener('input', function() {
            keyword = this.value; // Cập nhật giá trị keyword
            sortDirection = document.getElementById('sortSelect').value; // Lấy giá trị sắp xếp
            fetchTopicWords(keyword, sortDirection); // Gọi hàm fetch
    });


    document.getElementById('backButton').addEventListener('click', () => {
            window.location.href = `userTopic.html`;
    });
    function displayWords(data) {   
        const wordListDiv = document.getElementById('wordList');
        wordListDiv.innerHTML = '';

        document.getElementById('totalTopics').textContent = `Total: ${data.length}`;
        if (data.length === 0) {
            wordListDiv.innerHTML = '<p>No words found.</p>';
            return;
        }

        // Lấy thông tin topic
        const topic = data[0].topic;
        
        document.getElementById('nameTopic').textContent = `Topic: ${topic.name}`;

        const list = document.createElement('ul');
        
        data.forEach(item => {
            const listItem = document.createElement('li');

            const wordElement = document.createElement('a');
            wordElement.className = "linkWord"
            wordElement.textContent = item.word.name;
            wordElement.href = `detailWord.html?search=${encodeURIComponent(item.word.name)}`;
            wordElement.style.outline = 'none';
            listItem.appendChild(wordElement); 
            list.appendChild(listItem);
        });

        wordListDiv.appendChild(list);
    }
    function displayTopicWordWithNoneWord(topic) {   
        const wordListDiv = document.getElementById('wordList');
        wordListDiv.innerHTML = '';

        document.getElementById('totalTopics').textContent = `Total: 0`;
        if (topic.length === 0) {
            wordListDiv.innerHTML = '<p>No words found.</p>';
            return;
        }

        document.getElementById('nameTopic').textContent = `Topic: ${topic.name}`;

        const list = document.createElement('ul');
        
        topic.forEach(item => {
            const listItem = document.createElement('li');

            const wordElement = document.createElement('a');
            wordElement.className = "linkWord"
            wordElement.textContent = item.word.name;
            wordElement.href = `detailWord.html?search=${encodeURIComponent(item.word.name)}`;
            wordElement.style.outline = 'none';
            listItem.appendChild(wordElement); 
            list.appendChild(listItem);
        });

        wordListDiv.appendChild(list);
    }

    const urlParams = new URLSearchParams(window.location.search);
    const topicId = urlParams.get('tid');

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const requestOptions = {
        method: "GET",
        headers: myHeaders,
        redirect: "follow"
    };
    async function fetchTopicWords(keyword, sortDirection = 'date_ascending') {
            const response = await fetch(`http://localhost:8080/api/v1/user/topicword/${encodeURIComponent(topicId)}?name=${keyword}&sortDirection=${sortDirection}`, requestOptions);
            const result = await response.json();
            if (result.success) {
                if(result.data.length > 0){
                    displayWords(result.data);
                }else{
                    fetchTopicWordsNone(topicId);
                }
            } else {
                displayWords([]);
                console.error(result.message);
            }
    }

    async function fetchTopicWordsNone(topicId){
        fetch(`http://localhost:8080/api/v1/user/topic/${topicId}`, requestOptions)
            .then(response => response.json())
            .then(result => {
                if (result.success) {
                    displayTopicWordWithNoneWord(result.data);
                } else {
                    console.error(result.message);
                }
            })
            .catch(error => console.error('Error:', error));
    }
    function sortTopics() {
        sortDirection = document.getElementById('sortSelect').value;
        fetchTopicWords(keyword, sortDirection);
    }

    fetchTopicWords(keyword, currentSortDirection);

