// Waide Mobility - Vanilla JavaScript Functionality

// DOM Content Loaded Event
document.addEventListener("DOMContentLoaded", () => {
  initializeApp()
})

// Initialize Application
function initializeApp() {
  initializeAccessibilityWidget()
  initializeCarousel()
  initializePricingToggle()
  initializeForms()
  initializeAnimations()
  initializeNavigation()
  initializeMapOverlay()
}

// Accessibility Widget Functionality
function initializeAccessibilityWidget() {
  const toggle = document.getElementById("accessibility-toggle")
  const panel = document.getElementById("accessibility-panel")

  if (!toggle || !panel) return

  // Toggle panel visibility
  toggle.addEventListener("click", () => {
    panel.classList.toggle("show")
  })

  // Close panel when clicking outside
  document.addEventListener("click", (e) => {
    if (!toggle.contains(e.target) && !panel.contains(e.target)) {
      panel.classList.remove("show")
    }
  })

  // Accessibility controls
  const controls = {
    "font-size-increase": () => adjustFontSize(1.1),
    "font-size-decrease": () => adjustFontSize(0.9),
    "high-contrast": () => toggleHighContrast(),
    "focus-mode": () => toggleFocusMode(),
    "dyslexia-font": () => toggleDyslexiaFont(),
    "color-blind-mode": () => toggleColorBlindMode(),
  }

  Object.keys(controls).forEach((id) => {
    const button = document.getElementById(id)
    if (button) {
      button.addEventListener("click", function () {
        controls[id]()
        this.classList.toggle("active")
      })
    }
  })
}

// Font Size Adjustment
let currentFontSize = 1
function adjustFontSize(multiplier) {
  currentFontSize *= multiplier
  currentFontSize = Math.max(0.8, Math.min(1.5, currentFontSize))
  document.documentElement.style.fontSize = currentFontSize * 16 + "px"
}

// High Contrast Mode
function toggleHighContrast() {
  document.body.classList.toggle("high-contrast")
}

// Focus Mode for ADHD
function toggleFocusMode() {
  document.body.classList.toggle("focus-mode")
}

// Dyslexia Friendly Font
function toggleDyslexiaFont() {
  document.body.classList.toggle("dyslexia-font")
}

// Color Blind Support
function toggleColorBlindMode() {
  document.body.classList.toggle("color-blind-support")
}

// Carousel Functionality
function initializeCarousel() {
  const carousel = document.getElementById("spacesCarousel")
  if (!carousel) return

  // Pause animation on hover
  carousel.addEventListener("mouseenter", function () {
    this.style.animationPlayState = "paused"
  })

  carousel.addEventListener("mouseleave", function () {
    this.style.animationPlayState = "running"
  })

  // Add click handlers to carousel cards
  const carouselCards = carousel.querySelectorAll(".carousel-card")
  carouselCards.forEach((card) => {
    card.addEventListener("click", function () {
      const title = this.querySelector("h4").textContent
      showSpaceDetails(title)
    })
  })
}

// Show space details (placeholder functionality)
function showSpaceDetails(spaceTitle) {
  alert(`Learn more about ${spaceTitle} navigation solutions. Contact us for a demo!`)
}

// Pricing Toggle Functionality
function initializePricingToggle() {
  const toggle = document.getElementById("pricingToggle")
  if (!toggle) return

  let isYearly = false

  toggle.addEventListener("click", function () {
    isYearly = !isYearly
    this.classList.toggle("active")
    updatePricing(isYearly)
  })
}

// Update pricing display
function updatePricing(isYearly) {
  const amounts = document.querySelectorAll(".amount")
  amounts.forEach((amount) => {
    const monthly = Number.parseInt(amount.dataset.monthly)
    const yearly = Number.parseInt(amount.dataset.yearly)

    if (monthly && yearly) {
      amount.textContent = isYearly ? yearly : monthly
    }
  })

  const periods = document.querySelectorAll(".period")
  periods.forEach((period) => {
    period.textContent = isYearly ? "/year" : "/month"
  })
}

// Form Functionality
function initializeForms() {
  initializeAuthForms()
  initializeContactForm()
  initializePasswordToggles()
}

// Authentication Forms
function initializeAuthForms() {
  const loginForm = document.getElementById("loginForm")
  const signupForm = document.getElementById("signupForm")

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin)
  }

  if (signupForm) {
    signupForm.addEventListener("submit", handleSignup)
  }
}

