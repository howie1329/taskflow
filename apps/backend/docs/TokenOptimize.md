DB count needs to change to message pointer

Practical heuristic to use
Trigger by tokens OR messages
Summarize when either:
estimated_tokens(history_since_last_summary) ≥ T, or
messages_since_last_summary ≥ K
Start with T = 2,000–3,000 tokens, K = 12–16 messages. Tune per model.
Cooldown and freshness
Enforce a cooldown: don’t summarize again until at least C new messages (e.g., C = 6).
Always keep the last N raw messages un-summarized (e.g., N = 6–10) for recency fidelity.
Rolling summary with anchors
Persist: summary_text, summary_tokens, last_summarized_message_index, total_message_count.
When summarizing, summarize only messages since last_summarized_message_index, then merge into summary_text. Update pointers and counts.
Model-aware thresholds
Use higher thresholds for larger-context models; lower for small-context or expensive models.
Fail-safe
If summarization fails, skip and retry later without blocking chat.

function estimateTokens(str) {
return Math.ceil(str.split(/\s+/).length \* 1.3); // rough 1.3x word->token
}
