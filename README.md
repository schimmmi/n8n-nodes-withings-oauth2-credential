# n8n nodes for the Withings API

> ... because the Withings API decided to be weird and not OAuth2 compliant.

This package provides n8n credentials and nodes to work with the Withings API, which uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests.

## What's Included

### WithingsOAuth2Api Credential
A standard OAuth2 credential that can be used with HTTP Request nodes for making authenticated API calls to Withings endpoints.

### Withings Access Token Node
A simple 2-step OAuth2 flow handler that gets you access tokens without the manual hassle.

#### Operation 1: Get Authorization URL
- **Inputs**: Client ID, Client Secret, Redirect URI, Scopes
- **Output**: Authorization URL with clear instructions
- **What it does**: Generates the Withings authorization URL for you to visit

#### Operation 2: Get Access Token  
- **Inputs**: Client ID, Client Secret, Redirect URI, Callback URL (the full URL you get redirected to)
- **Output**: Access token, refresh token, user ID, and all OAuth2 data
- **What it does**: Automatically extracts the authorization code from your callback URL and exchanges it for tokens with the required `action=requesttoken` parameter

## Simple Usage Workflow

1. **Step 1**: Use "Get Authorization URL" operation → Get the authorization URL
2. **Step 2**: Visit the URL → Authorize your application → Copy the full callback URL
3. **Step 3**: Use "Get Access Token" operation → Paste the callback URL → Get your tokens
4. **Step 4**: Use the access token with WithingsOAuth2Api credential in HTTP Request nodes

## Why This Package Exists

The Withings API uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests. n8n's built-in OAuth2 system doesn't support this custom parameter, so this package provides the necessary workaround while keeping the user experience as simple as possible.

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
