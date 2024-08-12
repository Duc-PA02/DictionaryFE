import jwtDecode from 'https://cdn.jsdelivr.net/npm/jwt-decode@3.1.2/build/jwt-decode.esm.js';

function getToken() {
    return localStorage.getItem('token');
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

export { getToken, getUserFromToken };