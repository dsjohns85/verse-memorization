import { Verse, Review, User, VerseStats, ReviewStats } from '../types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// For development, we'll use a simple mock user email
const DEV_USER_EMAIL = 'test@example.com';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = API_URL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // Merge with options headers if provided
    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    // In development, add mock user email header
    if (import.meta.env.DEV) {
      headers['X-User-Email'] = DEV_USER_EMAIL;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Request failed' }));
      throw new Error(error.message || `Request failed with status ${response.status}`);
    }

    return response.json();
  }

  // Verse endpoints
  async getVerses(): Promise<Verse[]> {
    return this.request<Verse[]>('/api/verses');
  }

  async getVerse(id: string): Promise<Verse> {
    return this.request<Verse>(`/api/verses/${id}`);
  }

  async getVersesDue(): Promise<Verse[]> {
    return this.request<Verse[]>('/api/verses/due');
  }

  async getVerseStats(): Promise<VerseStats> {
    return this.request<VerseStats>('/api/verses/stats');
  }

  async createVerse(data: {
    reference: string;
    text: string;
    translation?: string;
  }): Promise<Verse> {
    return this.request<Verse>('/api/verses', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateVerse(
    id: string,
    data: {
      reference?: string;
      text?: string;
      translation?: string;
    }
  ): Promise<Verse> {
    return this.request<Verse>(`/api/verses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteVerse(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/api/verses/${id}`, {
      method: 'DELETE',
    });
  }

  // Review endpoints
  async createReview(data: { verseId: string; quality: number }): Promise<Review> {
    return this.request<Review>('/api/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getReviewHistory(limit?: number): Promise<Review[]> {
    const query = limit ? `?limit=${limit}` : '';
    return this.request<Review[]>(`/api/reviews/history${query}`);
  }

  async getReviewStats(days?: number): Promise<ReviewStats> {
    const query = days ? `?days=${days}` : '';
    return this.request<ReviewStats>(`/api/reviews/stats${query}`);
  }

  // User endpoints
  async getCurrentUser(): Promise<User> {
    return this.request<User>('/api/users/me');
  }

  async updateUser(data: { name?: string }): Promise<User> {
    return this.request<User>('/api/users/me', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }
}

export const apiClient = new ApiClient();
