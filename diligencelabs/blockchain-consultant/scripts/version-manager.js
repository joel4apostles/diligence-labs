#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Version Manager for Diligence Labs Blockchain Consultant
 * 
 * Implements semantic versioning with automated changelog generation
 * and deployment tracking.
 */

class VersionManager {
  constructor() {
    this.packagePath = path.join(__dirname, '..', 'package.json');
    this.changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    this.versionPath = path.join(__dirname, '..', 'VERSION');
  }

  /**
   * Read current version from package.json
   */
  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Parse semantic version string
   */
  parseVersion(versionString) {
    const [major, minor, patch] = versionString.split('.').map(Number);
    return { major, minor, patch };
  }

  /**
   * Format version object to string
   */
  formatVersion({ major, minor, patch }) {
    return `${major}.${minor}.${patch}`;
  }

  /**
   * Bump version based on type
   */
  bumpVersion(type) {
    const currentVersion = this.getCurrentVersion();
    const version = this.parseVersion(currentVersion);

    switch (type) {
      case 'major':
        version.major += 1;
        version.minor = 0;
        version.patch = 0;
        break;
      case 'minor':
        version.minor += 1;
        version.patch = 0;
        break;
      case 'patch':
      default:
        version.patch += 1;
        break;
    }

    return this.formatVersion(version);
  }

  /**
   * Update package.json with new version
   */
  updatePackageJson(newVersion) {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    packageJson.version = newVersion;
    fs.writeFileSync(this.packagePath, JSON.stringify(packageJson, null, 2) + '\n');
  }

  /**
   * Create or update VERSION file
   */
  updateVersionFile(newVersion) {
    const versionInfo = {
      version: newVersion,
      timestamp: new Date().toISOString(),
      build: this.getBuildInfo(),
      environment: process.env.NODE_ENV || 'development'
    };

    fs.writeFileSync(this.versionPath, JSON.stringify(versionInfo, null, 2) + '\n');
  }

  /**
   * Get build information
   */
  getBuildInfo() {
    try {
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      return {
        hash: gitHash,
        branch: gitBranch
      };
    } catch (error) {
      return {
        hash: 'unknown',
        branch: 'unknown'
      };
    }
  }

  /**
   * Get commit messages since last version
   */
  getCommitsSinceLastVersion() {
    try {
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%h %s"`, { encoding: 'utf8' });
      return commits.split('\n').filter(commit => commit.trim());
    } catch (error) {
      // If no tags exist, get recent commits
      try {
        const commits = execSync('git log --pretty=format:"%h %s" -10', { encoding: 'utf8' });
        return commits.split('\n').filter(commit => commit.trim());
      } catch (err) {
        return [];
      }
    }
  }

  /**
   * Create git tag for version
   */
  createGitTag(version) {
    try {
      execSync(`git tag -a v${version} -m "Release v${version}"`);
      console.log(`✅ Created git tag: v${version}`);
    } catch (error) {
      console.error(`❌ Failed to create git tag: ${error.message}`);
    }
  }

  /**
   * Main version bump function
   */
  bump(type = 'patch') {
    const currentVersion = this.getCurrentVersion();
    const newVersion = this.bumpVersion(type);

    console.log(`🚀 Bumping version from ${currentVersion} to ${newVersion} (${type})`);

    // Update files
    this.updatePackageJson(newVersion);
    this.updateVersionFile(newVersion);

    // Generate changelog entry
    this.generateChangelogEntry(newVersion);

    // Create git tag
    this.createGitTag(newVersion);

    console.log(`✅ Version bump complete!`);
    console.log(`📝 Don't forget to commit these changes and push the tag:`);
    console.log(`   git add . && git commit -m "Bump version to v${newVersion}"`);
    console.log(`   git push && git push --tags`);

    return newVersion;
  }

  /**
   * Generate changelog entry for new version
   */
  generateChangelogEntry(version) {
    const timestamp = new Date().toISOString().split('T')[0];
    const commits = this.getCommitsSinceLastVersion();

    let entry = `\n## [${version}] - ${timestamp}\n\n`;

    if (commits.length > 0) {
      // Categorize commits
      const features = commits.filter(c => c.match(/feat|feature|add/i));
      const fixes = commits.filter(c => c.match(/fix|bug|patch/i));
      const security = commits.filter(c => c.match(/security|sec/i));
      const other = commits.filter(c => !features.includes(c) && !fixes.includes(c) && !security.includes(c));

      if (security.length > 0) {
        entry += '### 🔐 Security\n';
        security.forEach(commit => entry += `- ${commit.substring(8)}\n`);
        entry += '\n';
      }

      if (features.length > 0) {
        entry += '### ✨ New Features\n';
        features.forEach(commit => entry += `- ${commit.substring(8)}\n`);
        entry += '\n';
      }

      if (fixes.length > 0) {
        entry += '### 🐛 Bug Fixes\n';
        fixes.forEach(commit => entry += `- ${commit.substring(8)}\n`);
        entry += '\n';
      }

      if (other.length > 0) {
        entry += '### 📝 Other Changes\n';
        other.forEach(commit => entry += `- ${commit.substring(8)}\n`);
        entry += '\n';
      }
    } else {
      entry += '### 📝 Changes\n- Version bump\n\n';
    }

    // Update CHANGELOG.md
    if (fs.existsSync(this.changelogPath)) {
      const changelog = fs.readFileSync(this.changelogPath, 'utf8');
      const updatedChangelog = changelog.replace('# Changelog\n', `# Changelog${entry}`);
      fs.writeFileSync(this.changelogPath, updatedChangelog);
    } else {
      const newChangelog = `# Changelog\n\nAll notable changes to the Diligence Labs Blockchain Consultant project will be documented in this file.\n\nThe format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),\nand this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).\n${entry}`;
      fs.writeFileSync(this.changelogPath, newChangelog);
    }

    console.log(`📝 Updated CHANGELOG.md with v${version} entry`);
  }
}

// CLI Interface
if (require.main === module) {
  const versionManager = new VersionManager();
  const args = process.argv.slice(2);
  const versionType = args[0] || 'patch';

  if (!['major', 'minor', 'patch'].includes(versionType)) {
    console.error('❌ Invalid version type. Use: major, minor, or patch');
    process.exit(1);
  }

  try {
    versionManager.bump(versionType);
  } catch (error) {
    console.error(`❌ Version bump failed: ${error.message}`);
    process.exit(1);
  }
}

module.exports = VersionManager;