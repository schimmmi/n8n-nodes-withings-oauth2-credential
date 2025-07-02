import { ICredentialType, INodeProperties, Icon } from "n8n-workflow"

export class WithingsOAuth2Api implements ICredentialType {
	name = "withingsOAuth2Api"
	extends = ["oAuth2Api"]
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
	]
}
