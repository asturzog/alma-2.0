import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-6">
      <div className="w-full max-w-md">
        <Card className="border-emerald-200/50 shadow-lg">
          <CardHeader className="space-y-4 text-center">
            <div className="flex justify-center">
              <CheckCircle className="h-16 w-16 text-emerald-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-emerald-900">Check Your Email</CardTitle>
            <CardDescription className="text-base">
              We've sent you a confirmation email. Click the link in the email to activate your account and start
              predicting!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-center text-sm text-muted-foreground">
              After confirming your email, you can{" "}
              <Link href="/auth/login" className="font-medium text-emerald-600 hover:text-emerald-700">
                log in here
              </Link>
              .
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
