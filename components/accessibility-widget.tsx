"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Accessibility, Type, X, Eye, Brain, Headphones, RotateCcw } from "lucide-react"

export function AccessibilityWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [fontSize, setFontSize] = useState(100)
  const [highContrast, setHighContrast] = useState(false)
  const [screenReader, setScreenReader] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [focusMode, setFocusMode] = useState(false)
  const [dyslexiaFont, setDyslexiaFont] = useState(false)
  const [colorBlindMode, setColorBlindMode] = useState(false)

  const adjustFontSize = (increment: number) => {
    const newSize = Math.max(75, Math.min(200, fontSize + increment))
    setFontSize(newSize)
    document.documentElement.style.fontSize = `${newSize}%`
  }

  const toggleHighContrast = () => {
    setHighContrast(!highContrast)
    if (!highContrast) {
      document.documentElement.classList.add("high-contrast")
    } else {
      document.documentElement.classList.remove("high-contrast")
    }
  }

  const toggleScreenReader = () => {
    setScreenReader(!screenReader)
    if (!screenReader) {
      document.documentElement.classList.add("screen-reader-mode")
      console.log("Screen reader mode enabled")
    } else {
      document.documentElement.classList.remove("screen-reader-mode")
      console.log("Screen reader mode disabled")
    }
  }

  const toggleReducedMotion = () => {
    setReducedMotion(!reducedMotion)
    if (!reducedMotion) {
      document.documentElement.classList.add("reduce-motion")
    } else {
      document.documentElement.classList.remove("reduce-motion")
    }
  }

  const toggleFocusMode = () => {
    setFocusMode(!focusMode)
    if (!focusMode) {
      document.documentElement.classList.add("focus-mode")
    } else {
      document.documentElement.classList.remove("focus-mode")
    }
  }

  const toggleDyslexiaFont = () => {
    setDyslexiaFont(!dyslexiaFont)
    if (!dyslexiaFont) {
      document.documentElement.classList.add("dyslexia-font")
    } else {
      document.documentElement.classList.remove("dyslexia-font")
    }
  }

  const toggleColorBlindMode = () => {
    setColorBlindMode(!colorBlindMode)
    if (!colorBlindMode) {
      document.documentElement.classList.add("color-blind-mode")
    } else {
      document.documentElement.classList.remove("color-blind-mode")
    }
  }

  const resetAll = () => {
    setFontSize(100)
    setHighContrast(false)
    setScreenReader(false)
    setReducedMotion(false)
    setFocusMode(false)
    setDyslexiaFont(false)
    setColorBlindMode(false)

    document.documentElement.style.fontSize = "100%"
    document.documentElement.classList.remove(
      "high-contrast",
      "screen-reader-mode",
      "reduce-motion",
      "focus-mode",
      "dyslexia-font",
      "color-blind-mode",
    )
  }

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-white text-black hover:bg-gray-100 shadow-[inset_0_2px_4px_rgba(255,255,255,0.3),0_4px_16px_rgba(0,0,0,0.2)] hover:shadow-[inset_0_2px_4px_rgba(255,255,255,0.4),0_6px_20px_rgba(0,0,0,0.3)] hover:ring-2 hover:ring-cyan-400 transition-all duration-300 font-bold"
        aria-label="Open accessibility options"
      >
        <Accessibility className="w-8 h-8 font-bold" strokeWidth={2.5} />
      </Button>

      {/* Accessibility Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <Card className="w-full max-w-lg mx-4 bg-white border-gray-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-black">Accessibility Center</h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsOpen(false)}
                  className="text-black hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>

              <div className="space-y-6">
                {/* Font Size */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center mb-3">
                    <Type className="w-5 h-5 mr-2 text-black" />
                    <span className="font-semibold text-black">Text Size</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustFontSize(-25)}
                      className="text-black border-gray-300 hover:bg-gray-100"
                    >
                      A-
                    </Button>
                    <span className="text-sm text-black min-w-16 text-center font-medium">{fontSize}%</span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => adjustFontSize(25)}
                      className="text-black border-gray-300 hover:bg-gray-100"
                    >
                      A+
                    </Button>
                  </div>
                </div>

                {/* Visual Accessibility */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-black mb-4 flex items-center">
                    <Eye className="w-5 h-5 mr-2" />
                    Visual Support
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-black">High Contrast</span>
                      <Button
                        variant={highContrast ? "default" : "outline"}
                        size="sm"
                        onClick={toggleHighContrast}
                        className={
                          highContrast ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"
                        }
                      >
                        {highContrast ? "On" : "Off"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black">Color Blind Support</span>
                      <Button
                        variant={colorBlindMode ? "default" : "outline"}
                        size="sm"
                        onClick={toggleColorBlindMode}
                        className={
                          colorBlindMode ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"
                        }
                      >
                        {colorBlindMode ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Cognitive & Neurological Support */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-black mb-4 flex items-center">
                    <Brain className="w-5 h-5 mr-2" />
                    Cognitive Support
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-black">Dyslexia-Friendly Font</span>
                      <Button
                        variant={dyslexiaFont ? "default" : "outline"}
                        size="sm"
                        onClick={toggleDyslexiaFont}
                        className={
                          dyslexiaFont ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"
                        }
                      >
                        {dyslexiaFont ? "On" : "Off"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black">Focus Mode (ADHD)</span>
                      <Button
                        variant={focusMode ? "default" : "outline"}
                        size="sm"
                        onClick={toggleFocusMode}
                        className={focusMode ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"}
                      >
                        {focusMode ? "On" : "Off"}
                      </Button>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-black">Reduce Motion</span>
                      <Button
                        variant={reducedMotion ? "default" : "outline"}
                        size="sm"
                        onClick={toggleReducedMotion}
                        className={
                          reducedMotion ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"
                        }
                      >
                        {reducedMotion ? "On" : "Off"}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Audio & Screen Reader */}
                <div className="p-4 border border-gray-200 rounded-lg">
                  <h3 className="font-semibold text-black mb-4 flex items-center">
                    <Headphones className="w-5 h-5 mr-2" />
                    Audio Support
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-black">Screen Reader Mode</span>
                    <Button
                      variant={screenReader ? "default" : "outline"}
                      size="sm"
                      onClick={toggleScreenReader}
                      className={screenReader ? "bg-black text-white" : "text-black border-gray-300 hover:bg-gray-100"}
                    >
                      {screenReader ? "On" : "Off"}
                    </Button>
                  </div>
                </div>

                {/* Reset */}
                <div className="pt-4 border-t border-gray-200">
                  <Button
                    variant="outline"
                    className="w-full text-black border-gray-300 hover:bg-gray-100 bg-transparent flex items-center justify-center gap-2"
                    onClick={resetAll}
                  >
                    <RotateCcw className="w-4 h-4" />
                    Reset All Settings
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%) brightness(120%);
        }
        
        .screen-reader-mode {
          /* Enhanced focus indicators for screen readers */
        }
        .screen-reader-mode *:focus {
          outline: 3px solid #06b6d4 !important;
          outline-offset: 2px !important;
        }
        
        .reduce-motion * {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .focus-mode {
          /* ADHD-friendly focus mode */
        }
        .focus-mode * {
          transition: all 0.1s ease !important;
        }
        .focus-mode *:hover {
          transform: scale(1.02) !important;
          box-shadow: 0 4px 12px rgba(6, 182, 212, 0.3) !important;
        }
        
        .dyslexia-font {
          font-family: 'Comic Sans MS', 'OpenDyslexic', Arial, sans-serif !important;
        }
        .dyslexia-font * {
          font-family: 'Comic Sans MS', 'OpenDyslexic', Arial, sans-serif !important;
          letter-spacing: 0.05em !important;
          line-height: 1.6 !important;
        }
        
        .color-blind-mode {
          /* Enhanced color differentiation */
        }
        .color-blind-mode .text-cyan-400 {
          color: #fbbf24 !important; /* Yellow instead of cyan */
        }
        .color-blind-mode .bg-cyan-400 {
          background-color: #fbbf24 !important;
        }
        .color-blind-mode .border-cyan-400 {
          border-color: #fbbf24 !important;
        }
        .color-blind-mode .ring-cyan-400 {
          --tw-ring-color: #fbbf24 !important;
        }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes slide-in-right {
          from { opacity: 0; transform: translateX(30px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes counter {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        
        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out;
        }
        
        .animate-slide-up-delay {
          animation: slide-up 0.8s ease-out 0.2s both;
        }
        
        .animate-slide-up-delay-2 {
          animation: slide-up 0.8s ease-out 0.4s both;
        }
        
        .animate-slide-in-left {
          animation: slide-in-left 0.8s ease-out;
        }
        
        .animate-slide-in-right {
          animation: slide-in-right 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out;
        }
        
        .animate-counter {
          animation: counter 1s ease-out 0.5s both;
        }
      `}</style>
    </>
  )
}
