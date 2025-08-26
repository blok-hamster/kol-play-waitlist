"use client"

import { useState, useEffect, memo } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Braces,
  Twitter,
  CheckCircle,
  AlertTriangle,
  Rocket,
  Copy,
  Check,
} from "lucide-react"
import Image from "next/image"

interface FormData {
  name: string
  email: string
  aiExperience: string
  cryptoExperience: string
  copyTradingInterest: string
  mlTrust: string
  twitterUsername: string
  retweetLink: string
  referredBy?: string
}

interface SubmissionResponse {
  success: boolean
  referralCode: string
  waitlistPosition: number
  error?: string
}

// MOVED OUTSIDE - This prevents component recreation on every render
const SimpleTextInput = memo(
  ({
    placeholder,
    value,
    onChange,
    type = "text",
    multiline = false,
  }: {
    placeholder: string
    value: string
    onChange: (value: string) => void
    type?: string
    multiline?: boolean
  }) => {
    if (multiline) {
      return (
        <textarea
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 rounded-lg p-3 min-h-[100px] resize-y focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm"
          rows={3}
        />
      )
    }

    return (
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-white/5 backdrop-blur-md border border-white/20 text-white placeholder-gray-400 rounded-lg h-10 px-3 focus:outline-none focus:ring-1 focus:ring-purple-500/50 focus:border-purple-500/50 transition-all duration-300 text-sm"
      />
    )
  },
)

SimpleTextInput.displayName = "SimpleTextInput"

