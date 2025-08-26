import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { email, name, waitlistPosition, referralCode } = await request.json()

    // Check if Resend API key is configured
    if (!process.env.RESEND_API_KEY) {
      console.error("RESEND_API_KEY environment variable is not set")
      return NextResponse.json(
        {
          success: false,
          error: "Email service not configured",
        },
        { status: 500 },
      )
    }

    console.log("Sending welcome email to:", email)

    const referralLink = `https://www.kolplay.xyz?ref=${referralCode}`

    // Send email using Resend API with matching design
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: "Kolplay <welcome@kolplay.xyz>",
        to: [email],
        subject: "Welcome to Kolplay Early Access Waitlist! 🚀",
        html: `
         <!DOCTYPE html>
         <html lang="en">
         <head>
           <meta charset="UTF-8">
           <meta name="viewport" content="width=device-width, initial-scale=1.0">
           <title>Welcome to Kolplay</title>
         </head>
         <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
           <div style="background-color: #000000; min-height: 100vh; padding: 20px;">
             <div style="max-width: 600px; margin: 0 auto; background: linear-gradient(135deg, rgba(124, 58, 237, 0.1), rgba(20, 184, 166, 0.1)); border-radius: 24px; padding: 40px; border: 1px solid #1f2937;">
               
               <!-- Header -->
               <div style="text-align: center; margin-bottom: 40px;">
                 <h1 style="color: #ffffff; font-size: 32px; font-weight: bold; margin: 0 0 16px 0; background: linear-gradient(135deg, #a855f7, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;">
                   Hi ${name}! 👋
                 </h1>
               </div>

               <!-- Welcome Message -->
               <div style="background: rgba(31, 41, 55, 0.5); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #374151;">
                 <p style="color: #d1d5db; font-size: 16px; line-height: 1.6; margin: 0;">
                   Thank you for joining our early access waitlist! You're now part of an exclusive group getting first access to AI-powered KOL predictions.
                 </p>
               </div>

               <!-- Position Card -->
               <div style="text-align: center; margin-bottom: 32px;">
                 <div style="background: linear-gradient(135deg, #7c3aed, #14b8a6); border-radius: 16px; padding: 24px; display: inline-block; min-width: 200px;">
                   <div style="color: #ffffff; font-size: 18px; font-weight: 600; margin-bottom: 8px; opacity: 0.9;">
                     Your Position
                   </div>
                   <div style="color: #ffffff; font-size: 36px; font-weight: bold; margin: 0;">
                     #${waitlistPosition.toLocaleString()}
                   </div>
                 </div>
               </div>

               <!-- Queue Status -->
               <div style="background: rgba(31, 41, 55, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #374151;">
                 <div style="display: flex; align-items: center; margin-bottom: 12px;">
                   <span style="color: #fbbf24; font-size: 20px; margin-right: 12px;">⚠️</span>
                   <span style="color: #ffffff; font-size: 18px; font-weight: 600;">You're in the queue!</span>
                 </div>
                 <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin: 0;">
                   We'll review your application and let you know if you made it to our alpha program. Keep an eye on your inbox!
                 </p>
               </div>

               <!-- Boost Position Section -->
               <div style="background: rgba(31, 41, 55, 0.3); border-radius: 16px; padding: 24px; margin-bottom: 32px; border: 1px solid #374151;">
                 <div style="display: flex; align-items: center; margin-bottom: 16px;">
                   <span style="color: #a855f7; font-size: 20px; margin-right: 12px;">🚀</span>
                   <span style="color: #ffffff; font-size: 18px; font-weight: 600;">Boost Your Position</span>
                 </div>
                 <p style="color: #d1d5db; font-size: 14px; line-height: 1.5; margin-bottom: 20px;">
                   Share your referral code and move up in the queue for each friend who joins!
                 </p>

                 <!-- Referral Code -->
                 <div style="margin-bottom: 16px;">
                   <div style="background: #374151; border-radius: 12px; padding: 16px; text-align: center; margin-bottom: 12px;">
                     <div style="color: #a855f7; font-family: 'Courier New', monospace; font-size: 24px; font-weight: bold; letter-spacing: 2px;">
                       ${referralCode}
                     </div>
                   </div>
                 </div>

                 <!-- Referral Link -->
                 <div style="margin-bottom: 16px;">
                   <p style="color: #ffffff; font-size: 14px; font-weight: 600; margin-bottom: 8px;">Share this link:</p>
                   <div style="background: #374151; border-radius: 12px; padding: 16px; word-break: break-all;">
                     <a href="${referralLink}" style="color: #14b8a6; text-decoration: none; font-size: 14px;">
                       ${referralLink}
                     </a>
                   </div>
                 </div>

                 <!-- CTA Button -->
                 <div style="text-align: center; margin-top: 24px;">
                   <a href="${referralLink}" style="display: inline-block; background: linear-gradient(135deg, #7c3aed, #14b8a6); color: #ffffff; text-decoration: none; padding: 12px 32px; border-radius: 12px; font-weight: 600; font-size: 16px;">
                     Share Your Link
                   </a>
                 </div>
               </div>

               <!-- Footer -->
               <div style="text-align: center; padding-top: 32px; border-top: 1px solid #374151;">
                 <p style="color: #9ca3af; font-size: 14px; margin: 0;">
                   Best regards,<br>
                   <span style="color: #ffffff; font-weight: 600;">The Kolplay Team</span>
                 </p>
                 <div style="margin-top: 16px;">
                   <span style="background: linear-gradient(135deg, #a855f7, #14b8a6); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text; font-weight: bold; font-size: 18px;">
                     Play with the 1%
                   </span>
                 </div>
               </div>

             </div>
           </div>
         </body>
         </html>
       `,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Resend API error:", errorText)
      throw new Error(`Resend API returned status ${response.status}: ${errorText}`)
    }

    const result = await response.json()
    console.log("Email sent successfully:", result)

    return NextResponse.json({ success: true, emailId: result.id })
  } catch (error) {
    console.error("Email sending error:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
    return NextResponse.json(
      {
        success: false,
        error: `Failed to send email: ${errorMessage}`,
      },
      { status: 500 },
    )
  }
}
