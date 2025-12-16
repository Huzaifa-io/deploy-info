const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class DeployInfo {
  constructor() {
    this._deployTime = new Date().toISOString();
  }

  getVersion() {
    try {
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

  getDeployCountFromGit() {
    try {
      const output = execSync(`git rev-list --count HEAD`, {
        encoding: "utf8",
      }).trim();
      return parseInt(output) || 0;
    } catch (_) {
      return 0;
    }
  }

  getLastFromGit() {
    try {
      const commit = execSync(`git log -1 --pretty=format:%H`, {
        encoding: "utf8",
      }).trim();
      if (!commit) return { commit: null, time: null };
      const timestamp = execSync(`git show -s --format=%ct ${commit}`, {
        encoding: "utf8",
      }).trim();
      const iso = new Date(parseInt(timestamp) * 1000).toISOString();
      return { commit, time: iso };
    } catch (_) {
      return { commit: null, time: null };
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

  getGitTag() {
    try {
      return execSync("git describe --tags --abbrev=0", {
        encoding: "utf8",
      }).trim();
    } catch (_) {
      return "no-tag";
    }
  }

  get deployTime() {
    return this._deployTime;
  }

  get version() {
    return this.getVersion();
  }

  get commitHash() {
    return this.getGitCommit();
  }

  get branchName() {
    return this.getGitBranch();
  }

  get commitCount() {
    return this.getDeployCountFromGit();
  }

  get lastCommitHash() {
    return this.getLastFromGit().commit || "unknown";
  }

  get lastCommitDate() {
    return this.getLastFromGit().time || null;
  }

  get lastCommitMessage() {
    return this.getGitLastCommitMessage();
  }

  get authorName() {
    return this.getGitAuthorName();
  }

  get authorEmail() {
    return this.getGitAuthorEmail();
  }

  get committerName() {
    return this.getGitCommitterName();
  }

  get latestTag() {
    return this.getGitTag();
  }

  getInfo() {
    return {
      version: this.version,
      deployTime: this.deployTime,
      deployCount: this.getDeployCountFromGit(),
      git: {
        commit: {
          hash: this.getGitCommit(),
          branch: this.getGitBranch(),
          message: this.getGitLastCommitMessage(),
          date: this.getLastFromGit().time,
          author: {
            name: this.getGitAuthorName(),
            email: this.getGitAuthorEmail(),
          },
          committer: this.getGitCommitterName(),
        },
        latestTag: this.getGitTag(),
      },
    };
  }

  toString() {
    const info = this.getInfo();
    const commit = info.git.commit;
    return `
╔════════════════════ DEPLOY INFO ══════════════════════╗
║ Version      : ${info.version}
║ Deploy Count : ${info.deployCount}
╠═════════════════════ LAST COMMIT ═════════════════════╣
║ Hash       : ${commit.hash}
║ Branch     : ${commit.branch}
║ Author     : ${commit.author.name} <${commit.author.email}>
║ Date       : ${commit.date}
║ Message    : ${commit.message}
╠═══════════════════════════════════════════════════════╣
║ Latest Tag : ${info.git.latestTag}
╚═══════════════════════════════════════════════════════╝
    `.trim();
  }
}

// Create singleton instance
const deployInfo = new DeployInfo();

module.exports = deployInfo;
