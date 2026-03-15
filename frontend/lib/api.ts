const CONFIGURED_API_BASE_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/$/, "");

export function getApiBaseUrl() {
    if (CONFIGURED_API_BASE_URL) {
        return CONFIGURED_API_BASE_URL;
    }

    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
}

export function buildApiUrl(endpoint: string) {
    return `${getApiBaseUrl()}${endpoint}`;
}

async function getErrorMessage(response: Response) {
    const errorData = await response.json().catch(() => null);

    if (
        errorData &&
        typeof errorData === "object" &&
        "detail" in errorData &&
        typeof errorData.detail === "string"
    ) {
        return errorData.detail;
    }

    return `Request failed with status ${response.status}`;
}

export async function apiRequest<T>(endpoint: string, options: RequestInit = {}) {
    const url = buildApiUrl(endpoint);

    const response = await fetch(url, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...options.headers,
        },
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json() as Promise<T>;
}

export async function apiFormRequest<T>(endpoint: string, formData: FormData) {
    const url = buildApiUrl(endpoint);

    const response = await fetch(url, {
        method: "POST",
        body: formData,
        // Let browser set Content-Type for FormData
    });

    if (!response.ok) {
        throw new Error(await getErrorMessage(response));
    }

    return response.json() as Promise<T>;
}
