# Package Creation Checklist

Quick reference checklist for creating a package.

---

## Quick Steps

### 1. Create Structure
```bash
mkdir -p packages/task-management/src/{services,database,utils}
touch packages/task-management/{package.json,README.md,.gitignore}
```

### 2. Create package.json
```json
{
  "name": "@taskflow/task-management",
  "version": "1.0.0",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "dependencies": {
    "drizzle-orm": "^0.44.5"
  }
}
```

### 3. Configure Workspace
**Root `package.json`:**
```json
{
  "workspaces": ["packages/*"]
}
```

### 4. Write Code
- `src/services/TaskService.js` - Business logic
- `src/database/TaskOperations.js` - Data access
- `src/index.js` - Exports

### 5. Install & Use
```bash
npm install
```

```javascript
import { TaskService } from '@taskflow/task-management';
```

---

## Detailed Checklist

### Setup
- [ ] Create `packages/` directory
- [ ] Create `packages/[package-name]/` directory
- [ ] Create `src/` subdirectories (services, database, utils)
- [ ] Create `package.json`
- [ ] Create `README.md`
- [ ] Create `.gitignore`

### Configuration
- [ ] Add `workspaces` to root `package.json`
- [ ] Set package name (`@taskflow/package-name`)
- [ ] Set version (`1.0.0`)
- [ ] Configure `exports` field
- [ ] Add dependencies
- [ ] Add peerDependencies (if needed)

### Code
- [ ] Write service classes (business logic)
- [ ] Write database operations (data access)
- [ ] Create `index.js` with exports
- [ ] Add factory function (optional)
- [ ] Validate dependencies in constructors

### Application Integration
- [ ] Create routes in `routes/v1/`
- [ ] Import package in routes
- [ ] Initialize with dependencies
- [ ] Wire up routes

### Testing
- [ ] Test package import
- [ ] Test service methods
- [ ] Verify workspace linking
- [ ] Test routes

### Documentation
- [ ] Write README.md
- [ ] Document API
- [ ] Add usage examples
- [ ] List dependencies

---

## File Template: package.json

```json
{
  "name": "@taskflow/[package-name]",
  "version": "1.0.0",
  "description": "Description of package",
  "type": "module",
  "main": "./src/index.js",
  "exports": {
    ".": "./src/index.js"
  },
  "scripts": {
    "test": "node --test tests/**/*.test.js"
  },
  "keywords": ["keyword1", "keyword2"],
  "author": "",
  "license": "ISC",
  "dependencies": {},
  "peerDependencies": {},
  "devDependencies": {}
}
```

---

## File Template: index.js

```javascript
/**
 * Package Name
 * Main entry point
 */

// Services
export { ServiceName } from './services/ServiceName.js';

// Database Operations
export { OperationsName } from './database/OperationsName.js';

// Factory function (optional)
export function createPackageModule(config) {
  // Validate config
  if (!config.requiredDep) {
    throw new Error('requiredDep is required');
  }

  // Initialize
  const service = new ServiceName(config);

  return {
    services: {
      service,
    },
  };
}
```

---

## File Template: Service

```javascript
export class ServiceName {
  constructor(dependencies) {
    const { dep1, dep2 } = dependencies;
    
    // Validate
    if (!dep1) throw new Error('dep1 is required');
    if (!dep2) throw new Error('dep2 is required');

    this.dep1 = dep1;
    this.dep2 = dep2;
  }

  async methodName(data) {
    // Business logic
    return result;
  }
}
```

---

## Common Commands

```bash
# Install dependencies
npm install

# Test package
cd packages/[package-name]
npm test

# Check workspace linking
npm list @taskflow/[package-name]

# Version package
npm version patch
npm version minor
npm version major
```

---

## Quick Reference

| Step | Command/File | Purpose |
|------|-------------|---------|
| 1 | `mkdir packages/[name]` | Create directory |
| 2 | `package.json` | Package config |
| 3 | Root `package.json` | Workspace config |
| 4 | `src/services/` | Business logic |
| 5 | `src/index.js` | Exports |
| 6 | `npm install` | Link packages |
| 7 | `routes/v1/` | Use package |

---

See `CreatingAPackageGuide.md` for detailed instructions.
