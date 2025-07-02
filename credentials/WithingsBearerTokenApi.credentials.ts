import { IAuthenticateGeneric, ICredentialType, INodeProperties, Icon } from "n8n-workflow"

export class WithingsBearerTokenApi implements ICredentialType {
	name = "withingsBearerTokenApi"
	displayName = "Withings Bearer Token API"
	description = "Bearer token authentication for Withings API"
	documentationUrl = "https://developer.withings.com/api-reference/#section/Authentication"
	icon: Icon = "file:withings.svg"
	genericAuth = true

	properties: INodeProperties[] = [
		{
			displayName: "Access Token",
			name: "accessToken",
			type: "string",
			typeOptions: {
				password: true,
			},
			required: true,
			default: "",
			description: "The access token obtained from Withings OAuth2 flow",
		},
		{
			displayName: "Refresh Token",
			name: "refreshToken",
			type: "string",
			typeOptions: {
				password: true,
			},
			default: "",
			description: "The refresh token for renewing access tokens (optional)",
		},
		{
			displayName: "User ID",
			name: "userId",
			type: "string",
			default: "",
			description: "The Withings user ID returned during OAuth2 flow (optional)",
		},
		{
			displayName: "How to get tokens",
			name: "instructions",
			type: "notice",
			default: "",
			description: 'Use the "Withings Access Token" node to exchange authorization codes for access tokens, or complete the OAuth2 flow manually.',
		},
	]

	authenticate: IAuthenticateGeneric = {
		type: "generic",
		properties: {
			headers: {
				Authorization: "Bearer ={{$credentials.accessToken}}",
			},
		},
	}
}
