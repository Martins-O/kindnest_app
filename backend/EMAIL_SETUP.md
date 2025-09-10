# Email Configuration Guide

## Overview
The KindNest backend supports two modes for OTP delivery:

1. **Console Mode** - OTPs are logged to console (development/demo)
2. **Email Mode** - OTPs are sent via email (production)

## Configuration Options

### Environment Variables

- `EMAIL_CONSOLE_MODE=true` - Force console output mode
- `EMAIL_SERVICE=gmail` - Email service provider
- `EMAIL_USER=your-email@gmail.com` - Gmail address
- `EMAIL_PASS=your-app-password` - Gmail App Password

### Console Mode (Development/Demo)

Set `EMAIL_CONSOLE_MODE=true` in your `.env` file to log OTPs to console instead of sending emails. This is useful for:

- Development and testing
- Demo environments
- When email delivery is unavailable

### Email Mode (Production)

To enable actual email sending:

1. **Create Gmail App Password**:
   - Go to Google Account settings
   - Enable 2-Factor Authentication
   - Generate App Password for "Mail"
   - Use this password (not your regular password)

2. **Configure Environment**:
   ```env
   EMAIL_CONSOLE_MODE=false
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-16-character-app-password
   ```

3. **Network Requirements**:
   - Ensure outbound SMTP access (port 587/465)
   - Firewall allows connection to smtp.gmail.com

### Fallback Behavior

If email sending fails, the system automatically falls back to console logging to ensure authentication can still proceed.

## Testing

Test email functionality:
```bash
node test-email.js
```

## Troubleshooting

**Network Issues**: If you see `ENOTFOUND smtp.gmail.com`, check:
- Network connectivity
- Firewall settings
- Corporate proxy configuration

**Authentication Issues**: Ensure you're using Gmail App Password, not regular password.

**Rate Limiting**: Gmail may rate limit if sending too many emails quickly.