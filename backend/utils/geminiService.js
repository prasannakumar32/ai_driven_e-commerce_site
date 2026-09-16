/**
 * geminiService.js
 * Central service for all Gemini AI calls.
 * Used by: smart search ranking, personalized recommendations, similar products.
 * Falls back gracefully when the API key is missing or the model is unavailable.
 */

let GoogleGenAI;
try {
  GoogleGenAI = require('@google/genai').GoogleGenAI;
} catch (_) {
  console.warn('[Gemini] @google/genai not installed — AI features will use rule-based fallback.');
}

const isGeminiAvailable = () =>
  !!GoogleGenAI &&
  !!process.env.GEMINI_API_KEY &&
  process.env.GEMINI_API_KEY !== 'your-gemini-api-key';

let _ai = null;
const getAI = () => {
  if (!_ai && isGeminiAvailable()) {
    _ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  }
  return _ai;
};

// Wrapper to prevent Gemini from hanging indefinitely
const callGeminiWithTimeout = async (ai, prompt, timeoutMs = 5000) => {
  const geminiPromise = ai.models.generateContent({
    model: 'gemini-2.0-flash',
    contents: prompt,
    config: { responseMimeType: 'application/json' }
  });
  
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Gemini API timeout')), timeoutMs)
  );

  return Promise.race([geminiPromise, timeoutPromise]);
};

/**
 * Ask Gemini to rank a list of product candidates for a given search query.
 * Returns the product IDs in ranked order with a brief reason for each.
 *
 * @param {string} query         - User's search query
 * @param {object[]} products    - Array of product objects (id, name, category, brand, tags)
 * @returns {Promise<{rankedIds: string[], reasons: object}>}
 */
const rankSearchResults = async (query, products) => {
  const ai = getAI();
  if (!ai || products.length === 0) return { rankedIds: products.map(p => p._id?.toString()), reasons: {} };

  try {
    const candidates = products.slice(0, 30).map(p => ({
      id: p._id?.toString(),
      name: p.name,
      category: p.category,
      brand: p.brand,
      tags: (p.tags || []).slice(0, 5),
      rating: p.rating,
      price: p.price
    }));

    const prompt = `You are an e-commerce search ranking AI.

User searched for: "${query}"

Rank the following products from MOST to LEAST relevant for this search query.
Consider: name match, category relevance, brand relevance, tags, and overall fit.

Products (JSON):
${JSON.stringify(candidates, null, 2)}

Respond with ONLY valid JSON in this exact format:
{
  "rankedIds": ["id1", "id2", "id3", ...],
  "reasons": {
    "id1": "One-line reason why this is most relevant",
    "id2": "One-line reason"
  }
}

Include ALL product IDs in rankedIds. Put the most relevant first.`;

    const response = await callGeminiWithTimeout(ai, prompt, 6000); // 6s timeout for search ranking

    const result = JSON.parse(response.text);
    return {
      rankedIds: result.rankedIds || candidates.map(c => c.id),
      reasons: result.reasons || {}
    };
  } catch (err) {
    console.error('[Gemini] rankSearchResults error:', err.message);
    return { rankedIds: products.map(p => p._id?.toString()), reasons: {} };
  }
};

/**
 * Ask Gemini to generate personalized product recommendations for a user.
 * Returns recommended product IDs in priority order with a score (0–1) and reason.
 *
 * @param {object} userProfile   - { interests, browsingHistory, purchaseHistory, preferences }
 * @param {object[]} candidates  - Pool of available products to choose from
 * @param {number} limit         - How many to return
 * @returns {Promise<{rankedIds: string[], scores: object, reasons: object}>}
 */
