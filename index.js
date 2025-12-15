const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class DeployInfo {
  constructor() {
    this.deployTime = new Date().toISOString();
    this.version = this.getVersion();
    this.gitCommit = this.getGitCommit();
    this.gitBranch = this.getGitBranch();
    this.buildTime = new Date().toLocaleString();
    this.deployStatus = this.getDeployStatus();
  }

  getVersion() {
    try {
      // Try to read version from package.json
      const packageJsonPath = path.join(process.cwd(), "package.json");
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(
          fs.readFileSync(packageJsonPath, "utf8")
        );
        return packageJson.version || "1.0.0";
      }
    } catch (error) {
      console.warn("Could not read version from package.json:", error.message);
    }
    return "1.0.0";
  }

  getGitCommit() {
    try {
      return execSync("git rev-parse --short HEAD", {
        encoding: "utf8",
      }).trim();
    } catch (error) {
      return "unknown";
    }
  }

  getGitBranch() {
    try {
      return execSync("git rev-parse --abbrev-ref HEAD", {
        encoding: "utf8",
      }).trim();
    } catch (error) {
      return "unknown";
    }
  }

  // Compute deploy history from git logs
  getDeploySuccessPattern() {
    const envPattern = process.env.DEPLOY_SUCCESS_PATTERN;
    // Default pattern matches common phrases: "deploy success" or "deployment successful"
    return envPattern && envPattern.trim().length > 0
      ? envPattern.trim()
      : "deploy success|deployment successful";
  }

  getDeployCountFromGit() {
    try {
      const pattern = this.getDeploySuccessPattern();
      const output = execSync(
        `git log --grep="${pattern}" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      );
      const lines = output.split(/\r?\n/).filter(Boolean);
      return lines.length;
    } catch (_) {
      return 0;
    }
  }

  getLastSuccessfulFromGit() {
    try {
      const pattern = this.getDeploySuccessPattern();
      const commit = execSync(
        `git log -1 --grep="${pattern}" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (!commit) return { commit: null, time: null };
      const timestamp = execSync(`git show -s --format=%ct ${commit}`, { encoding: "utf8" }).trim();
      const iso = new Date(parseInt(timestamp) * 1000).toISOString();
      return { commit, time: iso };
    } catch (_) {
      return { commit: null, time: null };
    }
  }

  // Determine deploy success from env or marker file
  getDeployStatus() {
    try {
      const pattern = this.getDeploySuccessPattern();
      // Check if HEAD commit matches success pattern
      const matches = execSync(
        `git log -1 --grep="${pattern}" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (matches) return "success";
      return "failed"; // HEAD does not indicate a successful deploy
    } catch (_) {
      return "unknown";
    }
  }

  // Allow manually setting deploy status at runtime
  setDeployStatus(status) {
    const normalized = String(status || "").trim().toLowerCase();
    if (["success", "failed", "unknown"].includes(normalized)) {
      this.deployStatus = normalized;
    }
    return this.deployStatus;
  }

  getGitLastCommitDate() {
    try {
      const timestamp = execSync("git log -1 --format=%ct", {
        encoding: "utf8",
      }).trim();
      return new Date(parseInt(timestamp) * 1000).toISOString();
    } catch (error) {
      return this.deployTime;
    }
  }

  getGitLastCommitMessage() {
    try {
      return execSync("git log -1 --format=%s", { encoding: "utf8" }).trim();
    } catch (error) {
      return "No commit message available";
    }
  }

  // Property getters for easy access
  get latest_time() {
    return this.getGitLastCommitDate();
  }

  get latest_deploy_time() {
    return this.deployTime;
  }

  get app_version() {
    return this.version;
  }

  get commit() {
    return this.gitCommit;
  }

  get branch() {
    return this.gitBranch;
  }

  get build_time() {
    return this.buildTime;
  }

  get status() {
    return this.deployStatus;
  }

  get deploy_count() {
    return this.getDeployCountFromGit();
  }

  get last_success_commit() {
    return this.getLastSuccessfulFromGit().commit || "unknown";
  }

  get last_success_time() {
    return this.getLastSuccessfulFromGit().time || null;
  }

  // Get all info as object
  getInfo() {
    const lastSuccess = this.getLastSuccessfulFromGit();
    return {
      version: this.version,
      deployTime: this.deployTime,
      buildTime: this.buildTime,
      deployStatus: this.deployStatus,
      deployCount: this.getDeployCountFromGit(),
      git: {
        commit: this.gitCommit,
        branch: this.gitBranch,
        lastCommitDate: this.getGitLastCommitDate(),
        lastCommitMessage: this.getGitLastCommitMessage(),
        lastSuccessfulCommit: lastSuccess.commit,
        lastSuccessfulTime: lastSuccess.time,
      },
    };
  }

  // Get formatted string
  toString() {
    const info = this.getInfo();
    return `Version: ${info.version} | Deploy: ${info.deployTime} | Status: ${info.deployStatus} | Count: ${info.deployCount} | Commit: ${info.git.commit} (${info.git.lastCommitMessage}) | Branch: ${info.git.branch} | Last Success: ${info.git.lastSuccessfulCommit || "-"} @ ${info.git.lastSuccessfulTime || "-"}`;
  }
}

// Create singleton instance
const deployInfo = new DeployInfo();

module.exports = deployInfo;
