/* Waide Mobility — consultancy site behaviour
   Mobile navigation, form preparation and small progressive enhancements.
   No third-party scripts. */
;(function () {
  "use strict"

  var menuBtn = document.querySelector(".cx-menu-btn")
  var nav = document.getElementById("cx-primary-nav")

  function closeMenu() {
    if (!menuBtn || !nav) return
    nav.classList.remove("is-open")
    menuBtn.setAttribute("aria-expanded", "false")
  }

  if (menuBtn && nav) {
    menuBtn.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open")
      menuBtn.setAttribute("aria-expanded", open ? "true" : "false")
    })

    nav.addEventListener("click", function (event) {
      if (event.target.closest("a")) closeMenu()
    })

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && nav.classList.contains("is-open")) {
        closeMenu()
        menuBtn.focus()
      }
    })

    window.addEventListener("resize", function () {
      if (window.innerWidth > 1180) closeMenu()
    })
  }

  /* Contact form: validates, then opens the visitor's email client with a
     complete message. It does not pretend to submit to a server. */
  var form = document.getElementById("cx-contact-form")

  if (form) {
    var status = document.getElementById("cx-form-status")

    /* Deep links from the supplies pages preselect the enquiry type and
       subject, e.g. contact.html?division=supplies&subject=Supplier%20dossier */
    try {
      var params = new URLSearchParams(window.location.search)
      var categoryField = document.getElementById("cx-category")
      var division = params.get("division")
      if (categoryField) {
        if (division === "supplies") categoryField.value = "supplies"
        else if (division === "mapping") categoryField.value = "consultancy"
      }
      var subjectField = document.getElementById("cx-subject")
      var presetSubject = params.get("subject")
      if (subjectField && presetSubject && !subjectField.value) {
        subjectField.value = presetSubject
      }
    } catch (error) {
      /* Older browsers keep the plain form. */
    }

    var setStatus = function (message, state) {
      if (!status) return
      status.textContent = message
      if (state) status.setAttribute("data-state", state)
      else status.removeAttribute("data-state")
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault()

      /* Honeypot: a real visitor never fills this hidden field. */
      var trap = document.getElementById("cx-website")
      if (trap && trap.value.trim() !== "") {
        setStatus("Your message could not be prepared. Please email sales@waidemobility.com directly.", "error")
        return
      }

      if (!form.checkValidity()) {
        form.reportValidity()
        setStatus("Please complete the required fields before sending.", "error")
        return
      }

      var consent = form.querySelector("#cx-consent")
      if (consent && !consent.checked) {
        setStatus("Please confirm that we may use your details to reply.", "error")
        consent.focus()
        return
      }

      var get = function (id) {
        var el = document.getElementById(id)
        return el ? el.value.trim() : ""
      }

      var categoryLabels = {
        general: "General enquiry",
        supplies: "Medical supplies quotation",
        consultancy: "Consultancy project",
        procurement: "Procurement or tender",
        partnership: "Technical partnership",
        platform: "Product and platform"
      }

      var lines = [
        "Name: " + get("cx-name"),
        "Organisation: " + (get("cx-organisation") || "not given"),
        "Email: " + get("cx-email"),
        "Enquiry type: " + (categoryLabels[get("cx-category")] || get("cx-category")),
        "",
        get("cx-message")
      ]

      var subject = (get("cx-subject") || "Website enquiry") + " — " + (categoryLabels[get("cx-category")] || "Enquiry")
      var mailto =
        "mailto:sales@waidemobility.com" +
        "?subject=" + encodeURIComponent(subject) +
        "&body=" + encodeURIComponent(lines.join("\n"))

      window.location.href = mailto
      setStatus(
        "Your email app should open with the message ready to send. If it does not, email sales@waidemobility.com directly.",
        "ok"
      )
    })
  }

  /* Project image gallery: horizontal scroll-snap strip with buttons,
     thumbnails, keyboard support and an index readout. Without JavaScript
     the strip is still scrollable and every caption stays visible. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)")

  Array.prototype.forEach.call(document.querySelectorAll("[data-gallery]"), function (root) {
    var track = root.querySelector("[data-gallery-track]")
    if (!track) return

    var manifest = root.hasAttribute("data-gallery-manifest") ? window.waideNovareGallery : null
    var slideIdPrefix = root.getAttribute("data-gallery-id-prefix") || "home-nv"
    var thumbsList = root.querySelector("[data-gallery-thumbs]")
    var dateNav = root.querySelector("[data-gallery-dates]")

    if (manifest && manifest.length) {
      var sourceManifest = manifest
      manifest = window.waideNovareStoryOrder.map(function (capture) {
        var item = sourceManifest[capture - 1]
        return {
          capture: capture,
          date: item.date,
          stage: item.stage,
          caption: item.caption
        }
      })
      var dateLookup = {}
      track.textContent = ""
      if (thumbsList) thumbsList.textContent = ""
      if (dateNav) dateNav.textContent = ""

      manifest.forEach(function (item, index) {
        var imagePath = "public/novare/captures-cropped/novare-" + ("0" + item.capture).slice(-2) + ".jpg"
        var slideId = slideIdPrefix + "-" + (index + 1)
        var slide = document.createElement("div")
        slide.className = "cx-gallery-slide"
        slide.id = slideId
        slide.setAttribute("role", "group")
        slide.setAttribute("aria-roledescription", "slide")
        slide.setAttribute("aria-label", (index + 1) + " of " + manifest.length + ": " + item.caption)

        var image = document.createElement("img")
        image.src = imagePath
        image.alt = item.caption
        image.width = item.capture <= 15 ? 1277 : 1280
        image.height = item.capture >= 52 ? 610 : item.capture === 11 ? 654 : 715
        image.loading = index === 0 ? "eager" : "lazy"
        image.decoding = "async"
        slide.appendChild(image)

        var caption = document.createElement("p")
        caption.className = "cx-gallery-caption"
        var number = document.createElement("span")
        number.className = "cx-gallery-num"
        number.textContent = ("0" + (index + 1)).slice(-2)
        var description = document.createElement("span")
        description.textContent = item.caption
        caption.appendChild(number)
        caption.appendChild(description)
        slide.appendChild(caption)
        track.appendChild(slide)

        if (thumbsList) {
          var listItem = document.createElement("li")
          var link = document.createElement("a")
          link.href = "#" + slideId
          link.setAttribute("data-gallery-thumb", "")
          link.setAttribute("aria-label", "Show image " + (index + 1) + ": " + item.caption)
          var thumbnail = document.createElement("img")
          thumbnail.src = imagePath
          thumbnail.alt = ""
          thumbnail.width = 96
          thumbnail.height = 60
          thumbnail.loading = "lazy"
          thumbnail.decoding = "async"
          link.appendChild(thumbnail)
          listItem.appendChild(link)
          thumbsList.appendChild(listItem)
        }

        if (dateNav && !dateLookup[item.date]) {
          var dateButton = document.createElement("button")
          dateButton.type = "button"
          dateButton.className = "cx-gallery-date"
          dateButton.textContent = item.date.replace(" 2025", "")
          dateButton.setAttribute("data-gallery-jump", index)
          dateButton.setAttribute("data-gallery-date", item.date)
          dateButton.setAttribute("aria-label", "Jump to captures from " + item.date)
          dateNav.appendChild(dateButton)
          dateLookup[item.date] = true
        }
      })

      if (dateNav) {
        var monthOrder = { Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6, Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12 }
        var dateButtons = Array.prototype.slice.call(dateNav.children)
        dateButtons.sort(function (left, right) {
          function dateValue(button) {
            var parts = button.getAttribute("data-gallery-date").split(" ")
            return Number(parts[2]) * 10000 + monthOrder[parts[1]] * 100 + Number(parts[0])
          }
          return dateValue(left) - dateValue(right)
        }).forEach(function (button) {
          dateNav.appendChild(button)
        })
      }

      var manifestTotal = root.querySelector("[data-gallery-total]")
      if (manifestTotal) manifestTotal.textContent = manifest.length
      var manifestProgress = root.querySelector("[data-gallery-progress]")
      if (manifestProgress) manifestProgress.setAttribute("aria-valuemax", manifest.length)
    }

    var slides = track.querySelectorAll(".cx-gallery-slide")
    var prev = root.querySelector("[data-gallery-prev]")
    var next = root.querySelector("[data-gallery-next]")
    var indexEl = root.querySelector("[data-gallery-index]")
    var statusEl = root.querySelector("[data-gallery-status]")
    var thumbs = root.querySelectorAll("[data-gallery-thumb]")
    var jumps = root.querySelectorAll("[data-gallery-jump]")
    var totalEl = root.querySelector("[data-gallery-total]")
    var currentDateEl = root.querySelector("[data-gallery-current-date]")
    var currentStageEl = root.querySelector("[data-gallery-current-stage]")
    var progressBar = root.querySelector("[data-gallery-progress]")
    var count = slides.length
    if (!count) return
    var lastIndex = 0

    function currentIndex() {
      var width = track.clientWidth || 1
      return Math.min(count - 1, Math.max(0, Math.round(track.scrollLeft / width)))
    }

    var compactGallery = window.matchMedia("(max-width: 760px)")

    function fitTrack(index) {
      if (!root.classList.contains("cx-gallery--novare")) return
      if (!compactGallery.matches) {
        track.style.height = ""
        return
      }

      var slide = slides[index]
      var image = slide && slide.querySelector("img")
      var caption = slide && slide.querySelector(".cx-gallery-caption")
      if (!image || !caption) return

      var height = image.getBoundingClientRect().height + caption.getBoundingClientRect().height
      if (height > 0 && Math.abs(track.getBoundingClientRect().height - height) > 0.5) {
        track.style.height = height + "px"
      }
    }

    function goTo(index) {
      var target = Math.min(count - 1, Math.max(0, index))
      fitTrack(target)
      track.scrollTo({
        left: target * track.clientWidth,
        behavior: reduceMotion.matches ? "auto" : "smooth"
      })
      if (thumbs[target] && thumbsList) {
        var listRect = thumbsList.getBoundingClientRect()
        var thumbRect = thumbs[target].getBoundingClientRect()
        var visibleLeft = listRect.left + thumbsList.clientLeft
        var visibleTop = listRect.top + thumbsList.clientTop
        var visibleRight = visibleLeft + thumbsList.clientWidth
        var visibleBottom = visibleTop + thumbsList.clientHeight
        var scrollLeft = thumbsList.scrollLeft
        var scrollTop = thumbsList.scrollTop

        if (thumbRect.left < visibleLeft) scrollLeft += thumbRect.left - visibleLeft
        else if (thumbRect.right > visibleRight) scrollLeft += thumbRect.right - visibleRight
        if (thumbRect.top < visibleTop) scrollTop += thumbRect.top - visibleTop
        else if (thumbRect.bottom > visibleBottom) scrollTop += thumbRect.bottom - visibleBottom

        if (scrollLeft !== thumbsList.scrollLeft || scrollTop !== thumbsList.scrollTop) {
          thumbsList.scrollTo({
            left: scrollLeft,
            top: scrollTop,
            behavior: reduceMotion.matches ? "auto" : "smooth"
          })
        }
      }
    }

    function sync() {
      var index = currentIndex()
      lastIndex = index
      fitTrack(index)
      if (indexEl) indexEl.textContent = ("0" + (index + 1)).slice(-2)
      if (totalEl) totalEl.textContent = count
      if (progressBar) {
        progressBar.setAttribute("aria-valuenow", index + 1)
        var fill = progressBar.querySelector("span")
        if (fill) fill.style.width = ((index + 1) / count * 100) + "%"
      }
      Array.prototype.forEach.call(thumbs, function (thumb, n) {
        if (n === index) thumb.setAttribute("aria-current", "true")
        else thumb.removeAttribute("aria-current")
      })
      if (manifest && manifest[index]) {
        if (currentDateEl) currentDateEl.textContent = manifest[index].date
        if (currentStageEl) currentStageEl.textContent = manifest[index].stage
        Array.prototype.forEach.call(jumps, function (jump) {
          if (jump.getAttribute("data-gallery-date") === manifest[index].date) {
            jump.setAttribute("aria-current", "date")
          } else {
            jump.removeAttribute("aria-current")
          }
        })
      }
      if (statusEl) statusEl.textContent = "Image " + (index + 1) + " of " + count
    }

    var frame = 0
    track.addEventListener("scroll", function () {
      if (frame) return
      frame = window.requestAnimationFrame(function () {
        frame = 0
        sync()
      })
    })

    if (prev) prev.addEventListener("click", function () { goTo(currentIndex() - 1) })
    if (next) next.addEventListener("click", function () { goTo(currentIndex() + 1) })

    Array.prototype.forEach.call(thumbs, function (thumb, n) {
      thumb.addEventListener("click", function (event) {
        event.preventDefault()
        goTo(n)
      })
    })

    Array.prototype.forEach.call(jumps, function (jump) {
      jump.addEventListener("click", function () {
        goTo(parseInt(jump.getAttribute("data-gallery-jump"), 10))
      })
    })

    track.addEventListener("keydown", function (event) {
      if (event.key === "ArrowLeft") { event.preventDefault(); goTo(currentIndex() - 1) }
      else if (event.key === "ArrowRight") { event.preventDefault(); goTo(currentIndex() + 1) }
      else if (event.key === "Home") { event.preventDefault(); goTo(0) }
      else if (event.key === "End") { event.preventDefault(); goTo(count - 1) }
    })

    /* Keep the current slide aligned when the slide width changes. */
    window.addEventListener("resize", function () {
      var previous = track.style.scrollBehavior
      track.style.scrollBehavior = "auto"
      track.scrollLeft = lastIndex * track.clientWidth
      track.style.scrollBehavior = previous
      sync()
    })

    sync()
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(function () { fitTrack(currentIndex()) })
    }
  })

  /* Print button for the capability statement */
  var printBtn = document.querySelector("[data-cx-print]")
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print()
    })
  }
})()
