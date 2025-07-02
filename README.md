# n8n nodes for the Withings API

> ... because the Withings API decided to be weird and not OAuth2 compliant.

This package provides n8n credentials and nodes to work with the Withings API, which uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests.

## What's Included

### WithingsOAuth2Api Credential
A standard OAuth2 credential that handles the authorization flow and stores your client credentials.

### Withings Access Token Node
A simple single-purpose node that gets you access tokens from Withings OAuth2 callbacks.

**What it does:**
- Uses your Withings OAuth2 credential
- Takes your callback URL from Withings authorization
- Automatically extracts the authorization code
- Exchanges it for access tokens with the required `action=requesttoken` parameter
- Outputs working access tokens

**Inputs:**
- Withings OAuth2 credential (contains Client ID, Client Secret, Redirect URI)
- Callback URL (the full URL you get redirected to after authorization)

**Output:**
- Access token (ready to use)
- Refresh token
- Token type
- Expires in
- Scope
- User ID
- CSRF token

## Simple Usage

1. **Set up credential**: Create a new Withings OAuth2 API credential with your Client ID, Client Secret, and Redirect URI

2. **Get authorization URL**: Visit `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=user.info,user.metrics,user.activity`

3. **Authorize**: User visits the URL and authorizes your application

4. **Copy callback URL**: Copy the full URL you get redirected to (contains the authorization code)

5. **Run the node**: Use the Withings Access Token node with your credential and callback URL

6. **Get tokens**: Node outputs working access tokens

7. **Make API calls**: Use the access token with HTTP Request nodes

## Why This Package Exists

The Withings API uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests. n8n's built-in OAuth2 system doesn't support this custom parameter, so this package provides the necessary workaround.

## Installation

```bash
npm install n8n-nodes-withings-oauth2-credential
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run linting
npm run lint
