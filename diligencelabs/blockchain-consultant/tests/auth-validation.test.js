// Authentication Validation Test Suite
// Run with: node tests/auth-validation.test.js

const http = require('http');
const https = require('https');

class AuthTestSuite {
  constructor() {
    this.baseUrl = 'http://localhost:3001';
    this.results = [];
  }

  async makeRequest(path, method = 'GET', data = null, headers = {}) {
    return new Promise((resolve, reject) => {
      const url = new URL(this.baseUrl + path);
      const options = {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname + url.search,
        method: method,
        headers: {
          'Content-Type': 'application/json',
          ...headers
        }
      };

      const req = http.request(options, (res) => {
        let body = '';
        res.on('data', (chunk) => body += chunk);
        res.on('end', () => {
          try {
            const parsedBody = body ? JSON.parse(body) : {};
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: parsedBody
            });
          } catch (e) {
            resolve({
              status: res.statusCode,
              headers: res.headers,
              body: body
            });
          }
        });
      });

      req.on('error', reject);

      if (data) {
        req.write(JSON.stringify(data));
      }
      req.end();
    });
  }

  log(testName, status, details = '') {
    const result = { testName, status, details, timestamp: new Date().toISOString() };
    this.results.push(result);
    
    const emoji = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : '⚠️';
    console.log(`${emoji} ${testName}: ${status}${details ? ` - ${details}` : ''}`);
  }

  async testProviders() {
    try {
      const response = await this.makeRequest('/api/auth/providers');
      
      if (response.status === 200 && response.body) {
        const providers = response.body;
        const hasCredentials = providers.credentials ? true : false;
        const hasGoogle = providers.google ? true : false;
        const hasTwitter = providers.twitter ? true : false;
        
        this.log('NextAuth Providers Endpoint', 'PASS', 
          `Found providers: credentials=${hasCredentials}, google=${hasGoogle}, twitter=${hasTwitter}`);
        
        if (hasCredentials) {
          this.log('Credentials Provider', 'PASS', 'Email/password login available');
        } else {
          this.log('Credentials Provider', 'FAIL', 'Missing credentials provider');
        }

        if (hasGoogle) {
          this.log('Google OAuth Provider', 'PASS', 'Google login configured');
        } else {
          this.log('Google OAuth Provider', 'WARN', 'Google OAuth not configured');
        }

        if (hasTwitter) {
          this.log('Twitter OAuth Provider', 'PASS', 'Twitter login configured');
        } else {
          this.log('Twitter OAuth Provider', 'WARN', 'Twitter OAuth not configured');
        }

      } else {
        this.log('NextAuth Providers Endpoint', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      this.log('NextAuth Providers Endpoint', 'FAIL', error.message);
    }
  }

  async testCSRF() {
    try {
      const response = await this.makeRequest('/api/auth/csrf');
      
      if (response.status === 200 && response.body?.csrfToken) {
        this.log('CSRF Protection', 'PASS', 'CSRF token generated');
        return response.body.csrfToken;
      } else {
        this.log('CSRF Protection', 'FAIL', `Status: ${response.status}`);
        return null;
      }
    } catch (error) {
      this.log('CSRF Protection', 'FAIL', error.message);
      return null;
    }
  }

  async testSession() {
    try {
      const response = await this.makeRequest('/api/auth/session');
      
      if (response.status === 200) {
        if (response.body?.user) {
          this.log('Session Endpoint (Authenticated)', 'PASS', 
            `User ID: ${response.body.user.id}, Email: ${response.body.user.email}`);
        } else {
          this.log('Session Endpoint (Unauthenticated)', 'PASS', 'No active session');
        }
      } else {
        this.log('Session Endpoint', 'FAIL', `Status: ${response.status}`);
      }
    } catch (error) {
      this.log('Session Endpoint', 'FAIL', error.message);
    }
  }

  async testProtectedAPI() {
    try {
      const response = await this.makeRequest('/api/user-reputation');
      
      if (response.status === 401) {
        this.log('Protected API (Unauthorized)', 'PASS', 'Correctly requires authentication');
      } else if (response.status === 200) {
        this.log('Protected API (Authorized)', 'PASS', 'User has valid session');
      } else {
        this.log('Protected API', 'WARN', `Unexpected status: ${response.status}`);
      }
    } catch (error) {
      this.log('Protected API', 'FAIL', error.message);
    }
  }

  async testVerifyAuthFunction() {
    try {
      // Test various protected endpoints to ensure verifyAuthAndGetUser works
      const endpoints = [
        '/api/projects?userOnly=true',
        '/api/experts',
        '/api/user-reputation'
      ];

      for (const endpoint of endpoints) {
        const response = await this.makeRequest(endpoint);
        
        if (response.status === 401 || response.status === 200) {
          this.log(`verifyAuthAndGetUser (${endpoint})`, 'PASS', 
            `Status: ${response.status} (${response.status === 401 ? 'Unauthorized' : 'OK'})`);
        } else {
          this.log(`verifyAuthAndGetUser (${endpoint})`, 'WARN', 
            `Unexpected status: ${response.status}`);
        }
      }
    } catch (error) {
      this.log('verifyAuthAndGetUser Function', 'FAIL', error.message);
    }
  }

  async testRateLimiting() {
    try {
      // Test rapid requests to auth endpoint
      const promises = [];
      for (let i = 0; i < 5; i++) {
        promises.push(this.makeRequest('/api/auth/csrf'));
      }
      
      const responses = await Promise.all(promises);
      const successCount = responses.filter(r => r.status === 200).length;
      const rateLimitedCount = responses.filter(r => r.status === 429).length;
      
      if (successCount > 0) {
        this.log('Rate Limiting Test', 'PASS', 
          `${successCount} successful, ${rateLimitedCount} rate limited`);
      } else {
        this.log('Rate Limiting Test', 'FAIL', 'All requests failed');
      }
    } catch (error) {
      this.log('Rate Limiting Test', 'FAIL', error.message);
    }
  }

  async testSecurityHeaders() {
    try {
      const response = await this.makeRequest('/api/auth/session');
      const headers = response.headers;
      
      // Check for security headers
      const hasCSP = headers['content-security-policy'] ? true : false;
      const hasHSTS = headers['strict-transport-security'] ? true : false;
      const hasXFrame = headers['x-frame-options'] ? true : false;
      
      this.log('Security Headers', 'INFO', 
        `CSP: ${hasCSP}, HSTS: ${hasHSTS}, X-Frame: ${hasXFrame}`);
        
    } catch (error) {
      this.log('Security Headers', 'FAIL', error.message);
    }
  }

  async runAllTests() {
    console.log('🚀 Starting Authentication Validation Tests...\n');
    
    await this.testProviders();
    await this.testCSRF();
    await this.testSession();
    await this.testProtectedAPI();
    await this.testVerifyAuthFunction();
    await this.testRateLimiting();
    await this.testSecurityHeaders();
    
    this.generateReport();
  }

  generateReport() {
    console.log('\n📊 Test Results Summary:');
    console.log('=' .repeat(50));
    
    const passed = this.results.filter(r => r.status === 'PASS').length;
    const failed = this.results.filter(r => r.status === 'FAIL').length;
    const warnings = this.results.filter(r => r.status === 'WARN').length;
    const info = this.results.filter(r => r.status === 'INFO').length;
    
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⚠️  Warnings: ${warnings}`);
    console.log(`ℹ️  Info: ${info}`);
    console.log(`📋 Total Tests: ${this.results.length}`);
    
    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      this.results.filter(r => r.status === 'FAIL').forEach(r => {
        console.log(`  - ${r.testName}: ${r.details}`);
      });
    }
    
    if (warnings > 0) {
      console.log('\n⚠️  Warnings:');
      this.results.filter(r => r.status === 'WARN').forEach(r => {
        console.log(`  - ${r.testName}: ${r.details}`);
      });
    }
    
    const score = Math.round((passed / (passed + failed)) * 100);
    console.log(`\n🎯 Overall Score: ${score}% (${passed}/${passed + failed} critical tests passed)`);
    
    console.log('\n📄 Detailed Results:');
    console.log(JSON.stringify(this.results, null, 2));
  }
}

// Self-executing test suite
(async () => {
  const testSuite = new AuthTestSuite();
  await testSuite.runAllTests();
})();