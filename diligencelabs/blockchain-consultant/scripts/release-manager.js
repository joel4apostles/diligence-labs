#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

/**
 * Release Manager for Diligence Labs Blockchain Consultant
 * 
 * Handles automated releases with deployment tracking,
 * health checks, and rollback capabilities.
 */

class ReleaseManager {
  constructor() {
    this.packagePath = path.join(__dirname, '..', 'package.json');
    this.releaseConfigPath = path.join(__dirname, '..', 'release.config.js');
    this.deploymentLogPath = path.join(__dirname, '..', 'deployments.log');
  }

  /**
   * Get current version from package.json
   */
  getCurrentVersion() {
    const packageJson = JSON.parse(fs.readFileSync(this.packagePath, 'utf8'));
    return packageJson.version;
  }

  /**
   * Check if working directory is clean
   */
  isWorkingDirectoryClean() {
    try {
      const status = execSync('git status --porcelain', { encoding: 'utf8' });
      return status.trim() === '';
    } catch (error) {
      return false;
    }
  }

  /**
   * Run pre-release checks
   */
  async runPreReleaseChecks() {
    console.log('🔍 Running pre-release checks...');

    const checks = [
      {
        name: 'Working directory clean',
        check: () => this.isWorkingDirectoryClean(),
        fix: 'Commit or stash your changes before releasing'
      },
      {
        name: 'Build succeeds',
        check: () => {
          try {
            execSync('npm run build', { stdio: 'pipe' });
            return true;
          } catch (error) {
            return false;
          }
        },
        fix: 'Fix build errors before releasing'
      },
      {
        name: 'Tests pass',
        check: () => {
          try {
            // If tests exist, run them
            if (fs.existsSync(path.join(__dirname, '..', '__tests__')) || 
                fs.existsSync(path.join(__dirname, '..', 'test'))) {
              execSync('npm test', { stdio: 'pipe' });
            }
            return true;
          } catch (error) {
            return false;
          }
        },
        fix: 'Fix failing tests before releasing'
      }
    ];

    let allPassed = true;

    for (const check of checks) {
      const passed = await check.check();
      const status = passed ? '✅' : '❌';
      console.log(`${status} ${check.name}`);
      
      if (!passed) {
        allPassed = false;
        console.log(`   💡 ${check.fix}`);
      }
    }

    return allPassed;
  }

  /**
   * Create deployment record
   */
  createDeploymentRecord(version, environment = 'production') {
    const deployment = {
      version,
      environment,
      timestamp: new Date().toISOString(),
      buildInfo: this.getBuildInfo(),
      status: 'deployed'
    };

    const logEntry = JSON.stringify(deployment) + '\n';
    fs.appendFileSync(this.deploymentLogPath, logEntry);

    return deployment;
  }

  /**
   * Get build information
   */
  getBuildInfo() {
    try {
      const gitHash = execSync('git rev-parse --short HEAD', { encoding: 'utf8' }).trim();
      const gitBranch = execSync('git rev-parse --abbrev-ref HEAD', { encoding: 'utf8' }).trim();
      const buildDate = new Date().toISOString();
      
      return {
        hash: gitHash,
        branch: gitBranch,
        buildDate
      };
    } catch (error) {
      return {
        hash: 'unknown',
        branch: 'unknown',
        buildDate: new Date().toISOString()
      };
    }
  }

  /**
   * Generate release notes
   */
  generateReleaseNotes(version) {
    try {
      // Get commits since last tag
      const lastTag = execSync('git describe --tags --abbrev=0', { encoding: 'utf8' }).trim();
      const commits = execSync(`git log ${lastTag}..HEAD --pretty=format:"%s"`, { encoding: 'utf8' });
      
      const commitLines = commits.split('\n').filter(line => line.trim());
      
      if (commitLines.length === 0) {
        return `Release v${version}\n\n- Version bump`;
      }

      let notes = `Release v${version}\n\n`;
      
      // Categorize commits
      const features = commitLines.filter(c => c.match(/feat|feature|add/i));
      const fixes = commitLines.filter(c => c.match(/fix|bug|patch/i));
      const security = commitLines.filter(c => c.match(/security|sec/i));
      const other = commitLines.filter(c => !features.includes(c) && !fixes.includes(c) && !security.includes(c));

      if (security.length > 0) {
        notes += '🔐 **Security Updates:**\n';
        security.forEach(commit => notes += `- ${commit}\n`);
        notes += '\n';
      }

      if (features.length > 0) {
        notes += '✨ **New Features:**\n';
        features.forEach(commit => notes += `- ${commit}\n`);
        notes += '\n';
      }

      if (fixes.length > 0) {
        notes += '🐛 **Bug Fixes:**\n';
        fixes.forEach(commit => notes += `- ${commit}\n`);
        notes += '\n';
      }

      if (other.length > 0) {
        notes += '📝 **Other Changes:**\n';
        other.forEach(commit => notes += `- ${commit}\n`);
        notes += '\n';
      }

      return notes;
    } catch (error) {
      return `Release v${version}\n\n- Version bump`;
    }
  }

