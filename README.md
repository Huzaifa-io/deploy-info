# Deploy Info 📦

A professional Node.js module that captures and tracks deployment information directly from Git logs. Extract commit details, deployment history, author information, version numbers, and build metadata in a structured, production-ready format.

---

## Features ✨

- **Git-Based Tracking**: All deployment data sourced directly from Git logs (no external files needed)
- **Complete Commit History**: Track total commit count and access latest commit details
- **Author Information**: Capture author name, email, and committer details for auditing
- **Simple Status Detection**: Automatically checks if git repository exists and has commits
- **Version Management**: Read version from `package.json` automatically
- **Professional Output**: Beautiful formatted console output with box drawing
- **Structured Data**: Access deployment info via object notation for API integration
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

// Access specific properties
console.log(deployInfo.status);              // "success" or "unknown"
console.log(deployInfo.deploy_count);        // Total commits in repository
console.log(deployInfo.app_version);         // From package.json
console.log(deployInfo.author_name);         // Current commit author
console.log(deployInfo.last_author);         // Last commit author
```

---

## API Reference

### Deployment Status & History

```javascript
deployInfo.status                    // "success" | "unknown"
deployInfo.deploy_count              // Total commits in repository (number)
deployInfo.last_commit               // Last commit hash
deployInfo.last_time                 // Last commit time (ISO)
deployInfo.last_message              // Last commit message
```

### Current Commit Information

```javascript
deployInfo.commit                    // Short commit hash
deployInfo.branch                    // Current branch name
deployInfo.author_name               // Commit author name
deployInfo.author_email              // Commit author email
deployInfo.committer_name            // Commit committer name
deployInfo.latest_time               // Commit date (ISO timestamp)
```

### Application & Build Information

```javascript
deployInfo.app_version               // Version from package.json
deployInfo.deployTime                // When module loaded (ISO)
deployInfo.latest_deploy_time        // When module loaded (ISO)
deployInfo.build_time                // When module loaded (locale string)
deployInfo.latest_tag                // Latest git tag
```

### Last Commit Details

```javascript
deployInfo.last_author               // Last commit author name
deployInfo.last_author_email         // Last commit author email
deployInfo.last_commit               // Last commit hash
deployInfo.last_time                 // Last commit timestamp
deployInfo.last_message              // Last commit message
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
  buildTime: "12/15/2025, 10:30:45 AM",
  deployStatus: "success",
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
║ Status       : SUCCESS
║ Deploy Count : 42
║ Build Time   : 12/15/2025, 10:30:45 AM
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

### Simple Git Tracking

The module tracks all commits in your repository:

- **Deploy Count**: Total number of commits in the repository (`git rev-list --count HEAD`)
- **Status**: Returns "success" if git repository has commits, "unknown" otherwise
- **Last Commit**: Always refers to the most recent commit (HEAD)
- **No Pattern Matching**: Works with any commit message

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
  const status = deployInfo.status === 'success' ? 200 : 503;
  res.status(status).json({
    status: deployInfo.status,
    version: deployInfo.app_version,
    deployCount: deployInfo.deploy_count,
    author: deployInfo.last_author
  });
});

// Version endpoint
app.get('/version', (req, res) => {
  res.json({
    version: deployInfo.app_version,
    commit: deployInfo.commit,
    branch: deployInfo.branch
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
console.log(`App Version:      ${deployInfo.app_version}`);
console.log(`Status:           ${deployInfo.status}`);
console.log(`Total Commits:    ${deployInfo.deploy_count}`);
console.log(`Current Branch:   ${deployInfo.branch}`);
console.log(`Current Author:   ${deployInfo.author_name}`);
console.log(`Last Commit By:   ${deployInfo.last_author}`);
console.log(`Last Commit Time: ${deployInfo.last_time}`);
console.log(`Latest Tag:       ${deployInfo.latest_tag}`);
console.log('═══════════════════════════════════════');
```

### Example 3: Monitoring & Logging

```javascript
const deployInfo = require('deploy-info');

const deploymentLog = {
  timestamp: new Date().toISOString(),
  version: deployInfo.app_version,
  status: deployInfo.status,
  currentBranch: deployInfo.branch,
  currentAuthor: {
    name: deployInfo.author_name,
    email: deployInfo.author_email
  },
  deploymentCount: deployInfo.deploy_count,
  lastSuccessful: {
    commit: deployInfo.last_commit,
    author: deployInfo.last_author,
    time: deployInfo.last_time
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

### Status shows "unknown"

**Problem**: Module cannot access Git information

**Solution**: Verify Git is installed and working
```bash
git status
git log --oneline
```

### No deployments counted

**Problem**: Deploy count shows 0

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

- **Module Load**: 50-200ms (includes Git queries)
- **Getters Access**: <1ms (in-memory)
- **getDeployCountFromGit()**: 100-300ms (scans commits)
- **toString()**: <5ms (formatting)

*Times vary based on repository size and system performance*

---

## Best Practices

### ✅ DO

- Cache the instance: `const deployInfo = require('deploy-info')`
- Use `getInfo()` for API responses
- Use `toString()` for console output
- Use getters for single values
- Integrate with CI/CD pipelines
- Include deployment info in error reports

### ❌ DON'T

- Don't create multiple instances
- Don't modify commit messages after deployment
- Don't rely on deploy count without valid messages
- Don't expect real-time updates without Git commits

---

## License

MIT - Free to use in any project

---

**Created with ❤️ by Muhammad Huzaifa**