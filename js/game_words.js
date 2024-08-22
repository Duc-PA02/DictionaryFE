import { getToken, getUserFromToken } from "../service/token.js"
let words = []; // Global array to hold words

// let token = getToken();
// console.log(token)

async function fetchWords() {
    try {
        const token = getToken();
        console.log("token: " +token)
        const user = getUserFromToken(token);
        let userId = user.userId;
        const myHeaders = new Headers();
        myHeaders.append("Authorization", `Bearer ${token}`);
        const requestOptions = {
            method: "GET",
            headers: myHeaders,
            redirect: "follow"
        };
        const response = await fetch(`http://localhost:8080/api/v1/favoriteword/${userId}`, requestOptions);
        const result = await response.json();
        words = result.data.flatMap(wordItem => {
            const wordName = wordItem.words.name;
    
            // Kiểm tra typeList có ít nhất một item không
            if (!wordItem.words.typeList || wordItem.words.typeList.length === 0) {
                return { word: wordName, hint: "No hint available" };
            }
    
            // Lấy định nghĩa đầu tiên cho từ hiện tại
            for (const type of wordItem.words.typeList) {
                // Kiểm tra definitionsList có hợp lệ không
                if (type.definitionsList && type.definitionsList.length > 0) {
                    // Lấy định nghĩa đầu tiên
                    const firstDefinition = type.definitionsList[0].definition;
                    return { word: wordName, hint: firstDefinition };
                }
            }
    
            // Nếu không có định nghĩa nào
            return { word: wordName, hint: "No hint available" };
        });
        
        console.log("Words fetched successfully:", words); // Kiểm tra mảng words
        // return words
        // start(); // Bắt đầu trò chơi sau khi lấy dữ liệu
    } catch (error) {
        console.error("Error fetching words:", error);
    }
}

fetchWords();
export{words};

