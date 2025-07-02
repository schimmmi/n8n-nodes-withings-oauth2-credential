import { IExecuteFunctions, INodeExecutionData, INodeType, INodeTypeDescription, NodeConnectionType } from "n8n-workflow"

export class WithingsDummy implements INodeType {
	description: INodeTypeDescription = {
		displayName: "Withings Dummy",
		name: "withingsDummy",
		icon: "file:withings.svg",
		group: ["transform"],
		version: 1,
		description: "Dummy node for Withings OAuth2 credential package",
		defaults: {
			name: "Withings Dummy",
		},
		inputs: [NodeConnectionType.Main],
		outputs: [NodeConnectionType.Main],
		credentials: [
			{
				name: "withingsOAuth2Api",
				required: true,
			},
		],
		properties: [
			{
				displayName: "Notice",
				name: "notice",
				type: "notice",
				default: "",
				displayOptions: {
					show: {},
				},
				typeOptions: {
					theme: "info",
				},
				description: "This is a dummy node. Use HTTP Request nodes with the Withings OAuth2 credential instead.",
			},
		],
	}

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData()

		// Just pass through the input data unchanged
		return [items]
	}
}
