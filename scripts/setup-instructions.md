# Google Apps Script & Resend Setup Instructions

## Google Apps Script Setup

1. **Go to Google Apps Script**: https://script.google.com/
2. **Create a new project**
3. **Copy the code** from `google-apps-script.js`
4. **Replace `YOUR_GOOGLE_SHEET_ID_HERE`** with your actual Google Sheet ID
   - Get this from your Google Sheet URL: `https://docs.google.com/spreadsheets/d/SHEET_ID_HERE/edit`
5. **Save the project** (Ctrl+S)
6. **Run `setupSheet()` function once** to create headers
7. **Deploy as web app**:
   - Click "Deploy" → "New deployment"
   - Choose "Web app" as type
   - Set execute as "Me"
   - Set access to "Anyone"
   - Click "Deploy"
   - Copy the web app URL
8. **Add to Vercel**:
   - Go to your Vercel project settings
   - Add environment variable: `GOOGLE_APP_SCRIPT` = your web app URL

## Resend Email Setup

1. **Go to Resend**: https://resend.com/
2. **Create an account** and verify your domain
3. **Get your API key** from the dashboard
4. **Add to Vercel**:
   - Environment variable: `RESEND_API_KEY` = your API key

## Testing

After setup, check the browser console and Vercel logs to see if:
- Google Sheets submissions are working
- Emails are being sent successfully
