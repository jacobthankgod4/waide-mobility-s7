/* Waide Mobility — consultancy site behaviour
   Mobile navigation, form preparation and small progressive enhancements.
   No analytics or advertising scripts. */
;(function () {
  "use strict"

  /* Sienna accessibility widget compatibility.
     The widget snapshots each element's computed font size into an inline px
     value (and data-asw-org-font-size). That freezes responsive typography:
     a heading measured at desktop width stays at its desktop px size after the
     viewport narrows. We keep the widget's text-scaling feature but express its
     value as a ratio against the element's current responsive size, then
     re-measure on resize and orientation change. When the ratio is 1 we remove
     the inline value entirely and let the stylesheet and media queries work.
     This touches only elements the widget itself has marked. */
  var widgetFont = (function () {
    var observer = null
    var scale = null
    var resizeTimer = 0
    var frame = 0
    var writing = false

    if (typeof MutationObserver !== "function" || typeof window.getComputedStyle !== "function") {
      return { refresh: function () {} }
    }

    scale = new Map()

    function inlineRatio(el) {
      var inline = parseFloat(el.style.fontSize)
      var original = parseFloat(el.getAttribute("data-asw-org-font-size"))
      if (!isFinite(inline) || !isFinite(original) || original <= 0) return null
      return inline / original
    }

    function candidates() {
      var list = []
      var marked = document.querySelectorAll("[data-asw-org-font-size]")
      Array.prototype.forEach.call(marked, function (el) {
        if (list.indexOf(el) === -1) list.push(el)
      })
      scale.forEach(function (ratio, el) {
        if (list.indexOf(el) === -1) list.push(el)
      })
      return list
    }

    function normalize() {
      if (writing) return
      frame = 0
      var elements = candidates()
      if (!elements.length) return

      var ratios = []
      elements.forEach(function (el) {
        var ratio = inlineRatio(el)
        if (ratio === null) ratio = scale.get(el)
        if (ratio === null || !isFinite(ratio) || ratio <= 0 || ratio > 5) return
        if (Math.abs(ratio - 1) < 0.005) ratio = 1
        ratios.push({ element: el, ratio: ratio })
      })
      if (!ratios.length) return

      writing = true
      observer.disconnect()

      /* Pass 1: remove every frozen size so inherited sizes are responsive. */
      ratios.forEach(function (item) {
        item.element.style.removeProperty("font-size")
        item.element.removeAttribute("data-asw-org-font-size")
      })

      /* Pass 2: measure all responsive base sizes before applying any scale. */
      ratios.forEach(function (item) {
        item.base = parseFloat(window.getComputedStyle(item.element).fontSize)
      })

      /* Pass 3: reapply only a real user-chosen scale. */
      ratios.forEach(function (item) {
        if (!isFinite(item.base) || item.base <= 0) {
          scale.delete(item.element)
          return
        }
        if (item.ratio === 1) {
          scale.delete(item.element)
          return
        }
        scale.set(item.element, item.ratio)
        item.element.setAttribute("data-asw-org-font-size", String(item.base))
        item.element.style.fontSize = (item.base * item.ratio).toFixed(2) + "px"
      })

      writing = false
      observer.observe(document.documentElement, {
        subtree: true,
        attributes: true,
        attributeFilter: ["style"]
      })
    }

    function schedule() {
      if (writing || frame) return
      if (window.requestAnimationFrame) {
        frame = window.requestAnimationFrame(normalize)
      } else {
        frame = window.setTimeout(normalize, 50)
      }
    }

    function refresh() {
      window.clearTimeout(resizeTimer)
      resizeTimer = window.setTimeout(normalize, 150)
    }

    observer = new MutationObserver(function (records) {
      for (var i = 0; i < records.length; i++) {
        var target = records[i].target
        if (target && target.style && target.style.fontSize) {
          schedule()
          return
        }
      }
    })

    observer.observe(document.documentElement, {
      subtree: true,
      attributes: true,
      attributeFilter: ["style"]
    })

    window.addEventListener("resize", refresh)
    window.addEventListener("orientationchange", refresh)
    window.addEventListener("load", normalize)
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(normalize)
    }

    return { refresh: refresh }
  })()

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

  /* Scroll reveal. The class is added here rather than in the HTML, so a
     visitor without JavaScript, with reduced motion, or with an old browser
     always sees the finished page. Each section and card group slides in once
     and is then unobserved; nothing re-animates while scrolling back up. */
  var motionAllowed = !(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches)

  if (motionAllowed && "IntersectionObserver" in window) {
    var revealTargets = document.querySelectorAll(
      "main > section:not(.cx-hero), main .cx-area, main .cx-cat, main .cx-service-row, " +
      "main .cx-step, main .cx-card, main .cx-division, main .cx-record"
    )

    if (revealTargets.length) {
      var revealObserver = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return
          entry.target.classList.add("is-visible")
          revealObserver.unobserve(entry.target)
        })
      }, { rootMargin: "0px 0px -6% 0px", threshold: 0.06 })

      Array.prototype.forEach.call(revealTargets, function (el) {
        var siblings = el.parentNode ? Array.prototype.indexOf.call(el.parentNode.children, el) : 0
        el.classList.add("cx-reveal")
        el.style.setProperty("--cx-reveal-delay", Math.min(Math.max(siblings, 0), 5) * 60 + "ms")
        revealObserver.observe(el)
      })
    }
  }

  /* Contact form: validates, then posts to /api/enquiry. The server stores the
     enquiry and notifies the procurement inbox, so the message is not lost on
     a machine with no desktop mail client. */
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
        else if (division === "mapping") categoryField.value = "mapping"
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

    var submitBtn = form.querySelector('button[type="submit"]')
    var submitLabel = submitBtn ? submitBtn.textContent : "Send enquiry"
    var donePanel = document.getElementById("cx-form-done")
    var doneRef = document.getElementById("cx-form-ref")
    var sending = false

    function lock(state) {
      if (!submitBtn) return
      submitBtn.disabled = state
      submitBtn.textContent = state ? "Sending…" : submitLabel
    }

    function showDone(reference) {
      if (!donePanel) {
        setStatus("Enquiry received. Your reference is " + reference + ".", "ok")
        return
      }
      if (doneRef) doneRef.textContent = reference
      setStatus("", null)
      form.hidden = true
      donePanel.hidden = false
      donePanel.focus()
    }

    /* The AgentMail inbox sends the visitor the reference, so the enquiry can
       carry on by email. Best effort: the enquiry is already stored and
       notified, so a failure here changes nothing the visitor sees. */
    function acknowledge(payload, reference) {
      if (!reference) return
      fetch("/api/agent-mail", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({
          email: payload.email,
          name: payload.name,
          reference: reference,
          subject: payload.subject
        })
      }).catch(function () {})
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault()
      if (sending) return

      /* Honeypot: a real visitor never fills this hidden field. */
      var trap = document.getElementById("cx-website")

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

      var value = function (id) {
        var el = document.getElementById(id)
        return el ? el.value.trim() : ""
      }

      var payload = {
        name: value("cx-name"),
        organisation: value("cx-organisation"),
        email: value("cx-email"),
        category: value("cx-category"),
        subject: value("cx-subject"),
        message: value("cx-message"),
        consent: Boolean(consent && consent.checked),
        website: trap ? trap.value : "",
        source_page: window.location.pathname + window.location.search
      }

      sending = true
      lock(true)
      setStatus("Sending your enquiry…", "pending")

      var controller = typeof AbortController === "function" ? new AbortController() : null
      var timer = controller ? window.setTimeout(function () { controller.abort() }, 20000) : 0
      var fallback = "The enquiry did not reach us. Email sales@waidemobility.com with the same details — what you wrote is still in the form above."

      fetch("/api/enquiry", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify(payload),
        signal: controller ? controller.signal : undefined
      }).then(function (response) {
        return response.json().catch(function () { return {} }).then(function (data) {
          return { status: response.status, data: data }
        })
      }).then(function (result) {
        if (result.status === 200 && result.data && result.data.ok) {
          showDone(result.data.reference || "on request")
          acknowledge(payload, result.data.reference)
          return
        }
        if (result.status === 422) {
          setStatus("Some fields need checking. Confirm your name, email, enquiry type, subject, message and consent.", "error")
          return
        }
        if (result.status === 429) {
          setStatus("Several enquiries have come from this connection. Try again in ten minutes, or email sales@waidemobility.com.", "error")
          return
        }
        if (result.status === 503) {
          setStatus("The form cannot reach our inbox at the moment. Email sales@waidemobility.com — the message is still in the fields above.", "error")
          return
        }
        setStatus(fallback, "error")
      }).catch(function () {
        setStatus(fallback, "error")
      }).then(function () {
        if (timer) window.clearTimeout(timer)
        sending = false
        lock(false)
      })
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

  /* Procurement automation status.
     The console publishes automation-status.json into this repository and the
     markup carries the last published figures, so the page is complete without
     JavaScript. This refreshes those figures when the file can be read and
     leaves them alone when it cannot. */
  var statusBlock = document.querySelector("[data-automation-status]")
  if (statusBlock) {
    var setField = function (name, text) {
      if (!text) return
      var field = statusBlock.querySelector('[data-field="' + name + '"]')
      if (field) field.textContent = text
    }
    var day = function (value) {
      var date = new Date(value)
      if (!value || isNaN(date.getTime())) return null
      return date.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })
    }
    var tally = function (value) {
      return typeof value === "number" ? value.toLocaleString("en-GB") : null
    }

    fetch("automation-status.json", { headers: { Accept: "application/json" }, cache: "no-cache" })
      .then(function (response) {
        if (!response.ok) throw new Error("status unavailable")
        return response.json()
      })
      .then(function (data) {
        if (!data || data.schema !== "waide.automation-status/1") throw new Error("unknown schema")

        var controls = data.controls || {}
        var reference = data.reference || {}

        setField("published", day(data.generatedAt))
        if (controls.bidGateChecks) setField("gate-checks", String(controls.bidGateChecks))
        if (controls.authorityCapabilities) setField("capabilities", controls.authorityCapabilities + " across six roles")
        if (controls.correspondenceIntents) setField("intents", String(controls.correspondenceIntents))

        if (reference.sanctions) {
          var entries = tally(reference.sanctions.entries)
          var listed = day(reference.sanctions.generatedAt)
          if (entries) {
            setField("sanctions", entries + " entries from the " + reference.sanctions.source + " lists" + (listed ? ", generated " + listed : ""))
          }
        }

        if (reference.supplierRegistry) {
          var imported = tally(reference.supplierRegistry.imported)
          var retrieved = tally(reference.supplierRegistry.retrieved)
          var importDate = day(reference.supplierRegistry.importedAt)
          if (imported) {
            setField("registry", imported + " entities imported from " + retrieved + " retrieved from the " + reference.supplierRegistry.source + " registry" + (importDate ? ", " + importDate : ""))
          }
        }

        if (reference.exchangeRates) {
          var rateDate = day(reference.exchangeRates.asOf)
          setField("fx", reference.exchangeRates.source + (rateDate ? ", as of " + rateDate : ""))
        }

        if (controls.auditChain) {
          setField("audit", controls.auditChain.valid ? "Verified, SHA-256 hash chain" : "Integrity failure recorded")
        }

        statusBlock.setAttribute("data-automation-state", "current")
      })
      .catch(function () {
        statusBlock.setAttribute("data-automation-state", "unavailable")
      })
  }
})()