const getAIRecommendations = async (userProfile, candidates, limit = 10) => {
  const ai = getAI();
  if (!ai || candidates.length === 0) {
    return { rankedIds: candidates.map(p => p._id?.toString()), scores: {}, reasons: {} };
  }

  try {
    const profile = {
      interestedCategories: userProfile.interests?.categories?.slice(0, 5) || [],
      interestedBrands: userProfile.interests?.brands?.slice(0, 5) || [],
      recentlyViewedCategories: userProfile.browsingHistory?.slice(-10).map(h => h.category).filter(Boolean) || [],
      purchasedCategories: userProfile.purchaseHistory?.map(h => h.category).filter(Boolean) || [],
      priceRange: userProfile.preferences?.priceRange || { min: 0, max: 100000 },
      tags: userProfile.interests?.tags?.slice(0, 10) || []
    };

    const pool = candidates.slice(0, 40).map(p => ({
      id: p._id?.toString(),
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      tags: (p.tags || []).slice(0, 5)
    }));

    const prompt = `You are a personalized recommendation AI for an e-commerce platform.

User profile:
${JSON.stringify(profile, null, 2)}

Available products:
${JSON.stringify(pool, null, 2)}

Select the top ${limit} products most relevant to this user based on their interests, browsing history, and price range.
Rank them from most to least relevant.

Respond ONLY with valid JSON:
{
  "rankedIds": ["id1", "id2", ...],
  "scores": { "id1": 0.95, "id2": 0.87 },
  "reasons": { "id1": "Matches user's interest in electronics and Apple products" }
}`;

    const response = await callGeminiWithTimeout(ai, prompt, 6000);

    const result = JSON.parse(response.text);
    return {
      rankedIds: (result.rankedIds || pool.map(p => p.id)).slice(0, limit),
      scores: result.scores || {},
      reasons: result.reasons || {}
    };
  } catch (err) {
    console.error('[Gemini] getAIRecommendations error:', err.message);
    return { rankedIds: candidates.slice(0, limit).map(p => p._id?.toString()), scores: {}, reasons: {} };
  }
};

/**
 * Ask Gemini to find the most complementary/similar products for a given product.
 *
 * @param {object} product       - The source product
 * @param {object[]} candidates  - Pool of candidate products
 * @param {number} limit         - How many to return
 * @returns {Promise<{rankedIds: string[], types: object, reasons: object}>}
 */
const getSimilarProductsAI = async (product, candidates, limit = 6) => {
  const ai = getAI();
  if (!ai || candidates.length === 0) {
    return { rankedIds: candidates.map(p => p._id?.toString()), types: {}, reasons: {} };
  }

  try {
    const source = {
      name: product.name,
      category: product.category,
      brand: product.brand,
      tags: (product.tags || []).slice(0, 8),
      price: product.price,
      features: (product.features || []).slice(0, 5)
    };

    const pool = candidates.slice(0, 30).map(p => ({
      id: p._id?.toString(),
      name: p.name,
      category: p.category,
      brand: p.brand,
      price: p.price,
      rating: p.rating,
      tags: (p.tags || []).slice(0, 5)
    }));

    const prompt = `You are a product recommendation AI for an e-commerce store.

A user is viewing this product:
${JSON.stringify(source, null, 2)}

From the candidates below, select the ${limit} most relevant products to recommend.
Include BOTH:
1. Similar products (same category/brand/use case)
2. Complementary products (accessories or items that go well with the viewed product)

Candidates:
${JSON.stringify(pool, null, 2)}

Respond ONLY with valid JSON:
{
  "rankedIds": ["id1", "id2", ...],
  "types": { "id1": "similar", "id2": "complementary" },
  "reasons": { "id1": "Same category smartphone from rival brand", "id2": "Popular case accessory for this phone" }
}`;

    const response = await callGeminiWithTimeout(ai, prompt, 6000);

    const result = JSON.parse(response.text);
    return {
      rankedIds: (result.rankedIds || pool.map(p => p.id)).slice(0, limit),
      types: result.types || {},
      reasons: result.reasons || {}
    };
  } catch (err) {
    console.error('[Gemini] getSimilarProductsAI error:', err.message);
    return { rankedIds: candidates.slice(0, limit).map(p => p._id?.toString()), types: {}, reasons: {} };
  }
};

/**
 * Utility: reorder an array of product objects using a ranked ID list from Gemini.
 * Products not in the ranked list are appended at the end.
 */
const reorderByRankedIds = (products, rankedIds, extraProps = {}) => {
  const idToProduct = new Map(products.map(p => [p._id?.toString(), p]));
  const ordered = [];
  const seen = new Set();

  for (const id of rankedIds) {
    if (idToProduct.has(id) && !seen.has(id)) {
      const p = idToProduct.get(id);
      ordered.push({ ...p, ...(extraProps[id] || {}), aiPowered: true });
      seen.add(id);
    }
  }

  // Append any products not in Gemini's ranked list
  for (const p of products) {
    const id = p._id?.toString();
    if (!seen.has(id)) {
      ordered.push(p);
      seen.add(id);
    }
  }

  return ordered;
};

module.exports = {
  isGeminiAvailable,
  rankSearchResults,
  getAIRecommendations,
  getSimilarProductsAI,
  reorderByRankedIds
};
