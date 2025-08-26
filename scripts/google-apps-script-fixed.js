/**
 * UPDATED GOOGLE APPS SCRIPT CODE - FIXES REDIRECT ISSUES
 *
 * Instructions:
 * 1. Go to https://script.google.com/
 * 2. Create a new project or open your existing one
 * 3. Replace ALL code with this updated version
 * 4. Replace YOUR_GOOGLE_SHEET_ID_HERE with your actual Google Sheet ID
 * 5. Save the project (Ctrl+S)
 * 6. IMPORTANT: Re-deploy as web app:
 *    - Click "Deploy" → "Manage deployments"
 *    - Click the edit icon (pencil) on your existing deployment
 *    - Change "Version" to "New version"
 *    - Make sure "Execute as" is set to "Me"
 *    - Make sure "Who has access" is set to "Anyone"
 *    - Click "Deploy"
 *    - Copy the NEW web app URL and update it in Vercel
 */

// Declare GoogleAppsScript to fix the undeclared variable error
const GoogleAppsScript = {}
const SpreadsheetApp = GoogleAppsScript.Spreadsheet
const ContentService = GoogleAppsScript.Content

function doPost(e) {
  try {
    console.log("doPost called with:", e)

    // Check if we have post data
    if (!e.postData || !e.postData.contents) {
      throw new Error("No post data received")
    }

    // Parse the incoming data
    const data = JSON.parse(e.postData.contents)
    console.log("Parsed data:", data)

    // Open the Google Sheet (replace with your actual sheet ID)
    const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"

    if (SHEET_ID === "YOUR_GOOGLE_SHEET_ID_HERE") {
      throw new Error("Please replace YOUR_GOOGLE_SHEET_ID_HERE with your actual Google Sheet ID")
    }

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
      data.name || "",
      data.email || "",
      data.aiExperience || "",
      data.cryptoExperience || "",
      data.copyTradingInterest || "",
      data.mlTrust || "",
      data.twitterUsername || "",
      data.retweetLink || "",
      data.referredBy || "",
      referralCode,
      waitlistPosition,
    ])

    console.log("Data added to sheet successfully")

    // Create the response object
    const responseData = {
      success: true,
      referralCode: referralCode,
      waitlistPosition: waitlistPosition,
    }

    console.log("Returning response:", responseData)

    // Return success response with proper CORS headers
    return ContentService.createTextOutput(JSON.stringify(responseData))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST",
        "Access-Control-Allow-Headers": "Content-Type",
      })
  } catch (error) {
    console.error("Error in doPost:", error)

    // Return error response
    const errorResponse = {
      success: false,
      error: error.toString(),
    }

    return ContentService.createTextOutput(JSON.stringify(errorResponse))
      .setMimeType(ContentService.MimeType.JSON)
      .setHeaders({
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
      })
  }
}

// Handle preflight requests
function doOptions(e) {
  return ContentService.createTextOutput("").setHeaders({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  })
}

// Optional: Function to set up the sheet headers (run this once)
function setupSheet() {
  const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"

  if (SHEET_ID === "YOUR_GOOGLE_SHEET_ID_HERE") {
    console.error("Please replace YOUR_GOOGLE_SHEET_ID_HERE with your actual Google Sheet ID")
    return
  }

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

// Test function to verify the script works
function testScript() {
  const testData = {
    name: "Test User",
    email: "test@example.com",
    aiExperience: "Beginner",
    cryptoExperience: "Intermediate",
    copyTradingInterest: "Never tried",
    mlTrust: "Partially",
    twitterUsername: "testuser",
    retweetLink: "https://x.com/test",
    referredBy: "",
  }

  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData),
    },
  }

  const result = doPost(mockEvent)
  console.log("Test result:", result.getContent())
}
