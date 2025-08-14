import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Code, Smartphone, Cloud, Car } from "lucide-react"
import Link from "next/link"

export default function PlatformPage() {
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
          <Link href="/solutions" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Solutions
          </Link>
          <Link href="/about" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            About
          </Link>
          <Link href="/pricing" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Pricing
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <Badge className="mb-6 bg-white text-black border-white/20 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <Code className="w-4 h-4 mr-2" />
              Developer Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Build the Future of
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">Mobility</span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Comprehensive APIs, SDKs, and tools to integrate smart mobility solutions into your applications. From
              indoor navigation to fleet management, everything you need is here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                Get API Key
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-white/5 backdrop-blur-sm hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                View Documentation
              </Button>
            </div>
          </div>

          {/* Platform Features */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                  <Code className="w-16 h-16 text-cyan-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black mb-4">REST APIs</h3>
                  <p className="text-black/70 mb-4">
                    Comprehensive RESTful APIs for all mobility services with real-time data access.
                  </p>
                  <ul className="text-sm text-black/60 space-y-2">
                    <li>• Real-time location tracking</li>
                    <li>• Route optimization</li>
                    <li>• Fleet management</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                  <Smartphone className="w-16 h-16 text-cyan-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black mb-4">Mobile SDKs</h3>
                  <p className="text-black/70 mb-4">Native iOS and Android SDKs for seamless mobile integration.</p>
                  <ul className="text-sm text-black/60 space-y-2">
                    <li>• iOS Swift SDK</li>
                    <li>• Android Kotlin SDK</li>
                    <li>• React Native support</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                  <Cloud className="w-16 h-16 text-cyan-600" />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-black mb-4">Cloud Infrastructure</h3>
                  <p className="text-black/70 mb-4">Scalable cloud services with global edge computing capabilities.</p>
                  <ul className="text-sm text-black/60 space-y-2">
                    <li>• 99.9% uptime SLA</li>
                    <li>• Global CDN</li>
                    <li>• Auto-scaling</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
