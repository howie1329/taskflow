# Security Notes

## Untrusted Input

Always validate external payloads before use:

- `safeParseUIMessages` for API request data
- `normalizeUIMessages` before persistence or model context construction

## Serialization Safety

- Use `makeJsonSerializable` to sanitize parts and remove unsupported values
- Use `assertJsonSerializable` where strict validation is required
- Circular references throw `ChatContentError` with code `CIRCULAR_REFERENCE`

## Logging Guidance

- Avoid logging raw message parts in production
- Log aggregate metadata only:
  - message count
  - token estimate
  - summarization trigger reason

## Redaction

Redaction is not implemented in v1. If needed, apply redaction in app code:

1. before persistence
2. before telemetry
3. before sending transcripts to summarizer LLM
