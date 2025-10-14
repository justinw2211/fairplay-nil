/**
 * Sentry Webhook Handler for Sticky PR Comments
 * 
 * This function receives Sentry webhook alerts and creates/updates
 * a sticky comment on the corresponding GitHub PR with error information.
 */

import { Octokit } from '@octokit/rest';

// Initialize GitHub client
const octokit = new Octokit({
  auth: process.env.GITHUB_TOKEN,
});

// Repository configuration
const REPO_OWNER = 'justinw2211'; // Your GitHub username
const REPO_NAME = 'fairplay-nil';

/**
 * Find GitHub PR by commit SHA
 */
async function findPRByCommit(commitSha) {
  try {
    // Search for commits in the repository
    const { data: commits } = await octokit.rest.repos.listCommits({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      sha: commitSha,
      per_page: 1
    });

    if (commits.length === 0) {
      console.log(`No commit found for SHA: ${commitSha}`);
      return null;
    }

    // Get PRs associated with this commit
    const { data: prs } = await octokit.rest.repos.listPullRequestsAssociatedWithCommit({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      commit_sha: commitSha
    });

    return prs.length > 0 ? prs[0] : null;
  } catch (error) {
    console.error('Error finding PR by commit:', error);
    return null;
  }
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
      console.log(`Updated sticky comment for PR #${prNumber}`);
    } else {
      // Create new comment
      await octokit.rest.issues.createComment({
        owner: REPO_OWNER,
        repo: REPO_NAME,
        issue_number: prNumber,
        body: commentBody,
      });
      console.log(`Created sticky comment for PR #${prNumber}`);
    }
  } catch (error) {
    console.error('Error updating sticky comment:', error);
    throw error;
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
 * Main webhook handler
 */
export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const payload = req.body;
    
    // Validate Sentry webhook payload
    if (!payload || !payload.data) {
      return res.status(400).json({ error: 'Invalid payload' });
    }

    // Extract issue from Sentry webhook
    const issue = payload.data?.issue || payload.issue;
    if (!issue) {
      return res.status(400).json({ error: 'No issue data found' });
    }

    // Extract release information (commit SHA)
    // Sentry can send release in different formats:
    // 1. Direct: issue.release
    // 2. In tags array: issue.tags = [["release", "sha"], ...]
    // 3. In metadata: issue.metadata.release
    let release = issue.release;
    
    if (!release && Array.isArray(issue.tags)) {
      // Find release in tags array
      const releaseTag = issue.tags.find(tag => Array.isArray(tag) && tag[0] === 'release');
      if (releaseTag && releaseTag[1]) {
        release = releaseTag[1];
      }
    }
    
    if (!release && issue.metadata?.release) {
      release = issue.metadata.release;
    }
    
    if (!release) {
      console.log('No release information found in issue');
      return res.status(200).json({ message: 'No release info, skipping' });
    }

    // Find the PR for this commit
    const pr = await findPRByCommit(release);
    if (!pr) {
      console.log(`No PR found for commit: ${release}`);
      return res.status(200).json({ message: 'No PR found for commit' });
    }

    // Build error data from Sentry webhook
    const errorData = {
      id: issue.id,
      title: issue.title || issue.culprit || 'Unknown Error',
      count: issue.count || issue.numComments || 1,
      lastSeen: issue.lastSeen || issue.last_seen || new Date().toISOString(),
      status: issue.status || 'unresolved'
    };
    
    // Update sticky comment
    await updateStickyComment(pr.number, [errorData]);

    return res.status(200).json({ 
      message: 'Sticky comment updated successfully',
      pr_number: pr.number,
      errors_count: 1
    });

  } catch (error) {
    console.error('Webhook handler error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      details: error.message 
    });
  }
}

// Removed unused function - error data now comes directly from Sentry webhook payload
