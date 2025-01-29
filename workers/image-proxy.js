addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request))
})

async function handleRequest(request) {
  // Get the target URL from the request URL's searchParams
  const url = new URL(request.url)
  const imageUrl = url.searchParams.get('url')
  
  if (!imageUrl) {
    return new Response('Missing URL parameter', { status: 400 })
  }

  try {
    // Fetch the image
    const response = await fetch(imageUrl)
    
    // Create a new response with CORS headers
    const modifiedResponse = new Response(response.body, response)
    
    // Add CORS headers
    modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
    modifiedResponse.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS')
    modifiedResponse.headers.set('Access-Control-Max-Age', '86400')
    
    return modifiedResponse
  } catch (error) {
    return new Response('Error fetching image: ' + error.message, { status: 500 })
  }
} 