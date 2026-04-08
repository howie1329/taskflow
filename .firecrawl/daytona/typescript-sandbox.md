[Skip to content](https://www.daytona.io/docs/en/typescript-sdk/sandbox/#_top)

Copy for LLM[View as Markdown](https://www.daytona.io/docs/en/typescript-sdk/sandbox.md)Open

## [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#sandbox) Sandbox

Represents a Daytona Sandbox.

**Properties**:

- `autoArchiveInterval?` _number_ \- Auto-archive interval in minutes


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of) Implementation of




```
SandboxDto.autoArchiveInterval
```

- `autoDeleteInterval?` _number_ \- Auto-delete interval in minutes


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-1) Implementation of




```
SandboxDto.autoDeleteInterval
```

- `autoStopInterval?` _number_ \- Auto-stop interval in minutes


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-2) Implementation of




```
SandboxDto.autoStopInterval
```

- `backupCreatedAt?` _string_ \- When the backup was created


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-3) Implementation of




```
SandboxDto.backupCreatedAt
```

- `backupState?` _SandboxBackupStateEnum_ \- Current state of Sandbox backup


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-4) Implementation of




```
SandboxDto.backupState
```

- `buildInfo?` _BuildInfo_ \- Build information for the Sandbox if it was created from dynamic build


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-5) Implementation of




```
SandboxDto.buildInfo
```

- `codeInterpreter` _CodeInterpreter_ \- Stateful interpreter interface for executing code.
Currently supports only Python. For other languages, use the `process.codeRun` method.

- `computerUse` _ComputerUse_ \- Computer use operations interface for desktop automation

- `cpu` _number_ \- Number of CPUs allocated to the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-6) Implementation of




```
SandboxDto.cpu
```

- `createdAt?` _string_ \- When the Sandbox was created


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-7) Implementation of




```
SandboxDto.createdAt
```

- `disk` _number_ \- Amount of disk space allocated to the Sandbox in GiB


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-8) Implementation of




```
SandboxDto.disk
```

- `env` _Record<string, string>_ \- Environment variables set in the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-9) Implementation of




```
SandboxDto.env
```

- `errorReason?` _string_ \- Error message if Sandbox is in error state


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-10) Implementation of




```
SandboxDto.errorReason
```

- `fs` _FileSystem_ \- File system operations interface

- `git` _Git_ \- Git operations interface

- `gpu` _number_ \- Number of GPUs allocated to the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-11) Implementation of




```
SandboxDto.gpu
```

- `id` _string_ \- Unique identifier for the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-12) Implementation of




```
SandboxDto.id
```

- `labels` _Record<string, string>_ \- Custom labels attached to the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-13) Implementation of




```
SandboxDto.labels
```

- `memory` _number_ \- Amount of memory allocated to the Sandbox in GiB


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-14) Implementation of




```
SandboxDto.memory
```

- `name` _string_ \- The name of the sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-15) Implementation of




```
SandboxDto.name
```

- `networkAllowList?` _string_ \- Comma-separated list of allowed CIDR network addresses for the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-16) Implementation of




```
SandboxDto.networkAllowList
```

- `networkBlockAll` _boolean_ \- Whether to block all network access for the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-17) Implementation of




```
SandboxDto.networkBlockAll
```

- `organizationId` _string_ \- Organization ID of the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-18) Implementation of




```
SandboxDto.organizationId
```

- `process` _Process_ \- Process execution interface

- `public` _boolean_ \- Whether the Sandbox is publicly accessible


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-19) Implementation of




```
SandboxDto.public
```

- `recoverable?` _boolean_ \- Whether the Sandbox error is recoverable.


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-20) Implementation of




```
SandboxDto.recoverable
```

- `snapshot?` _string_ \- Daytona snapshot used to create the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-21) Implementation of




```
SandboxDto.snapshot
```

- `state?` _SandboxState_ \- Current state of the Sandbox (e.g., “started”, “stopped”)


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-22) Implementation of




```
SandboxDto.state
```

- `target` _string_ \- Target location of the runner where the Sandbox runs


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-23) Implementation of




```
SandboxDto.target
```

- `toolboxProxyUrl` _string_ \- The toolbox proxy URL for the sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-24) Implementation of




```
SandboxDto.toolboxProxyUrl
```

- `updatedAt?` _string_ \- When the Sandbox was last updated


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-25) Implementation of




```
SandboxDto.updatedAt
```

- `user` _string_ \- OS user running in the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-26) Implementation of




```
SandboxDto.user
```

- `volumes?` _SandboxVolume\[\]_ \- Volumes attached to the Sandbox


##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implementation-of-27) Implementation of




```
SandboxDto.volumes
```


### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#implements) Implements

- `Sandbox`

### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#constructors) Constructors

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#new-sandbox) new Sandbox()

```
new Sandbox(

   sandboxDto: Sandbox,

   clientConfig: Configuration,

   axiosInstance: AxiosInstance,

   sandboxApi: SandboxApi,

   codeToolbox: SandboxCodeToolbox): Sandbox
```

Creates a new Sandbox instance

**Parameters**:

- `sandboxDto` _Sandbox_ \- The API Sandbox instance
- `clientConfig` _Configuration_
- `axiosInstance` _AxiosInstance_
- `sandboxApi` _SandboxApi_ \- API client for Sandbox operations
- `codeToolbox` _SandboxCodeToolbox_ \- Language-specific toolbox implementation

**Returns**:

- `Sandbox`

### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#methods) Methods

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#archive) archive()

```
archive(): Promise<void>
```

Archives the sandbox, making it inactive and preserving its state. When sandboxes are archived, the entire filesystem
state is moved to cost-effective object storage, making it possible to keep sandboxes available for an extended period.
The tradeoff between archived and stopped states is that starting an archived sandbox takes more time, depending on its size.
Sandbox must be stopped before archiving.

**Returns**:

- `Promise<void>`

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#createlspserver) createLspServer()

```
createLspServer(languageId: string, pathToProject: string): Promise<LspServer>
```

Creates a new Language Server Protocol (LSP) server instance.

The LSP server provides language-specific features like code completion,
diagnostics, and more.

**Parameters**:

- `languageId` _string_ \- The language server type (e.g., “typescript”)
- `pathToProject` _string_ \- Path to the project root directory. Relative paths are resolved based on the sandbox working directory.

**Returns**:

- `Promise<LspServer>` \- A new LSP server instance configured for the specified language

**Example:**

```
const lsp = await sandbox.createLspServer('typescript', 'workspace/project');
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#createsshaccess) createSshAccess()

```
createSshAccess(expiresInMinutes?: number): Promise<SshAccessDto>
```

Creates an SSH access token for the sandbox.

**Parameters**:

- `expiresInMinutes?` _number_ \- The number of minutes the SSH access token will be valid for.

**Returns**:

- `Promise<SshAccessDto>` \- The SSH access token.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#delete) delete()

```
delete(timeout: number): Promise<void>
```

Deletes the Sandbox.

**Parameters**:

- `timeout` _number = 60_

**Returns**:

- `Promise<void>`

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#expiresignedpreviewurl) expireSignedPreviewUrl()

```
expireSignedPreviewUrl(port: number, token: string): Promise<void>
```

Expires a signed preview url for the sandbox at the specified port.

**Parameters**:

- `port` _number_ \- The port to expire the signed preview url on.
- `token` _string_ \- The token to expire the signed preview url on.

**Returns**:

- `Promise<void>`

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getpreviewlink) getPreviewLink()

```
getPreviewLink(port: number): Promise<PortPreviewUrl>
```

Retrieves the preview link for the sandbox at the specified port. If the port is closed,
it will be opened automatically. For private sandboxes, a token is included to grant access
to the URL.

**Parameters**:

- `port` _number_ \- The port to open the preview link on.

**Returns**:

- `Promise<PortPreviewUrl>` \- The response object for the preview link, which includes the `url`
and the `token` (to access private sandboxes).

**Example:**

```
const previewLink = await sandbox.getPreviewLink(3000);

console.log(`Preview URL: ${previewLink.url}`);

console.log(`Token: ${previewLink.token}`);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getsignedpreviewurl) getSignedPreviewUrl()

```
getSignedPreviewUrl(port: number, expiresInSeconds?: number): Promise<SignedPortPreviewUrl>
```

Retrieves a signed preview url for the sandbox at the specified port.

**Parameters**:

- `port` _number_ \- The port to open the preview link on.
- `expiresInSeconds?` _number_ \- The number of seconds the signed preview url will be valid for. Defaults to 60 seconds.

**Returns**:

- `Promise<SignedPortPreviewUrl>` \- The response object for the signed preview url.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getuserhomedir) getUserHomeDir()

```
getUserHomeDir(): Promise<string>
```

Gets the user’s home directory path for the logged in user inside the Sandbox.

**Returns**:

- `Promise<string>` \- The absolute path to the Sandbox user’s home directory for the logged in user

**Example:**

