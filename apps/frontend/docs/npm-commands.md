# Useful NPM Commands

## 📦 Package Management

### Installing

```bash
npm install                          # Install all dependencies from package.json
npm install <package>                # Install package and add to dependencies
npm install <package>@<version>      # Install specific version
npm install <package> --save-dev     # Install as dev dependency (or -D)
npm install <package> --global       # Install globally (or -g)
npm install --production             # Install only production dependencies
npm ci                               # Clean install (faster, uses package-lock.json exactly)
```

### Updating

```bash
npm outdated                         # Check for outdated packages
npm update                           # Update packages within semver range
npm update <package>                 # Update specific package
npm install <package>@latest         # Update to latest version (changes package.json)
```

### Removing

```bash
npm uninstall <package>              # Remove package (or npm remove, npm rm)
npm uninstall <package> --save-dev   # Remove dev dependency
npm uninstall <package> --global     # Remove global package
npm prune                            # Remove unused packages
```

## 🔍 Information & Debugging

```bash
npm list                             # Show installed packages tree
npm list --depth=0                   # Show only top-level packages
npm list <package>                   # Show specific package and dependencies
npm list --global                    # Show global packages
npm view <package>                   # Show package info from registry
npm view <package> versions          # Show all available versions
npm info <package>                   # Alias for npm view
npm show <package> version           # Show latest version
npm docs <package>                   # Open package documentation
npm repo <package>                   # Open package repository
npm search <query>                   # Search npm registry
npm doctor                           # Check environment for issues
npm audit                            # Check for security vulnerabilities
npm audit fix                        # Auto-fix vulnerabilities
```

## 🏃 Running Scripts

```bash
npm start                            # Run start script
npm test                             # Run test script
npm run <script>                     # Run custom script from package.json
npm run                              # List all available scripts
npm run-script <script>              # Alternative to npm run
```

## 📝 Package.json Management

```bash
npm init                             # Create new package.json (interactive)
npm init -y                          # Create package.json with defaults
npm version patch                    # Bump patch version (1.0.0 → 1.0.1)
npm version minor                    # Bump minor version (1.0.0 → 1.1.0)
npm version major                    # Bump major version (1.0.0 → 2.0.0)
npm pkg get <key>                    # Get value from package.json
npm pkg set <key>=<value>            # Set value in package.json
```

## 🧹 Cleanup & Cache

```bash
npm cache clean --force              # Clear npm cache
npm cache verify                     # Verify cache integrity
npm dedupe                           # Reduce duplication in dependency tree
npm fund                             # Show funding info for dependencies
```

## 🔐 Authentication & Publishing

```bash
npm login                            # Login to npm registry
npm whoami                           # Show current user
npm logout                           # Logout from registry
npm publish                          # Publish package to registry
npm unpublish <package>@<version>    # Unpublish specific version
```

## 🔧 Configuration

```bash
npm config list                      # Show all config settings
npm config get <key>                 # Get specific config value
npm config set <key> <value>         # Set config value
npm config delete <key>              # Delete config value
npm prefix                           # Show local prefix (project root)
npm prefix -g                        # Show global prefix
npm root                             # Show local node_modules path
npm root -g                          # Show global node_modules path
```

## 🚀 Execution & Development

```bash
npx <command>                        # Execute package binary
npx <package>                        # Download and execute package once
npm link                             # Link package for local development
npm link <package>                   # Link to local package
npm unlink <package>                 # Unlink package
```

## 📊 Useful Combinations

```bash
npm outdated && npm update           # Check and update packages
npm ci && npm run build              # Clean install and build
npm audit fix --force                # Force fix all vulnerabilities
npm ls --depth=0 --json              # Get top-level deps as JSON
npm install --dry-run                # Preview what would be installed
```

## 💡 Pro Tips

- Use `npm ci` in CI/CD pipelines (faster, more reliable)
- Use `npx` to run packages without installing globally
- Use `--save-exact` to install exact versions (no ^ or ~)
- Use `npm ls <package>` to find why a package is installed
- Use `npm outdated --depth=0` to check only direct dependencies
