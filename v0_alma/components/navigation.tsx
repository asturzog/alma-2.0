"use client"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Trophy } from "lucide-react"
import Link from "next/link"
import { useRouter, usePathname } from "next/navigation"
import { useEffect, useState } from "react"

export function Navigation() {
  const [user, setUser] = useState<any>(null)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
  }

  return (
    <nav className="border-b border-emerald-200/50 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-xl text-emerald-900">
            <Trophy className="h-6 w-6 text-emerald-600" />
            <span>almaPredict</span>
          </Link>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Button
                  variant={pathname === "/markets" ? "default" : "ghost"}
                  className={pathname === "/markets" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  asChild
                >
                  <Link href="/markets">Markets</Link>
                </Button>
                <Button
                  variant={pathname === "/admin" ? "default" : "ghost"}
                  className={pathname === "/admin" ? "bg-emerald-600 hover:bg-emerald-700" : ""}
                  asChild
                >
                  <Link href="/admin">Admin</Link>
                </Button>
                <Button variant="ghost" onClick={handleLogout}>
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/auth/login">Login</Link>
                </Button>
                <Button className="bg-emerald-600 hover:bg-emerald-700" asChild>
                  <Link href="/auth/sign-up">Sign Up</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
