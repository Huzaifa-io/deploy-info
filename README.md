# Deploy Info 📦

A professional Node.js module that captures and tracks deployment information directly from Git logs. Extract commit details, deployment history, author information, version numbers, and build metadata in a structured, production-ready format.

---

## Features ✨

- **Git-Based Tracking**: All deployment data sourced directly from Git logs (no external files needed)
- **Server Start Time Tracking**: Captures deployment time when server starts
- **Complete Commit History**: Track total commit count and access latest commit details
- **Author Information**: Capture author name, email, and committer details for auditing
- **Version Management**: Read version from `package.json` automatically
- **Professional Output**: Beautiful formatted console output with box drawing
- **Structured Data**: Access deployment info via object notation for API integration
- **CamelCase Convention**: Consistent naming across all properties for better readability
- **No Dependencies**: Uses only Node.js built-in modules

---

## Installation

```bash
npm install deploy-info
```

---

## Quick Start

### Basic Usage

```javascript
const deployInfo = require('deploy-info');

// Display formatted deployment info
console.log(deployInfo.toString());

// Get complete data object
const info = deployInfo.getInfo();
console.log(info);

// Access specific properties (camelCase)
console.log(deployInfo.deployTime);          // Server start time (ISO format)
console.log(deployInfo.commitCount);         // Total commits in repository
console.log(deployInfo.version);             // From package.json
console.log(deployInfo.authorName);          // Current commit author
console.log(deployInfo.lastCommitHash);      // Last commit hash
```

---

## API Reference

### Deployment Information

```javascript
deployInfo.deployTime                // Server start time (ISO format)
deployInfo.version                   // Version from package.json
deployInfo.commitCount               // Total commits in repository (number)
```

### Current Commit Information

```javascript
deployInfo.commitHash                // Short commit hash
deployInfo.branchName                // Current branch name
deployInfo.authorName                // Commit author name
deployInfo.authorEmail               // Commit author email
deployInfo.committerName             // Commit committer name
```

### Last Commit Details

```javascript
deployInfo.lastCommitHash            // Last commit hash (full)
deployInfo.lastCommitDate            // Last commit timestamp (ISO)
deployInfo.lastCommitMessage         // Last commit message
```

### Git Tags

```javascript
deployInfo.latestTag                 // Latest git tag
```

---

## Methods

### getInfo() - Get Complete Data Object

Returns comprehensive deployment information in structured format:

```javascript
const info = deployInfo.getInfo();
console.log(JSON.stringify(info, null, 2));
```

**Response Structure:**
```javascript
{
  version: "1.0.0",
  deployTime: "2025-12-15T10:30:45.123Z",
  deployCount: 42,
  git: {
    commit: {
      hash: "a1b2c3d",
      branch: "main",
      date: "2025-12-15T10:30:00.000Z",
      message: "Latest commit message",
      author: {
        name: "John Doe",
        email: "john@example.com"
      },
      committer: "John Doe"
    },
    latestTag: "v1.0.0"
  }
}
```

### toString() - Get Formatted Display

Returns beautifully formatted string output for console display:

```javascript
console.log(deployInfo.toString());
```

**Example Output:**
```
╔════════════════════ DEPLOY INFO ══════════════════════╗
║ Version      : 1.0.0
║ Deploy Count : 42
╠═════════════════════ LAST COMMIT ═════════════════════╣
║ Hash       : a1b2c3d
║ Branch     : main
║ Author     : John Doe <john@example.com>
║ Date       : 2025-12-15T10:30:00.000Z
║ Message    : Latest commit message
╠═══════════════════════════════════════════════════════╣
║ Latest Tag : v1.0.0
╚═══════════════════════════════════════════════════════╝
```

---

## How It Works

### Git-Based Tracking

The module tracks all commits in your repository and captures server start time:

- **Deploy Time**: Captured when the module is first loaded (server start time)
- **Commit Count**: Total number of commits in the repository (`git rev-list --count HEAD`)
- **Last Commit**: Always refers to the most recent commit (HEAD)
- **No Special Format Required**: Works with any commit message

**All commits are tracked - no special commit message format required.**

---

## Usage Examples

### Example 1: Express.js API Integration

