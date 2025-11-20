import axios from 'axios';

const ESV_API_BASE_URL = 'https://api.esv.org/v3';
const ESV_API_KEY = import.meta.env.VITE_ESV_API_KEY || '';

export interface ESVPassage {
  query: string;
  canonical: string;
  parsed: string[][];
  passage_meta: Array<{
    canonical: string;
    chapter_start: number[];
    chapter_end: number[];
    prev_verse: number;
    next_verse: number;
    prev_chapter: number[];
    next_chapter: number[];
  }>;
  passages: string[];
}

class ESVApiClient {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = ESV_API_KEY;
    this.baseUrl = ESV_API_BASE_URL;
  }

  /**
   * Fetch a passage from the ESV API
   * @param reference - Bible reference (e.g., "John 3:16", "Romans 8:28-30")
   * @returns Passage text and metadata
   */
  async getPassage(reference: string): Promise<{
    reference: string;
    text: string;
    canonical: string;
  }> {
    if (!this.apiKey) {
      throw new Error('ESV API key not configured. Set VITE_ESV_API_KEY in environment.');
    }

    try {
      const response = await axios.get<ESVPassage>(`${this.baseUrl}/passage/text/`, {
        params: {
          q: reference,
          'include-headings': false,
          'include-footnotes': false,
          'include-verse-numbers': false,
          'include-short-copyright': false,
          'include-passage-references': false,
        },
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      });

      const data = response.data;

      if (!data.passages || data.passages.length === 0) {
        throw new Error('No passage found for reference: ' + reference);
      }

      // Clean up the passage text
      const text = data.passages[0]
        .trim()
        .replace(/\s+/g, ' ')
        .replace(/\n+/g, ' ');

      return {
        reference: data.canonical || reference,
        text,
        canonical: data.canonical,
      };
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`ESV API error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }

  /**
   * Search for passages in the ESV Bible
   * @param query - Search query
   * @param page - Page number (default: 1)
   * @returns Search results
   */
  async search(
    query: string,
    page: number = 1
  ): Promise<{
    results: Array<{ reference: string; content: string }>;
    total_results: number;
    page: number;
    total_pages: number;
  }> {
    if (!this.apiKey) {
      throw new Error('ESV API key not configured');
    }

    try {
      const response = await axios.get(`${this.baseUrl}/passage/search/`, {
        params: {
          q: query,
          page,
          'page-size': 20,
        },
        headers: {
          Authorization: `Token ${this.apiKey}`,
        },
      });

      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`ESV API search error: ${error.response?.statusText || error.message}`);
      }
      throw error;
    }
  }
}

export const esvApiClient = new ESVApiClient();
