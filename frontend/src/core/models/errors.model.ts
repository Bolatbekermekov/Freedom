export type LocalizedError = {
	success: boolean
	message: string
	timestamp: Date
	statusCode: number
	localizedMessages?: {
		en: string
		ru: string
		kk: string
	}
}