```javascript
const express = require('express');
const deployInfo = require('deploy-info');

const app = express();

// Info endpoint
app.get('/api/info', (req, res) => {
  res.json({
    success: true,
    data: deployInfo.getInfo()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    version: deployInfo.version,
    deployCount: deployInfo.commitCount,
    deployTime: deployInfo.deployTime
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: deployInfo.version,
    commit: deployInfo.commitHash,
    branch: deployInfo.branchName
  });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
  console.log(deployInfo.toString());
});
```

### Example 2: CI/CD Deployment Report

```javascript
const deployInfo = require('deploy-info');

console.log('═══════════════════════════════════════');
console.log('DEPLOYMENT REPORT');
console.log('═══════════════════════════════════════');
console.log(`App Version:      ${deployInfo.version}`);
console.log(`Deploy Time:      ${deployInfo.deployTime}`);
console.log(`Total Commits:    ${deployInfo.commitCount}`);
console.log(`Current Branch:   ${deployInfo.branchName}`);
console.log(`Current Author:   ${deployInfo.authorName}`);
console.log(`Last Commit:      ${deployInfo.lastCommitHash}`);
console.log(`Last Commit Time: ${deployInfo.lastCommitDate}`);
console.log(`Latest Tag:       ${deployInfo.latestTag}`);
console.log('═══════════════════════════════════════');
```

### Example 3: Monitoring & Logging

```javascript
const deployInfo = require('deploy-info');

const deploymentLog = {
  timestamp: new Date().toISOString(),
  version: deployInfo.version,
  deployTime: deployInfo.deployTime,
  currentBranch: deployInfo.branchName,
  currentAuthor: {
    name: deployInfo.authorName,
    email: deployInfo.authorEmail
  },
  commitCount: deployInfo.commitCount,
  lastCommit: {
    hash: deployInfo.lastCommitHash,
    date: deployInfo.lastCommitDate,
    message: deployInfo.lastCommitMessage
  }
};

// Send to logging service
console.log('DEPLOYMENT_EVENT', JSON.stringify(deploymentLog, null, 2));

// Or store in database
// db.deploymentLogs.insert(deploymentLog);
```

### Example 4: CLI Tool

```bash
# Add to package.json
{
  "scripts": {
    "deploy-info": "node -e \"console.log(require('deploy-info').toString())\""
  }
}

# Run it
npm run deploy-info
```

---

## Requirements

- **Node.js**: v12.0.0 or higher
- **Git**: Must be installed and available in system PATH
- **package.json**: Required in project root (for version reading)

---

## Troubleshooting

### Git information shows "unknown"

**Problem**: Module cannot access Git information

**Solution**: Verify Git is installed and working
```bash
git status
git log --oneline
```

### Commit count shows 0

**Problem**: No commits found in repository

**Solution**: Verify you have commits in your repository
```bash
git log --oneline
# Should show your commits
```

### Version shows "1.0.0" instead of actual version

**Problem**: Cannot read version from package.json

**Solution**: Verify package.json exists and has version field
```bash
cat package.json | grep version
```

### Author shows "unknown"

**Problem**: Git user not configured

**Solution**: Configure Git user
```bash
git config user.name "Your Name"
git config user.email "your.email@example.com"

# Or for global config
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

---

## Performance

- **Module Load**: 50-100ms (captures deploy time and initializes)
- **Getters Access**: <1ms (lazy-loaded Git queries)
- **getInfo()**: 100-300ms (multiple Git queries)
- **toString()**: 100-300ms (includes getInfo() call)

*Times vary based on repository size and system performance*

---

## Best Practices

### ✅ DO

- Cache the instance: `const deployInfo = require('deploy-info')`
- Use `getInfo()` for API responses
- Use `toString()` for console output
- Use getters for single values (lazy-loaded)
- Track server start time via `deployTime`
- Integrate with CI/CD pipelines
- Include deployment info in error reports

### ❌ DON'T

- Don't create multiple instances
- Don't expect `deployTime` to change (it's set at server start)
- Don't call `getInfo()` repeatedly (cache if needed)
- Don't rely on Git info without proper Git setup

---

## License

MIT - Free to use in any project

---

**Created with ❤️ by [Muhammad Huzaifa](https://www.muhammad-huzaifa.me/)**