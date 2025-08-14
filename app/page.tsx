"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, Play, Zap, Car, Users, Award, Shield } from "lucide-react"
import { AccessibilityWidget } from "@/components/accessibility-widget"

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black">
      <AccessibilityWidget />

      {/* Navigation */}
      <nav className="flex items-center justify-between p-6 lg:px-12">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-lg hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
            <Car className="w-5 h-5 text-black" />
          </div>
          <span className="text-white font-bold text-xl">Waide Mobility</span>
        </div>
        <div className="hidden md:flex items-center space-x-8">
          <a href="#" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Platform
          </a>
          <a href="#solutions" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Solutions
          </a>
          <a href="#about" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            About Us
          </a>
          <a href="#pricing" className="text-white/80 hover:text-cyan-400 transition-colors font-medium">
            Pricing
          </a>
          <Button
            variant="outline"
            className="border-white/20 text-black hover:bg-white/90 bg-white backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
          >
            Sign In
          </Button>
          <Button className="bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
            Get Started
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <Badge className="mb-6 bg-white text-black border-white/20 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <Zap className="w-4 h-4 mr-2" />
              Next-Gen Mobility Platform
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-bold text-white mb-8 leading-tight animate-slide-up">
              Smart Mobility
              <br />
              <span className="bg-gradient-to-r from-cyan-400 to-cyan-600 bg-clip-text text-transparent">
                Solutions
              </span>
            </h1>
            <p className="text-xl text-white/80 mb-12 max-w-3xl mx-auto leading-relaxed animate-slide-up-delay">
              Transform urban transportation with our AI-powered mobility platform. Connect, optimize, and scale
              intelligent transportation systems for the future of smart cities.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up-delay-2">
              <Button
                size="lg"
                className="bg-white text-black hover:bg-gray-100 text-lg px-8 py-4 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                Start Building
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10 text-lg px-8 py-4 bg-white/5 backdrop-blur-sm shadow-[inset_0_2px_4px_rgba(255,255,255,0.1),0_2px_8px_rgba(0,0,0,0.3)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.2),0_4px_12px_rgba(0,0,0,0.4)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
              >
                <Play className="mr-2 w-5 h-5" />
                Watch Demo
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-20 animate-fade-in-up">
            <Card className="bg-black border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(6,182,212,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/mobility-app-interface.png"
                    alt="Mobile Platform"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Mobile-First Platform
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Deploy mobility solutions across iOS and Android with our comprehensive SDK
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(6,182,212,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/ai-brain-dashboard.png"
                    alt="AI Analytics"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    AI-Powered Analytics
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Advanced machine learning for traffic optimization and predictive routing
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:shadow-[0_12px_48px_rgba(6,182,212,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/global-network.png"
                    alt="Global Infrastructure"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Global Infrastructure
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Worldwide network and cloud infrastructure for seamless mobility services
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center animate-fade-in-up">
            <div className="animate-counter">
              <div className="text-4xl font-bold text-white mb-2">15M+</div>
              <div className="text-white/70">Daily Trips</div>
            </div>
            <div className="animate-counter">
              <div className="text-4xl font-bold text-white mb-2">800+</div>
              <div className="text-white/70">City Partners</div>
            </div>
            <div className="animate-counter">
              <div className="text-4xl font-bold text-white mb-2">99.8%</div>
              <div className="text-white/70">Reliability</div>
            </div>
            <div className="animate-counter">
              <div className="text-4xl font-bold text-white mb-2">25ms</div>
              <div className="text-white/70">Response Time</div>
            </div>
          </div>
        </div>
      </div>

      <section className="px-6 lg:px-12 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Empowering Accessible Navigation</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transforming how individuals with diverse abilities navigate complex environments through innovative
              digital solutions and immersive training platforms.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="animate-slide-in-left">
              <h3 className="text-2xl font-bold text-white mb-6">Interactive Learning Platform</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                Our revolutionary digital training system empowers individuals and families to master navigation skills
                through engaging, game-based learning experiences. By simulating real-world environments, we build
                confidence and independence for travelers of all abilities.
              </p>
              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white/80">Immersive virtual environment training</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white/80">Worldwide deployment capabilities</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white/80">Comprehensive family support tools</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                  <span className="text-white/80">Confidence-building travel experiences</span>
                </div>
              </div>
            </div>
            <div className="animate-slide-in-right">
              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
                <CardContent className="p-0">
                  <div className="h-64 relative overflow-hidden">
                    <img
                      src="/airport-wayfinding.png"
                      alt="Accessible Airport Navigation"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                  <div className="p-6 transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    <h4 className="text-xl font-bold text-white mb-3 group-hover:text-cyan-400 transition-colors duration-300">
                      Travel Preparation System
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Comprehensive digital environments that familiarize users with complex travel hubs, reducing
                      anxiety and building navigation confidence.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-32 relative overflow-hidden">
                  <img
                    src="/modern-mall-navigation.png"
                    alt="Virtual Training"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h4 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    Digital Simulation
                  </h4>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Advanced virtual environments for safe practice and skill development
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-32 relative overflow-hidden">
                  <img
                    src="/hospital-smart-navigation.png"
                    alt="Family Support"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h4 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    Collaborative Learning
                  </h4>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Inclusive tools designed for families and support networks
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 hover:-translate-y-2 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-32 relative overflow-hidden">
                  <img
                    src="/smart-office-navigation.png"
                    alt="Global Deployment"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <div className="p-6 text-center transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                  <h4 className="font-bold text-white mb-2 group-hover:text-cyan-400 transition-colors duration-300">
                    Scalable Solutions
                  </h4>
                  <p className="text-sm text-white/70 group-hover:text-white/90 transition-colors duration-300">
                    Adaptable platform for diverse environments and global implementation
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Indoor Spaces Carousel */}
      <section className="px-6 lg:px-12 py-20 bg-black">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Spaces We Transform</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Our intelligent navigation solutions adapt to any indoor environment, creating seamless experiences across
              diverse spaces.
            </p>
          </div>

          <div className="relative overflow-hidden">
            <div className="flex animate-scroll-left space-x-8" style={{ width: "calc(400px * 20 + 32px * 19)" }}>
              {/* Shopping & Retail */}
              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/modern-mall-interior.png"
                      alt="Shopping Malls"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Shopping Malls
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Smart wayfinding and crowd flow optimization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/airport-terminal-interior.png"
                      alt="Airports"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Airports
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Terminal navigation and passenger guidance
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/modern-hospital-interior.png"
                      alt="Hospitals"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Hospitals
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Patient and visitor navigation systems
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/modern-office-lobby.png"
                      alt="Office Buildings"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Office Buildings
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Workplace navigation and space optimization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/university-campus-interior.png"
                      alt="Universities"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Universities
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Campus navigation for students and visitors
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/luxury-hotel-lobby.png"
                      alt="Hotels"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Hotels
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Guest services and facility navigation
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/convention-center-interior.png"
                      alt="Convention Centers"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Convention Centers
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Event navigation and crowd management
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/sports-stadium-interior.png"
                      alt="Sports Venues"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Sports Venues
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Stadium navigation and seat finding
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/museum-gallery.png"
                      alt="Museums"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Museums
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Interactive exhibit navigation and tours
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/train-station-interior.png"
                      alt="Train Stations"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Train Stations
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Platform guidance and transit connections
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/modern-library-interior.png"
                      alt="Libraries"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Libraries
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Resource location and study space finding
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/modern-warehouse-interior.png"
                      alt="Warehouses"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Warehouses
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Inventory navigation and logistics optimization
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/manufacturing-facility-interior.png"
                      alt="Manufacturing"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Manufacturing
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Factory floor navigation and safety routing
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/data-center-interior.png"
                      alt="Data Centers"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Data Centers
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Server location and maintenance routing
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/parking-garage-interior.png"
                      alt="Parking Garages"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Parking Garages
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Vehicle location and space availability
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/cruise-ship-interior.png"
                      alt="Cruise Ships"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Cruise Ships
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Deck navigation and amenity location
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/placeholder-64s4t.png"
                      alt="Theme Parks"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Theme Parks
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Attraction navigation and queue management
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/placeholder.svg?height=192&width=384"
                      alt="Casinos"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Casinos
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Gaming floor navigation and amenity finding
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer flex-shrink-0 w-96 h-80">
                <CardContent className="p-0">
                  <div className="h-48 relative overflow-hidden">
                    <img
                      src="/placeholder.svg?height=192&width=384"
                      alt="Subway Systems"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </div>
                  <div className="p-8 text-center">
                    <h4 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                      Subway Systems
                    </h4>
                    <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                      Underground navigation and transfer guidance
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section className="py-32 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-bold text-white mb-8">Our Solutions</h2>
            <p className="text-xl text-white/70 max-w-3xl mx-auto">
              Comprehensive indoor navigation and mapping solutions powered by cutting-edge technology
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Interactive Indoor Mapping */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/interactive-indoor-mapping.png"
                    alt="Interactive Indoor Mapping"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Interactive Indoor Mapping
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Customizable 2D and 3D indoor maps with real-time updates and AI-powered maintenance
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• Geo-referenced mapping</li>
                    <li>• Custom branding options</li>
                    <li>• Multi-floor visualization</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Smart Wayfinding */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/smart-wayfinding.png"
                    alt="Smart Wayfinding"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Smart Wayfinding
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Turn-by-turn navigation with dynamic route adjustments and accessibility options
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• Personalized guidance</li>
                    <li>• Multi-stop navigation</li>
                    <li>• Arrival time calculation</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Advanced Search & Discovery */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/advanced-search.png"
                    alt="Advanced Search"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Advanced Search & Discovery
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Intelligent search with customizable filters for locations, venues, and categories
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• Building-specific search</li>
                    <li>• Category filtering</li>
                    <li>• Location-based results</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Real-time Data Visualization */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/data-visualization.png"
                    alt="Data Visualization"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Real-time Data Visualization
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Live sensor integration with calendar systems and ERP for dynamic map data
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• Occupancy sensors</li>
                    <li>• Booking system integration</li>
                    <li>• Traffic flow analytics</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Outdoor-Indoor Transitions */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/outdoor-indoor-navigation.png"
                    alt="Outdoor Indoor Navigation"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Seamless Outdoor-Indoor Navigation
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Continuous navigation experience from outdoor GPS to indoor positioning
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• GPS to indoor transition</li>
                    <li>• Unified user experience</li>
                    <li>• Cross-platform compatibility</li>
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Smart Building Integration */}
            <Card className="bg-black border border-white/10 hover:ring-2 hover:ring-cyan-400 transition-all duration-500 hover:scale-105 overflow-hidden group cursor-pointer">
              <CardContent className="p-0">
                <div className="h-48 relative overflow-hidden">
                  <img
                    src="/smart-building-integration.png"
                    alt="Smart Building Integration"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-cyan-400 transition-colors duration-300">
                    Smart Building Integration
                  </h3>
                  <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300 mb-4">
                    Complete ecosystem integration for room booking, space management, and IoT devices
                  </p>
                  <ul className="text-white/60 space-y-2 text-sm">
                    <li>• Room & desk booking</li>
                    <li>• Space management</li>
                    <li>• IoT sensor integration</li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us Section */}
      <section id="about" className="px-6 lg:px-12 py-20 bg-white/5 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">About Waide Mobility</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              We're pioneering the future of urban transportation through innovative technology and sustainable
              solutions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="animate-slide-in-left">
              <h3 className="text-2xl font-bold text-white mb-6">Our Mission</h3>
              <p className="text-white/80 mb-6 leading-relaxed">
                To revolutionize urban mobility by creating intelligent, sustainable, and accessible transportation
                ecosystems that connect communities and reduce environmental impact.
              </p>
              <p className="text-white/80 leading-relaxed">
                Through cutting-edge AI, IoT integration, and data-driven insights, we're building the infrastructure
                for tomorrow's smart cities today.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-4 animate-slide-in-right">
              <Card className="bg-black border border-white/10 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <CardContent className="p-6 text-center">
                  <Users className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">200+</div>
                  <div className="text-sm text-white/70">Team Members</div>
                </CardContent>
              </Card>
              <Card className="bg-black border border-white/10 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)]">
                <CardContent className="p-6 text-center">
                  <Award className="w-8 h-8 text-cyan-400 mx-auto mb-3" />
                  <div className="text-2xl font-bold text-white">50+</div>
                  <div className="text-sm text-white/70">Awards Won</div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="px-6 lg:px-12 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16 animate-fade-in">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-8">Indoor Space Solutions</h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto leading-relaxed">
              Transform your indoor spaces with our smart navigation technology. Choose monthly or yearly plans.
            </p>
            <div className="flex items-center justify-center gap-4 mt-8">
              <span className="text-white/80">Monthly</span>
              <button className="relative inline-flex h-6 w-11 items-center rounded-full bg-white/20 transition-colors hover:bg-white/30">
                <span className="inline-block h-4 w-4 transform rounded-full bg-white transition-transform translate-x-1"></span>
              </button>
              <span className="text-white/80">
                Yearly <span className="text-cyan-400 text-sm">(Save 20%)</span>
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 animate-fade-in-up">
            <Card className="bg-black border border-white/10 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Small Spaces</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    $299<span className="text-lg text-white/70">/month</span>
                  </div>
                  <p className="text-white/70">Perfect for retail stores & small offices</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Up to 5,000 sq ft coverage
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Basic indoor positioning
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Mobile app integration
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    24/7 support
                  </li>
                </ul>
                <Button
                  className="w-full bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
                  onClick={() => (window.location.href = "/contact?plan=small")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300 scale-105">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <Badge className="mb-4 bg-cyan-400 text-black">Most Popular</Badge>
                  <h3 className="text-2xl font-bold text-white mb-2">Medium Spaces</h3>
                  <div className="text-4xl font-bold text-white mb-2">
                    $799<span className="text-lg text-white/70">/month</span>
                  </div>
                  <p className="text-white/70">Ideal for shopping centers & hospitals</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Up to 50,000 sq ft coverage
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Advanced AR navigation
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Real-time analytics
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    API access & integrations
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Priority support
                  </li>
                </ul>
                <Button
                  className="w-full bg-cyan-400 text-black hover:bg-cyan-300 shadow-[0_4px_16px_rgba(6,182,212,0.3)] hover:shadow-[0_6px_20px_rgba(6,182,212,0.4)] transition-all duration-300"
                  onClick={() => (window.location.href = "/contact?plan=medium")}
                >
                  Get Started
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-black border border-white/10 backdrop-blur-sm shadow-[0_4px_16px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300">
              <CardContent className="p-8">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold text-white mb-2">Large Spaces</h3>
                  <div className="text-4xl font-bold text-white mb-2">Custom</div>
                  <p className="text-white/70">For airports & mega complexes</p>
                </div>
                <ul className="space-y-4 mb-8">
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Unlimited coverage area
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Full AI navigation suite
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Custom integrations
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    White-label solutions
                  </li>
                  <li className="flex items-center text-white/80">
                    <Shield className="w-5 h-5 mr-3 text-cyan-400" />
                    Dedicated support team
                  </li>
                </ul>
                <Button
                  className="w-full bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_2px_8px_rgba(0,0,0,0.1)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_4px_12px_rgba(0,0,0,0.15)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300"
                  onClick={() => (window.location.href = "/contact?plan=enterprise")}
                >
                  Contact Sales
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-6 lg:px-12 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-6 h-6 bg-white rounded flex items-center justify-center shadow-lg">
                  <Car className="w-4 h-4 text-black" />
                </div>
                <span className="text-white font-bold">Waide Mobility</span>
              </div>
              <p className="text-white/60 text-sm">
                The future of smart transportation, powered by artificial intelligence.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Fleet Management
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Analytics Suite
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Mobile SDK
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    API Gateway
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Solutions</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Smart Cities
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Public Transit
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Ride Sharing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Logistics
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-white/60">
                <li>
                  <a href="#about" className="hover:text-white transition-colors">
                    About Us
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    News
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition-colors">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 text-sm">© 2024 Waide Mobility. All rights reserved.</p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-white/60 hover:text-white text-sm transition-colors">
                Security
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
