"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Car, MapPin, Building, Users, Phone, Mail, Send, CheckCircle } from "lucide-react"
import Link from "next/link"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    company: "",
    spaceType: "",
    spaceSize: "",
    plan: "",
    message: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Get plan from URL params
    const urlParams = new URLSearchParams(window.location.search)
    const plan = urlParams.get("plan")
    if (plan) {
      setFormData((prev) => ({ ...prev, plan }))
    }
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsLoading(false)
    setIsSubmitted(true)
  }

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center px-6">
        <Card className="w-full max-w-md bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
          <CardContent className="p-8 text-center">
            <CheckCircle className="w-16 h-16 text-cyan-400 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-white mb-4">Thank You!</h2>
            <p className="text-white/80 mb-6">
              We've received your inquiry and will get back to you within 24 hours to discuss your indoor navigation
              needs.
            </p>
            <Button
              onClick={() => (window.location.href = "/")}
              className="bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
            >
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl">Waide Mobility</span>
        </Link>
      </nav>

      <div className="px-6 lg:px-12 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-6">Get In Touch</h1>
            <p className="text-xl text-white/80 max-w-2xl mx-auto">
              Ready to transform your indoor space? Fill out the form below and our team will contact you to discuss
              your specific needs.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardHeader>
                <CardTitle className="text-white text-2xl">Project Details</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName" className="text-white">
                        First Name *
                      </Label>
                      <Input
                        id="firstName"
                        value={formData.firstName}
                        onChange={(e) => handleChange("firstName", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                        placeholder="John"
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName" className="text-white">
                        Last Name *
                      </Label>
                      <Input
                        id="lastName"
                        value={formData.lastName}
                        onChange={(e) => handleChange("lastName", e.target.value)}
                        className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                        placeholder="Doe"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="text-white">
                      Email *
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleChange("email", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                      placeholder="john@company.com"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-white">
                      Phone
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleChange("phone", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="company" className="text-white">
                      Company *
                    </Label>
                    <Input
                      id="company"
                      value={formData.company}
                      onChange={(e) => handleChange("company", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300"
                      placeholder="Your Company Name"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-white">Space Type *</Label>
                      <Select value={formData.spaceType} onValueChange={(value) => handleChange("spaceType", value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300">
                          <SelectValue placeholder="Select space type" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="retail" className="text-white hover:bg-white/10">
                            Retail Store
                          </SelectItem>
                          <SelectItem value="mall" className="text-white hover:bg-white/10">
                            Shopping Mall
                          </SelectItem>
                          <SelectItem value="hospital" className="text-white hover:bg-white/10">
                            Hospital
                          </SelectItem>
                          <SelectItem value="airport" className="text-white hover:bg-white/10">
                            Airport
                          </SelectItem>
                          <SelectItem value="office" className="text-white hover:bg-white/10">
                            Office Building
                          </SelectItem>
                          <SelectItem value="other" className="text-white hover:bg-white/10">
                            Other
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-white">Space Size *</Label>
                      <Select value={formData.spaceSize} onValueChange={(value) => handleChange("spaceSize", value)}>
                        <SelectTrigger className="bg-white/5 border-white/20 text-white focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300">
                          <SelectValue placeholder="Select size" />
                        </SelectTrigger>
                        <SelectContent className="bg-black border-white/20">
                          <SelectItem value="small" className="text-white hover:bg-white/10">
                            Under 5,000 sq ft
                          </SelectItem>
                          <SelectItem value="medium" className="text-white hover:bg-white/10">
                            5,000 - 50,000 sq ft
                          </SelectItem>
                          <SelectItem value="large" className="text-white hover:bg-white/10">
                            50,000+ sq ft
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {formData.plan && (
                    <div className="space-y-2">
                      <Label className="text-white">Selected Plan</Label>
                      <Input
                        value={formData.plan.charAt(0).toUpperCase() + formData.plan.slice(1)}
                        className="bg-white/5 border-white/20 text-white"
                        disabled
                      />
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="message" className="text-white">
                      Project Details
                    </Label>
                    <Textarea
                      id="message"
                      value={formData.message}
                      onChange={(e) => handleChange("message", e.target.value)}
                      className="bg-white/5 border-white/20 text-white placeholder:text-white/50 focus:border-cyan-400 focus:ring-cyan-400 hover:border-cyan-400 transition-all duration-300 min-h-[120px]"
                      placeholder="Tell us about your indoor navigation needs, expected foot traffic, special requirements, etc."
                    />
                  </div>

                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300 disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin"></div>
                        Sending...
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Send className="w-4 h-4" />
                        Send Inquiry
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-8">
              <Card className="bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-6">Contact Information</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Mail className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/80">sales@waidemobility.com</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Phone className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/80">+1 (555) 123-4567</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <MapPin className="w-5 h-5 text-cyan-400" />
                      <span className="text-white/80">San Francisco, CA</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.5)]">
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold text-white mb-4">Why Choose Waide Mobility?</h3>
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <Building className="w-5 h-5 text-cyan-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Proven Experience</h4>
                        <p className="text-white/70 text-sm">
                          Over 800 successful indoor navigation deployments worldwide
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <Users className="w-5 h-5 text-cyan-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Expert Support</h4>
                        <p className="text-white/70 text-sm">Dedicated team of navigation specialists and engineers</p>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <CheckCircle className="w-5 h-5 text-cyan-400 mt-1" />
                      <div>
                        <h4 className="font-semibold text-white">Quick Deployment</h4>
                        <p className="text-white/70 text-sm">Get up and running in as little as 2 weeks</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
