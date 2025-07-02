import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError, NodeConnectionType } from "n8n-workflow"

export class WithingsAccessToken implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Withings Access Token",
		name: "withingsAccessToken",
		icon: "file:withings.svg",
		group: ["transform"],
		version: 1,
		description: "Get Withings access token - handles the non-standard OAuth2 flow",
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
						name: "Get Authorization URL",
						value: "getAuthUrl",
						description: "Get the URL to authorize your application",
						action: "Get authorization URL",
					},
					{
						name: "Get Access Token",
						value: "getAccessToken",
						description: "Exchange authorization code for access token",
						action: "Get access token from authorization code",
					},
				],
				default: "getAuthUrl",
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
				default: "http://localhost:8080/callback",
				description: "The redirect URI for OAuth2 authorization",
			},
			{
				displayName: "Scopes",
				name: "scopes",
				type: "string",
				displayOptions: {
					show: {
						operation: ["getAuthUrl"],
					},
				},
				default: "user.info,user.metrics,user.activity",
				description: "Comma-separated list of scopes to request",
			},
			{
				displayName: "Callback URL",
				name: "callbackUrl",
				type: "string",
				required: true,
				displayOptions: {
					show: {
						operation: ["getAccessToken"],
					},
				},
				default: "",
				description: "Paste the full callback URL you received after authorization (contains the code parameter)",
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
				const redirectUri = this.getNodeParameter("redirectUri", i) as string

				let responseData: any = {}

				if (operation === "getAuthUrl") {
					const scopes = this.getNodeParameter("scopes", i) as string

					// Generate authorization URL
					const authParams = [
						`response_type=code`,
						`client_id=${encodeURIComponent(clientId)}`,
						`redirect_uri=${encodeURIComponent(redirectUri)}`,
						`scope=${encodeURIComponent(scopes || "user.info,user.metrics,user.activity")}`,
					]

					const authorizationUrl = `https://account.withings.com/oauth2_user/authorize2?${authParams.join("&")}`

					responseData = {
						authorization_url: authorizationUrl,
						instructions:
							"1. Visit the authorization_url above\n2. Authorize the application\n3. Copy the full callback URL\n4. Use 'Get Access Token' operation with the callback URL",
						client_id: clientId,
						redirect_uri: redirectUri,
						scopes: scopes || "user.info,user.metrics,user.activity",
					}
				} else if (operation === "getAccessToken") {
					const callbackUrl = this.getNodeParameter("callbackUrl", i) as string

					// Extract authorization code from callback URL
					const codeMatch = callbackUrl.match(/[?&]code=([^&]+)/)
					const authorizationCode = codeMatch ? decodeURIComponent(codeMatch[1]) : null

					if (!authorizationCode) {
						throw new NodeOperationError(
							this.getNode(),
							"No authorization code found in callback URL. Make sure you copied the complete callback URL that contains 'code=' parameter.",
							{ itemIndex: i }
						)
					}

					// Exchange authorization code for access token with Withings' required parameter
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
						access_token: response.body.access_token,
						refresh_token: response.body.refresh_token,
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
