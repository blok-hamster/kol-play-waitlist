# Google Apps Script Deployment Troubleshooting

## The "Moved Temporarily" Error

This error occurs when:
1. The Google Apps Script deployment URL is incorrect
2. The script permissions aren't set properly
3. The deployment is outdated

## Step-by-Step Fix:

### 1. Update Your Google Apps Script
- Copy the code from `google-apps-script-fixed.js`
- Replace `YOUR_GOOGLE_SHEET_ID_HERE` with your actual sheet ID
- Save the project

### 2. Re-Deploy the Script
- Click "Deploy" → "Manage deployments"
- Click the edit icon (pencil) on your existing deployment
- Change "Version" to "New version"
- Make sure settings are:
  - Execute as: "Me"
  - Who has access: "Anyone"
- Click "Deploy"
- **COPY THE NEW URL** (it will be different)

### 3. Update Vercel Environment Variable
- Go to your Vercel project settings
- Update `GOOGLE_APP_SCRIPT` with the NEW URL from step 2

### 4. Test the Setup
- The script now includes better error handling
- Check the browser console for detailed logs
- The app will use mock data if Google Sheets fails

## Common Issues:

1. **Wrong Sheet ID**: Make sure you're using the ID from the URL, not the sheet name
2. **Permissions**: The script must be deployed with "Anyone" access
3. **Old URL**: Always use the latest deployment URL after re-deploying

## Fallback Behavior:
The app now gracefully handles Google Apps Script issues by:
- Using mock data when the script fails
- Continuing to work even if Google Sheets is down
- Providing detailed error logs for debugging
