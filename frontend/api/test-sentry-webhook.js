/**
 * Test script for Sentry webhook functionality
 * Run this to test the webhook without triggering actual Sentry events
 */

import { Octokit } from '@octokit/rest';

// Test configuration
const REPO_OWNER = 'justinwachtel'; // Update with your GitHub username
const REPO_NAME = 'fairplay-nil';   // Update with your repo name if different

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

/**
 * Test function to simulate webhook behavior
 */
async function testWebhookFunctionality() {
  console.log('🧪 Testing Sentry Webhook Functionality...\n');

  try {
    // Test 1: Find a recent PR
    console.log('1. Finding recent PR...');
    const { data: prs } = await octokit.rest.pulls.list({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      state: 'open',
      per_page: 1
    });

    if (prs.length === 0) {
      console.log('❌ No open PRs found. Create a test PR first.');
      return;
    }

    const testPR = prs[0];
    console.log(`✅ Found PR #${testPR.number}: ${testPR.title}`);

    // Test 2: Get commit SHA from PR
    console.log('\n2. Getting commit SHA...');
    const { data: commits } = await octokit.rest.pulls.listCommits({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      pull_number: testPR.number,
      per_page: 1
    });

    if (commits.length === 0) {
      console.log('❌ No commits found in PR.');
      return;
    }

    const commitSha = commits[0].sha;
    console.log(`✅ Latest commit SHA: ${commitSha}`);

    // Test 3: Create/update sticky comment
    console.log('\n3. Creating test sticky comment...');
    const testErrors = [
      {
        id: 'test-error-1',
        title: 'Test Error: Cannot read property of undefined',
        count: 3,
        lastSeen: new Date().toISOString(),
        status: 'unresolved'
      },
      {
        id: 'test-error-2',
        title: 'Test Warning: Network request failed',
        count: 1,
        lastSeen: new Date().toISOString(),
        status: 'unresolved'
      }
    ];

    await updateStickyComment(testPR.number, testErrors);
    console.log('✅ Test sticky comment created/updated');

    // Test 4: Verify comment was created
    console.log('\n4. Verifying comment...');
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: testPR.number,
    });

    const stickyComment = comments.find(comment => 
      comment.body.includes('<!-- SENTRY_STICKY_COMMENT -->')
    );

    if (stickyComment) {
      console.log('✅ Sticky comment found and verified');
      console.log(`   Comment ID: ${stickyComment.id}`);
      console.log(`   Comment URL: ${stickyComment.html_url}`);
    } else {
      console.log('❌ Sticky comment not found');
    }

    console.log('\n🎉 Test completed successfully!');
    console.log(`\n📋 Summary:`);
    console.log(`   - PR: #${testPR.number}`);
    console.log(`   - Commit SHA: ${commitSha}`);
    console.log(`   - Comment: ${stickyComment ? 'Created/Updated' : 'Failed'}`);

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.status === 401) {
      console.error('   → Check your GITHUB_TOKEN environment variable');
    } else if (error.status === 404) {
      console.error('   → Check repository owner/name configuration');
    }
  }
}

/**
 * Generate comment body with error information
 */
function generateCommentBody(errors) {
  const timestamp = new Date().toISOString();
  
  let body = `<!-- SENTRY_STICKY_COMMENT -->
## 🚨 Sentry Error Monitor

*Last updated: ${timestamp}*

`;

  if (errors.length === 0) {
    body += `✅ **No active errors detected** in this preview deployment.`;
  } else {
    body += `❌ **${errors.length} active error(s)** detected:\n\n`;
    
    // Create compact error table
    body += `| Error | Count | Last Seen | Status |\n`;
    body += `|-------|-------|-----------|--------|\n`;
    
    errors.forEach(error => {
      const status = error.status === 'unresolved' ? '🔴 Active' : '🟡 Resolved';
      const lastSeen = new Date(error.lastSeen).toLocaleDateString();
      
      body += `| [${error.title}](https://sentry.io/organizations/4509759316426752/issues/${error.id}/) | ${error.count} | ${lastSeen} | ${status} |\n`;
    });
    
    body += `\n📊 **View all errors:** [Sentry Dashboard](https://sentry.io/organizations/4509759316426752/issues/)`;
  }

  body += `\n\n---\n*This comment is automatically updated by Sentry webhook.*`;
  
  return body;
}

/**
 * Create or update sticky PR comment
 */
async function updateStickyComment(prNumber, errors) {
  const commentBody = generateCommentBody(errors);
  
  try {
    // Check if sticky comment already exists
    const { data: comments } = await octokit.rest.issues.listComments({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      issue_number: prNumber,
    });

    // Find existing sticky comment (marked with special identifier)
    const existingComment = comments.find(comment => 
      comment.body.includes('<!-- SENTRY_STICKY_COMMENT -->')
    );

    if (existingComment) {
      // Update existing comment
      await octokit.rest.issues.updateComment({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        comment_id: existingComment.id,
        body: commentBody,
      });
      console.log(`✅ Updated sticky comment for PR #${prNumber}`);
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: prNumber,
        body: commentBody,
      });
      console.log(`✅ Created sticky comment for PR #${prNumber}`);
    }
  } catch (error) {
    console.error('❌ Error updating sticky comment:', error);
    throw error;
  }
}

// Run the test
testWebhookFunctionality();
