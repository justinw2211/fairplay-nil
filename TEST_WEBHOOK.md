# Test Webhook Integration

This is a test PR to verify the Sentry webhook integration for sticky PR comments.

## What's Being Tested

1. Sentry webhook receives error notifications
2. Webhook finds the PR by commit SHA
3. Sticky comment is created/updated on this PR
4. Error information is displayed in the comment

## Expected Behavior

When an error occurs in a preview deployment:
- A comment should appear on this PR
- The comment should show error details
- The comment should update when new errors occur

---

*This test PR can be closed after verification.*

