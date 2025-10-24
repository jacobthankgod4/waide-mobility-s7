"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Car, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle login logic here
    console.log("Login attempt:", { email, password })
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
              <Car className="w-6 h-6 text-black" />
            </div>
            <span className="text-white font-bold text-2xl">Waide Mobility</span>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
          <p className="text-white/70">Sign in to your account to continue</p>
        </div>

        <Card className="bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-white text-center">Sign In</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-white">
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                  placeholder="Enter your email"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-white">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300 pr-10"
                    placeholder="Enter your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-cyan-400 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <label className="flex items-center space-x-2 text-sm text-white/70">
                  <input
                    type="checkbox"
                    className="rounded border-white/20 bg-white/5 text-cyan-400 focus:ring-cyan-400"
                  />
                  <span>Remember me</span>
                </label>
                <Link href="/forgot-password" className="text-sm text-cyan-400 hover:text-cyan-300 transition-colors">
                  Forgot password?
                </Link>
              </div>
              <Button
                type="submit"
                className="w-full bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                Sign In
              </Button>
            </form>
            <div className="mt-6 text-center">
              <p className="text-white/70">
                Don't have an account?{" "}
                <Link href="/signup" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
