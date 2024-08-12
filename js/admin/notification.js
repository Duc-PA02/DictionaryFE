// notification.js
import { getToken, getUserFromToken } from '../../service/token.js';

export function updateNotificationIcon() {
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];
    
    const user = getUserFromToken(getToken());
    const userNotifications = notifications.filter(notification => notification.username === user.username);
    const hasUnread = userNotifications.some(notification => !notification.read);

    const bellIcon = document.querySelector('.fa-bell');
    if (hasUnread) {
        bellIcon.style.color = "red";
    } else {
        bellIcon.style.color = "";
    }
}

export function displayNotifications(user) {
    const notificationList = document.getElementById("notification-list");
    const notifications = JSON.parse(localStorage.getItem("notifications")) || [];

    const userNotifications = notifications.filter(notification => notification.username === user.username);

    if (userNotifications.length === 0) {
        alert("No new notifications");
    } else {
        notificationList.innerHTML = "";

        userNotifications.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        userNotifications.forEach(notification => {
            const li = document.createElement("li");
            li.innerHTML = `
                <div>${notification.message}</div>
                <span class="notification-timestamp">${new Date(notification.timestamp).toLocaleString()}</span>
            `;
            notificationList.appendChild(li);
        });

        notificationList.style.display = notificationList.style.display === "block" ? "none" : "block";

        userNotifications.forEach(notification => notification.read = true);
        localStorage.setItem("notifications", JSON.stringify(notifications));

        updateNotificationIcon();
    }
}
