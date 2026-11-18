export interface ApiClientOptions {
  baseUrl: string;
  getAccessToken?: () => Promise<string | undefined>;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    async get<T>(path: string): Promise<T> {
      const token = await options.getAccessToken?.();
      const response = await fetch(new URL(path, options.baseUrl), {
        ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      return (await response.json()) as T;
    },
  };
}
