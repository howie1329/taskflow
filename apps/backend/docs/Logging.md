# Logging TODO

Add structured logging with correlation IDs across the application.

## TODOs

- [ ] Install logger: `npm i pino pino-http`
- [ ] Create `utils/logger.js` with Pino (pretty in dev, JSON in prod)
- [ ] Add request logging middleware with correlation ID (`x-correlation-id`) and `req.log`
- [ ] Expose correlation ID in responses (`x-correlation-id` header)
- [ ] Replace all `console.*` with structured logs
  - [ ] `controllers/newControllers/AIController.js`
  - [ ] `application/usecases/AiUseCaseService.js`
  - [ ] `application/services/ConversationService.js`
  - [ ] `application/repositories/*`
  - [ ] `sockets/*`
  - [ ] `index.js`
  - [ ] `utils/aiTools.js` (reduce payloads; log counts/ids)
- [ ] Inject `logger` via container into services/repositories
- [ ] Add timing around AI calls (durationMs)
- [ ] Limit log payload sizes; avoid PII
- [ ] Add log levels: debug/info/warn/error
- [ ] Document where to view logs (local, Docker, PM2, K8s)
- [ ] Add sample queries/filters by `correlationId` in your log platform

## Example

```json
{
  "level": "info",
  "msg": "AIChatConversation start",
  "correlationId": "req-abc123",
  "userId": "u_42",
  "route": "/api/ai/chat"
}
```

## Notes

- Use `req.log` in controllers; inject `logger` elsewhere.
- Prefer metadata objects over raw payloads.
- Keep correlation ID consistent across services.

# Logging Setup

Structured logging with correlation IDs using Pino.

## 1) Install

```bash
npm i pino pino-http pino-pretty
```

## 2) Create base logger

Path: `utils/logger.js`

```javascript
const pino = require("pino");

const logger = pino({
  level: process.env.LOG_LEVEL || "info",
  base: null,
  transport:
    process.env.NODE_ENV === "development"
      ? {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "SYS:standard" },
        }
      : undefined,
});

module.exports = logger;
```

## 3) Request middleware with correlation ID

Path: `middleware/requestLogger.js`

```javascript
const pinoHttp = require("pino-http");
const { v4: uuid } = require("uuid");
const logger = require("../utils/logger");

module.exports = pinoHttp({
  logger,
  genReqId: (req) => req.headers["x-correlation-id"] || uuid(),
  customProps: (req, res) => ({
    correlationId: req.id,
    userId: req.user?.id || undefined,
  }),
});
```

## 4) Wire into app

In `index.js` (before routes):

```javascript
const requestLogger = require("./middleware/requestLogger");
app.use(requestLogger);
app.use((req, res, next) => {
  res.setHeader("x-correlation-id", req.id);
  next();
});
```

## 5) Use logs in controllers

```javascript
// inside a controller handler
req.log.info({ route: req.originalUrl }, "request start");
try {
  // ...
  req.log.info({ status: "ok" }, "request success");
  return res.json(result);
} catch (err) {
  req.log.error({ err }, "request failed");
  return next(err);
}
```

## 6) Inject logger elsewhere

- Prefer DI via your container; fall back to requiring `utils/logger.js`.

Example service:

```javascript
class ConversationService {
  constructor(repository, logger) {
    this.repository = repository;
    this.logger = logger;
  }
  async ensureConversationExists(userId, conversationId, title) {
    this.logger?.debug({ userId, conversationId }, "ensure conversation");
    // ...
  }
}
```

Example container wiring:

```javascript
const logger = require("../utils/logger");
// pass logger into services/repositories as needed
```

## 7) Replace console.\*

- Replace `console.log/error/warn/info` with:

```javascript
logger.info({ key: "value" }, "message");
logger.error({ err }, "something failed");
```

- In controllers, always use `req.log`.

## 8) Suggested log fields

- Common: `correlationId`, `userId`, `route`, `durationMs`, `conversationId`, `op`, `count`
- Errors: `err` object

## 9) Viewing logs

- Local: `npm start` (pretty if `NODE_ENV=development`)
- Docker: `docker compose logs -f`
- File (optional): `node index.js | pino-pretty > app.log`

## 10) Env vars (optional)

- `LOG_LEVEL=debug` (more verbose)
- `NODE_ENV=production` (JSON logs, no pretty)

## 11) Examples

Controller:

```javascript
req.log.info({ conversationId }, "AIChatConversation start");
const t0 = Date.now();
// call service/AI
req.log.info({ durationMs: Date.now() - t0 }, "AI call complete");
```

Repository error:

```javascript
if (error) {
  this.logger?.error(
    { err: error, op: "fetchMessages", conversationId, userId },
    "DB error"
  );
  throw error;
}
```

AI stream chunk (debug):

```javascript
this.logger?.debug({ chunkLen: String(chunk).length }, "AI stream chunk");
```

```

- This complements `docs/Logging.md` by giving exact steps and snippets to wire everything up.
```