// Handle Login
function handleLogin(e) {
  e.preventDefault()
  const formData = new FormData(e.target)
  const email = formData.get("email") || document.getElementById("email").value
  const password = formData.get("password") || document.getElementById("password").value

  // Basic validation
  if (!email || !password) {
    showNotification("Please fill in all fields", "error")
    return
  }

  if (!isValidEmail(email)) {
    showNotification("Please enter a valid email address", "error")
    return
  }

  // Simulate login process
  showLoadingState(e.target.querySelector('button[type="submit"]'))

  setTimeout(() => {
    hideLoadingState(e.target.querySelector('button[type="submit"]'))
    showNotification("Login successful! Redirecting...", "success")

    setTimeout(() => {
      window.location.href = "index.html"
    }, 1500)
  }, 2000)
}

// Handle Signup
function handleSignup(e) {
  e.preventDefault()
  const firstName = document.getElementById("firstName").value
  const lastName = document.getElementById("lastName").value
  const email = document.getElementById("email").value
  const password = document.getElementById("password").value
  const confirmPassword = document.getElementById("confirmPassword").value
  const terms = document.getElementById("terms").checked

  // Validation
  if (!firstName || !lastName || !email || !password || !confirmPassword) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  if (!isValidEmail(email)) {
    showNotification("Please enter a valid email address", "error")
    return
  }

  if (password.length < 8) {
    showNotification("Password must be at least 8 characters long", "error")
    return
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", "error")
    return
  }

  if (!terms) {
    showNotification("Please accept the terms and conditions", "error")
    return
  }

  // Simulate signup process
  showLoadingState(e.target.querySelector('button[type="submit"]'))

  setTimeout(() => {
    hideLoadingState(e.target.querySelector('button[type="submit"]'))
    showNotification("Account created successfully! Please check your email to verify your account.", "success")

    setTimeout(() => {
      window.location.href = "login.html"
    }, 2000)
  }, 2000)
}

// Contact Form
function initializeContactForm() {
  const contactForm = document.getElementById("contactForm")
  if (!contactForm) return

  // Check for plan parameter in URL
  const urlParams = new URLSearchParams(window.location.search)
  const plan = urlParams.get("plan")
  if (plan) {
    const planGroup = document.getElementById("planGroup")
    const selectedPlan = document.getElementById("selectedPlan")
    if (planGroup && selectedPlan) {
      planGroup.style.display = "block"
      selectedPlan.value = plan.charAt(0).toUpperCase() + plan.slice(1)
    }
  }

  contactForm.addEventListener("submit", handleContactForm)
}

// Handle Contact Form
function handleContactForm(e) {
  e.preventDefault()

  const formData = {
    firstName: document.getElementById("firstName").value,
    lastName: document.getElementById("lastName").value,
    email: document.getElementById("email").value,
    phone: document.getElementById("phone").value,
    company: document.getElementById("company").value,
    spaceType: document.getElementById("spaceType").value,
    spaceSize: document.getElementById("spaceSize").value,
    message: document.getElementById("message").value,
  }

  // Validation
  if (
    !formData.firstName ||
    !formData.lastName ||
    !formData.email ||
    !formData.company ||
    !formData.spaceType ||
    !formData.spaceSize
  ) {
    showNotification("Please fill in all required fields", "error")
    return
  }

  if (!isValidEmail(formData.email)) {
    showNotification("Please enter a valid email address", "error")
    return
  }

  // Show loading state
  const submitBtn = document.getElementById("submitBtn")
  showLoadingState(submitBtn)

  // Simulate form submission
  setTimeout(() => {
    hideLoadingState(submitBtn)
    showSuccessModal()
  }, 2000)
}

// Password Toggle Functionality
function initializePasswordToggles() {
  // This function is called from HTML onclick attributes
}

function togglePassword(inputId) {
  const input = document.getElementById(inputId)
  const button = input.nextElementSibling
  const icon = button.querySelector("svg")

  if (input.type === "password") {
    input.type = "text"
    icon.innerHTML = `
            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `
  } else {
    input.type = "password"
    icon.innerHTML = `
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        `
  }
}

// Success Modal
function showSuccessModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.classList.add("show")
  }
}

function closeModal() {
  const modal = document.getElementById("successModal")
  if (modal) {
    modal.classList.remove("show")
  }
  window.location.href = "index.html"
}

// Utility Functions
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