```
const userHomeDir = await sandbox.getUserHomeDir();

console.log(`Sandbox user home: ${userHomeDir}`);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getuserrootdir) ~~getUserRootDir()~~

```
getUserRootDir(): Promise<string>
```

**Returns**:

- `Promise<string>`

##### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#deprecated) Deprecated

Use `getUserHomeDir` instead. This method will be removed in a future version.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getworkdir) getWorkDir()

```
getWorkDir(): Promise<string>
```

Gets the working directory path inside the Sandbox.

**Returns**:

- `Promise<string>` \- The absolute path to the Sandbox working directory. Uses the WORKDIR specified
in the Dockerfile if present, or falling back to the user’s home directory if not.

**Example:**

```
const workDir = await sandbox.getWorkDir();

console.log(`Sandbox working directory: ${workDir}`);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#recover) recover()

```
recover(timeout?: number): Promise<void>
```

Recover the Sandbox from a recoverable error and wait for it to be ready.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.
Defaults to 60-second timeout.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If Sandbox fails to recover or times out

**Example:**

```
const sandbox = await daytona.get('my-sandbox-id');

await sandbox.recover();

console.log('Sandbox recovered successfully');
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#refreshactivity) refreshActivity()

```
refreshActivity(): Promise<void>
```

Refreshes the sandbox activity to reset the timer for automated lifecycle management actions.

This method updates the sandbox’s last activity timestamp without changing its state.
It is useful for keeping long-running sessions alive while there is still user activity.

**Returns**:

- `Promise<void>`

**Example:**

```
// Keep sandbox activity alive

await sandbox.refreshActivity();
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#refreshdata) refreshData()

```
refreshData(): Promise<void>
```

Refreshes the Sandbox data from the API.

**Returns**:

- `Promise<void>`

**Example:**

```
await sandbox.refreshData();

console.log(`Sandbox ${sandbox.id}:`);

console.log(`State: ${sandbox.state}`);

console.log(`Resources: ${sandbox.cpu} CPU, ${sandbox.memory} GiB RAM`);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#resize) resize()

```
resize(resources: Resources, timeout?: number): Promise<void>
```

Resizes the Sandbox resources.

Changes the CPU, memory, or disk allocation for the Sandbox. Hot resize (on running
sandbox) only allows CPU/memory increases. Disk resize requires a stopped sandbox.

**Parameters**:

- `resources` _Resources_\- New resource configuration. Only specified fields will be updated.

  - cpu: Number of CPU cores (minimum: 1). For hot resize, can only be increased.
  - memory: Memory in GiB (minimum: 1). For hot resize, can only be increased.
  - disk: Disk space in GiB (can only be increased, requires stopped sandbox).
- `timeout?` _number = 60_ \- Timeout in seconds for the resize operation. 0 means no timeout.

**Returns**:

- `Promise<void>`

**Throws**:

- If hot resize constraints are violated, disk resize attempted on running sandbox,
disk size decrease is attempted, no resource changes are specified, or resize operation times out.

**Example:**

```
// Increase CPU/memory on running sandbox (hot resize)

await sandbox.resize({ cpu: 4, memory: 8 });

// Change disk (sandbox must be stopped)

await sandbox.stop();

await sandbox.resize({ cpu: 2, memory: 4, disk: 30 });
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#revokesshaccess) revokeSshAccess()

```
revokeSshAccess(token: string): Promise<void>
```

Revokes an SSH access token for the sandbox.

**Parameters**:

- `token` _string_ \- The token to revoke.

**Returns**:

- `Promise<void>`

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#setautoarchiveinterval) setAutoArchiveInterval()

```
setAutoArchiveInterval(interval: number): Promise<void>
```

Set the auto-archive interval for the Sandbox.

The Sandbox will automatically archive after being continuously stopped for the specified interval.

**Parameters**:

- `interval` _number_ \- Number of minutes after which a continuously stopped Sandbox will be auto-archived.
Set to 0 for the maximum interval. Default is 7 days.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If interval is not a non-negative integer

**Example:**

```
// Auto-archive after 1 hour

await sandbox.setAutoArchiveInterval(60);

// Or use the maximum interval

await sandbox.setAutoArchiveInterval(0);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#setautodeleteinterval) setAutoDeleteInterval()

```
setAutoDeleteInterval(interval: number): Promise<void>
```

Set the auto-delete interval for the Sandbox.

The Sandbox will automatically delete after being continuously stopped for the specified interval.

**Parameters**:

- `interval` _number_ \- Number of minutes after which a continuously stopped Sandbox will be auto-deleted.
Set to negative value to disable auto-delete. Set to 0 to delete immediately upon stopping.
By default, auto-delete is disabled.

**Returns**:

- `Promise<void>`

**Example:**

```
// Auto-delete after 1 hour

await sandbox.setAutoDeleteInterval(60);

// Or delete immediately upon stopping

await sandbox.setAutoDeleteInterval(0);

// Or disable auto-delete

