import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeOperationError, NodeConnectionType } from "n8n-workflow"

export class WithingsAccessToken implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Withings Access Token",
		name: "withingsAccessToken",
		icon: "file:withings.svg",
		group: ["transform"],
		version: 1,
		description: "Get Withings access token from callback URL",
		defaults: {
			name: "Withings Access Token",
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		properties: [
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
				displayName: "Callback URL",
				name: "callbackUrl",
				type: "string",
				required: true,
				default: "",
				description: "The full callback URL from Withings authorization (contains the code parameter)",
			},
			{
				displayName: "Redirect URI",
				name: "redirectUri",
				type: "string",
				required: true,
				default: "http://localhost:8080/callback",
				description: "The redirect URI used in authorization",
			},
		],
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()
		const returnData: INodeExecutionData[] = []

		for (let i = 0; i < items.length; i++) {
			try {
				const clientId = this.getNodeParameter("clientId", i) as string
				const clientSecret = this.getNodeParameter("clientSecret", i) as string
				const callbackUrl = this.getNodeParameter("callbackUrl", i) as string
				const redirectUri = this.getNodeParameter("redirectUri", i) as string

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

				// Output the access token and all token data
				const responseData = {
					access_token: response.body.access_token,
					refresh_token: response.body.refresh_token,
					token_type: response.body.token_type || "Bearer",
					expires_in: response.body.expires_in,
					scope: response.body.scope,
					userid: response.body.userid,
					csrf_token: response.body.csrf_token,
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
