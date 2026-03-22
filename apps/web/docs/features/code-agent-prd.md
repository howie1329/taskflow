# Code Agent PRD

## Problem Statement

Taskflow currently has an AI chat experience and a separate Daytona-backed repo inspection flow, but it does not have a durable coding-agent experience that users can use with their own Codex subscriptions. Trying to fold Codex into the existing AI chat would create conflicting thread models, mixed conversation ownership, unclear lifecycle rules, and confusing persistence boundaries between Taskflow chat state and Codex state. Users need a dedicated Code Agent feature that can provision a coding sandbox, let them authenticate Codex with their own ChatGPT/Codex account, and maintain a persistent coding session without polluting the existing AI chat architecture.

## Solution

Introduce a separate `Code Agent` feature in `apps/web` that lives alongside the existing chat shell but owns its own threads, Daytona sandboxes, Codex session lifecycle, and streamed coding output. Users create a Code Agent thread, provide a public GitHub repository URL, provision a dedicated Daytona sandbox, sign in to Codex interactively inside that sandbox, and then use a persistent coding session that streams progress and final answers back into a chat-style interface. Existing AI chat remains separate and unaffected.

## User Stories

1. As a developer using Taskflow, I want a separate Code Agent feature, so that coding-agent work does not get mixed into the existing AI chat thread model.
2. As a developer, I want Code Agent to appear in the product shell, so that it feels like a first-class feature instead of an external add-on.
3. As a developer, I want Code Agent to have its own thread list, so that coding work can be organized independently from general AI chat.
4. As a developer, I want to create a new Code Agent thread, so that I can start a fresh coding session for a repository or task.
5. As a developer, I want to give Code Agent a public GitHub repository URL, so that the coding workspace can be provisioned from a known source.
6. As a developer, I want Code Agent to clone the repository into a Daytona sandbox, so that Codex can work in an isolated environment.
7. As a developer, I want the Code Agent sandbox to be separate from the existing repo-inspection sandbox, so that read-only inspection and writable coding do not interfere with each other.
8. As a developer, I want one persistent coding sandbox per Code Agent thread, so that my session can maintain state over time.
9. As a developer, I want one persistent Codex session per Code Agent thread, so that Codex can preserve working context across prompts.
10. As a developer, I want to authenticate Codex with my own ChatGPT/Codex subscription, so that I do not need to rely on a shared platform API key.
11. As a developer, I want the authentication flow to happen interactively inside the sandboxed Code Agent session, so that login remains user-owned.
12. As a developer, I want the app to avoid asking me for an OpenAI API key for Code Agent, so that the experience aligns with subscription-based Codex usage.
13. As a developer, I want to know when a Code Agent thread still needs authentication, so that I can complete login before trying to code.
14. As a developer, I want a resumed Code Agent thread to tell me when Codex auth has expired or is missing, so that recovery is straightforward.
15. As a developer, I want to send prompts to Code Agent in a chat-style interface, so that working with Codex feels familiar and conversational.
16. As a developer, I want Code Agent to stream terminal or progress output while working, so that I can see what it is doing in real time.
17. As a developer, I want Code Agent to also return a final readable answer after the streaming output, so that I can quickly understand the result of a turn.
18. As a developer, I want Code Agent to own the coding turn end-to-end, so that there is no ambiguity about whether Taskflow chat or Codex is producing the coding result.
19. As a developer, I want Code Agent to be able to edit files in its sandbox, so that it can make real progress on code tasks.
20. As a developer, I want Code Agent to be able to run installs, tests, and builds inside its sandbox, so that it can complete normal coding workflows.
21. As a developer, I want Code Agent to do this only inside its isolated sandbox, so that the rest of the app stays safe and predictable.
22. As a developer, I want the Code Agent thread to store my prompts and the streamed/final app-visible outputs, so that I have a durable record of the work from Taskflow’s perspective.
23. As a developer, I do not want the app to try to mirror Codex’s entire internal thread state, so that persistence stays manageable and duplication is avoided.
24. As a developer, I want to reopen a Code Agent thread later, so that I can continue work without starting over.
25. As a developer, I want Code Agent to resume the existing Daytona sandbox and Codex session when possible, so that long-running workspaces feel persistent.
26. As a developer, I want clear provisioning states, so that I understand whether Code Agent is creating a sandbox, ready, blocked on auth, running, stopped, or failed.
27. As a developer, I want clear failure states when sandbox creation, clone, session startup, or auth recovery fail, so that I know what to do next.
28. As a developer, I want Code Agent deletion to clean up the backing sandbox too, so that abandoned sessions do not accumulate unnecessarily.
29. As a developer, I want Code Agent lifecycle to be explicit and thread-owned, so that I can trust what will happen when I create, resume, or delete a thread.
30. As a product engineer, I want Code Agent isolated from the existing AI chat system, so that the current chat architecture does not need to absorb Codex’s thread model.
31. As a product engineer, I want Code Agent to have a dedicated persistence model, so that Code Agent state can evolve without destabilizing AI chat threads.
32. As a product engineer, I want the first version to support only public GitHub repos, so that repository provisioning stays simple.
33. As a product engineer, I want the first version to be Codex-first, so that the implementation targets one harness well before introducing abstraction for others.
34. As a product engineer, I want the architecture to leave room for future harnesses like Claude, OpenCode, or Mastra, so that expansion is possible later without forcing it into v1.
35. As a support/debugging teammate, I want Code Agent thread state to show lifecycle and auth status clearly, so that user issues can be diagnosed quickly.
36. As a support/debugging teammate, I want the app-visible transcript to include enough streamed progress and final outputs, so that Code Agent behavior is understandable without needing the full internal Codex transcript.
37. As a security-minded teammate, I want Code Agent auth to stay user-driven, so that the product does not centrally manage user OpenAI credentials.
38. As a future implementer, I want Code Agent to be described as a separate feature set rather than a chat mode, so that the product boundaries are clear from the start.
39. As a future implementer, I want sandbox ownership, auth state, and session reuse rules to be explicit, so that lifecycle behavior does not drift over time.
40. As a future implementer, I want Code Agent to sit cleanly alongside existing Daytona repo-inspection features, so that both systems can coexist without surprising cross-coupling.

