import { ICredentialType, INodeProperties, Icon, IHttpRequestOptions, ICredentialDataDecryptedObject } from "n8n-workflow"

export class WithingsOAuth2Api implements ICredentialType {
	name = "withingsOAuth2Api"
	displayName = "Withings OAuth2 API"
	description = "OAuth2 authentication for Withings API with custom token exchange"
	documentationUrl = "https://developer.withings.com/api-reference/#section/Authentication"
	icon: Icon = "file:withings.svg"
	extends = ["genericAuth"]

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
			default: "https://wbsapi.withings.net/v2/oauth2",
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
	]

	async authenticate(credentials: ICredentialDataDecryptedObject, requestOptions: IHttpRequestOptions): Promise<IHttpRequestOptions> {
		// For token exchange requests to Withings OAuth2 endpoint
		if (requestOptions.url?.includes("/oauth2") && requestOptions.method === "POST") {
			// Parse existing body to get the authorization code and other params
			// Parse existing body to get the authorization code and other params
			const bodyString = requestOptions.body as string
			const params = new Map<string, string>()

			// Parse URL-encoded body manually
			if (bodyString) {
				bodyString.split("&").forEach((pair) => {
					const [key, value] = pair.split("=")
					if (key && value) {
						params.set(key, decodeURIComponent(value))
					}
				})
			}

			// Create new body with Withings-specific action parameter
			const newBodyParts = [
				"action=requesttoken",
				`grant_type=${encodeURIComponent(params.get("grant_type") || "authorization_code")}`,
				`client_id=${encodeURIComponent(params.get("client_id") || (credentials.clientId as string))}`,
				`client_secret=${encodeURIComponent(params.get("client_secret") || (credentials.clientSecret as string))}`,
				`code=${encodeURIComponent(params.get("code") || "")}`,
				`redirect_uri=${encodeURIComponent(params.get("redirect_uri") || "")}`,
			]

			requestOptions.body = newBodyParts.join("&")
			requestOptions.headers = {
				...requestOptions.headers,
				"Content-Type": "application/x-www-form-urlencoded",
			}
		}

		return requestOptions
	}
}
