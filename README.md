# n8n nodes for the Withings API

> ... because the Withings API decided to be weird and not OAuth2 compliant.

This package provides n8n credentials and nodes to work with the Withings API, which uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests.

## What's Included

### WithingsOAuth2Api Credential
A standard OAuth2 credential that can be used with HTTP Request nodes for making authenticated API calls to Withings endpoints.

### Withings Access Token Node
A complete OAuth2 flow handler with three operations:

#### 1. Generate Authorization URL
- **Purpose**: Creates the authorization URL for users to visit and authorize your application
- **Inputs**: Client ID, Client Secret, Redirect URI, Scopes (optional), State (optional)
- **Output**: Authorization URL and instructions for the user

#### 2. Exchange Authorization Code
- **Purpose**: Exchanges the authorization code for access and refresh tokens
- **Inputs**: Client ID, Client Secret, Authorization Code, Redirect URI
- **Output**: Access token, refresh token, user ID, and other OAuth2 response data
- **Special**: Includes the required `action=requesttoken` parameter that Withings needs

#### 3. Refresh Access Token
- **Purpose**: Refreshes an expired access token using a refresh token
- **Inputs**: Client ID, Client Secret, Refresh Token
- **Output**: New access token and updated token information
- **Special**: Includes the required `action=requesttoken` parameter that Withings needs

## Usage Workflow

1. **Generate Authorization URL**: Use the Withings Access Token node with "Generate Authorization URL" operation to get the URL
2. **User Authorization**: Send the user to the authorization URL to approve access
3. **Extract Authorization Code**: Get the `code` parameter from the callback URL
4. **Exchange for Tokens**: Use the "Exchange Authorization Code" operation to get access tokens
5. **Make API Calls**: Use the WithingsOAuth2Api credential with HTTP Request nodes for API calls
6. **Refresh When Needed**: Use the "Refresh Access Token" operation when tokens expire

## Why This Package Exists

The Withings API uses a non-standard OAuth2 implementation that requires an `action=requesttoken` parameter in token exchange requests. n8n's built-in OAuth2 system doesn't support this custom parameter, so this package provides the necessary workaround while maintaining a good user experience.

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
