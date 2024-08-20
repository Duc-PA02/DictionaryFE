import { port } from '../js/header.js';

document.addEventListener("DOMContentLoaded", function() {
    const sendButton = document.getElementById("send-message");
    const userInput = document.getElementById("chat-input");
    const chatHistory = document.getElementById("chat-history");
    let conversation = []; // Mảng lưu trữ các tin nhắn trong cuộc hội thoại

    let isSending = false; // Cờ để kiểm tra xem đang gửi tin nhắn hay không

    sendButton.addEventListener("click", sendMessage);
    userInput.addEventListener("keydown", function(e) {
        if (e.key === "Enter") sendMessage();
    });

    function sendMessage() {
        if (isSending) return; // Nếu đang gửi, không thực hiện gửi lại

        const message = userInput.value.trim();
        if (!message) return;

        // Thêm tin nhắn của người dùng vào mảng cuộc hội thoại
        conversation.push({ role: "user", parts: [{ text: message }] });

        // Hiển thị tin nhắn của người dùng
        addMessageToChat("user", message);

        // Hiển thị loading spinner khi chờ phản hồi từ mô hình
        addLoadingSpinner();

        // Đặt cờ đang gửi thành true
        isSending = true;

        // Gửi toàn bộ cuộc hội thoại tới backend
        fetch(`http://localhost:${port}/api/v1/chatAI/generate`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ contents: conversation })
            })
            .then(response => response.text()) // Đọc response dưới dạng text
            .then(data => {
                // Xóa loading spinner
                removeLoadingSpinner();

                // Thêm phản hồi từ mô hình vào mảng cuộc hội thoại
                conversation.push({ role: "model", parts: [{ text: data }] });

                // Hiển thị phản hồi từ mô hình
                addMessageToChat("model", data);

                // Đặt cờ đang gửi thành false
                isSending = false;
            })
            .catch(error => {
                console.error("Error:", error);
                removeLoadingSpinner();
                addMessageToChat("model", "Error occurred while processing your request.");
                // Đặt cờ đang gửi thành false ngay cả khi có lỗi
                isSending = false;
            });

        // Xóa giá trị của ô nhập liệu sau khi tin nhắn đã được gửi
        setTimeout(() => userInput.value = "", 0);
    }

    function addMessageToChat(role, text) {
        const messageElement = document.createElement("div");
        messageElement.className = `message ${role}`;
        // Xử lý định dạng đặc biệt từ API
        const formattedText = formatText(text);
        messageElement.innerHTML = formattedText;

        chatHistory.appendChild(messageElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function formatText(text) {
        // Thay **...** bằng <strong>...</strong> và thêm dòng mới trước đó
        text = text.replace(/\*\*(.*?)\*\*/g, '<br><strong>$1</strong>');

        // Xử lý dấu *: thêm xuống dòng trước đó nếu trước và sau dấu * là khoảng trắng
        text = text.replace(/(\s)\*(\s)/g, '$1<br>$2');

        return text;
    }

    function addLoadingSpinner() {
        const loadingElement = document.createElement("div");
        loadingElement.className = "loading";
        loadingElement.innerHTML = `
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
            <div class="loading-dot"></div>
        `;
        chatHistory.appendChild(loadingElement);
        chatHistory.scrollTop = chatHistory.scrollHeight;
    }

    function removeLoadingSpinner() {
        const loadingElement = chatHistory.querySelector(".loading");
        if (loadingElement) {
            chatHistory.removeChild(loadingElement);
        }
    }
});