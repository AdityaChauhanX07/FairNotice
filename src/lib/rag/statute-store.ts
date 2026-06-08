import tenantStatutes from "@/data/statutes/california-tenant.json";
import insuranceStatutes from "@/data/statutes/california-insurance.json";
import benefitsStatutes from "@/data/statutes/california-benefits.json";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */

export interface Statute {
  id: string;
  statute_number: string;
  title: string;
  text: string;
  topics: string[];
  document_types: string[];
  jurisdiction: string;
  summary: string;
}

export interface StatuteResult extends Statute {
  /** Relevance score for the query; higher is more relevant. */
  score: number;
}

export interface StatuteSearchFilters {
  jurisdiction?: string;
  documentType?: string;
  topics?: string[];
}

/* ------------------------------------------------------------------ */
/* Tokenization                                                       */
/* ------------------------------------------------------------------ */

// Common English words that carry little retrieval signal.
const STOP_WORDS = new Set([
  "a", "an", "and", "are", "as", "at", "be", "by", "for", "from", "has", "have",
  "he", "her", "his", "i", "in", "is", "it", "its", "may", "must", "not", "of",
  "on", "or", "our", "shall", "she", "that", "the", "their", "them", "they",
  "this", "to", "was", "were", "will", "with", "you", "your", "if", "any",
  "all", "can", "do", "does", "but", "we", "us", "me", "my", "so", "no",
  "what", "which", "who", "whom", "been", "being", "than", "then", "there",
  "these", "those", "such", "about", "into", "over", "under", "out", "up",
]);

/** Lowercase, split on non-alphanumerics, drop stop words and 1-char tokens. */
function tokenize(input: string): string[] {
  return input
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((token) => token.length > 1 && !STOP_WORDS.has(token));
}

/** Count how many times `token` occurs as a whole word within `tokens`. */
function countOccurrences(tokens: string[], token: string): number {
  let count = 0;
  for (const t of tokens) {
    if (t === token) count += 1;
  }
  return count;
}

/* ------------------------------------------------------------------ */
/* Scoring weights                                                    */
/* ------------------------------------------------------------------ */

const WEIGHTS = {
  title: 5,
  summary: 3,
  topic: 4,
  text: 1,
  documentTypeMatch: 6,
  topicFilterMatch: 4,
};

/* ------------------------------------------------------------------ */
/* Store                                                              */
/* ------------------------------------------------------------------ */

export class StatuteStore {
  private readonly statutes: Statute[];
  private readonly byId: Map<string, Statute>;

  constructor() {
    this.statutes = [
      ...(tenantStatutes as Statute[]),
      ...(insuranceStatutes as Statute[]),
      ...(benefitsStatutes as Statute[]),
    ];
    this.byId = new Map(this.statutes.map((s) => [s.id, s]));
  }

  /**
   * Keyword search over the statute set.
   *
   * Tokenizes the query (removing stop words), scores each statute by weighted
   * keyword matches across its title, summary, topics, and text, and applies
   * bonuses for matching the requested document type and topic filters.
   */
  search(
    query: string,
    filters: StatuteSearchFilters = {},
    topK = 5
  ): StatuteResult[] {
    const queryTokens = tokenize(query);

    // 1. Pre-filter on hard filters before scoring.
    const candidates = this.statutes.filter((statute) => {
      if (
        filters.jurisdiction &&
        statute.jurisdiction.toLowerCase() !== filters.jurisdiction.toLowerCase()
      ) {
        return false;
      }
      if (
        filters.documentType &&
        !statute.document_types.includes(filters.documentType)
      ) {
        return false;
      }
      if (filters.topics && filters.topics.length > 0) {
        const statuteTopics = statute.topics.map((t) => t.toLowerCase());
        const hasTopic = filters.topics.some((t) =>
          statuteTopics.includes(t.toLowerCase())
        );
        if (!hasTopic) return false;
      }
      return true;
    });

    // 2. Score each candidate.
    const scored: StatuteResult[] = candidates.map((statute) => {
      const titleTokens = tokenize(statute.title);
      const summaryTokens = tokenize(statute.summary);
      const textTokens = tokenize(statute.text);
      const topicTokens = tokenize(statute.topics.join(" "));

      let score = 0;

      for (const token of queryTokens) {
        score += countOccurrences(titleTokens, token) * WEIGHTS.title;
        score += countOccurrences(summaryTokens, token) * WEIGHTS.summary;
        score += countOccurrences(topicTokens, token) * WEIGHTS.topic;
        score += countOccurrences(textTokens, token) * WEIGHTS.text;
      }

      // 3. Bonus weights for document-type and topic filter matches.
      if (
        filters.documentType &&
        statute.document_types.includes(filters.documentType)
      ) {
        score += WEIGHTS.documentTypeMatch;
      }
      if (filters.topics && filters.topics.length > 0) {
        const statuteTopics = statute.topics.map((t) => t.toLowerCase());
        const overlap = filters.topics.filter((t) =>
          statuteTopics.includes(t.toLowerCase())
        ).length;
        score += overlap * WEIGHTS.topicFilterMatch;
      }

      return { ...statute, score };
    });

    // 4. Keep only statutes with some relevance, sort, and return top-K.
    return scored
      .filter((result) => result.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, topK);
  }

  getById(id: string): Statute | null {
    return this.byId.get(id) ?? null;
  }

  getByTopic(topic: string): Statute[] {
    const target = topic.toLowerCase();
    return this.statutes.filter((statute) =>
      statute.topics.some((t) => t.toLowerCase() === target)
    );
  }

  getAllForJurisdiction(jurisdiction: string): Statute[] {
    const target = jurisdiction.toLowerCase();
    return this.statutes.filter(
      (statute) => statute.jurisdiction.toLowerCase() === target
    );
  }
}

/** Singleton instance loaded once per server process. */
export const statuteStore = new StatuteStore();
