[Skip to content](https://www.daytona.io/docs/en/getting-started/#_top)

# Getting Started

Copy for LLM[View as Markdown](https://www.daytona.io/docs/en/getting-started.md)Open

This section introduces core concepts, common workflows, and next steps for using Daytona.

## [\#](https://www.daytona.io/docs/en/getting-started/\#dashboard) Dashboard

[Daytona Dashboard ↗](https://app.daytona.io/) is a visual user interface where you can manage sandboxes, access API keys, view usage, and more.
It serves as the primary point of control for managing your Daytona resources.

## [\#](https://www.daytona.io/docs/en/getting-started/\#sdks) SDKs

Daytona provides [Python](https://www.daytona.io/docs/en/python-sdk), [TypeScript](https://www.daytona.io/docs/en/typescript-sdk), [Ruby](https://www.daytona.io/docs/en/ruby-sdk), and [Go](https://www.daytona.io/docs/en/go-sdk) SDKs to programmatically interact with sandboxes. They support sandbox lifecycle management, code execution, resource access, and more.

## [\#](https://www.daytona.io/docs/en/getting-started/\#cli) CLI

Daytona provides command-line access to core features for interacting with Daytona Sandboxes, including managing their lifecycle, snapshots, and more.

To interact with Daytona Sandboxes from the command line, install the Daytona CLI:

- [Mac/Linux](https://www.daytona.io/docs/en/getting-started/#tab-panel-317)
- [Windows](https://www.daytona.io/docs/en/getting-started/#tab-panel-318)

```
brew install daytonaio/cli/daytona
```

```
powershell -Command "irm https://get.daytona.io/windows | iex"
```

After installing the Daytona CLI, use the `daytona` command to interact with Daytona Sandboxes from the command line.

To upgrade the Daytona CLI to the latest version:

- [Mac/Linux](https://www.daytona.io/docs/en/getting-started/#tab-panel-319)
- [Windows](https://www.daytona.io/docs/en/getting-started/#tab-panel-320)

```
brew upgrade daytonaio/cli/daytona
```

```
powershell -Command "irm https://get.daytona.io/windows | iex"
```

To view all available commands and flags, see the [CLI reference](https://www.daytona.io/docs/en/tools/cli).

## [\#](https://www.daytona.io/docs/en/getting-started/\#api) API

Daytona provides a RESTful API for interacting with Daytona Sandboxes, including managing their lifecycle, snapshots, and more.
It serves as a flexible and powerful way to interact with Daytona from your own applications.

To interact with Daytona Sandboxes from the API, see the [API reference](https://www.daytona.io/docs/en/tools/api).

## [\#](https://www.daytona.io/docs/en/getting-started/\#mcp-server) MCP server

Daytona provides a Model Context Protocol (MCP) server that enables AI agents to interact with Daytona Sandboxes programmatically. The MCP server integrates with popular AI agents including Claude, Cursor, and Windsurf.

To set up the MCP server with your AI agent:

```
daytona mcp init [claude/cursor/windsurf]
```

For more information, see the [MCP server documentation](https://www.daytona.io/docs/en/mcp).

## [\#](https://www.daytona.io/docs/en/getting-started/\#multiple-runtime-support) Multiple runtime support

Daytona supports multiple programming language runtimes for direct code execution inside the sandbox.

[TypeScript SDK](https://www.daytona.io/docs/en/typescript-sdk) works across multiple **JavaScript runtimes** including **Node.js**, **browsers**, and **serverless platforms**: Cloudflare Workers, AWS Lambda, Azure Functions, etc.

Using the Daytona SDK in browser-based environments or frameworks like [**Vite**](https://www.daytona.io/docs/en/getting-started#daytona-in-vite-projects) and [**Next.js**](https://www.daytona.io/docs/en/getting-started#daytona-in-nextjs-projects) requires configuring node polyfills.

### [\#](https://www.daytona.io/docs/en/getting-started/\#daytona-in-vite-projects) Daytona in Vite projects

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

### [\#](https://www.daytona.io/docs/en/getting-started/\#daytona-in-nextjs-projects) Daytona in Next.js projects

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

## [\#](https://www.daytona.io/docs/en/getting-started/\#guides) Guides

Daytona provides a comprehensive set of guides to help you get started. The guides cover a wide range of topics, from basic usage to advanced topics, and showcase various types of integrations between Daytona and other tools.

For more information, see [guides](https://www.daytona.io/docs/en/guides).

## [\#](https://www.daytona.io/docs/en/getting-started/\#examples) Examples

Daytona provides quick examples for common sandbox operations and best practices.

The examples are based on the Daytona [Python SDK](https://www.daytona.io/docs/en/python-sdk/sync/process), [TypeScript SDK](https://www.daytona.io/docs/en/typescript-sdk/process), [Go SDK](https://www.daytona.io/docs/en/go-sdk/daytona#type-processservice), [Ruby SDK](https://www.daytona.io/docs/en/ruby-sdk/process), [CLI](https://www.daytona.io/docs/en/tools/cli), and [API](https://www.daytona.io/docs/en/tools/api) references. More examples are available in the [GitHub repository ↗](https://github.com/daytonaio/daytona/tree/main/examples).

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox) Create a sandbox

Create a [sandbox](https://www.daytona.io/docs/en/sandboxes) with default settings.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-321)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-322)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-323)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-324)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-325)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-326)

```
from daytona import Daytona

daytona = Daytona()

sandbox = daytona.create()

print(f"Sandbox ID: {sandbox.id}")
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create();

console.log(`Sandbox ID: ${sandbox.id}`);
```

```
package main

import (

    "context"

    "fmt"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    sandbox, err := client.Create(context.Background(), nil)

    if err != nil {

        log.Fatal(err)

    }

    fmt.Printf("Sandbox ID: %s\n", sandbox.ID)

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create

puts "Sandbox ID: #{sandbox.id}"
```

```
daytona create
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-and-run-code-in-a-sandbox) Create and run code in a sandbox

Create a [sandbox](https://www.daytona.io/docs/en/sandboxes) and run code securely in it.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-327)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-328)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-329)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-330)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-331)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-332)

```
from daytona import Daytona

daytona = Daytona()

sandbox = daytona.create()

response = sandbox.process.exec("echo 'Hello, World!'")

print(response.result)

sandbox.delete()
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create();

const response = await sandbox.process.executeCommand('echo "Hello, World!"');

console.log(response.result);

await sandbox.delete();
```

```
package main

import (

    "context"

    "fmt"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    sandbox, err := client.Create(context.Background(), nil)

    if err != nil {

        log.Fatal(err)

    }

    response, err := sandbox.Process.ExecuteCommand(context.Background(), "echo 'Hello, World!'")

    if err != nil {

        log.Fatal(err)

    }

    fmt.Println(response.Result)

    sandbox.Delete(context.Background())

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create

response = sandbox.process.exec(command: "echo 'Hello, World!'")

puts response.result

daytona.delete(sandbox)
```

```
daytona create --name my-sandbox

daytona exec my-sandbox -- echo 'Hello, World!'

daytona delete my-sandbox
```

```
# Create a sandbox

curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{}'

# Execute a command in the sandbox

curl 'https://proxy.app.daytona.io/toolbox/{sandboxId}/process/execute' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "command": "echo '\''Hello, World!'\''"

}'

# Delete the sandbox

curl 'https://app.daytona.io/api/sandbox/{sandboxId}' \

  --request DELETE \

  --header 'Authorization: Bearer <API_KEY>'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox-with-custom-resources) Create a sandbox with custom resources

Create a sandbox with [custom resources](https://www.daytona.io/docs/en/sandboxes#resources) (CPU, memory, disk).

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-333)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-334)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-335)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-336)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-337)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-338)

```
from daytona import Daytona, CreateSandboxFromImageParams, Image, Resources

daytona = Daytona()

sandbox = daytona.create(

    CreateSandboxFromImageParams(

        image=Image.debian_slim("3.12"),

        resources=Resources(cpu=2, memory=4, disk=8)

    )

)
```

```
import { Daytona, Image } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create({

    image: Image.debianSlim('3.12'),

    resources: { cpu: 2, memory: 4, disk: 8 }

});
```

```
package main

import (

    "context"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/types"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    sandbox, err := client.Create(context.Background(), types.ImageParams{

        Image: daytona.DebianSlim(nil),

        Resources: &types.Resources{

            CPU:    2,

            Memory: 4,

            Disk:   8,

        },

    })

    if err != nil {

        log.Fatal(err)

    }

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create(

    Daytona::CreateSandboxFromImageParams.new(

        image: Daytona::Image.debian_slim('3.12'),

        resources: Daytona::Resources.new(cpu: 2, memory: 4, disk: 8)

    )

)
```

```
daytona create --class small
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "cpu": 2,

  "memory": 4,

  "disk": 8

}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-an-ephemeral-sandbox) Create an ephemeral sandbox

Create an [ephemeral sandbox](https://www.daytona.io/docs/en/sandboxes#ephemeral-sandboxes) that is automatically deleted when stopped.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-339)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-340)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-341)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-342)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-343)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-344)

```
from daytona import Daytona, CreateSandboxFromSnapshotParams

daytona = Daytona()

sandbox = daytona.create(

    CreateSandboxFromSnapshotParams(ephemeral=True, auto_stop_interval=5)

)
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create({

    ephemeral: true,

    autoStopInterval: 5

});
```

```
package main

import (

    "context"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/types"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    autoStop := 5

    sandbox, err := client.Create(context.Background(), types.SnapshotParams{

        SandboxBaseParams: types.SandboxBaseParams{

            Ephemeral:        true,

            AutoStopInterval: &autoStop,

        },

    })

    if err != nil {

        log.Fatal(err)

    }

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create(

    Daytona::CreateSandboxFromSnapshotParams.new(ephemeral: true, auto_stop_interval: 5)

)
```

```
daytona create --auto-stop 5 --auto-delete 0
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "autoStopInterval": 5,

  "autoDeleteInterval": 0

}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox-from-a-snapshot) Create a sandbox from a snapshot

Create a sandbox from a pre-built [snapshot](https://www.daytona.io/docs/en/snapshots) for faster sandbox creation with pre-installed dependencies.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-345)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-346)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-347)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-348)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-349)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-350)

```
from daytona import Daytona, CreateSandboxFromSnapshotParams

daytona = Daytona()

sandbox = daytona.create(

    CreateSandboxFromSnapshotParams(

        snapshot="my-snapshot-name",

        language="python"

    )

)
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create({

    snapshot: 'my-snapshot-name',

    language: 'typescript'

});
```

```
package main

import (

    "context"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/types"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    sandbox, err := client.Create(context.Background(), types.SnapshotParams{

        Snapshot: "my-snapshot-name",

        SandboxBaseParams: types.SandboxBaseParams{

            Language: types.CodeLanguagePython,

        },

    })

    if err != nil {

        log.Fatal(err)

    }

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create(

    Daytona::CreateSandboxFromSnapshotParams.new(

        snapshot: 'my-snapshot-name',

        language: Daytona::CodeLanguage::PYTHON

    )

)
```

```
daytona create --snapshot my-snapshot-name
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "snapshot": "my-snapshot-name"

}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox-with-a-declarative-image) Create a sandbox with a declarative image

Create a sandbox with a [declarative image](https://www.daytona.io/docs/en/declarative-builder) that defines dependencies programmatically.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-351)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-352)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-353)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-354)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-355)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-356)

```
from daytona import Daytona, CreateSandboxFromImageParams, Image

daytona = Daytona()

image = (

    Image.debian_slim("3.12")

    .pip_install(["requests", "pandas", "numpy"])

    .workdir("/home/daytona")

)

sandbox = daytona.create(

    CreateSandboxFromImageParams(image=image),

    on_snapshot_create_logs=print

)
```

```
import { Daytona, Image } from '@daytonaio/sdk';

const daytona = new Daytona();

const image = Image.debianSlim('3.12')

    .pipInstall(['requests', 'pandas', 'numpy'])

    .workdir('/home/daytona');

const sandbox = await daytona.create(

    { image },

    { onSnapshotCreateLogs: console.log }

);
```

```
package main

import (

    "context"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/types"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    image := daytona.DebianSlim(nil).

        PipInstall([]string{"requests", "pandas", "numpy"}).

        Workdir("/home/daytona")

    sandbox, err := client.Create(context.Background(), types.ImageParams{

        Image: image,

    })

    if err != nil {

        log.Fatal(err)

    }

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

image = Daytona::Image

    .debian_slim('3.12')

    .pip_install(['requests', 'pandas', 'numpy'])

    .workdir('/home/daytona')

sandbox = daytona.create(

    Daytona::CreateSandboxFromImageParams.new(image: image),

    on_snapshot_create_logs: proc { |chunk| puts chunk }

)
```

```
daytona create --dockerfile ./Dockerfile
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "buildInfo": {

    "dockerfileContent": "FROM python:3.12-slim\nRUN pip install requests pandas numpy\nWORKDIR /home/daytona"

  }

}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox-with-volumes) Create a sandbox with volumes

Create a sandbox with a [volume](https://www.daytona.io/docs/en/volumes) mounted to share data across sandboxes.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-357)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-358)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-359)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-360)
- [CLI](https://www.daytona.io/docs/en/getting-started/#tab-panel-361)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-362)

```
from daytona import Daytona, CreateSandboxFromSnapshotParams, VolumeMount

daytona = Daytona()

volume = daytona.volume.get("my-volume", create=True)

sandbox = daytona.create(

    CreateSandboxFromSnapshotParams(

        volumes=[VolumeMount(volume_id=volume.id, mount_path="/home/daytona/data")]

    )

)
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const volume = await daytona.volume.get('my-volume', true);

const sandbox = await daytona.create({

    volumes: [{ volumeId: volume.id, mountPath: '/home/daytona/data' }]

});
```

```
package main

import (

    "context"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/types"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    volume, err := client.Volume.Get(context.Background(), "my-volume")

    if err != nil {

        volume, err = client.Volume.Create(context.Background(), "my-volume")

        if err != nil {

            log.Fatal(err)

        }

    }

    sandbox, err := client.Create(context.Background(), types.SnapshotParams{

        SandboxBaseParams: types.SandboxBaseParams{

            Volumes: []types.VolumeMount{{

                VolumeID:  volume.ID,

                MountPath: "/home/daytona/data",

            }},

        },

    })

    if err != nil {

        log.Fatal(err)

    }

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

volume = daytona.volume.get('my-volume', create: true)

sandbox = daytona.create(

    Daytona::CreateSandboxFromSnapshotParams.new(

        volumes: [DaytonaApiClient::SandboxVolume.new(\
\
            volume_id: volume.id,\
\
            mount_path: '/home/daytona/data'\
\
        )]

    )

)
```

```
daytona volume create my-volume

daytona create --volume my-volume:/home/daytona/data
```

```
curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "volumes": [\
\
    {\
\
      "volumeId": "<VOLUME_ID>",\
\
      "mountPath": "/home/daytona/data"\
\
    }\
\
  ]

}'
```

### [\#](https://www.daytona.io/docs/en/getting-started/\#create-a-sandbox-with-a-git-repository-cloned) Create a sandbox with a Git repository cloned

Create a sandbox with a [Git repository](https://www.daytona.io/docs/en/typescript-sdk/git) cloned to manage version control.

- [Python](https://www.daytona.io/docs/en/getting-started/#tab-panel-363)
- [TypeScript](https://www.daytona.io/docs/en/getting-started/#tab-panel-364)
- [Go](https://www.daytona.io/docs/en/getting-started/#tab-panel-365)
- [Ruby](https://www.daytona.io/docs/en/getting-started/#tab-panel-366)
- [API](https://www.daytona.io/docs/en/getting-started/#tab-panel-367)

```
from daytona import Daytona

daytona = Daytona()

sandbox = daytona.create()

sandbox.git.clone("https://github.com/daytonaio/daytona.git", "/home/daytona/daytona")

status = sandbox.git.status("/home/daytona/daytona")

print(f"Branch: {status.current_branch}")
```

```
import { Daytona } from '@daytonaio/sdk';

const daytona = new Daytona();

const sandbox = await daytona.create();

await sandbox.git.clone('https://github.com/daytonaio/daytona.git', '/home/daytona/daytona');

const status = await sandbox.git.status('/home/daytona/daytona');

console.log(`Branch: ${status.currentBranch}`);
```

```
package main

import (

    "context"

    "fmt"

    "log"

    "github.com/daytonaio/daytona/libs/sdk-go/pkg/daytona"

)

func main() {

    client, err := daytona.NewClient()

    if err != nil {

        log.Fatal(err)

    }

    sandbox, err := client.Create(context.Background(), nil)

    if err != nil {

        log.Fatal(err)

    }

    sandbox.Git.Clone(context.Background(), "https://github.com/daytonaio/daytona.git", "/home/daytona/daytona")

    status, err := sandbox.Git.Status(context.Background(), "/home/daytona/daytona")

    if err != nil {

        log.Fatal(err)

    }

    fmt.Printf("Branch: %s\n", status.CurrentBranch)

}
```

```
require 'daytona'

daytona = Daytona::Daytona.new

sandbox = daytona.create

sandbox.git.clone(url: "https://github.com/daytonaio/daytona.git", path: "/home/daytona/daytona")

status = sandbox.git.status("/home/daytona/daytona")

puts "Branch: #{status.current_branch}"
```

```
# Create a sandbox

curl 'https://app.daytona.io/api/sandbox' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{}'

# Clone a Git repository in the sandbox

curl 'https://proxy.app.daytona.io/toolbox/{sandboxId}/git/clone' \

  --request POST \

  --header 'Authorization: Bearer <API_KEY>' \

  --header 'Content-Type: application/json' \

  --data '{

  "url": "https://github.com/daytonaio/daytona.git",

  "path": "/home/daytona/daytona"

}'

# Get repository status

curl 'https://proxy.app.daytona.io/toolbox/{sandboxId}/git/status?path=/home/daytona/daytona' \

  --header 'Authorization: Bearer <API_KEY>'
```