function showLoadingState(button) {
  if (!button) return

  button.disabled = true
  const originalText = button.innerHTML
  button.dataset.originalText = originalText

  button.innerHTML = `
        <div style="display: flex; align-items: center; gap: 0.5rem;">
            <div style="width: 16px; height: 16px; border: 2px solid rgba(0,0,0,0.2); border-top: 2px solid #000; border-radius: 50%; animation: spin 1s linear infinite;"></div>
            Sending...
        </div>
    `
}

function hideLoadingState(button) {
  if (!button) return

  button.disabled = false
  button.innerHTML = button.dataset.originalText || "Submit"
}

function showNotification(message, type = "info") {
  // Create notification element
  const notification = document.createElement("div")
  notification.className = `notification notification-${type}`
  notification.style.cssText = `
        position: fixed;
        top: 2rem;
        right: 2rem;
        background: ${type === "error" ? "#dc2626" : type === "success" ? "#059669" : "#06b6d4"};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 16px rgba(0,0,0,0.2);
        z-index: 1000;
        max-width: 300px;
        font-weight: 500;
        animation: slideInRight 0.3s ease;
    `
  notification.textContent = message

  document.body.appendChild(notification)

  // Remove after 5 seconds
  setTimeout(() => {
    notification.style.animation = "slideOutRight 0.3s ease"
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification)
      }
    }, 300)
  }, 5000)
}

// Animation Initialization
function initializeAnimations() {
  // Intersection Observer for scroll animations
  const observerOptions = {
    threshold: 0.1,
    rootMargin: "0px 0px -50px 0px",
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.style.opacity = "1"
        entry.target.style.transform = "translateY(0)"
      }
    })
  }, observerOptions)

  // Observe elements with animation classes
  const animatedElements = document.querySelectorAll(
    ".animate-fade-in, .animate-fade-in-up, .animate-slide-in-left, .animate-slide-in-right",
  )
  animatedElements.forEach((el) => {
    el.style.opacity = "0"
    el.style.transform = "translateY(30px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"
    observer.observe(el)
  })

  // Counter animation for stats
  const statNumbers = document.querySelectorAll(".stat-number")
  const statsObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target)
        statsObserver.unobserve(entry.target)
      }
    })
  }, observerOptions)

  statNumbers.forEach((stat) => statsObserver.observe(stat))
}

// Counter Animation
function animateCounter(element) {
  const text = element.textContent
  const number = Number.parseInt(text.replace(/[^\d]/g, ""))
  const suffix = text.replace(/[\d]/g, "")

  if (isNaN(number)) return

  let current = 0
  const increment = number / 50
  const timer = setInterval(() => {
    current += increment
    if (current >= number) {
      current = number
      clearInterval(timer)
    }
    element.textContent = Math.floor(current) + suffix
  }, 30)
}

// Navigation Functionality
function initializeNavigation() {
  // Smooth scrolling for anchor links
  const anchorLinks = document.querySelectorAll('a[href^="#"]')
  anchorLinks.forEach((link) => {
    link.addEventListener("click", function (e) {
      e.preventDefault()
      const targetId = this.getAttribute("href").substring(1)
      const targetElement = document.getElementById(targetId)

      if (targetElement) {
        targetElement.scrollIntoView({
          behavior: "smooth",
          block: "start",
        })
      }
    })
  })

  // Active navigation highlighting
  const navLinks = document.querySelectorAll(".nav-link")
  const sections = document.querySelectorAll("section[id]")

  if (sections.length > 0) {
    const navObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const activeLink = document.querySelector(`.nav-link[href="#${entry.target.id}"]`)
            navLinks.forEach((link) => link.classList.remove("active"))
            if (activeLink) {
              activeLink.classList.add("active")
            }
          }
        })
      },
      { threshold: 0.5 },
    )

    sections.forEach((section) => navObserver.observe(section))
  }
}

// Keyboard Navigation Support
document.addEventListener("keydown", (e) => {
  // ESC key closes modals and panels
  if (e.key === "Escape") {
    const modal = document.querySelector(".modal.show")
    const panel = document.querySelector(".accessibility-panel.show")

    if (modal) {
      closeModal()
    }
    if (panel) {
      panel.classList.remove("show")
    }
  }

  // Enter key on buttons
  if (e.key === "Enter" && e.target.tagName === "BUTTON") {
    e.target.click()
  }
})

