# Sentry Alert Payload Fix Needed

## ✅ Success: Webhook Fired!

The Alert Rule successfully triggered a webhook to our endpoint at:
- Time: Oct 14, 2025 9:19:54 PM UTC
- Event Type: `event_alert.triggered`
- Status: 400 (error in processing)

## 🔧 Issue

Alert Rules send a DIFFERENT payload format than Internal Integration webhooks.

Alert Rule payload format:
```json
{
  "action": "triggered",
  "data": {
    "event": { ... },
    "triggered_rule": "Alert Rule Name"
  }
}
```

Our webhook expects:
```json
{
  "data": {
    "issue": { ... }
  }
}
```

## 🎯 Fix Required

Update the webhook to handle BOTH formats:
1. Internal Integration format (issue webhooks)
2. Alert Rule format (event_alert.triggered)

The webhook needs to extract issue/error data from either format.

---

**Next Step**: Update webhook code to handle Alert Rule payload format.
