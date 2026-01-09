"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, Loader2, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function TestLoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState<"start" | "signing-up" | "signing-in" | "success" | "error">("start")
  const [message, setMessage] = useState("")

  const testEmail = "test@example.com"
  const testPassword = "test123456"

  const runTest = async () => {
    setLoading(true)
    setStep("signing-up")
    setMessage("Creating test account...")

    try {
      const supabase = createClient()

      // Step 1: Sign up
      const { data: signupData, error: signupError } = await supabase.auth.signUp({
        email: testEmail,
        password: testPassword,
        options: {
          data: { full_name: "Test User" },
        },
      })

      if (signupError) {
        // Account might already exist, try logging in
        if (signupError.message.includes("already registered")) {
          setMessage("Account exists, trying to login...")
        } else {
          throw signupError
        }
      } else {
        setMessage("Account created! Now testing login...")
      }

      // Wait a moment
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Step 2: Sign out first
      await supabase.auth.signOut()

      // Step 3: Try to sign in
      setStep("signing-in")
      setMessage("Testing login with same credentials...")

      await new Promise((resolve) => setTimeout(resolve, 500))

      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email: testEmail,
        password: testPassword,
      })

      if (loginError) {
        setStep("error")
        setMessage(
          `Login failed: ${loginError.message}\n\n` +
            `This means:\n` +
            `- Email confirmation might be required\n` +
            `- Database trigger might not be working\n` +
            `- There's a configuration issue`,
        )
        setLoading(false)
        return
      }

      if (loginData.session) {
        setStep("success")
        setMessage(
          `SUCCESS! Login is working perfectly!\n\n` +
            `✓ Account created: ${testEmail}\n` +
            `✓ Login successful\n` +
            `✓ Session established\n\n` +
            `You can now use these credentials or create your own account.`,
        )
      }
    } catch (err: any) {
      setStep("error")
      setMessage(`Error: ${err.message}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle>Login System Test</CardTitle>
          <CardDescription>
            This will create a test account and verify that signup and login are working correctly
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {step === "start" && (
            <>
              <Alert>
                <AlertDescription>
                  <strong>Test Credentials:</strong>
                  <br />
                  Email: {testEmail}
                  <br />
                  Password: {testPassword}
                </AlertDescription>
              </Alert>
              <Button onClick={runTest} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Running test...
                  </>
                ) : (
                  "Test Login System"
                )}
              </Button>
            </>
          )}

          {(step === "signing-up" || step === "signing-in") && (
            <Alert>
              <Loader2 className="h-4 w-4 animate-spin" />
              <AlertDescription className="whitespace-pre-wrap">{message}</AlertDescription>
            </Alert>
          )}

          {step === "success" && (
            <>
              <Alert className="bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800">
                <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                <AlertDescription className="text-green-900 dark:text-green-100 whitespace-pre-wrap">
                  {message}
                </AlertDescription>
              </Alert>
              <div className="flex gap-2">
                <Button onClick={() => router.push("/auth/login")} className="flex-1">
                  Go to Login
                </Button>
                <Button onClick={() => router.push("/dashboard")} variant="outline" className="flex-1">
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {step === "error" && (
            <>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="whitespace-pre-wrap">{message}</AlertDescription>
              </Alert>
              <Button onClick={() => setStep("start")} variant="outline" className="w-full">
                Try Again
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
