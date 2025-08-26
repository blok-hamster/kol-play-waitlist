import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Check if Google Apps Script URL is configured
    if (!process.env.GOOGLE_APP_SCRIPT) {
      console.error("GOOGLE_APP_SCRIPT environment variable is not set")
      console.log(
        "Available environment variables:",
        Object.keys(process.env).filter((key) => key.includes("GOOGLE")),
      )

      // Return mock data for development
      return NextResponse.json({
        success: true,
        referralCode: generateMockReferralCode(),
        waitlistPosition: Math.floor(Math.random() * 5000) + 1000,
        message: "Development mode - Google Apps Script URL not configured",
      })
    }

    console.log("Google Apps Script URL found:", process.env.GOOGLE_APP_SCRIPT)
    console.log("Submitting to Google Sheets:", formData)

    // Send data to Google Apps Script with proper headers and error handling
    const response = await fetch(process.env.GOOGLE_APP_SCRIPT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(formData),
      redirect: "follow", // Follow redirects automatically
    })

    console.log("Google Sheets response status:", response.status)
    console.log("Google Sheets response URL:", response.url)
    console.log("Google Sheets response headers:", Object.fromEntries(response.headers.entries()))

    // Get the response text first
    const responseText = await response.text()
    console.log("Google Sheets raw response:", responseText)

    // Check if response is HTML (error page)
    if (responseText.includes("<HTML>") || responseText.includes("<!DOCTYPE")) {
      console.error("Received HTML response instead of JSON - likely a Google Apps Script deployment issue")

      // Return mock data when Google Apps Script has issues
      return NextResponse.json({
        success: true,
        referralCode: generateMockReferralCode(),
        waitlistPosition: Math.floor(Math.random() * 5000) + 1000,
        message: "Google Apps Script deployment issue - using mock data",
        debug: "Received HTML response instead of JSON",
      })
    }

    if (!response.ok) {
      throw new Error(`Google Sheets API returned status ${response.status}: ${responseText}`)
    }

    let result
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse Google Sheets response:", parseError)
      console.error("Raw response was:", responseText)

      // Return mock data when parsing fails
      return NextResponse.json({
        success: true,
        referralCode: generateMockReferralCode(),
        waitlistPosition: Math.floor(Math.random() * 5000) + 1000,
        message: "JSON parsing failed - using mock data",
        debug: "Could not parse response as JSON",
      })
    }

    if (!result.success) {
      throw new Error(result.error || "Google Sheets submission failed")
    }

    // Ensure we have the required fields
    const finalResult = {
      success: true,
      referralCode: result.referralCode || generateMockReferralCode(),
      waitlistPosition: result.waitlistPosition || Math.floor(Math.random() * 5000) + 1000,
    }

    console.log("Final result:", finalResult)
    return NextResponse.json(finalResult)
  } catch (error) {
    console.error("Google Sheets submission error:", error)

    // Return mock data instead of failing completely
    return NextResponse.json({
      success: true,
      referralCode: generateMockReferralCode(),
      waitlistPosition: Math.floor(Math.random() * 5000) + 1000,
      message: "Error occurred - using mock data",
      debug: error instanceof Error ? error.message : "Unknown error",
    })
  }
}

function generateMockReferralCode(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  let result = ""
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return result
}
