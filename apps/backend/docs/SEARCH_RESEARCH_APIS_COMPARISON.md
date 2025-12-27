# Search & Research APIs Comparison (2024)

## Overview

This document compares various search and research APIs available for implementing the Research + Daily Digest feature in Taskflow. It includes pricing, features, and recommendations for cost-effective implementation.

---

## Paid APIs

### 1. Exa Search API

**Pricing:**
- **Search Requests:**
  - 1–25 results: **$5 per 1,000 requests**
  - 26–100 results: **$25 per 1,000 requests**
- **Content Retrieval:**
  - Text, Highlights, or Summaries: **$1 per 1,000 pages**
- **Answer Generation:** **$5 per 1,000 answers**
- **Research Tasks:**
  - Agent search operations: **$5 per 1,000 searches**
  - Agent page reads: **$5 per 1,000 pages**
  - Reasoning tokens: **$5 per 1 million tokens**

**Model:** Pay-as-you-go (no monthly subscription)

**Best For:** AI-powered semantic search with content extraction

**Features:**
- Semantic understanding of queries
- Content extraction (text, highlights, summaries)
- Live crawling capability
- Answer generation with citations

---

### 2. Exa Websets

**Pricing Plans:**

| Plan | Monthly Cost | Credits/Month | Results/Webset | Team Seats | Enrichment Columns |
|------|-------------|----------------|----------------|------------|-------------------|
| **Starter** | $49 | 8,000 | Up to 100 | 2 | 10 |
| **Pro** | $449 | 100,000 | Up to 1,000 | 10 | 50 |
| **Enterprise** | Custom | Custom | Up to 5,000 | Custom | 100 |

**Credit Usage:**
- 10 credits per fully matched result
- 5 credits per email or phone number
- 2 credits per other enrichment field

**Best For:** Structured data collection with built-in enrichments

**Features:**
- Pre-built enrichment pipelines
- Batch processing optimizations
- Structured entity extraction
- Custom enrichment columns

---

### 3. Google Custom Search API

**Pricing:**
- **Free Tier:** 100 searches per day (3,000/month)
- **Paid:** $5 per 1,000 queries after free tier

**Best For:** General web search with customization

**Features:**
- Customizable search engines
- Site-specific searches
- Reliable uptime
- High scalability

---

### 4. SerpAPI

**Pricing (Estimated):**
- **Free Tier:** ~100 searches/month
- **Paid:** Starts around $50/month for 5,000 searches

**Best For:** Google/Bing search results parsing

**Features:**
- Structured Google/Bing results
- Parsed HTML extraction
- Multiple search engines support

---

### 5. Perplexity API

**Pricing:**
- **Free Tier:** Limited requests/month
- **Paid:** Varies by plan

**Best For:** AI-powered conversational search with citations

**Features:**
- Conversational answers
- Real-time citations
- AI-driven search
- Concise summaries

---

## Free/Low-Cost APIs

### 6. Academic APIs (Free)

#### arXiv API
- **Pricing:** Free, unlimited
- **Rate Limits:** Reasonable use policy
- **Best For:** Physics, mathematics, computer science papers

#### Semantic Scholar API
- **Pricing:** Free
- **Rate Limits:** 100 requests per 5 minutes
- **Best For:** Academic paper search with citations

#### CrossRef API
- **Pricing:** Free
- **Rate Limits:** 50 requests per second
- **Best For:** Scholarly metadata and DOIs

#### PubMed API
- **Pricing:** Free, unlimited
- **Best For:** Biomedical and life sciences research

**Best For:** Academic papers and research

---

### 7. DuckDuckGo Instant Answer API

**Pricing:** Free (no official API, but can scrape)

**Limitations:**
- Rate limits apply
- No official support
- Terms of service restrictions

**Best For:** Privacy-focused search

---

### 8. Bing Search API (Azure)

**Pricing:**
- **Free Tier:** 1,000 queries/month
- **Paid:** ~$4 per 1,000 queries

**Best For:** Microsoft ecosystem integration

**Features:**
- Web search results
- News search
- Image search
- Video search

---

## Cost Comparison Table

| Service | Free Tier | Cost per 1K Searches | Monthly Subscription | Best Use Case |
|---------|-----------|---------------------|---------------------|---------------|
| **Exa Search API** | None | $5 (1-25 results)<br>$25 (26-100) | None | AI semantic search |
| **Exa Websets** | None | N/A | $49-$449/month | Structured data collection |
| **Google Custom Search** | 100/day | $5 | None | General web search |
| **Perplexity API** | Limited | Varies | Varies | AI conversational search |
| **SerpAPI** | ~100/month | ~$10 | $50+/month | Google/Bing parsing |
| **Bing Search API** | 1,000/month | ~$4 | None | Microsoft ecosystem |
| **Academic APIs** | Unlimited* | Free | Free | Research papers |
| **DuckDuckGo** | Unlimited* | Free | Free | Privacy-focused |

*With reasonable rate limits

---

## Recommended Strategy

### Tier 1: Free Tier Usage

Maximize free tier capacity:
1. **Google Custom Search:** 100 free/day = **3,000/month**
2. **Bing Search API:** 1,000 free/month
3. **Academic APIs:** Free for papers
4. **Total Free Capacity:** ~4,000 searches/month

### Tier 2: Pay-as-You-Go (Low Cost)

For queries beyond free tier:
1. **Exa Search API:** $5 per 1,000 searches (1-25 results)
2. **Google Custom Search:** $5 per 1,000 after free tier
3. **Cost:** ~$0.005 per search

