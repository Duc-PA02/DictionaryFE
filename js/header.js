import { getToken, getUserFromToken } from '../service/token.js';

class HeaderComponent extends HTMLElement {
    constructor() {
        super();
        const template = document.createElement('template');
        template.innerHTML = `
            <link rel="stylesheet" href="../css/header.css">
            <div class="header">
                <a href="home.html"><img src="../image/logo.png" alt="Logo" class="logo-header"></a>
                <!--NAVIGATION BAR-->
                <ul class="navigation">
                    <a href="index.html" title="Dictionary" class="navigation-item-selected">
                        <li>Dictionary</li>
                    </a>
                    <a href="translate.html" title="Translate">
                        <li>Translate</li>
                    </a>
                    <a href="chatAI.html" title="ChatAI">
                        <li>ChatAI</li>
                    </a>
                    <a href="https://www.messenger.com/t/318840944656645" title="Support">
                        <li>Support</li>
                    </a>
                </ul>
                <div class="auth-buttons">
                    <button id="login-button">Login</button>
                    <button id="register-button">Register</button>
                </div>
                <div id="user-menu" class="user-menu" style="display: none;">
                    <span id="username-header"></span>
                    <button id="user-menu-toggle">&#9662;</button>
                    <ul id="user-dropdown-menu" class="user-dropdown-menu" style="display: none;">
                        <li><a href="userInfo.html">User Info</a></li>
                        <li><a href="#" id="logout-button">Logout</a></li>
                    </ul>
                </div>
            </div>
        `;
        const shadowRoot = this.attachShadow({ mode: 'open' });
        shadowRoot.appendChild(template.content.cloneNode(true));

        this.shadowRoot.querySelector('#login-button').addEventListener('click', () => {
            window.location.href = 'login.html';
        });
        this.shadowRoot.querySelector('#register-button').addEventListener('click', () => {
            window.location.href = 'register.html';
        });
        this.shadowRoot.querySelector('#user-menu-toggle').addEventListener('click', () => {
            const menu = this.shadowRoot.querySelector('#user-dropdown-menu');
            menu.style.display = (menu.style.display === 'block') ? 'none' : 'block';
        });
        this.shadowRoot.querySelector('#logout-button').addEventListener('click', async () => {
            try {
                const token = getToken();
                await fetch('http://localhost:8080/api/v1/auth/logout', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ token })
                });
                
                localStorage.removeItem('token');
                localStorage.removeItem('username');
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Failed to log out', error);
            }
        });
    }

    connectedCallback() {
        const loginButton = this.shadowRoot.querySelector('#login-button');
        const registerButton = this.shadowRoot.querySelector('#register-button');
        const userMenu = this.shadowRoot.querySelector('#user-menu');
        const usernameHeader = this.shadowRoot.querySelector('#username-header');

        const token = getToken();
        if (token) {
            try {
                const user = getUserFromToken();
                loginButton.style.display = 'none';
                registerButton.style.display = 'none';
                userMenu.style.display = 'flex';
                usernameHeader.textContent = user.username;
            } catch (error) {
                console.error('Failed to decode token', error);
            }
        } else {
            loginButton.style.display = 'block';
            registerButton.style.display = 'block';
            userMenu.style.display = 'none';
        }
    }
}

customElements.define('header-component', HeaderComponent);
