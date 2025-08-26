/**
 * GOOGLE APPS SCRIPT CODE
 *
 * Instructions:
 * 1. Go to https://script.google.com/
 * 2. Create a new project
 * 3. Replace the default code with this code
 * 4. Replace YOUR_GOOGLE_SHEET_ID_HERE with your actual Google Sheet ID
 * 5. Save the project
 * 6. Deploy as web app:
 *    - Click "Deploy" → "New deployment"
 *    - Choose "Web app" as type
 *    - Set execute as "Me"
 *    - Set access to "Anyone"
 *    - Copy the web app URL
 * 7. Add the URL to Vercel as GOOGLE_APP_SCRIPT environment variable
 */

// Declare SpreadsheetApp and ContentService
const ContentService = ContentService
const SpreadsheetApp = SpreadsheetApp

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents)

    console.log("Received data:", data)

    // Open the Google Sheet (replace with your actual sheet ID)
    const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"
    const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet()

    // Generate a unique referral code
    function generateReferralCode() {
      const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
      let result = ""
      for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return result
    }

    // Get current waitlist position (number of rows)
    const waitlistPosition = sheet.getLastRow()

    // Generate referral code
    const referralCode = generateReferralCode()

    // Add data to sheet
    sheet.appendRow([
      new Date(), // Timestamp
      data.name,
      data.email,
      data.aiExperience,
      data.cryptoExperience,
      data.copyTradingInterest,
      data.mlTrust,
      data.twitterUsername,
      data.retweetLink,
      data.referredBy || "",
      referralCode,
      waitlistPosition,
    ])

    console.log("Data added to sheet successfully")

    // Return success response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: true,
        referralCode: referralCode,
        waitlistPosition: waitlistPosition,
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  } catch (error) {
    console.error("Error in doPost:", error)

    // Return error response
    return ContentService.createTextOutput(
      JSON.stringify({
        success: false,
        error: error.toString(),
      }),
    ).setMimeType(ContentService.MimeType.JSON)
  }
}

// Optional: Function to set up the sheet headers (run this once)
function setupSheet() {
  const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"
  const sheet = SpreadsheetApp.openById(SHEET_ID).getActiveSheet()

  // Set headers
  sheet
    .getRange(1, 1, 1, 12)
    .setValues([
      [
        "Timestamp",
        "Name",
        "Email",
        "AI Experience",
        "Crypto Experience",
        "Copy Trading Interest",
        "ML Trust",
        "Twitter Username",
        "Retweet Link",
        "Referred By",
        "Referral Code",
        "Waitlist Position",
      ],
    ])

  console.log("Sheet headers set up successfully")
}
