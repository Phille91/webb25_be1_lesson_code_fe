const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const LS_ACCESS_TOKEN_KEY = "@MOTIFY_ACCESS_TOKEN"

/**
 * Fetch data from the API
 * @param {string} endpoint - The endpoint to fetch from
 * @param {Object} options - The options for the request
 * @param {Object} body - The body of the request
 * @param {Object} isAuthenticated - is the request authenticated `default true`
 * @returns {Promise<Object>} The response from the API
 */
export async function apiFetch(endpoint, options = {}, body = null, isAuthenticated = true) {
    const endpointUrl = new URL(endpoint, BASE_URL);
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers,
    };

    if(isAuthenticated) {
        const accessToken = localStorage.getItem(LS_ACCESS_TOKEN_KEY)
        if(accessToken) {
            headers['Authorization'] = `Bearer ${accessToken}`
        }
    }

    const config = {
        ...options,
        headers,
        body: body ? JSON.stringify(body) : null,
    };

    const response = await fetch(endpointUrl.toString(), config);

    if (!response.ok) {
        throw response
    }

    return response.json();
}
