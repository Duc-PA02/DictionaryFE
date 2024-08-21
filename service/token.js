import jwtDecode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';

function getToken() {
    const token = localStorage.getItem('token');
    
    if (window.location.pathname.endsWith('detailWord.html') && !token) {
        return null; 
    }

    if (!token) {
        redirectToLogin();
        return null;
    }

    // Tách "Bearer " nếu có
    let actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    try {
        const decodedToken = jwtDecode(actualToken);

        // Kiểm tra thời gian hết hạn
        if (decodedToken.exp && isTokenExpired(decodedToken.exp)) {
            redirectToLogin();
            return null;
        }

        return actualToken; // Trả về token nếu hợp lệ
    } catch (error) {
        console.error('Failed to decode token', error);
        redirectToLogin();
        return null;
    }
}

function getUserFromToken() {
    const token = getToken();
    if (!token) {
        throw new Error('No token found');
    }

    // Tách "Bearer " nếu có
    let actualToken = token.startsWith("Bearer ") ? token.substring(7) : token;

    try {
        const decodedToken = jwtDecode(actualToken);
        return {
            userId: decodedToken.userId,
            username: decodedToken.username
        };
    } catch (error) {
        console.error('Failed to decode token', error);
        throw new Error('Invalid token');
    }
}

function redirectToLogin() {
    window.location.href = 'login.html';
}

function isTokenExpired(expirationDate) {
    return Date.now() >= expirationDate * 1000;
}

export { getToken, getUserFromToken };