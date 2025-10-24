import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, MapPin, Car, Train, Truck, Building, Plane, ShoppingBag } from "lucide-react"
import Link from "next/link"

export default function SolutionsPage() {
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
              <MapPin className="w-4 h-4 mr-2" />
              Smart Solutions
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Mobility Solutions for
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Every Space
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              From bustling shopping centers to complex airport terminals, our AI-powered solutions transform how people
              navigate and interact with indoor and outdoor spaces.
            </p>
          </div>

          {/* Industry Solutions */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Indoor Navigation</h2>
              <div className="space-y-6">
                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <ShoppingBag className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Retail & Shopping</h3>
                      <p className="text-black/70 text-sm">
                        Guide customers to stores, products, and amenities with AR-powered navigation and personalized
                        recommendations.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <Plane className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Airports & Transit</h3>
                      <p className="text-black/70 text-sm">
                        Streamline passenger flow with intelligent wayfinding, real-time updates, and multilingual
                        support.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <Building className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Corporate Offices</h3>
                      <p className="text-black/70 text-sm">
                        Optimize workplace navigation, meeting room booking, and visitor management systems.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            <div>
              <h2 className="text-3xl font-bold text-white mb-8">Transportation</h2>
              <div className="space-y-6">
                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <Car className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Fleet Management</h3>
                      <p className="text-black/70 text-sm">
                        Real-time vehicle tracking, route optimization, and predictive maintenance for maximum
                        efficiency.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <Train className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Public Transit</h3>
                      <p className="text-black/70 text-sm">
                        Integrate buses, trains, and micro-mobility options for seamless multimodal transportation.
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
                  <CardContent className="p-0">
                    <div className="h-32 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                      <Truck className="w-12 h-12 text-cyan-600" />
                    </div>
                    <div className="p-6">
                      <h3 className="text-lg font-bold text-black mb-2">Logistics & Delivery</h3>
                      <p className="text-black/70 text-sm">
                        AI-powered route planning, warehouse optimization, and last-mile delivery solutions.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to Transform Your Space?</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Join hundreds of organizations already using Waide Mobility to create smarter, more efficient spaces.
            </p>
            <Button
              size="lg"
              className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
