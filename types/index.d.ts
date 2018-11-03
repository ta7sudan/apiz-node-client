export default function (options?: {
	beforeRequest?: Array<function>,
	afterResponse?: Array<function>,
	retry?: number | object
}): object;