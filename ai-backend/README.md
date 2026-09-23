# Artisan Mate AI Design Studio backend

The Design Studio frontend calls:

`https://api.artisanmate.com/generate-design`

The Cloudflare Worker in `worker.js` keeps the Gemini API key server-side.

## One-time setup

1. Create/sign in to a Cloudflare account.
2. Open **Workers & Pages → Create → Worker**.
3. Deploy the code from `ai-backend/worker.js`.
4. Add an environment variable/secret:
   - Name: `GEMINI_API_KEY`
   - Value: your Google Gemini API key.
5. Add the custom domain:
   - `api.artisanmate.com`
6. Keep the route/path as:
   - `POST /generate-design`

The frontend is already configured to call this endpoint.

## Important

Do not put the Gemini API key in `design-studio.html`, `index.html`, or any public GitHub file.

The browser sends the compressed room image to the Worker. The Worker calls Gemini's image-editing endpoint and returns the generated image.

Google's current Gemini image API supports image-to-image editing with `gemini-3.1-flash-image`. See the official documentation for current model/API details.
