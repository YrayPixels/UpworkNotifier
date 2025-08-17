# Upwork Job Notifier

A Chrome extension that monitors Upwork's most recent jobs and sends notifications for quick jobs (under 10 minutes).

## Features

- **Job Monitoring**: Automatically checks for new jobs on Upwork every 5 minutes
- **Quick Job Detection**: Focuses on jobs that can be completed quickly (under 10 minutes)
- **Real-time Notifications**: Desktop notifications for new job opportunities
- **Email Alerts**: Optional email notifications (requires EmailJS setup)
- **AI Proposal Drafting**: **NEW!** Generate personalized proposals using OpenAI GPT-3.5

## AI Proposal Feature

The extension now includes an AI-powered proposal drafting system that:

1. **Analyzes Job Requirements**: Reads job details from the current Upwork page
2. **Uses Your CV**: Incorporates your skills and experience from the attached CV
3. **Generates Personalized Proposals**: Creates compelling, job-specific proposals
4. **Auto-insertion**: Automatically fills the cover letter textarea on Upwork

### Setup for AI Proposals

1. **Get OpenAI API Key**: Visit [OpenAI Platform](https://platform.openai.com/api-keys) to get your API key
2. **Configure Extension**: 
   - Click the extension icon
   - Enable "AI Proposals" toggle
   - Enter your OpenAI API key
   - Save settings
3. **Use the Feature**:
   - Navigate to any Upwork job posting
   - Click the green "AI Proposal" floating button (positioned above the blue "Check Jobs" button)
   - Wait for the AI to generate your proposal
   - Click "Insert into Cover Letter" to automatically fill the textarea

### CV Data

The extension reads your CV from the `cv.txt` file. Make sure this file contains your:
- Skills and expertise
- Work experience
- Relevant projects
- Technical background

## Installation

1. Clone or download this repository
2. Open Chrome and go to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension folder
5. The extension icon should appear in your Chrome toolbar

## Configuration

### Basic Settings
- **Enable/Disable**: Toggle job monitoring on/off
- **Check Interval**: Set how often to check for new jobs (30 seconds to 30 minutes)

### Email Notifications
- **Enable Email Alerts**: Turn on email notifications
- **Email Address**: Your email for job alerts
- **Note**: Requires EmailJS setup (see below)

### AI Proposal Settings
- **Enable AI Proposals**: Turn on AI proposal drafting
- **OpenAI API Key**: Your OpenAI API key for proposal generation

## Email Setup (Optional)

To enable email notifications:

1. Sign up for [EmailJS](https://www.emailjs.com/)
2. Create an email service and template
3. Update the `service_id`, `template_id`, and `user_id` in `background.js`
4. Enable email notifications in the extension settings

## Usage

1. **Install the extension** (see Installation above)
2. **Configure settings** by clicking the extension icon
3. **Navigate to Upwork** - the extension will automatically start monitoring
4. **Use AI Proposals** - click the green floating button on any job page
5. **Receive notifications** for new quick job opportunities

## File Structure

```
UpworkNotifier/
├── manifest.json          # Extension configuration
├── background.js          # Background service worker
├── content.js            # Content script for job monitoring
├── popup.html            # Extension popup interface
├── popup.js              # Popup functionality
├── cv.txt                # Your CV/resume for AI proposals
├── coverletterhtml.txt   # Reference for textarea location
├── icons/                # Extension icons
└── README.md             # This file
```

## How It Works

### Job Monitoring
- The extension periodically checks Upwork's most recent jobs page
- Uses both background script polling and content script monitoring
- Filters jobs to focus on quick opportunities (under 10 minutes)

### AI Proposal Generation
- Analyzes the current job posting for requirements and details
- Reads your CV to understand your skills and experience
- Sends a structured prompt to OpenAI GPT-3.5
- Generates a personalized, professional proposal
- Automatically inserts the proposal into Upwork's cover letter field

### Notifications
- Desktop notifications for new jobs
- Optional email alerts
- Real-time updates when browsing Upwork

## Troubleshooting

### AI Proposals Not Working
- Check that OpenAI API key is entered correctly
- Ensure "AI Proposals" is enabled in settings
- Verify you have sufficient OpenAI API credits
- Check browser console for error messages

### API Key Issues
- **Invalid Format**: API key must start with "sk-" (e.g., sk-proj-...)
- **Test Your Key**: Use the "Test API Key" button in settings to verify connectivity
- **Clear and Re-enter**: Use the "Clear" button to remove the old key and enter a new one
- **Check OpenAI Status**: Visit [OpenAI Status](https://status.openai.com/) for service issues
- **API Credits**: Ensure you have sufficient credits in your OpenAI account
- **Rate Limits**: Check if you've exceeded OpenAI's rate limits

### No Jobs Found
- Verify the extension is enabled
- Check that you're on an Upwork page
- Ensure the check interval isn't too long
- Check browser console for errors

### Extension Not Loading
- Verify all files are present
- Check Chrome extension page for errors
- Try reloading the extension
- Ensure Chrome is up to date

## Privacy & Security

- **CV Data**: Stored locally, never sent to external servers
- **OpenAI API**: Only job details and CV are sent to OpenAI for proposal generation
- **Job Data**: Stored locally in Chrome storage
- **No Tracking**: Extension doesn't collect personal data

### API Key Security 🔒

**Your OpenAI API key is completely secure:**

- **Local Storage Only**: API keys are stored locally in your browser using Chrome's secure storage
- **Never Shared**: Your API key is never sent to any external servers except OpenAI's official API
- **No Logging**: API keys are never logged or displayed in console logs (only masked versions are shown)
- **Automatic Validation**: The extension validates your API key format and tests connectivity before use
- **Easy Management**: Test, clear, and update your API key directly from the extension settings

**Security Features:**
- API key format validation (must start with "sk-")
- Real-time API connectivity testing
- Secure storage using Chrome's built-in encryption
- Automatic disabling of AI features if API key is invalid
- No persistent storage of API keys in external databases

## Contributing

Feel free to submit issues, feature requests, or pull requests to improve the extension.

## License

This project is open source and available under the MIT License.

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Submit an issue on the project repository 