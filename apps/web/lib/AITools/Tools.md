# AI Tools
## Folder Structure
- **Description**: Tools are separated by their provider. Every provider has its own folder and every tool has its own file. Inside the root of each provider folder is an index file to be treated as the main export.

- **Example**: 
   - Valyu/
     - webSearch.ts
     - financeSearch.ts
     - types.ts (shared types)
     - index.ts (main export)

- At the root of the main tool folder (`AITools/`), you will see:
  - `index.ts` - Aggregates all tools from all providers
  - `ModeMapping.ts` - Maps tool keys into active tool arrays for different modes
  - `Custom/` - Custom tools folder for developer-created tools

- **Custom tools** are developer-created tools that combine multiple tools either for enhanced capabilities or fallback scenarios.
- **Mode mapping** takes the keys of the exported tools and places them into an active tool array.
- Typically used to activate certain tools in Vercel AI SDK with the `tools` parameter/option.