### Tier 3: Hybrid Approach (Recommended)

Combine free tiers + pay-as-you-go + LLM enrichment:

```javascript
// Cost-effective research service
const researchStrategy = {
  // Free sources first
  freeSources: [
    'googleCustomSearch', // 100/day free
    'bingSearch',         // 1,000/month free
    'academicAPIs',       // Unlimited free
  ],
  
  // Paid sources as fallback
  paidSources: [
    'exaSearch',          // $5/1K searches
    'perplexity',         // Free tier available
  ],
  
  // LLM enrichment
  enrichment: {
    model: 'gpt-4o-mini', // ~$0.15/1M tokens
    costPerEnrichment: '~$0.02-0.05 per batch',
  },
};
```

---

## Cost Analysis: Example Use Case

**Query:** "Find 10 companies primed for great Q4"

### Option 1: Exa Search + LLM Enrichment
- Exa search (10 results): **$0.05**
- LLM enrichment (1 batch): **$0.03-0.05**
- **Total:** ~**$0.08-0.10 per query**

### Option 2: Free Tier + LLM Enrichment
- Google Custom Search: **Free** (within 100/day limit)
- Bing Search: **Free** (within 1,000/month limit)
- LLM enrichment: **$0.03-0.05**
- **Total:** ~**$0.03-0.05 per query**

### Option 3: Exa Websets
- Monthly: **$49/month**
- Break-even: ~500-1,000 queries/month

---

## LLM Enrichment Approach

### Why Use LLM Enrichment Instead of Websets?

**Advantages:**
1. ✅ **Flexibility:** Custom schemas per query
2. ✅ **Multi-source:** Combine Exa + Google + Perplexity + academic
3. ✅ **Context-aware:** Uses user's tasks/notes for better extraction
4. ✅ **Cost control:** Pay per use, not monthly subscription
5. ✅ **Better deduplication:** Semantic understanding, not just URLs
6. ✅ **Domain-specific:** Extract fields relevant to your use case

**Example Enrichment Schema:**

```javascript
const enrichmentSchema = {
  companyName: z.string().describe("Extracted company name"),
  industry: z.string().describe("Industry sector"),
  q4Outlook: z.string().describe("Why they're primed for Q4"),
  revenue: z.string().nullable().describe("Recent revenue if mentioned"),
  growthRate: z.string().nullable().describe("Growth rate if mentioned"),
  keyProducts: z.array(z.string()).describe("Key products/services"),
  marketPosition: z.string().describe("Market position"),
  recentNews: z.string().describe("Recent positive news"),
};
```

**Process:**
1. Search multiple sources (Exa, Google, Perplexity, Academic)
2. Merge results from all sources
3. LLM enriches with custom schema
4. Smart deduplication (semantic + URL)
5. Return structured table-ready data

---

## Final Recommendation

### Use Hybrid Approach:

1. **Start with free tiers:**
   - Google Custom Search (100/day)
   - Bing Search API (1,000/month)
   - Academic APIs (unlimited)

2. **Add pay-as-you-go:**
   - Exa Search API ($5/1K searches)
   - Only when free tier exhausted

3. **Enrich with LLM:**
   - Custom column extraction
   - Multi-source deduplication
   - Context-aware enrichment

4. **Add Perplexity:**
   - Free tier for conversational queries
   - Good for AI-powered summaries

### Cost Breakdown:

- **Free tier:** ~4,000 searches/month
- **Pay-as-you-go:** ~$0.005/search after free tier
- **LLM enrichment:** ~$0.03-0.05 per batch
- **Total monthly cost:** ~$0-20 for most use cases

### When Websets Might Be Worth It:

1. **High volume:** Processing 1,000+ items regularly
2. **Standard enrichments:** Common fields (revenue, employees) repeatedly needed
3. **Cost efficiency:** If LLM enrichment costs exceed $49/month
4. **Speed:** Need sub-second enrichment for large batches

---

## Implementation Notes

### Multi-Source Search Flow:

```
User Query
    ↓
[Free Tier Check]
    ├─→ Google Custom Search (if < 100/day)
    ├─→ Bing Search (if < 1,000/month)
    └─→ Academic APIs (always)
    ↓
[Fallback to Paid]
    ├─→ Exa Search API
    └─→ Perplexity API
    ↓
[Merge Results]
    ↓
[LLM Enrichment]
    ├─→ Extract custom columns
    ├─→ Add context from user data
    └─→ Generate summaries
    ↓
[Smart Deduplication]
    ├─→ URL-based dedupe
    └─→ Semantic similarity dedupe
    ↓
[Return Structured Results]
```

### Cost Optimization Tips:

1. **Cache repeat queries** - Store results for common searches
2. **Batch enrichment** - Process multiple results in one LLM call
3. **Use cheaper models** - GPT-4o-mini for enrichment, GPT-4o only when needed
4. **Prioritize free sources** - Always check free tier limits first
5. **Rate limiting** - Respect API rate limits to avoid overages

---

## References

- [Exa Search API Pricing](https://exa.ai/pricing/api)
- [Exa Websets Pricing](https://websets.exa.ai/pricing)
- [Google Custom Search API](https://developers.google.com/custom-search)
- [Perplexity API](https://www.perplexity.ai/)
- [Semantic Scholar API](https://www.semanticscholar.org/product/api)
- [arXiv API](https://arxiv.org/help/api)
- [CrossRef API](https://www.crossref.org/services/metadata-delivery/rest-api/)

---

## Last Updated

December 2024

