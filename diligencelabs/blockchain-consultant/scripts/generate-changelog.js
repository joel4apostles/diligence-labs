#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Changelog Generator for Diligence Labs Blockchain Consultant
 * 
 * Generates comprehensive changelogs from git commit history
 * with semantic categorization and release notes.
 */

class ChangelogGenerator {
  constructor() {
    this.changelogPath = path.join(__dirname, '..', 'CHANGELOG.md');
    this.packagePath = path.join(__dirname, '..', 'package.json');
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Get all git tags in chronological order
   */
  getAllTags() {
    try {
      const tags = execSync('git tag --sort=-version:refname', { encoding: 'utf8' });
      return tags.split('\n').filter(tag => tag.trim());
    } catch (error) {
      return [];
    }
  }

  /**
   * Get commits between two references
   */
  getCommitsBetween(from, to = 'HEAD') {
    try {
      const range = from ? `${from}..${to}` : to;
      const commits = execSync(
        `git log ${range} --pretty=format:"%h|%s|%an|%ad" --date=short`, 
        { encoding: 'utf8' }
      );
      
      return commits.split('\n').filter(commit => commit.trim()).map(commit => {
        const [hash, subject, author, date] = commit.split('|');
        return { hash, subject, author, date };
      });
    } catch (error) {
      return [];
    }
  }

  /**
   * Categorize commits based on conventional commit patterns
   */
  categorizeCommits(commits) {
    const categories = {
      security: [],
      breaking: [],
      features: [],
      fixes: [],
      improvements: [],
      documentation: [],
      testing: [],
      dependencies: [],
      other: []
    };

    commits.forEach(commit => {
      const subject = commit.subject.toLowerCase();
      
      // Security updates
      if (subject.match(/security|sec|vulnerability|cve|exploit|patch/)) {
        categories.security.push(commit);
      }
      // Breaking changes
      else if (subject.match(/breaking|major|!:|BREAKING/)) {
        categories.breaking.push(commit);
      }
      // Features
      else if (subject.match(/feat|feature|add|implement|create/)) {
        categories.features.push(commit);
      }
      // Bug fixes
      else if (subject.match(/fix|bug|resolve|repair|correct/)) {
        categories.fixes.push(commit);
      }
      // Improvements/enhancements
      else if (subject.match(/improve|enhance|update|optimize|refactor|perf/)) {
        categories.improvements.push(commit);
      }
      // Documentation
      else if (subject.match(/doc|readme|comment|guide|manual/)) {
        categories.documentation.push(commit);
      }
      // Testing
      else if (subject.match(/test|spec|coverage|jest|cypress/)) {
        categories.testing.push(commit);
      }
      // Dependencies
      else if (subject.match(/dep|dependency|bump|upgrade|package|npm/)) {
        categories.dependencies.push(commit);
      }
      // Everything else
      else {
        categories.other.push(commit);
      }
    });

    return categories;
  }

  /**
   * Format commits for changelog
   */
  formatCommits(commits, includeAuthor = false) {
    return commits.map(commit => {
      const subject = commit.subject.charAt(0).toUpperCase() + commit.subject.slice(1);
      const authorInfo = includeAuthor ? ` (@${commit.author})` : '';
      return `- ${subject} ([${commit.hash}](../../commit/${commit.hash}))${authorInfo}`;
    }).join('\n');
  }

  /**
   * Generate changelog section for a version
   */
  generateVersionSection(version, date, commits, isUnreleased = false) {
    const categories = this.categorizeCommits(commits);
    const versionHeader = isUnreleased ? '## [Unreleased]' : `## [${version}] - ${date}`;
    
    let section = `${versionHeader}\n\n`;

    // Add summary statistics
    const totalCommits = commits.length;
    if (totalCommits > 0) {
      section += `*${totalCommits} ${totalCommits === 1 ? 'change' : 'changes'} in this release*\n\n`;
    }

    // Security updates (highest priority)
    if (categories.security.length > 0) {
      section += '### 🔐 Security Updates\n\n';
      section += this.formatCommits(categories.security) + '\n\n';
    }

    // Breaking changes
    if (categories.breaking.length > 0) {
      section += '### ⚠️ Breaking Changes\n\n';
      section += this.formatCommits(categories.breaking) + '\n\n';
    }

    // New features
    if (categories.features.length > 0) {
      section += '### ✨ New Features\n\n';
      section += this.formatCommits(categories.features) + '\n\n';
    }

    // Bug fixes
    if (categories.fixes.length > 0) {
      section += '### 🐛 Bug Fixes\n\n';
      section += this.formatCommits(categories.fixes) + '\n\n';
    }

    // Improvements
    if (categories.improvements.length > 0) {
      section += '### 🚀 Improvements\n\n';
      section += this.formatCommits(categories.improvements) + '\n\n';
    }

    // Documentation
    if (categories.documentation.length > 0) {
      section += '### 📚 Documentation\n\n';
      section += this.formatCommits(categories.documentation) + '\n\n';
    }

    // Testing
    if (categories.testing.length > 0) {
      section += '### 🧪 Testing\n\n';
      section += this.formatCommits(categories.testing) + '\n\n';
    }

    // Dependencies
    if (categories.dependencies.length > 0) {
      section += '### 📦 Dependencies\n\n';
      section += this.formatCommits(categories.dependencies) + '\n\n';
    }

    // Other changes
    if (categories.other.length > 0) {
      section += '### 📝 Other Changes\n\n';
      section += this.formatCommits(categories.other) + '\n\n';
    }

    // If no commits found
    if (totalCommits === 0) {
      section += '- Initial release\n\n';
    }

    return section;
  }

  /**
   * Generate complete changelog
   */
  generateChangelog() {
    console.log('📝 Generating changelog...');

    const currentVersion = this.getCurrentVersion();
    const tags = this.getAllTags();

    let changelog = `# Changelog

All notable changes to the Diligence Labs Blockchain Consultant project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

    // Add unreleased section if there are commits since last tag
    const lastTag = tags[0];
    if (lastTag) {
      const unreleasedCommits = this.getCommitsBetween(lastTag);
      if (unreleasedCommits.length > 0) {
        changelog += this.generateVersionSection(null, null, unreleasedCommits, true);
      }
    }

    // Add sections for each tagged version
    for (let i = 0; i < tags.length; i++) {
      const currentTag = tags[i];
      const previousTag = tags[i + 1];
      const commits = this.getCommitsBetween(previousTag, currentTag);
      
      // Get date of the tag
      const tagDate = this.getTagDate(currentTag);
      const version = currentTag.replace(/^v/, '');
      
      changelog += this.generateVersionSection(version, tagDate, commits);
    }

    // If no tags exist, show all commits as initial version
    if (tags.length === 0) {
      const allCommits = this.getCommitsBetween(null);
      changelog += this.generateVersionSection(currentVersion, new Date().toISOString().split('T')[0], allCommits);
    }

    return changelog;
  }

  /**
   * Get the date when a tag was created
   */
  getTagDate(tag) {
    try {
      const date = execSync(`git log -1 --format=%ai ${tag}`, { encoding: 'utf8' });
      return date.split(' ')[0];
    } catch (error) {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Write changelog to file
   */
  writeChangelog(content) {
    fs.writeFileSync(this.changelogPath, content);
    console.log(`✅ Changelog written to ${this.changelogPath}`);
  }

  /**
   * Main function to generate and write changelog
   */
  generate() {
    try {
      const changelog = this.generateChangelog();
      this.writeChangelog(changelog);
      
      console.log('🎉 Changelog generation complete!');
      console.log(`📊 View your changelog: ${path.relative(process.cwd(), this.changelogPath)}`);
      
      return true;
    } catch (error) {
      console.error(`❌ Changelog generation failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Update changelog with new version entry
   */
  updateChangelog(version) {
    console.log(`📝 Adding v${version} to changelog...`);

    const lastTag = this.getAllTags()[0];
    const commits = this.getCommitsBetween(lastTag);
    const date = new Date().toISOString().split('T')[0];
    
    const newSection = this.generateVersionSection(version, date, commits);

    // Read existing changelog
    let existingChangelog = '';
    if (fs.existsSync(this.changelogPath)) {
      existingChangelog = fs.readFileSync(this.changelogPath, 'utf8');
    }

    // Insert new version after the header
    const headerEnd = existingChangelog.indexOf('\n\n') + 2;
    const beforeHeader = existingChangelog.substring(0, headerEnd);
    const afterHeader = existingChangelog.substring(headerEnd);

    // Remove unreleased section if it exists
    const unreleasedMatch = afterHeader.match(/## \[Unreleased\][\s\S]*?(?=##|$)/);
    const withoutUnreleased = unreleasedMatch ? 
      afterHeader.replace(unreleasedMatch[0], '') : 
      afterHeader;

    const updatedChangelog = beforeHeader + newSection + withoutUnreleased;
    
    this.writeChangelog(updatedChangelog);
    return true;
  }
}

// CLI Interface
if (require.main === module) {
  const generator = new ChangelogGenerator();
  const args = process.argv.slice(2);
  
  if (args[0] === 'update' && args[1]) {
    // Update changelog with specific version
    generator.updateChangelog(args[1]);
  } else {
    // Generate complete changelog
    generator.generate();
  }
}

module.exports = ChangelogGenerator;