export default function (options?: {
	beforeRequest?: Array<Function>,
	afterResponse?: Array<Function>,
	retry?: number | object
}): object;