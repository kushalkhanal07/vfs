/**
 * Search Utilities - Tokenizer, TF-IDF ranking, and fuzzy matching
 */

export class SearchUtils {
  /**
   * Tokenize text into searchable words
   */
  static tokenize(text) {
    if (!text) return [];
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove special characters
      .split(/\s+/)
      .filter((token) => token.length > 0 && !this.isStopWord(token));
  }

  /**
   * Common stop words to exclude from search
   */
  static isStopWord(word) {
    const stopWords = new Set([
      "the",
      "a",
      "an",
      "and",
      "or",
      "but",
      "in",
      "on",
      "at",
      "to",
      "for",
      "of",
      "with",
      "is",
      "was",
      "are",
      "were",
      "be",
      "been",
      "being",
      "have",
      "has",
      "had",
      "do",
      "does",
      "did",
      "will",
      "would",
      "could",
      "should",
      "may",
      "might",
      "must",
      "can",
      "this",
      "that",
      "these",
      "those",
      "i",
      "you",
      "he",
      "she",
      "it",
      "we",
      "they",
    ]);
    return stopWords.has(word);
  }

  /**
   * Calculate TF (Term Frequency) for a document
   */
  static calculateTF(tokens) {
    const tf = {};
    const totalTokens = tokens.length;

    tokens.forEach((token) => {
      tf[token] = (tf[token] || 0) + 1;
    });

    Object.keys(tf).forEach((token) => {
      tf[token] = tf[token] / totalTokens;
    });

    return tf;
  }

  /**
   * Calculate IDF (Inverse Document Frequency) across multiple documents
   */
  static calculateIDF(allDocuments) {
    const documentCount = allDocuments.length;
    const idf = {};

    const allTokens = new Set();
    allDocuments.forEach((doc) => {
      doc.tokens.forEach((token) => allTokens.add(token));
    });

    allTokens.forEach((token) => {
      const docsWithToken = allDocuments.filter((doc) => doc.tokens.includes(token)).length;
      idf[token] = Math.log(documentCount / (docsWithToken + 1));
    });

    return idf;
  }

  /**
   * Calculate TF-IDF score for documents
   */
  static calculateTFIDF(documents, query) {
    const queryTokens = this.tokenize(query);
    const idf = this.calculateIDF(documents);

    return documents.map((doc) => {
      const tf = this.calculateTF(doc.tokens);
      let score = 0;

      queryTokens.forEach((token) => {
        score += (tf[token] || 0) * (idf[token] || 0);
      });

      return {
        ...doc,
        relevanceScore: score,
      };
    });
  }

  /**
   * Fuzzy string matching (Levenshtein distance)
   */
  static fuzzyMatch(query, text, threshold = 0.7) {
    const distance = this.levenshteinDistance(query.toLowerCase(), text.toLowerCase());
    const maxLength = Math.max(query.length, text.length);
    const similarity = 1 - distance / maxLength;
    return similarity >= threshold ? similarity : 0;
  }

  /**
   * Calculate Levenshtein distance between two strings
   */
  static levenshteinDistance(a, b) {
    const matrix = Array(b.length + 1)
      .fill(null)
      .map(() => Array(a.length + 1).fill(0));

    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;

    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        if (a[i - 1] === b[j - 1]) {
          matrix[j][i] = matrix[j - 1][i - 1];
        } else {
          matrix[j][i] = Math.min(
            matrix[j - 1][i - 1] + 1, // substitution
            matrix[j][i - 1] + 1, // insertion
            matrix[j - 1][i] + 1 // deletion
          );
        }
      }
    }

    return matrix[b.length][a.length];
  }

  /**
   * Rank search results by relevance
   */
  static rankResults(results) {
    return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
  }

  /**
   * Highlight query terms in search results
   */
  static highlightTerms(text, query, contextLength = 50) {
    const tokens = this.tokenize(query);
    let highlighted = text;

    tokens.forEach((token) => {
      const regex = new RegExp(`\\b${token}\\b`, "gi");
      highlighted = highlighted.replace(regex, `<mark>$&</mark>`);
    });

    return highlighted;
  }
}

export default SearchUtils;
