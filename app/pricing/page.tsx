import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, Zap, Car } from "lucide-react"
import Link from "next/link"

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-black">
      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl">Waide Mobility</span>
        </Link>
        <div className="hidden md:flex items-center space-x-8">
          <Link href="/" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Home
          </Link>
          <Link href="/platform" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Platform
          </Link>
          <Link href="/solutions" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Solutions
          </Link>
          <Link href="/about" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            About
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white text-black border-white/20 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <Zap className="w-4 h-4 mr-2" />
              Flexible Pricing
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Choose Your
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Perfect Plan
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              From startups to enterprise organizations, we have the right mobility solution for your needs. Scale as
              you grow with transparent, predictable pricing.
            </p>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {/* Starter Plan */}
            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Starter</h3>
                  <div className="text-5xl font-bold text-black mb-2">
                    $99<span className="text-lg text-black/70">/month</span>
                  </div>
                  <p className="text-black/70">Perfect for small businesses and startups</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Up to 50 vehicles or devices
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Basic analytics dashboard
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    24/7 email support
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Mobile app access
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Basic API access (1,000 calls/day)
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Standard SLA (99.5% uptime)
                  </li>
                </ul>
                <Button className="w-full bg-black text-white hover:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Professional Plan */}
            <Card className="bg-white border-cyan-400 border-2 shadow-[0_8px_32px_rgba(0,0,0,0.2)] scale-105 relative">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-cyan-400 text-black px-4 py-1">Most Popular</Badge>
              </div>
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Professional</h3>
                  <div className="text-5xl font-bold text-black mb-2">
                    $299<span className="text-lg text-black/70">/month</span>
                  </div>
                  <p className="text-black/70">For growing businesses and teams</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Up to 200 vehicles or devices
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Advanced analytics & AI insights
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Priority phone & chat support
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Full API access (10,000 calls/day)
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Custom integrations
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Enhanced SLA (99.8% uptime)
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Advanced reporting & exports
                  </li>
                </ul>
                <Button className="w-full bg-cyan-400 text-black hover:bg-cyan-500 shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] transition-all duration-300">
                  Start Free Trial
                </Button>
              </CardContent>
            </Card>

            {/* Enterprise Plan */}
            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-black mb-2">Enterprise</h3>
                  <div className="text-5xl font-bold text-black mb-2">Custom</div>
                  <p className="text-black/70">For large organizations and cities</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Unlimited vehicles and devices
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Full AI suite & predictive analytics
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Dedicated account manager
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Unlimited API calls
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    White-label solutions
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    Premium SLA (99.9% uptime)
                  </li>
                  <li className="flex items-center text-black/80">
                    <Check className="w-5 h-5 mr-3 text-green-600" />
                    On-premise deployment options
                  </li>
                </ul>
                <Button className="w-full bg-black text-white hover:bg-gray-800 shadow-[0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* FAQ Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Frequently Asked Questions</h2>
            <div className="grid md:grid-cols-2 gap-8">
              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Can I change plans anytime?</h3>
                  <p className="text-white/70 text-sm">
                    Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll
                    prorate any billing adjustments.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Is there a free trial?</h3>
                  <p className="text-white/70 text-sm">
                    All plans include a 14-day free trial with full access to features. No credit card required to start
                    your trial.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3">What payment methods do you accept?</h3>
                  <p className="text-white/70 text-sm">
                    We accept all major credit cards, ACH transfers, and wire transfers for enterprise accounts. Annual
                    billing receives a 15% discount.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
                <CardContent className="p-6">
                  <h3 className="text-lg font-bold text-white mb-3">Do you offer custom solutions?</h3>
                  <p className="text-white/70 text-sm">
                    Yes, our Enterprise plan includes custom development, integrations, and deployment options tailored
                    to your specific needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Get Started?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join thousands of organizations already using Waide Mobility to transform their transportation systems.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
            >
              Start Your Free Trial
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
