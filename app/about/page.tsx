import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Users, Award, Globe, Target, Heart, Lightbulb, Car } from "lucide-react"
import Link from "next/link"

export default function AboutPage() {
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
              <Heart className="w-4 h-4 mr-2" />
              Our Story
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight">
              Pioneering the Future of
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Smart Mobility
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed">
              Founded in 2019, Waide Mobility emerged from a simple vision: to make navigation intuitive and
              transportation intelligent for everyone, everywhere.
            </p>
          </div>

          {/* Mission & Vision */}
          <div className="grid md:grid-cols-2 gap-12 mb-20">
            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                  <Target className="w-16 h-16 text-cyan-600" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-4">Our Mission</h2>
                  <p className="text-black/70 leading-relaxed">
                    To revolutionize how people navigate and interact with spaces by creating intelligent, sustainable,
                    and accessible mobility solutions that connect communities and reduce environmental impact through
                    cutting-edge technology.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-0">
                <div className="h-48 bg-gradient-to-br from-cyan-100 to-cyan-200 rounded-t-lg flex items-center justify-center">
                  <Lightbulb className="w-16 h-16 text-cyan-600" />
                </div>
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-black mb-4">Our Vision</h2>
                  <p className="text-black/70 leading-relaxed">
                    A world where every journey is seamless, every space is intelligently connected, and sustainable
                    transportation is accessible to all. We envision smart cities where mobility flows effortlessly,
                    powered by AI and human-centered design.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Company Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-20">
            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-black mx-auto mb-3" />
                <div className="text-3xl font-bold text-black mb-2">200+</div>
                <div className="text-sm text-black/70">Team Members</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Globe className="w-8 h-8 text-black mx-auto mb-3" />
                <div className="text-3xl font-bold text-black mb-2">50+</div>
                <div className="text-sm text-black/70">Countries Served</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Award className="w-8 h-8 text-black mx-auto mb-3" />
                <div className="text-3xl font-bold text-black mb-2">25+</div>
                <div className="text-sm text-black/70">Industry Awards</div>
              </CardContent>
            </Card>

            <Card className="bg-white border-white/20 shadow-[0_4px_16px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-6 text-center">
                <Users className="w-8 h-8 text-black mx-auto mb-3" />
                <div className="text-3xl font-bold text-black mb-2">1M+</div>
                <div className="text-sm text-black/70">Daily Users</div>
              </CardContent>
            </Card>
          </div>

          {/* Values */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-white mb-12 text-center">Our Core Values</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Lightbulb className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Innovation</h3>
                <p className="text-white/70">
                  We push the boundaries of what's possible, constantly exploring new technologies and approaches to
                  solve complex mobility challenges.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Users className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Collaboration</h3>
                <p className="text-white/70">
                  We believe in the power of partnership, working closely with cities, businesses, and communities to
                  create solutions that work for everyone.
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-cyan-400 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Globe className="w-8 h-8 text-black" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Sustainability</h3>
                <p className="text-white/70">
                  Every solution we build considers environmental impact, promoting cleaner, more efficient
                  transportation for a sustainable future.
                </p>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Join Our Journey</h2>
            <p className="text-white/80 mb-8 max-w-2xl mx-auto">
              Be part of the mobility revolution. Whether you're a developer, city planner, or business leader, there's
              a place for you in our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                View Careers
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-white/5 backdrop-blur-sm hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                Contact Us
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
