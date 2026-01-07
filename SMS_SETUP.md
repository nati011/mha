# SMS Campaign Setup Guide

## Overview

The SMS Campaign feature allows you to send SMS messages to event attendees for:
- **Event Campaigns**: Send reminders and updates about specific events
- **Announcement/Holiday Campaigns**: Send general announcements and holiday greetings

## SMS Provider Setup

### Option 1: Twilio (Recommended for Production)

1. **Sign up for Twilio**: Create an account at [twilio.com](https://www.twilio.com)

2. **Get your credentials**:
   - Account SID
   - Auth Token
   - Phone Number (Twilio phone number to send from)

3. **Install Twilio SDK** (optional - only needed if using Twilio):
   ```bash
   npm install twilio
   ```

4. **Set environment variables** in your `.env` file:
   ```env
   SMS_PROVIDER=twilio
   TWILIO_ACCOUNT_SID=your_account_sid
   TWILIO_AUTH_TOKEN=your_auth_token
   TWILIO_PHONE_NUMBER=+1234567890
   ```

### Option 2: Mock Provider (Development/Testing)

For development and testing, you can use the mock provider which logs SMS messages to the console:

```env
SMS_PROVIDER=mock
```

No additional setup required. SMS messages will be logged to the console instead of being sent.

## Using Campaigns

### Creating Event Campaigns

1. **From Event Creation**:
   - When creating a new event, check "Create SMS Campaign for this Event"
   - Enter your SMS message
   - After creating the event, you'll be redirected to the campaign page to select recipients

2. **From Campaigns Page**:
   - Go to Campaigns → New Campaign
   - Select "Event" type
   - Choose an event from the dropdown
   - Enter campaign name and message
   - Optionally schedule for later

### Creating Announcement/Holiday Campaigns

1. Go to Campaigns → New Announcement
2. Enter campaign name and message
3. Select recipients manually (you'll need to add phone numbers)
4. Optionally schedule for later

### Managing Recipients

- **Event Campaigns**: Automatically includes all attendees with phone numbers, or you can select specific attendees
- **Announcement Campaigns**: Manually add recipients by selecting attendees from events

### Sending Campaigns

1. **Immediate Send**: Click "Send Now" on the campaign detail page
2. **Scheduled Send**: Set a date/time when creating/editing the campaign
3. **Draft**: Save as draft and send later

## Campaign Status

- **Draft**: Created but not sent
- **Scheduled**: Scheduled for future sending
- **Sent**: Successfully sent to recipients

## Features

- ✅ Send to all or selected attendees
- ✅ Schedule campaigns for later
- ✅ Track delivery status (sent/failed)
- ✅ Edit campaigns before sending
- ✅ View recipient statistics
- ✅ Support for both event-specific and general announcements

## Notes

- SMS messages are limited to 1600 characters (typically 10 SMS messages)
- Phone numbers must be valid and include country code
- Failed messages are tracked with error details
- Sent campaigns cannot be edited or deleted

## Troubleshooting

### SMS Not Sending

1. Check your SMS provider credentials in `.env`
2. Verify phone numbers are in correct format (include country code)
3. Check Twilio account balance (if using Twilio)
4. Review error messages in campaign recipient details

### Mock Provider Not Working

- Mock provider logs to console, check server logs
- No actual SMS will be sent in mock mode

