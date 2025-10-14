# Cursor AI Deployment Feedback Commands

## Available Commands

### `@deployment-status`
Check current deployment status and recent changes
```bash
# Usage in Cursor AI chat
@deployment-status

# Returns:
# - Current Vercel deployment status
# - Recent commits and their deployment status
# - Any pending deployments
```

### `@check-errors`
Check for new errors since last deployment
```bash
# Usage in Cursor AI chat
@check-errors

# Returns:
# - New Sentry errors
# - Error categorization and severity
# - Suggested fixes based on error patterns
```

### `@deployment-feedback`
Get comprehensive feedback loop status
```bash
# Usage in Cursor AI chat
@deployment-feedback

# Returns:
# - Complete feedback loop status
# - Recent deployment history
# - Error trends and patterns
# - Performance metrics
```

### `@suggest-fixes`
Get AI-suggested fixes for current errors
```bash
# Usage in Cursor AI chat
@suggest-fixes

# Returns:
# - Code fix suggestions
# - Configuration changes
# - Dependencies updates
# - Best practices recommendations
```

## Integration with Git MCP

### Automatic Triggers
- **On commit**: Auto-check deployment status
- **On push**: Monitor deployment progress
- **On error**: Generate fix suggestions
- **On success**: Update performance metrics

### Context Awareness
- **File changes**: Understand what code changed
- **Error patterns**: Learn from repeated issues
- **Deployment history**: Track success/failure patterns
- **Performance trends**: Monitor optimization opportunities

## Usage Examples

### Quick Status Check
```
User: @deployment-status
AI: Current deployment status: ✅ Success
     Last commit: "Fix deal wizard validation"
     Deployment time: 2m 34s ago
     No new errors detected
```

### Error Investigation
```
User: @check-errors
AI: 3 new errors detected:
     1. Validation error in Step5_Compliance.jsx
     2. API timeout in social media integration
     3. Memory leak in deal context
     
     Suggested fixes:
     - Add null check for compliance data
     - Increase API timeout to 30s
     - Clear context on component unmount
```

### Comprehensive Feedback
```
User: @deployment-feedback
AI: Feedback Loop Status:
     ✅ Last 5 deployments: 4 successful, 1 failed
     ⚠️  Error rate: 12% (target: <5%)
     📈 Performance: Stable (2.1s avg load time)
     🔄 Auto-fixes applied: 3/5 errors resolved
     
     Recommendations:
     - Add more error boundaries
     - Optimize bundle size
     - Implement retry logic for API calls
```

## Configuration

### Environment Variables
```bash
# Required for deployment monitoring
VITE_VERCEL_ENV=production
VITE_APP_VERSION=1.0.0
VITE_BUILD_TIME=auto-generated

# Required for error tracking
VITE_SENTRY_DSN=your-sentry-dsn
```

### Cursor Settings
```json
{
  "cursor.ai.deploymentFeedback": {
    "enabled": true,
    "autoCheck": true,
    "errorThreshold": 5,
    "performanceThreshold": 3000
  }
}
```

## Best Practices

### 1. Regular Monitoring
- Check deployment status after each commit
- Monitor error trends daily
- Review performance metrics weekly

### 2. Proactive Fixes
- Address errors before they accumulate
- Implement suggested fixes promptly
- Test fixes in staging before production

### 3. Learning from Feedback
- Track which fixes work best
- Identify common error patterns
- Optimize based on performance data

### 4. Team Collaboration
- Share deployment status with team
- Document error resolution processes
- Maintain deployment runbooks