## Implementation Decisions

- Code Agent is a separate product feature, not a mode inside the existing AI chat.
- Code Agent lives in the existing shell through a dedicated sidebar feature entry point.
- Code Agent has its own thread model and own thread list; it does not reuse or extend the existing AI chat thread/message model.
- The first version is Codex-first and does not attempt to build a harness abstraction layer up front.
- Each Code Agent thread owns one dedicated Daytona sandbox and one persistent Codex session.
- Code Agent sandboxes are separate from the current Daytona repo-inspection sandboxes.
- The initial workspace source is limited to a public GitHub repository URL.
- Provisioning flow is: create Code Agent thread, create Daytona sandbox, clone repo, start Codex CLI session, then prompt for interactive login if needed.
- Authentication is handled through interactive Codex CLI login inside the sandbox.
- The feature explicitly avoids requiring users to provide an OpenAI API key in the product.
- Code Agent threads store app-level prompts, streamed progress chunks, final responses, sandbox/session identifiers, and lifecycle state.
- The app does not attempt to mirror Codex’s full internal thread state or own Codex’s full conversation model.
- Recommended Code Agent lifecycle states include at least: provisioning, ready, needs_auth, running, stopped, and failed.
- Reopening a Code Agent thread should attempt to resume the existing Daytona sandbox and Codex session when still valid.
- If a thread resumes without valid Codex auth, the thread should move to a `needs_auth` state and guide the user through re-login.
- Code Agent owns the coding turn when active; the existing Taskflow AI chat does not orchestrate or interleave those turns.
- Code Agent may edit files and run normal development commands inside its sandbox.
- Deleting a Code Agent thread deletes the associated Daytona sandbox and Codex session.
- The design should keep room for future harness support, but only after the Codex-first path is proven.

## Testing Decisions

- Good tests should verify external behavior and user-visible state transitions rather than internal Codex or Daytona implementation details.
- The most important behaviors to test are:
  - Code Agent thread creation and persistence
  - Daytona sandbox provisioning from a public GitHub URL
  - Codex session startup and reuse
  - auth-required and re-auth flows
  - streamed progress/final response rendering
  - deletion cleanup of sandbox/session ownership
- Modules that are good candidates for direct tests include:
  - the Code Agent lifecycle/orchestration module
  - the thread persistence/state-mapping layer
  - any stream normalization layer that converts Codex session output into app-visible events
- UI tests should focus on user-facing behavior such as provisioning, auth-needed recovery, resume behavior, and deletion cleanup.
- Prior art for testing should follow the existing Taskflow preference for behavior-oriented tests and targeted lint/static validation, rather than brittle implementation-detail assertions.
- Manual acceptance should cover:
  - create a Code Agent thread from a GitHub repo
  - complete interactive Codex login
  - send prompts and observe streaming output plus final response
  - resume the same thread later
  - recover from missing auth
  - delete the thread and confirm sandbox cleanup

## Out of Scope

- Reusing the existing AI chat thread/message model for Code Agent
- Treating Codex as just another tool inside the current AI chat
- Private repository support in the first version
- Workspace uploads in the first version
- Multi-harness support in the first version
- API-key-based Codex authentication
- Mirroring the full internal Codex conversation or event model into Taskflow storage
- Building a full IDE-style experience with file browser, diffs, previews, or other rich coding workspace controls in the first version
- Sharing one Daytona sandbox between repo-inspection and Code Agent behavior

## Further Notes

- The most important product boundary is that Code Agent is a separate conversation engine with its own lifecycle, even if it appears in the same app shell.
- This approach keeps the existing AI chat architecture clean while still allowing a strong Codex-powered coding workflow.
- If the Codex-first version proves valuable, the architecture can later be generalized to support other coding harnesses, but that should happen after the core session, auth, and lifecycle model is validated.

## References

- Daytona OpenCode web agent guide: https://www.daytona.io/docs/en/guides/opencode/opencode-web-agent/
- Daytona Mastra coding agent guide: https://www.daytona.io/docs/en/guides/mastra/mastra-coding-agent/
- Daytona Claude Agent SDK interactive terminal sandbox guide: https://www.daytona.io/docs/en/guides/claude/claude-agent-sdk-interactive-terminal-sandbox/
- Daytona Codex SDK interactive terminal sandbox guide: https://www.daytona.io/docs/en/guides/codex/codex-sdk-interactive-terminal-sandbox/
- OpenAI Codex overview: https://developers.openai.com/codex
- OpenAI Codex CLI docs: https://developers.openai.com/codex/cli
- OpenAI Codex SDK docs: https://developers.openai.com/codex/sdk
- OpenAI Codex App Server docs: https://developers.openai.com/codex/app-server#models
