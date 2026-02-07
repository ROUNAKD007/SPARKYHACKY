const DEFAULT_API_BASE_URL = 'http://localhost:5001';
const TOKEN_KEY = 'token';

export const getApiBaseUrl = () => {
    return (import.meta.env.VITE_API_BASE_URL || DEFAULT_API_BASE_URL).replace(/\/+$/, '');
};

export const getStoredToken = () => localStorage.getItem(TOKEN_KEY);

export const setStoredToken = (token) => {
    if (!token) {
        localStorage.removeItem(TOKEN_KEY);
        return;
    }
    localStorage.setItem(TOKEN_KEY, token);
};

export const clearStoredToken = () => {
    localStorage.removeItem(TOKEN_KEY);
};

const buildUrl = (path) => {
    if (/^https?:\/\//i.test(path)) return path;
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${getApiBaseUrl()}${normalizedPath}`;
};

const summarizeRequestBody = (body) => {
    if (!body) return undefined;
    if (typeof body !== 'string') return '[non-string body]';

    try {
        const parsed = JSON.parse(body);
        if (parsed && typeof parsed === 'object') {
            return {
                captionLength: typeof parsed.caption === 'string' ? parsed.caption.length : 0,
                imagesCount: Array.isArray(parsed.images) ? parsed.images.length : 0,
                hasColorCheck: Boolean(parsed.colorCheck),
                dateKey: parsed.colorCheck?.dateKey || parsed.dateKey || null,
            };
        }
    } catch {
        return `[string body length=${body.length}]`;
    }

    return undefined;
};

const redactHeadersForLog = (headers) => {
    const auth = headers.Authorization || headers.authorization;
    return {
        ...headers,
        ...(auth ? { Authorization: '[present redacted]' } : { Authorization: '[missing]' }),
    };
};

const parseResponsePayload = async (response) => {
    const contentType = response.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
        return await response.json();
    }

    const text = await response.text();
    return { message: text || null };
};

const createApiError = ({ message, status = null, code = null, url, method, responseBody = null, isNetworkError = false }) => {
    const error = new Error(message);
    error.status = status;
    error.code = code;
    error.url = url;
    error.method = method;
    error.responseBody = responseBody;
    error.isNetworkError = isNetworkError;
    return error;
};

const getMixedContentHint = (url) => {
    if (typeof window === 'undefined') return '';
    const pageIsHttps = window.location.protocol === 'https:';
    const requestIsHttp = /^http:\/\//i.test(url);
    return pageIsHttps && requestIsHttp ? ' Mixed content detected (https page calling http API).' : '';
};

export const apiFetch = async (path, options = {}) => {
    const url = buildUrl(path);
    const method = options.method || 'GET';
    const token = getStoredToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const debugPayload = {
        url,
        method,
        headers: redactHeadersForLog(headers),
        bodySummary: summarizeRequestBody(options.body),
    };
    console.log('[apiFetch] Request', debugPayload);

    let response;
    try {
        response = await fetch(url, {
            ...options,
            method,
            headers,
        });
    } catch (error) {
        const mixedContentHint = getMixedContentHint(url);
        const detail = `Network error: likely server down, CORS, wrong URL, or mixed content.${mixedContentHint}`;
        console.error('[apiFetch] Network failure', { ...debugPayload, originalError: error?.message || error });
        throw createApiError({
            message: detail,
            url,
            method,
            isNetworkError: true,
        });
    }

    const data = await parseResponsePayload(response);
    console.log('[apiFetch] Response', {
        url,
        method,
        status: response.status,
        ok: response.ok,
        body: data,
    });

    if (!response.ok) {
        const backendMessage = data?.message || data?.error?.message;
        const message = backendMessage || `API Error: ${response.status} ${response.statusText}`;
        throw createApiError({
            message,
            status: response.status,
            code: data?.error?.code || null,
            url,
            method,
            responseBody: data,
        });
    }

    return data;
};

export const checkApiHealth = async () => {
    const data = await apiFetch('/health', { method: 'GET' });
    if (!data?.ok) {
        throw createApiError({
            message: 'Health check failed: API reachable but unhealthy',
            status: 503,
            url: buildUrl('/health'),
            method: 'GET',
            responseBody: data,
        });
    }
    return data;
};

export const validateSession = async () => {
    const data = await apiFetch('/auth/me', { method: 'GET' });
    return data?.user || null;
};
