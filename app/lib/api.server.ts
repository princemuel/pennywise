const SERVER_URL = process.env.SERVER_URL ?? "http://localhost:8080";

export class HttpError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "HttpError";
  }
}

export async function swr<T>(path: string, token: string, init?: RequestInit): Promise<T> {
  const input = new URL(path, SERVER_URL);
  const res = await fetch(input, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      // oxlint-disable-next-line typescript/no-misused-spread
      ...init?.headers,
    },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new HttpError(res.status, body || res.statusText);
  }

  // Handle 204 No Content
  if (res.status === 204) return undefined as T;

  return res.json() as Promise<T>;
}
