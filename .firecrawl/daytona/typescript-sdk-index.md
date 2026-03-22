[Skip to content](https://www.daytona.io/docs/en/typescript-sdk/#_top)

# TypeScript SDK Reference

Copy for LLM[View as Markdown](https://www.daytona.io/docs/en/typescript-sdk.md)Open

The Daytona TypeScript SDK provides a powerful interface for programmatically interacting with Daytona Sandboxes.

## [\#](https://www.daytona.io/docs/en/typescript-sdk/\#installation) Installation

Install the Daytona TypeScript SDK using npm:

```
npm install @daytonaio/sdk
```

Or using yarn:

```
yarn add @daytonaio/sdk
```

## [\#](https://www.daytona.io/docs/en/typescript-sdk/\#getting-started) Getting Started

### [\#](https://www.daytona.io/docs/en/typescript-sdk/\#create-a-sandbox) Create a Sandbox

Create a Daytona Sandbox to run your code securely in an isolated environment. The following snippet is an example “Hello World” program that runs securely inside a Daytona Sandbox.

```
import { Daytona } from '@daytonaio/sdk'

async function main() {

  // Initialize the SDK (uses environment variables by default)

  const daytona = new Daytona()

  // Create a new sandbox

  const sandbox = await daytona.create({

    language: 'typescript',

    envVars: { NODE_ENV: 'development' },

  })

  // Execute a command

  const response = await sandbox.process.executeCommand('echo "Hello, World!"')

  console.log(response.result)

}

main().catch(console.error)
```

## [\#](https://www.daytona.io/docs/en/typescript-sdk/\#configuration) Configuration

The Daytona SDK can be configured using environment variables or by passing options to the constructor:

```
import { Daytona } from '@daytonaio/sdk';

// Using environment variables (DAYTONA_API_KEY, DAYTONA_API_URL, DAYTONA_TARGET)

const daytona = new Daytona();

// Using explicit configuration

const daytona = new Daytona({

  apiKey: 'YOUR_API_KEY',

  apiUrl: 'https://app.daytona.io/api',

  target: 'us'

});
```

For more information on configuring the Daytona SDK, see [configuration](https://www.daytona.io/docs/en/configuration).

## [\#](https://www.daytona.io/docs/en/typescript-sdk/\#multiple-runtime-support) Multiple runtime support

Daytona supports multiple programming language runtimes for direct code execution inside the sandbox.

[TypeScript SDK](https://www.daytona.io/docs/en/typescript-sdk) works across multiple **JavaScript runtimes** including **Node.js**, **browsers**, and **serverless platforms**: Cloudflare Workers, AWS Lambda, Azure Functions, etc.

Using the Daytona SDK in browser-based environments or frameworks like [**Vite**](https://www.daytona.io/docs/en/getting-started#daytona-in-vite-projects) and [**Next.js**](https://www.daytona.io/docs/en/getting-started#daytona-in-nextjs-projects) requires configuring node polyfills.

### [\#](https://www.daytona.io/docs/en/typescript-sdk/\#daytona-in-vite-projects) Daytona in Vite projects

When using Daytona SDK in a Vite-based project, configure node polyfills to ensure compatibility.

Add the following configuration to your `vite.config.ts` file in the `plugins` array:

```
import { nodePolyfills } from 'vite-plugin-node-polyfills'

export default defineConfig({

  plugins: [\
\
    // ... other plugins\
\
    nodePolyfills({\
\
      globals: { global: true, process: true, Buffer: true },\
\
      overrides: {\
\
        path: 'path-browserify-win32',\
\
      },\
\
    }),\
\
  ],

  // ... rest of your config

})
```

### [\#](https://www.daytona.io/docs/en/typescript-sdk/\#daytona-in-nextjs-projects) Daytona in Next.js projects

When using Daytona SDK in a Next.js project, configure node polyfills to ensure compatibility with Webpack and Turbopack bundlers.

Add the following configuration to your `next.config.ts` file:

```
import type { NextConfig } from 'next'

import NodePolyfillPlugin from 'node-polyfill-webpack-plugin'

import { env, nodeless } from 'unenv'

const { alias: turbopackAlias } = env(nodeless, {})

const nextConfig: NextConfig = {

  // Turbopack

  experimental: {

    turbo: {

      resolveAlias: {

        ...turbopackAlias,

      },

    },

  },

  // Webpack

  webpack: (config, { isServer }) => {

    if (!isServer) {

      config.plugins.push(new NodePolyfillPlugin())

    }

    return config

  },

}

export default nextConfig
```