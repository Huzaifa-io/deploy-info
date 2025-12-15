# Deploy Info

An NPM package that provides deployment time and version information for your Node.js application.

## Installation

```bash
npm install deploy-info
```

## Usage

### Basic Example

```javascript
const express = require('express');
const deployInfo = require('deploy-info');

const app = express();

app.get('/', (req, res) => {
  res.json({
    message: 'Hello World',
    version: deployInfo.version,
    deployTime: deployInfo.latest_time,
    commit: deployInfo.commit,
    branch: deployInfo.branch
  });
});

app.get('/info', (req, res) => {
  res.json(deployInfo.getInfo());
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log(deployInfo.toString());
});
```

### Simple Response Example

```javascript
app.get('/', (req, res) => {
  res.send(`
    Date: ${new Date().toDateString()}
    Version: ${deployInfo.version}
    Last Deploy: ${deployInfo.latest_time}
  `);
});
```

## Available Properties

- `deployInfo.version` - Application version from package.json
- `deployInfo.latest_time` - Latest git commit date
- `deployInfo.latest_deploy_time` - Server start/deploy time
- `deployInfo.commit` - Git commit hash (short)
- `deployInfo.branch` - Git branch name
- `deployInfo.build_time` - Build time (formatted)

## Available Methods

### `getInfo()`

Complete information object return karta hai:

```javascript
const info = deployInfo.getInfo();
console.log(info);
/*
{
  version: '1.0.0',
  deployTime: '2024-01-15T10:30:00.000Z',
  buildTime: '1/15/2024, 10:30:00 AM',
  git: {
    commit: 'abc1234',
    branch: 'main',
    lastCommitDate: '2024-01-15T09:00:00.000Z',
    lastCommitMessage: 'Added new feature'
  }
}
*/
```

### `toString()`

Formatted string return karta hai:

```javascript
console.log(deployInfo.toString());
// Output: Version: 1.0.0 | Deploy: 2024-01-15T10:30:00.000Z | Commit: abc1234 | Branch: main
```

## Complete Express Example

```javascript
const express = require('express');
const deployInfo = require('deploy-info');

const app = express();

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    ...deployInfo.getInfo()
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: deployInfo.version,
    commit: deployInfo.commit
  });
});

// Main route
app.get('/', (req, res) => {
  res.json({
    message: 'API is running',
    currentTime: new Date().toDateString(),
    deployInfo: {
      version: deployInfo.version,
      deployTime: deployInfo.latest_time
    }
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
  console.log(deployInfo.toString());
});
```

## Features

- ✅ Git commit information
- ✅ Git branch information  
- ✅ Application version from package.json
- ✅ Deployment timestamp
- ✅ Build time
- ✅ Last commit date aur message
- ✅ Easy to use API
- ✅ Express.js ke saath fully compatible

## Requirements

- Node.js
- Git (optional, but recommended for full features)

## License

MIT