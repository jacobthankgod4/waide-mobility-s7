'use strict'

/* Netlify adapter for the enquiry endpoint.
   The handler itself lives in api/enquiry.js (Vercel's serverless format) so
   there is one implementation of validation, rate limiting, Brevo delivery
   and storage. netlify.toml rewrites /api/* here, which keeps the browser's
   fetch("/api/enquiry") unchanged on both hosts. */

const enquiry = require('../../api/enquiry.js')

exports.handler = async function (event) {
  const req = {
    method: event.httpMethod,
    headers: Object.assign({}, event.headers),
    body: event.body,
    socket: {}
  }

  let statusCode = 200
  let payload = { ok: false, error: 'no_response' }

  const res = {
    setHeader: function () {},
    status: function (code) {
      statusCode = code
      return this
    },
    json: function (value) {
      payload = value
      return this
    }
  }

  await enquiry(req, res)

  return {
    statusCode: statusCode,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'no-store'
    },
    body: JSON.stringify(payload)
  }
}
