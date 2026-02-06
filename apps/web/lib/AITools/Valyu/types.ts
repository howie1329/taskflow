export interface SearchResponse {
    success: boolean;
    error?: string;
    tx_id: string | null;
    query: string;
    results: SearchResult[];
    results_by_source: {
        web: number;
        proprietary: number;
    };
    total_deduction_pcm: number;
    total_deduction_dollars: number;
    total_characters: number;
}

export interface SearchResult {
    title: string;
    url: string;
    content: string;
    description?: string;
    source: string;
    price: number;
    length: number;
    relevance_score: number;
    data_type?: "structured" | "unstructured";
    publication_date?: string;
    authors?: string[];
    citation?: string;
    doi?: string;
}