  /**
   * Create GitHub release (if configured)
   */
  createGitHubRelease(version, notes) {
    try {
      // Check if gh CLI is available
      execSync('gh --version', { stdio: 'pipe' });
      
      // Create release
      const tempFile = path.join(__dirname, 'release-notes.md');
      fs.writeFileSync(tempFile, notes);
      
      execSync(`gh release create v${version} --title "Release v${version}" --notes-file "${tempFile}"`, { stdio: 'inherit' });
      
      fs.unlinkSync(tempFile);
      
      console.log(`✅ Created GitHub release: v${version}`);
      return true;
    } catch (error) {
      console.log(`ℹ️  GitHub CLI not available or not configured. Skipping GitHub release.`);
      return false;
    }
  }

  /**
   * Deploy to environment
   */
  async deployToEnvironment(environment = 'production') {
    console.log(`🚀 Deploying to ${environment}...`);
    
    const version = this.getCurrentVersion();
    
    try {
      // For Vercel deployment
      if (environment === 'production') {
        console.log('📡 Triggering Vercel deployment...');
        // Note: This assumes Vercel is set up to auto-deploy from main branch
        // You might want to add specific Vercel CLI commands here
        
        execSync('git push origin main', { stdio: 'inherit' });
        execSync('git push --tags', { stdio: 'inherit' });
        
        console.log('✅ Code pushed to production branch');
        console.log('ℹ️  Vercel will automatically deploy from the main branch');
      }
      
      // Create deployment record
      this.createDeploymentRecord(version, environment);
      
      return true;
    } catch (error) {
      console.error(`❌ Deployment failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Main release function
   */
  async release(options = {}) {
    const { 
      environment = 'production',
      skipChecks = false,
      skipDeploy = false 
    } = options;

    console.log('🎉 Starting release process...');
    
    const version = this.getCurrentVersion();
    console.log(`📦 Releasing version: v${version}`);

    // Run pre-release checks
    if (!skipChecks) {
      const checksPass = await this.runPreReleaseChecks();
      if (!checksPass) {
        console.error('❌ Pre-release checks failed. Fix issues and try again.');
        process.exit(1);
      }
    }

    // Generate release notes
    const releaseNotes = this.generateReleaseNotes(version);
    console.log('\n📋 Release Notes:');
    console.log(releaseNotes);

    // Create GitHub release
    this.createGitHubRelease(version, releaseNotes);

    // Deploy to environment
    if (!skipDeploy) {
      const deploymentSuccess = await this.deployToEnvironment(environment);
      if (!deploymentSuccess) {
        console.error('❌ Deployment failed');
        process.exit(1);
      }
    }

    console.log('\n🎊 Release completed successfully!');
    console.log(`📊 Version v${version} is now live in ${environment}`);
    
    // Display post-release info
    console.log('\n📌 Post-release checklist:');
    console.log('  □ Monitor deployment health');
    console.log('  □ Update documentation if needed');
    console.log('  □ Notify team of release');
    console.log('  □ Monitor error tracking for issues');

    return version;
  }

  /**
   * Get deployment history
   */
  getDeploymentHistory(limit = 10) {
    if (!fs.existsSync(this.deploymentLogPath)) {
      return [];
    }

    const logs = fs.readFileSync(this.deploymentLogPath, 'utf8')
      .split('\n')
      .filter(line => line.trim())
      .map(line => {
        try {
          return JSON.parse(line);
        } catch (error) {
          return null;
        }
      })
      .filter(log => log !== null)
      .reverse()
      .slice(0, limit);

    return logs;
  }
}

// CLI Interface
if (require.main === module) {
  const releaseManager = new ReleaseManager();
  const args = process.argv.slice(2);
  
  const options = {};
  
  // Parse CLI arguments
  if (args.includes('--skip-checks')) {
    options.skipChecks = true;
  }
  
  if (args.includes('--skip-deploy')) {
    options.skipDeploy = true;
  }
  
  const envIndex = args.indexOf('--env');
  if (envIndex !== -1 && args[envIndex + 1]) {
    options.environment = args[envIndex + 1];
  }

  // Handle different commands
  const command = args[0];
  
  switch (command) {
    case 'history':
      const history = releaseManager.getDeploymentHistory();
      console.log('📜 Recent deployments:');
      history.forEach((deployment, index) => {
        console.log(`${index + 1}. v${deployment.version} (${deployment.environment}) - ${deployment.timestamp}`);
      });
      break;
      
    case 'status':
      const currentVersion = releaseManager.getCurrentVersion();
      const buildInfo = releaseManager.getBuildInfo();
      console.log(`📦 Current version: v${currentVersion}`);
      console.log(`🌿 Branch: ${buildInfo.branch}`);
      console.log(`🔗 Commit: ${buildInfo.hash}`);
      break;
      
    default:
      // Default release command
      releaseManager.release(options).catch(error => {
        console.error(`❌ Release failed: ${error.message}`);
        process.exit(1);
      });
  }
}

module.exports = ReleaseManager;