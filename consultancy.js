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
      if (window.innerWidth > 980) closeMenu()
    })
  }

  /* Contact form: validates, then opens the visitor's email client with a
     complete message. It does not pretend to submit to a server. */
  var form = document.getElementById("cx-contact-form")

  if (form) {
    var status = document.getElementById("cx-form-status")

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

  /* Print button for the capability statement */
  var printBtn = document.querySelector("[data-cx-print]")
  if (printBtn) {
    printBtn.addEventListener("click", function () {
      window.print()
    })
  }
})()
