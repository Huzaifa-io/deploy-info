const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class DeployInfo {
  constructor() {
    this.deployTime = new Date().toISOString();
    this.version = this.getVersion();
    this.gitCommit = this.getGitCommit();
    this.gitCommitMessage = this.getGitLastCommitMessage();
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
  getDeployCountFromGit() {
    try {
      const output = execSync(
        `git log --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
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
      const commit = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
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

  getLastSuccessfulCommitMessage() {
    try {
      const commit = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (!commit) return "No successful deploy found";
      const message = execSync(`git log -1 --format=%s ${commit}`, { encoding: "utf8" }).trim();
      return message;
    } catch (_) {
      return "Unable to retrieve message";
    }
  }

  // Determine deploy success from git logs only
  getDeployStatus() {
    try {
      // Check if HEAD commit matches success pattern
      const matches = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
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

  getGitAuthorName() {
    try {
      return execSync("git log -1 --format=%an", { encoding: "utf8" }).trim();
    } catch (_) {
      return "unknown";
    }
  }

  getGitAuthorEmail() {
    try {
      return execSync("git log -1 --format=%ae", { encoding: "utf8" }).trim();
    } catch (_) {
      return "unknown";
    }
  }

  getGitCommitterName() {
    try {
      return execSync("git log -1 --format=%cn", { encoding: "utf8" }).trim();
    } catch (_) {
      return "unknown";
    }
  }

  getLastSuccessfulAuthorName() {
    try {
      const commit = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (!commit) return "unknown";
      return execSync(`git log -1 --format=%an ${commit}`, { encoding: "utf8" }).trim();
    } catch (_) {
      return "unknown";
    }
  }

  getLastSuccessfulAuthorEmail() {
    try {
      const commit = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (!commit) return "unknown";
      return execSync(`git log -1 --format=%ae ${commit}`, { encoding: "utf8" }).trim();
    } catch (_) {
      return "unknown";
    }
  }

  getGitTag() {
    try {
      return execSync("git describe --tags --abbrev=0", { encoding: "utf8" }).trim();
    } catch (_) {
      return "no-tag";
    }
  }

  getDeployCommitStats() {
    try {
      const commit = execSync(
        `git log -1 --grep="deploy success|deployment successful" --regexp-ignore-case --pretty=format:%H`,
        { encoding: "utf8" }
      ).trim();
      if (!commit) return { filesChanged: 0, insertions: 0, deletions: 0 };
      const stats = execSync(`git show --stat ${commit}`, { encoding: "utf8" });
      const lines = stats.split(/\r?\n/);
      const lastLine = lines[lines.length - 2] || "";
      const match = lastLine.match(/(\d+)\s+files?\s+changed|insertions|deletions/);
      return { raw: lastLine, commit };
    } catch (_) {
      return { filesChanged: 0, insertions: 0, deletions: 0 };
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

  get last_success_message() {
    return this.getLastSuccessfulCommitMessage();
  }

  get author_name() {
    return this.getGitAuthorName();
  }

  get author_email() {
    return this.getGitAuthorEmail();
  }

  get committer_name() {
    return this.getGitCommitterName();
  }

  get last_success_author() {
    return this.getLastSuccessfulAuthorName();
  }

  get last_success_author_email() {
    return this.getLastSuccessfulAuthorEmail();
  }

  get latest_tag() {
    return this.getGitTag();
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
        currentCommit: {
          hash: this.gitCommit,
          branch: this.gitBranch,
          date: this.getGitLastCommitDate(),
          message: this.getGitLastCommitMessage(),
          author: {
            name: this.getGitAuthorName(),
            email: this.getGitAuthorEmail(),
          },
          committer: this.getGitCommitterName(),
        },
        lastSuccessfulDeploy: {
          commit: lastSuccess.commit,
          time: lastSuccess.time,
          message: this.getLastSuccessfulCommitMessage(),
          author: {
            name: this.getLastSuccessfulAuthorName(),
            email: this.getLastSuccessfulAuthorEmail(),
          },
        },
        latestTag: this.getGitTag(),
      },
    };
  }

  // Get formatted string
  toString() {
    const info = this.getInfo();
    const current = info.git.currentCommit;
    const lastDeploy = info.git.lastSuccessfulDeploy;
    return `
╔════════════════════ DEPLOY INFO ════════════════════╗
║ Version      : ${info.version}
║ Status       : ${info.deployStatus.toUpperCase()}
║ Deploy Count : ${info.deployCount}
║ Build Time   : ${info.buildTime}
╠════════════════════ CURRENT COMMIT ═════════════════╣
║ Hash       : ${current.hash}
║ Branch     : ${current.branch}
║ Author     : ${current.author.name} <${current.author.email}>
║ Date       : ${current.date}
║ Message    : ${current.message}
╠═══════════════════ LAST SUCCESSFUL DEPLOY ══════════╣
║ Commit     : ${lastDeploy.commit || "-"}
║ Author     : ${lastDeploy.author.name || "-"} <${lastDeploy.author.email || "-"}>
║ Time       : ${lastDeploy.time || "-"}
║ Message    : ${lastDeploy.message || "-"}
╠═══════════════════════════════════════════════════════╣
║ Latest Tag : ${info.git.latestTag}
╚═══════════════════════════════════════════════════════╝
    `.trim();
  }
}

// Create singleton instance
const deployInfo = new DeployInfo();

module.exports = deployInfo;
