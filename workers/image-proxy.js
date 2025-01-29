// Rate limiting configuration
const RATE_LIMIT = {
  maxRequests: 50,
  windowMs: 60000, // 1 minute
}

// In-memory store for rate limiting (resets on worker restart)
const ipRequests = new Map()

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Basic security checks
  if (request.method !== 'GET' && request.method !== 'OPTIONS') {
    return new Response('Method not allowed', { status: 405 })
  }

  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleCORS(request)
  }

  // Get client IP for rate limiting
  const clientIP = request.headers.get('cf-connecting-ip')
  
  // Apply rate limiting
  if (!checkRateLimit(clientIP)) {
    return new Response('Too many requests', { status: 429 })
  }

  // Get and validate the target URL
  const url = new URL(request.url)
  const imageUrl = url.pathname.startsWith('/proxy') ? 
    url.searchParams.get('url') : 
    url.searchParams.get('url')
  
  if (!imageUrl) {
    return new Response('Missing URL parameter', { 
      status: 400,
      headers: getCORSHeaders()
    })
  }

  // Validate URL
  try {
    new URL(imageUrl)
  } catch {
    return new Response('Invalid URL', { 
      status: 400,
      headers: getCORSHeaders()
    })
  }

  try {
    // Fetch the image with timeout
    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), 10000) // 10s timeout

    const response = await fetch(imageUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'annotate.today image proxy'
      }
    })

    clearTimeout(timeout)

    // Check if response is an image
    const contentType = response.headers.get('content-type')
    if (!contentType?.startsWith('image/')) {
      return new Response('URL must point to an image', { 
        status: 400,
        headers: getCORSHeaders()
      })
    }

    // Create response with CORS headers
    const modifiedResponse = new Response(response.body, {
      status: response.status,
      headers: {
        ...Object.fromEntries(response.headers),
        ...getCORSHeaders()
      }
    })

    return modifiedResponse

  } catch (error) {
    console.error('Proxy error:', error)
    
    // Handle specific errors
    if (error.name === 'AbortError') {
      return new Response('Request timeout', { 
        status: 504,
        headers: getCORSHeaders()
      })
    }

    return new Response('Failed to fetch image: ' + error.message, { 
      status: 500,
      headers: getCORSHeaders()
    })
  }
}

function getCORSHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Max-Age': '86400',
  }
}

function handleCORS() {
  return new Response(null, {
    status: 204,
    headers: getCORSHeaders()
  })
}

function checkRateLimit(clientIP) {
  const now = Date.now()
  const userRequests = ipRequests.get(clientIP) || []
  
  // Clean old requests
  const validRequests = userRequests.filter(time => time > now - RATE_LIMIT.windowMs)
  
  if (validRequests.length >= RATE_LIMIT.maxRequests) {
    return false
  }
  
  // Add new request
  validRequests.push(now)
  ipRequests.set(clientIP, validRequests)
  
  return true
} 