export default function KolplayWaitlist() {
  const [currentStep, setCurrentStep] = useState(0)
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    aiExperience: "",
    cryptoExperience: "",
    copyTradingInterest: "",
    mlTrust: "",
    twitterUsername: "",
    retweetLink: "",
    referredBy: "",
  })
  const [referralCode, setReferralCode] = useState("KT11VP")
  const [waitlistPosition, setWaitlistPosition] = useState(2498)
  const [copiedCode, setCopiedCode] = useState(false)
  const [copiedLink, setCopiedLink] = useState(false)
  const [followButtonClicked, setFollowButtonClicked] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Get referral code from URL on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search)
      const refCode = urlParams.get("ref")
      if (refCode) {
        setFormData((prev) => ({ ...prev, referredBy: refCode }))
      }
    }
  }, [])

  // Simplified update functions
  const updateName = (value: string) => setFormData((prev) => ({ ...prev, name: value }))
  const updateEmail = (value: string) => setFormData((prev) => ({ ...prev, email: value }))
  const updateTwitterUsername = (value: string) => setFormData((prev) => ({ ...prev, twitterUsername: value }))
  const updateRetweetLink = (value: string) => setFormData((prev) => ({ ...prev, retweetLink: value }))

  const nextStep = () => {
    if (currentStep < 7) {
      setCurrentStep(currentStep + 1)
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleSubmit = async () => {
    setIsSubmitting(true)
    setErrors({})

    try {
      console.log("Submitting form data:", formData)

      const response = await fetch("/api/google-sheets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      console.log("API response status:", response.status)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result: SubmissionResponse = await response.json()
      console.log("API response data:", result)

      if (result.success) {
        setReferralCode(result.referralCode)
        setWaitlistPosition(result.waitlistPosition)

        // Try to send welcome email
        try {
          const emailResponse = await fetch("/api/send-welcome-email", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              email: formData.email,
              name: formData.name,
              waitlistPosition: result.waitlistPosition,
              referralCode: result.referralCode,
            }),
          })

          if (emailResponse.ok) {
            console.log("Welcome email sent successfully")
          } else {
            console.warn("Failed to send welcome email:", await emailResponse.text())
          }
        } catch (emailError) {
          console.warn("Failed to send welcome email:", emailError)
        }

        nextStep()
      } else {
        throw new Error(result.error || "Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      const errorMessage = error instanceof Error ? error.message : "Unknown error occurred"
      setErrors({ submit: `Failed to submit: ${errorMessage}. Please try again.` })
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyToClipboard = (text: string, type: "code" | "link") => {
    navigator.clipboard.writeText(text).then(() => {
      if (type === "code") {
        setCopiedCode(true)
        setTimeout(() => setCopiedCode(false), 2000)
      } else {
        setCopiedLink(true)
        setTimeout(() => setCopiedLink(false), 2000)
      }
    })
  }

  const steps = [
    // Step 0: Initial Landing
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: "Join the Waitlist",
      subtitle: "Be among the first to experience the future",
      content: (
        <div className="space-y-4">
          <SimpleTextInput placeholder="Enter your full name" value={formData.name} onChange={updateName} />
          <Button
            onClick={nextStep}
            disabled={!formData.name.trim()}
            className="w-full bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 text-sm font-medium disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl"
          >
            Continue <ArrowRight className="ml-2 w-4 h-4" />
          </Button>
        </div>
      ),
    },
    // Step 1: Email
    {
      icon: <Mail className="w-6 h-6 text-white" />,
      title: "What's your email?",
      subtitle: `Hi ${formData.name}! We'll notify you when you get early access`,
      content: (
        <div className="space-y-4">
          <SimpleTextInput
            placeholder="Enter your email address"
            value={formData.email}
            onChange={updateEmail}
            type="email"
          />
          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!formData.email.trim() || !formData.email.includes("@")}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 2: AI/ML Familiarity
    {
      icon: <Braces className="w-6 h-6 text-white" />,
      title: "Quick Questions",
      subtitle: "Help us understand your background (1 of 4)",
      content: (
        <div className="space-y-4">
          <div className="text-white text-base font-medium mb-3">
            How familiar are you with AI and machine learning?
          </div>
          <RadioGroup
            value={formData.aiExperience}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, aiExperience: value }))}
            className="space-y-2"
          >
            {[
              "Complete beginner - I've heard of it but don't understand it",
              "Some knowledge - I understand basic concepts",
              "Intermediate - I've used AI tools and understand how they work",
              "Advanced - I have technical knowledge or work with AI",
            ].map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  formData.aiExperience === option
                    ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-white/20 hover:border-white/30 hover:bg-white/5"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, aiExperience: option }))}
              >
                <RadioGroupItem value={option} id={`ai-${index}`} className="text-purple-500 mt-0.5" />
                <Label
                  htmlFor={`ai-${index}`}
                  className="text-gray-300 cursor-pointer flex-1 select-none leading-relaxed text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!formData.aiExperience}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 3: Crypto Trading Experience
    {
      icon: <Braces className="w-6 h-6 text-white" />,
      title: "Quick Questions",
      subtitle: "Help us understand your background (2 of 4)",
      content: (
        <div className="space-y-4">
          <div className="text-white text-base font-medium mb-3">
            What's your experience with cryptocurrency trading?
          </div>
          <RadioGroup
            value={formData.cryptoExperience}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, cryptoExperience: value }))}
            className="space-y-2"
          >
            {[
              "Never traded crypto before - complete beginner",
              "Beginner - I've made a few trades but still learning",
              "Intermediate - I trade regularly and understand the markets",
              "Expert - I'm an experienced trader with advanced strategies",
            ].map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  formData.cryptoExperience === option
                    ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-white/20 hover:border-white/30 hover:bg-white/5"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, cryptoExperience: option }))}
              >
                <RadioGroupItem value={option} id={`crypto-${index}`} className="text-purple-500 mt-0.5" />
                <Label
                  htmlFor={`crypto-${index}`}
                  className="text-gray-300 cursor-pointer flex-1 select-none leading-relaxed text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!formData.cryptoExperience}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 4: Copy Trading Interest
    {
      icon: <Braces className="w-6 h-6 text-white" />,
      title: "Quick Questions",
      subtitle: "Help us understand your background (3 of 4)",
      content: (
        <div className="space-y-4">
          <div className="text-white text-base font-medium mb-3">What's your experience with copy trading?</div>
          <RadioGroup
            value={formData.copyTradingInterest}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, copyTradingInterest: value }))}
            className="space-y-2"
          >
            {[
              "Never tried copy trading before",
              "I've tried it a few times with small amounts",
              "I regularly use copy trading platforms",
              "I'm an experienced copy trader with multiple strategies",
            ].map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  formData.copyTradingInterest === option
                    ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-white/20 hover:border-white/30 hover:bg-white/5"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, copyTradingInterest: option }))}
              >
                <RadioGroupItem value={option} id={`copy-${index}`} className="text-purple-500 mt-0.5" />
                <Label
                  htmlFor={`copy-${index}`}
                  className="text-gray-300 cursor-pointer flex-1 select-none leading-relaxed text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!formData.copyTradingInterest}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Next <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 5: ML Trust
    {
      icon: <Braces className="w-6 h-6 text-white" />,
      title: "Quick Questions",
      subtitle: "Help us understand your background (4 of 4)",
      content: (
        <div className="space-y-4">
          <div className="text-white text-base font-medium mb-3">
            How much would you trust ML predictions for trading decisions?
          </div>
          <RadioGroup
            value={formData.mlTrust}
            onValueChange={(value) => setFormData((prev) => ({ ...prev, mlTrust: value }))}
            className="space-y-2"
          >
            {[
              "Completely - I'd follow all recommendations",
              "Mostly - I'd use them as primary guidance",
              "Partially - I'd use them as one factor among many",
              "Skeptical - I'd rarely follow ML predictions",
            ].map((option, index) => (
              <div
                key={index}
                className={`flex items-start space-x-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer backdrop-blur-md ${
                  formData.mlTrust === option
                    ? "border-purple-500/50 bg-purple-500/10 shadow-lg shadow-purple-500/20"
                    : "border-white/20 hover:border-white/30 hover:bg-white/5"
                }`}
                onClick={() => setFormData((prev) => ({ ...prev, mlTrust: option }))}
              >
                <RadioGroupItem value={option} id={`ml-${index}`} className="text-purple-500 mt-0.5" />
                <Label
                  htmlFor={`ml-${index}`}
                  className="text-gray-300 cursor-pointer flex-1 select-none leading-relaxed text-sm"
                >
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={nextStep}
              disabled={!formData.mlTrust}
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              Continue <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 6: Social Media
    {
      icon: <Twitter className="w-6 h-6 text-white" />,
      title: "Follow us on X",
      subtitle: "Help us spread the word and stay updated",
      content: (
        <div className="space-y-4">
          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 space-y-3 border border-white/10">
            <div className="text-white font-medium mb-2 text-sm">Steps to complete:</div>
            <div className="space-y-1 text-gray-300 text-sm">
              <div>1. Follow us on X (Twitter)</div>
              <div>2. Retweet our pinned post</div>
              <div>3. Share the link to your retweet below</div>
            </div>
          </div>

          <Button
            onClick={() => {
              setFollowButtonClicked(true)
              window.open("https://twitter.com/kolplayai", "_blank")
            }}
            className="w-full h-10 rounded-lg bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
          >
            <Twitter className="mr-2 w-4 h-4" />
            Follow @kolplayai
          </Button>

          {errors.follow && <p className="text-red-400 text-xs">{errors.follow}</p>}

          <div className="space-y-3">
            <SimpleTextInput
              placeholder="Your X (Twitter) username"
              value={formData.twitterUsername}
              onChange={updateTwitterUsername}
            />
            <SimpleTextInput
              placeholder="https://x.com/... (Link to your retweet)"
              value={formData.retweetLink}
              onChange={updateRetweetLink}
              multiline={true}
            />
          </div>

          {errors.submit && <p className="text-red-400 text-xs">{errors.submit}</p>}

          <div className="flex gap-3">
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-lg h-10 bg-white/5 backdrop-blur-md transition-all duration-300 text-sm"
            >
              <ArrowLeft className="mr-2 w-4 h-4" /> Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={
                isSubmitting || !followButtonClicked || !formData.twitterUsername.trim() || !formData.retweetLink.trim()
              }
              className="flex-1 bg-gradient-to-r from-purple-600 to-teal-500 hover:from-purple-700 hover:to-teal-600 text-white rounded-lg h-10 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl text-sm"
            >
              {isSubmitting ? "Submitting..." : "Complete"} <ArrowRight className="ml-2 w-4 h-4" />
            </Button>
          </div>
        </div>
      ),
    },
    // Step 7: Thank You
    {
      icon: <CheckCircle className="w-6 h-6 text-teal-400" />,
      title: "Thank you for signing up!",
      subtitle: `Hi ${formData.name}! You're now on our early access waitlist.`,
      content: (
        <div className="space-y-4">
          <div className="text-center">
            <div className="text-2xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent mb-2">
              Position #{waitlistPosition.toLocaleString()}
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 space-y-3 border border-white/10">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-yellow-400" />
              <div className="text-white font-medium text-sm">You're in the queue!</div>
            </div>
            <div className="text-gray-300 text-xs">
              We'll review your application and let you know if you made it to our alpha program. Keep an eye on your
              inbox!
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md rounded-lg p-4 space-y-3 border border-white/10">
            <div className="flex items-center gap-2">
              <Rocket className="w-4 h-4 text-purple-400" />
              <div className="text-white font-medium text-sm">Boost your chances!</div>
            </div>
            <div className="text-gray-300 text-xs mb-3">
              Share your referral link and move up in the queue for each friend who joins
            </div>

            <div className="space-y-2">
              <div>
                <div className="text-white text-xs font-medium mb-1">Your referral code:</div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-purple-300 font-mono text-sm text-center border border-white/20">
                    {referralCode}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(referralCode, "code")}
                    variant="outline"
                    size="icon"
                    className="border-white/20 hover:bg-white/10 backdrop-blur-md transition-all duration-300 h-8 w-8"
                  >
                    {copiedCode ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>

              <div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-white/10 backdrop-blur-md rounded-lg px-3 py-2 text-gray-300 text-xs border border-white/20">
                    https://www.kolplay.xyz?ref={referralCode}
                  </div>
                  <Button
                    onClick={() => copyToClipboard(`https://www.kolplay.xyz?ref=${referralCode}`, "link")}
                    variant="outline"
                    size="icon"
                    className="border-white/20 hover:bg-white/10 backdrop-blur-md transition-all duration-300 h-8 w-8"
                  >
                    {copiedLink ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ]

  const currentStepData = steps[currentStep]

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Enhanced Starry background with more depth */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 via-black to-teal-900/30">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.6) 1px, transparent 1px),
                         radial-gradient(circle at 75% 75%, rgba(255,255,255,0.4) 1px, transparent 1px),
                         radial-gradient(circle at 50% 10%, rgba(255,255,255,0.5) 1px, transparent 1px),
                         radial-gradient(circle at 10% 80%, rgba(255,255,255,0.4) 1px, transparent 1px),
                         radial-gradient(circle at 90% 20%, rgba(124, 58, 237, 0.3) 1px, transparent 1px),
                         radial-gradient(circle at 20% 90%, rgba(20, 184, 166, 0.3) 1px, transparent 1px)`,
            backgroundSize: "100px 100px, 150px 150px, 200px 200px, 120px 120px, 180px 180px, 160px 160px",
          }}
        />
      </div>

      {/* Floating orbs for extra ambiance */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Header with adjusted positioning - moved up 5%, slightly right but not too far */}
      <header
        className="relative z-10 flex items-center justify-start px-2 pt-2"
        style={{ marginTop: "-5vh", marginLeft: "2vw" }}
      >
        <div className="flex items-center">
          <Image
            src="/images/kolplay-logo-white.png"
            alt="Kolplay"
            width={180}
            height={180}
            className="rounded-lg w-36 h-36 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
            priority
          />
        </div>
      </header>

      {/* Main Content with better spacing */}
      <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)] px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          {currentStep === 0 ? (
            // Hero Section with improved layout
            <div className="text-center space-y-6">
              <div className="space-y-4">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-teal-400 bg-clip-text text-transparent leading-tight">
                  Play with the 1%
                </h1>
                <h2 className="text-lg sm:text-xl text-gray-300 font-medium">AI-powered KOL predictions</h2>
                <p className="text-gray-400 max-w-md mx-auto text-sm leading-relaxed">
                  Get early access to our Machine learning AI
                  <br />
                  prediction models for copy trading
                </p>
              </div>

              {/* Liquid Glass Card */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-500/10">
                <CardContent className="p-6 space-y-4">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                      {currentStepData.icon}
                    </div>
                    <div className="text-center space-y-1">
                      <h3 className="text-xl font-bold text-white">{currentStepData.title}</h3>
                      <p className="text-gray-400 text-sm">{currentStepData.subtitle}</p>
                    </div>
                  </div>
                  {currentStepData.content}
                </CardContent>
              </Card>
            </div>
          ) : (
            // Form Steps with liquid glass effect
            <Card className="bg-white/5 backdrop-blur-xl border border-white/20 shadow-2xl shadow-purple-500/10">
              <CardContent className="p-6 space-y-4">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/25">
                    {currentStepData.icon}
                  </div>
                  <div className="text-center space-y-1">
                    <h3 className="text-xl font-bold text-white">{currentStepData.title}</h3>
                    <p className="text-gray-400 text-sm">{currentStepData.subtitle}</p>
                  </div>
                </div>
                {currentStepData.content}
              </CardContent>
            </Card>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex items-center justify-center py-4">
        <div className="flex items-center gap-2 text-gray-400 text-xs">
          <span>© Kolplay 2025</span>
          <a
            href="https://twitter.com/kolplayai"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-400 hover:text-white transition-colors duration-300"
          >
            <Twitter className="w-3 h-3" />
          </a>
        </div>
      </footer>
    </div>
  )
}