// Form Validation Helpers
function validateForm(formElement) {
  const requiredFields = formElement.querySelectorAll("[required]")
  let isValid = true

  requiredFields.forEach((field) => {
    if (!field.value.trim()) {
      field.classList.add("error")
      isValid = false
    } else {
      field.classList.remove("error")
    }
  })

  return isValid
}

// Real-time form validation
document.addEventListener("input", (e) => {
  if (e.target.matches("input, textarea, select")) {
    if (e.target.hasAttribute("required") && e.target.value.trim()) {
      e.target.classList.remove("error")
    }

    // Email validation
    if (e.target.type === "email" && e.target.value) {
      if (isValidEmail(e.target.value)) {
        e.target.classList.remove("error")
      } else {
        e.target.classList.add("error")
      }
    }
  }
})

// Map Overlay Functionality for Fullscreen Detection
function initializeMapOverlay() {
  const mapContainer = document.querySelector(".map-container")
  const fullscreenOverlay = document.querySelector(".map-logo-overlay-fullscreen")

  if (!mapContainer || !fullscreenOverlay) return

  // Function to show/hide fullscreen overlay based on viewport width
  function checkViewportAndShowOverlay() {
    const viewportWidth = window.innerWidth

    // Show overlay when viewport is large (desktop) or in fullscreen
    if (viewportWidth >= 900) {
      fullscreenOverlay.style.display = "flex"
    } else {
      fullscreenOverlay.style.display = "none"
    }
  }

  // Function to handle fullscreen changes
  function handleFullscreenChange() {
    const isFullscreen =
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement ||
      document.msFullscreenElement

    if (isFullscreen && (isFullscreen === mapContainer || mapContainer.contains(isFullscreen))) {
      fullscreenOverlay.style.display = "flex"
    } else if (!isFullscreen) {
      // Check viewport width when exiting fullscreen
      checkViewportAndShowOverlay()
    }
  }

  // Listen for viewport resize
  window.addEventListener("resize", checkViewportAndShowOverlay)

  // Listen for fullscreen changes
  document.addEventListener("fullscreenchange", handleFullscreenChange)
  document.addEventListener("webkitfullscreenchange", handleFullscreenChange)
  document.addEventListener("mozfullscreenchange", handleFullscreenChange)
  document.addEventListener("MSFullscreenChange", handleFullscreenChange)

  // Initial check
  checkViewportAndShowOverlay()

  // Add click handler to iframe for fullscreen detection
  const iframe = mapContainer.querySelector("iframe")
  if (iframe) {
    // Monitor iframe for fullscreen events
    iframe.addEventListener("load", () => {
      try {
        // Try to access iframe content (may be blocked by CORS)
        const iframeDoc = iframe.contentDocument || iframe.contentWindow.document
        if (iframeDoc) {
          iframeDoc.addEventListener("fullscreenchange", handleFullscreenChange)
          iframeDoc.addEventListener("webkitfullscreenchange", handleFullscreenChange)
        }
      } catch (e) {
        // CORS blocked - use alternative detection
        console.log("Cross-origin iframe detected, using viewport-based overlay")
      }
    })
  }
}

// Add CSS for animations and notifications
const style = document.createElement("style")
style.textContent = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    @keyframes slideInRight {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOutRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .form-input.error,
    .form-select.error,
    .form-textarea.error {
        border-color: #dc2626 !important;
        box-shadow: 0 0 0 2px rgba(220, 38, 38, 0.2) !important;
    }
    
    .nav-link.active {
        color: #06b6d4 !important;
    }
    
    /* Focus styles for accessibility */
    button:focus,
    input:focus,
    select:focus,
    textarea:focus,
    a:focus {
        outline: 2px solid #06b6d4;
        outline-offset: 2px;
    }
    
    /* Reduced motion support */
    @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        .carousel-track {
            animation: none !important;
        }
    }
`
document.head.appendChild(style)

// Error handling
window.addEventListener("error", (e) => {
  console.error("JavaScript Error:", e.error)
  // Could send error reports to analytics service
})

// Performance monitoring
window.addEventListener("load", () => {
  // Log page load time for performance monitoring
  const loadTime = performance.now()
  console.log(`Page loaded in ${Math.round(loadTime)}ms`)
})

// Service Worker Registration (for future PWA features)
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    // Uncomment when service worker is implemented
    // navigator.serviceWorker.register('/sw.js')
    //     .then(registration => console.log('SW registered'))
    //     .catch(error => console.log('SW registration failed'));
  })
}