await sandbox.setAutoDeleteInterval(-1);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#setautostopinterval) setAutostopInterval()

```
setAutostopInterval(interval: number): Promise<void>
```

Set the auto-stop interval for the Sandbox.

The Sandbox will automatically stop after being idle (no new events) for the specified interval.
Events include any state changes or interactions with the Sandbox through the sdk.
Interactions using Sandbox Previews are not included.

**Parameters**:

- `interval` _number_ \- Number of minutes of inactivity before auto-stopping.
Set to 0 to disable auto-stop. Default is 15 minutes.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If interval is not a non-negative integer

**Example:**

```
// Auto-stop after 1 hour

await sandbox.setAutostopInterval(60);

// Or disable auto-stop

await sandbox.setAutostopInterval(0);
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#setlabels) setLabels()

```
setLabels(labels: Record<string, string>): Promise<Record<string, string>>
```

Sets labels for the Sandbox.

Labels are key-value pairs that can be used to organize and identify Sandboxes.

**Parameters**:

- `labels` _Record<string, string>_ \- Dictionary of key-value pairs representing Sandbox labels

**Returns**:

- `Promise<Record<string, string>>`

**Example:**

```
// Set sandbox labels

await sandbox.setLabels({

  project: 'my-project',

  environment: 'development',

  team: 'backend'

});
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#start) start()

```
start(timeout?: number): Promise<void>
```

Start the Sandbox.

This method starts the Sandbox and waits for it to be ready.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.
Defaults to 60-second timeout.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If Sandbox fails to start or times out

**Example:**

```
const sandbox = await daytona.getCurrentSandbox('my-sandbox');

await sandbox.start(40);  // Wait up to 40 seconds

console.log('Sandbox started successfully');
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#stop) stop()

```
stop(timeout?: number): Promise<void>
```

Stops the Sandbox.

This method stops the Sandbox and waits for it to be fully stopped.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.
Defaults to 60-second timeout.

**Returns**:

- `Promise<void>`

**Example:**

```
const sandbox = await daytona.get('my-sandbox-id');

await sandbox.stop();

console.log('Sandbox stopped successfully');
```

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#validatesshaccess) validateSshAccess()

```
validateSshAccess(token: string): Promise<SshAccessValidationDto>
```

Validates an SSH access token for the sandbox.

**Parameters**:

- `token` _string_ \- The token to validate.

**Returns**:

- `Promise<SshAccessValidationDto>` \- The SSH access validation result.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#waitforresizecomplete) waitForResizeComplete()

```
waitForResizeComplete(timeout?: number): Promise<void>
```

Waits for the Sandbox resize operation to complete.

This method polls the Sandbox status until the state is no longer ‘resizing’.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.

**Returns**:

- `Promise<void>`

**Throws**:

- If the sandbox ends up in an error state or resize times out.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#waituntilstarted) waitUntilStarted()

```
waitUntilStarted(timeout?: number): Promise<void>
```

Waits for the Sandbox to reach the ‘started’ state.

This method polls the Sandbox status until it reaches the ‘started’ state
or encounters an error.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.
Defaults to 60 seconds.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If the sandbox ends up in an error state or fails to start within the timeout period.

* * *

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#waituntilstopped) waitUntilStopped()

```
waitUntilStopped(timeout?: number): Promise<void>
```

Wait for Sandbox to reach ‘stopped’ state.

This method polls the Sandbox status until it reaches the ‘stopped’ state
or encounters an error.

**Parameters**:

- `timeout?` _number = 60_ \- Maximum time to wait in seconds. 0 means no timeout.
Defaults to 60 seconds.

**Returns**:

- `Promise<void>`

**Throws**:

- `DaytonaError` \- If the sandbox fails to stop within the timeout period.

## [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#paginatedsandboxes) PaginatedSandboxes

**Extends:**

**Properties**:

- `items` _Sandbox\[\]_

- `page` _number_
  - _Inherited from_: `PaginatedSandboxes.page`
- `total` _number_
  - _Inherited from_: `PaginatedSandboxes.total`
- `totalPages` _number_
  - _Inherited from_: `PaginatedSandboxes.totalPages`
- `Omit`<`PaginatedSandboxesDto`, `"items"`>


## [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#sandboxcodetoolbox) SandboxCodeToolbox

Interface defining methods that a code toolbox must implement

### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#methods-1) Methods

#### [\#](https://www.daytona.io/docs/en/typescript-sdk/sandbox/\#getruncommand) getRunCommand()

```
getRunCommand(code: string, params?: CodeRunParams): string
```

Generates a command to run the provided code

**Parameters**:

- `code` _string_
- `params?` _CodeRunParams_

**Returns**:

- `string`