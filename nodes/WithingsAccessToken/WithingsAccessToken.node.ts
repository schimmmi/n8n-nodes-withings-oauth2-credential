import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError, NodeConnectionType } from "n8n-workflow"

export class WithingsAccessToken implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Withings Access Token",
		name: "withingsAccessToken",
		icon: "file:withings.svg",
		group: ["transform"],
		version: 1,
		subtitle: '={{$parameter["operation"]}}',
		description: "Handle Withings OAuth2 token exchange with action=requesttoken support",
		defaults: {
			name: "Withings Access Token",
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
			{
				displayName: "Operation",
				name: "operation",
				type: "options",
				noDataExpression: true,
				options: [
					{
						name: "Generate Authorization URL",
						value: "generateAuthUrl",
						description: "Generate the authorization URL for OAuth2 flow",
						action: "Generate authorization url for o auth2 flow",
					},
					{
						name: "Exchange Authorization Code",
						value: "exchangeCode",
						description: "Exchange authorization code for access token",
						action: "Exchange authorization code for access token",
					},
					{
						name: "Refresh Access Token",
						value: "refreshToken",
						description: "Refresh an expired access token",
						action: "Refresh an expired access token",
					},
				],
				default: "generateAuthUrl",
			},
			{
				displayName: "Client ID",
				name: "clientId",
				type: "string",
				required: true,
				default: "",
				description: "Your Withings Client ID",
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
				description: "Your Withings Client Secret",
			},
			{
				displayName: "Redirect URI",
				name: "redirectUri",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["generateAuthUrl", "exchangeCode"],
					},
				},
				default: "",
				description: "The redirect URI for OAuth2 authorization",
			},
			{
				displayName: "Scopes",
				name: "scopes",
				type: "string",
				displayOptions: {
					show: {
						operation: ["generateAuthUrl"],
					},
				},
				default: "user.info,user.metrics,user.activity",
				description: "Comma-separated list of scopes to request (e.g., user.info,user.metrics,user.activity)",
			},
			{
				displayName: "State",
				name: "state",
				type: "string",
				displayOptions: {
					show: {
						operation: ["generateAuthUrl"],
					},
				},
				default: "",
				description: "Optional state parameter for CSRF protection",
			},
			{
				displayName: "Authorization Code",
				name: "authorizationCode",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["exchangeCode"],
					},
				},
				default: "",
				description: "The authorization code received from Withings OAuth2 callback",
			},
			{
				displayName: "Refresh Token",
				name: "refreshToken",
				type: "string",
				typeOptions: {
					password: true,
				},
				required: true,
				displayOptions: {
					show: {
						operation: ["refreshToken"],
					},
				},
				default: "",
				description: "The refresh token to use for getting a new access token",
			},
		],
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const returnData: INodeExecutionData[] = []
		const operation = this.getNodeParameter("operation", 0) as string

		for (let i = 0; i < items.length; i++) {
			try {
				const clientId = this.getNodeParameter("clientId", i) as string
				const clientSecret = this.getNodeParameter("clientSecret", i) as string

				let responseData: any = {}

				if (operation === "generateAuthUrl") {
					const redirectUri = this.getNodeParameter("redirectUri", i) as string
					const scopes = this.getNodeParameter("scopes", i) as string
					const state = this.getNodeParameter("state", i) as string

					// Build authorization URL
					const authParams = [
						`response_type=code`,
						`client_id=${encodeURIComponent(clientId)}`,
						`redirect_uri=${encodeURIComponent(redirectUri)}`,
						`scope=${encodeURIComponent(scopes || "user.info,user.metrics,user.activity")}`,
					]

					if (state) {
						authParams.push(`state=${encodeURIComponent(state)}`)
					}

					const authorizationUrl = `https://account.withings.com/oauth2_user/authorize2?${authParams.join("&")}`

					responseData = {
						success: true,
						operation: "generateAuthUrl",
						authorization_url: authorizationUrl,
						client_id: clientId,
						redirect_uri: redirectUri,
						scopes: scopes || "user.info,user.metrics,user.activity",
						state: state || null,
						instructions:
							"Visit the authorization_url, authorize the application, and copy the 'code' parameter from the callback URL to use in the 'Exchange Authorization Code' operation.",
					}
				} else if (operation === "exchangeCode") {
					const authorizationCode = this.getNodeParameter("authorizationCode", i) as string
					const redirectUri = this.getNodeParameter("redirectUri", i) as string

					// Withings-specific token exchange with action=requesttoken
					const tokenRequestBody = [
						"action=requesttoken",
						"grant_type=authorization_code",
						`client_id=${encodeURIComponent(clientId)}`,
						`client_secret=${encodeURIComponent(clientSecret)}`,
						`code=${encodeURIComponent(authorizationCode)}`,
						`redirect_uri=${encodeURIComponent(redirectUri)}`,
					].join("&")

					const response = await this.helpers.httpRequest({
						method: "POST",
						url: "https://wbsapi.withings.com/v2/oauth2",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: tokenRequestBody,
					})

					if (response.status !== 0) {
						throw new NodeOperationError(this.getNode(), `Token exchange failed: ${response.error || "Unknown error"}`, { itemIndex: i })
					}

					responseData = {
						success: true,
						operation: "exchangeCode",
						access_token: response.body.access_token,
						refresh_token: response.body.refresh_token,
						token_type: response.body.token_type || "Bearer",
						expires_in: response.body.expires_in,
						scope: response.body.scope,
						userid: response.body.userid,
						csrf_token: response.body.csrf_token,
					}
				} else if (operation === "refreshToken") {
					const refreshToken = this.getNodeParameter("refreshToken", i) as string

					// Withings refresh token request with action=requesttoken
					const refreshRequestBody = [
						"action=requesttoken",
						"grant_type=refresh_token",
						`client_id=${encodeURIComponent(clientId)}`,
						`client_secret=${encodeURIComponent(clientSecret)}`,
						`refresh_token=${encodeURIComponent(refreshToken)}`,
					].join("&")

					const response = await this.helpers.httpRequest({
						method: "POST",
						url: "https://wbsapi.withings.com/v2/oauth2",
						headers: {
							"Content-Type": "application/x-www-form-urlencoded",
						},
						body: refreshRequestBody,
					})

					if (response.status !== 0) {
						throw new NodeOperationError(this.getNode(), `Token refresh failed: ${response.error || "Unknown error"}`, { itemIndex: i })
					}

					responseData = {
						success: true,
						operation: "refreshToken",
						access_token: response.body.access_token,
						refresh_token: response.body.refresh_token || refreshToken,
						token_type: response.body.token_type || "Bearer",
						expires_in: response.body.expires_in,
						scope: response.body.scope,
						userid: response.body.userid,
						csrf_token: response.body.csrf_token,
					}
				}

				returnData.push({
					json: responseData,
					pairedItem: {
						item: i,
					},
				})
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: {
							success: false,
							error: error.message,
						},
						pairedItem: {
							item: i,
						},
					})
					continue
				}
				throw error
			}
		}

		return [returnData]
	}
}
