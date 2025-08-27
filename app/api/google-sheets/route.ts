import { type NextRequest, NextResponse } from "next/server"

interface IWhitelistData {
  aiExperience: string;
  copyTradingInterest: string;
  cryptoExperience: string;
  email: string;
  mlTrust: string;
  name: string;
  referredBy?: string;
  retweetLink?: string;
  twitterUsername?: string;
}

interface BackendResponse {
  message: string;
  data: {
    email: string;
    inviteCode: string[];
    position?: number;
  };
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.json()

    // Check if Backend API URL is configured
    // if (!process.env.BACKEND_API_URL) {
    //   console.error("BACKEND_API_URL environment variable is not set")
      
    //   return NextResponse.json({
    //     success: false,
    //     message: "Backend API URL not configured",
    //   }, { status: 500 })
    // }

    // console.log("Backend API URL found:", process.env.BACKEND_API_URL)
    // console.log("Submitting to backend whitelist:", formData)

    // Validate required email field
    if (!formData.email) {
      return NextResponse.json({
        success: false,
        message: "Email is required",
      }, { status: 400 })
    }

    // Prepare whitelist data according to backend interface
    const whitelistData: IWhitelistData = {
      aiExperience: formData.aiExperience || '',
      copyTradingInterest: formData.copyTradingInterest || '',
      cryptoExperience: formData.cryptoExperience || '',
      email: formData.email,
      mlTrust: formData.mlTrust || '',
      name: formData.name || '',
      referredBy: formData.referredBy,
      retweetLink: formData.retweetLink,
      twitterUsername: formData.twitterUsername,
    }

    // Send data to backend whitelist API
    const response = await fetch(`${process.env.BACKEND_API_URL || 'https://inscribable-ai.up.railway.app'}/api/whitelist/add`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ whitelistData }),
    })

    console.log("Backend response status:", response.status)

    const responseText = await response.text()
    console.log("Backend raw response:", responseText)

    let result: BackendResponse
    try {
      result = JSON.parse(responseText)
    } catch (parseError) {
      console.error("Failed to parse backend response:", parseError)
      console.error("Raw response was:", responseText)

      return NextResponse.json({
        success: false,
        message: "Invalid response from backend",
      }, { status: 500 })
    }

    if (response.status === 200) {
      // Success - email added to whitelist
      return NextResponse.json({
        success: true,
        message: result.message,
        referralCode: result.data.inviteCode?.[0] || null,
        waitlistPosition: result.data.position || 1,
        email: result.data.email,
        inviteCodes: result.data.inviteCode,
      })
    } else if (response.status === 409) {
      // Email already whitelisted
      return NextResponse.json({
        success: true,
        message: result.message,
        referralCode: result.data.inviteCode?.[0] || null,
        waitlistPosition: result.data.position || 1,
        email: result.data.email,
        inviteCodes: result.data.inviteCode,
        alreadyWhitelisted: true,
      })
    } else if (response.status === 400) {
      // Bad request (validation error)
      return NextResponse.json({
        success: false,
        message: result.message,
      }, { status: 400 })
    } else {
      // Other error
      return NextResponse.json({
        success: false,
        message: result.message || "Failed to add email to whitelist",
      }, { status: response.status })
    }

  } catch (error) {
    console.error("Backend whitelist submission error:", error)
    console.error("Backend API URL:", process.env.BACKEND_API_URL)

    return NextResponse.json({
      success: false,
      message: "Failed to connect to backend service",
      error: error instanceof Error ? error.message : "Unknown error",
      debug: {
        backendUrl: process.env.BACKEND_API_URL,
        errorType: error instanceof Error ? error.constructor.name : typeof error
      }
    }, { status: 500 })
  }
}


