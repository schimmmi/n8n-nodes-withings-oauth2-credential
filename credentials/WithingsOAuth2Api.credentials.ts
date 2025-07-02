import { ICredentialType, INodeProperties, ICredentialDataDecryptedObject, IHttpRequestOptions, INodeCredentialTestResult, Icon } from "n8n-workflow"

export class WithingsOAuth2Api implements ICredentialType {
	name = "withingsOAuth2Api"
	displayName = "Withings OAuth2 API"
	description = "OAuth2 authentication for Withings API"
	documentationUrl = "https://developer.withings.com/api-reference/#section/Authentication"
	icon: Icon = "file:withings.svg"

	properties: INodeProperties[] = [
		{
			displayName: "Grant Type",
			name: "grantType",
			type: "hidden",
			default: "authorizationCode",
		},
		{
			displayName: "Authorization URL",
			name: "authUrl",
			type: "hidden",
			default: "https://account.withings.com/oauth2_user/authorize2",
		},
		{
			displayName: "Access Token URL",
			name: "accessTokenUrl",
			type: "hidden",
			default: "https://wbsapi.withings.com/v2/oauth2",
		},
		{
			displayName: "Client ID",
			name: "clientId",
			type: "string",
			required: true,
			default: "",
			description: "The Client ID from your Withings Developer Account",
		},
		{
			displayName: "Client Secret",
			name: "clientSecret",
			type: "string",
			typeOptions: {
				password: true,
			},
			required: true,
			default: "",
			description: "The Client Secret from your Withings Developer Account",
		},
		{
			displayName: "Scope",
			name: "scope",
			type: "string",
			default: "user.info,user.metrics,user.activity",
			description: "Comma-separated list of scopes. Common scopes: user.info, user.metrics, user.activity, user.sleepevents",
		},
		{
			displayName: "Redirect URI",
			name: "redirectUri",
			type: "string",
			default: "",
			description: "Must match the redirect URI configured in your Withings app",
		},
		{
			displayName: "Access Token",
			name: "accessToken",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			description: "OAuth2 Access Token (obtained through authorization flow)",
		},
		{
			displayName: "Refresh Token",
			name: "refreshToken",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			description: "OAuth2 Refresh Token (obtained through authorization flow)",
		},
		{
			displayName: "Important Note",
			name: "notice",
			type: "notice",
			default: "",
			description: "Withings requires action=requesttoken parameter in token requests. Use the Withings OAuth2 Helper node to complete the OAuth2 flow.",
		},
	]

	async authenticate(credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		// Check if we have an access token
		if (!credentials.accessToken) {
			throw new Error("No access token available. Please complete OAuth2 flow first.")
		}

		// Add the Bearer token to the request
		requestOptions.headers = {
			...requestOptions.headers,
			Authorization: `Bearer ${credentials.accessToken}`,
		}

		return requestOptions
	}
}
