import { Product } from "../data/products";

// Simple Levenshtein distance for typo tolerance
function levenshteinDistance(a: string, b: string): number {
    const matrix = [];

    for (let i = 0; i <= b.length; i++) {
        matrix[i] = [i];
    }

    for (let j = 0; j <= a.length; j++) {
        matrix[0][j] = j;
    }

    for (let i = 1; i <= b.length; i++) {
        for (let j = 1; j <= a.length; j++) {
            if (b.charAt(i - 1) === a.charAt(j - 1)) {
                matrix[i][j] = matrix[i - 1][j - 1];
            } else {
                matrix[i][j] = Math.min(
                    matrix[i - 1][j - 1] + 1, // substitution
                    Math.min(
                        matrix[i][j - 1] + 1, // insertion
                        matrix[i - 1][j] + 1 // deletion
                    )
                );
            }
        }
    }

    return matrix[b.length][a.length];
}

export function searchProducts(query: string, products: Product[]): Product[] {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/);

    return products.filter(product => {
        const searchableText = [
            product.title,
            product.category,
            product.location,
            ...product.tags
        ].join(" ").toLowerCase();

        // 1. Exact match (High priority)
        if (searchableText.includes(normalizedQuery)) return true;

        // 2. Term match (Medium priority)
        const hasAllTerms = terms.every(term => searchableText.includes(term));
        if (hasAllTerms) return true;

        // 3. Fuzzy match / Typo tolerance (Low priority)
        // Check if any word in the product title/tags is "close enough" to the query terms
        const words = searchableText.split(/\s+/);
        return terms.some(term => {
            if (term.length < 3) return false; // Don't fuzzy match very short words
            return words.some(word => {
                if (Math.abs(word.length - term.length) > 2) return false;
                const dist = levenshteinDistance(term, word);
                return dist <= 1 || (term.length > 5 && dist <= 2);
            });
        });
    }).sort((a, b) => {
        // Simple ranking
        const aText = a.title.toLowerCase();
        const bText = b.title.toLowerCase();

        // Exact title match is best
        if (aText === normalizedQuery) return -1;
        if (bText === normalizedQuery) return 1;

        // Starts with query
        if (aText.startsWith(normalizedQuery) && !bText.startsWith(normalizedQuery)) return -1;
        if (bText.startsWith(normalizedQuery) && !aText.startsWith(normalizedQuery)) return 1;

        return 0;
    });
}

import { Profile } from "../data/profiles";

export function searchProfiles(query: string, profiles: Profile[]): Profile[] {
    if (!query) return [];

    const normalizedQuery = query.toLowerCase().trim();
    const terms = normalizedQuery.split(/\s+/);

    return profiles.filter(profile => {
        const searchableText = [
            profile.name,
            profile.handle,
            profile.bio,
            ...profile.tags
        ].join(" ").toLowerCase();

        // 1. Exact match
        if (searchableText.includes(normalizedQuery)) return true;

        // 2. Term match
        const hasAllTerms = terms.every(term => searchableText.includes(term));
        if (hasAllTerms) return true;

        // 3. Fuzzy match
        const words = searchableText.split(/\s+/);
        return terms.some(term => {
            if (term.length < 3) return false;
            return words.some(word => {
                if (Math.abs(word.length - term.length) > 2) return false;
                const dist = levenshteinDistance(term, word);
                return dist <= 1 || (term.length > 5 && dist <= 2);
            });
        });
    }).sort((a, b) => {
        const aText = a.name.toLowerCase();
        const bText = b.name.toLowerCase();

        if (aText === normalizedQuery) return -1;
        if (bText === normalizedQuery) return 1;

        if (aText.startsWith(normalizedQuery) && !bText.startsWith(normalizedQuery)) return -1;
        if (bText.startsWith(normalizedQuery) && !aText.startsWith(normalizedQuery)) return 1;

        return 0;
    });
}
