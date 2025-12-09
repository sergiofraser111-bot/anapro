import { API_BASE_URL, SESSION_TOKEN_KEY } from '../lib/constants';

// API client with automatic auth header injection
class APIClient {
    private baseURL: string;

    constructor(baseURL: string) {
        this.baseURL = baseURL;
    }

    private getAuthHeader(): HeadersInit {
        const token = localStorage.getItem(SESSION_TOKEN_KEY);
        if (token) {
            return { 'Authorization': `Bearer ${token}` };
        }
        return {};
    }

    async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${this.baseURL}${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...this.getAuthHeader(),
            ...options.headers,
        };

        const response = await fetch(url, {
            ...options,
            headers,
        });

        if (!response.ok) {
            let errorMsg = `HTTP ${response.status}`;
            try {
                const text = await response.text();
                try {
                    const json = JSON.parse(text);
                    errorMsg = json.error || errorMsg;
                } catch {
                    // If not JSON, use a snippet of the text (e.g. HTML error title)
                    errorMsg = `Server Error (${response.status}): ${text.slice(0, 100)}`;
                }
            } catch {
                // Ignore reading body error
            }
            throw new Error(errorMsg);
        }

        return response.json();
    }

    async get<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'GET' });
    }

    async post<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async put<T>(endpoint: string, data?: any): Promise<T> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        });
    }

    async delete<T>(endpoint: string): Promise<T> {
        return this.request<T>(endpoint, { method: 'DELETE' });
    }
}

export const apiClient = new APIClient(API_BASE_URL);
