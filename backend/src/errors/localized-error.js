export default class LocalizedError extends Error {
	constructor(localizedMessages, statusCode) {
		super()
		this.message = localizedMessages.en
		this.localizedMessages = localizedMessages
		this.statusCode = statusCode
	}
}
