# n8n nodes for the Withings API

> ... because the Withings API decided to be weird and not OAuth2 compliant.

This package provides n8n credentials and nodes to work with the Withings API, which uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests.

## What's Included

### WithingsOAuth2Api Credential
A standard OAuth2 credential that can be used with HTTP Request nodes for making authenticated API calls to Withings endpoints.

### Withings Access Token Node
A simple node that exchanges authorization codes for access tokens with Withings' required `action=requesttoken` parameter.

**Inputs:**
- Client ID
- Client Secret  
- Authorization Code (from OAuth2 callback)
- Redirect URI

**Output:**
- Access token
- Refresh token
- Token type
- Expires in
- Scope
- User ID
- CSRF token

## Usage Workflow

1. **Get Authorization URL**: Visit `https://account.withings.com/oauth2_user/authorize2?response_type=code&client_id=YOUR_CLIENT_ID&redirect_uri=YOUR_REDIRECT_URI&scope=user.info,user.metrics,user.activity`

2. **User Authorization**: User visits the URL and authorizes your application

3. **Extract Authorization Code**: Get the `code` parameter from the callback URL

4. **Get Access Token**: Use the Withings Access Token node with the authorization code to get tokens

5. **Make API Calls**: Use the WithingsOAuth2Api credential with HTTP Request nodes for API calls

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
