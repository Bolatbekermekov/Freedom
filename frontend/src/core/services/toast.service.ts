import { toast } from 'sonner'

import { LOCALES } from '../config/i18next.config'
import { ResponseError } from '../models/axios.models'
import { LocalizedError } from '../models/errors.model'

class ToastServiceClass {
	private readonly errorDuration = 5000
	private readonly defaultLocale: LOCALES = LOCALES.RU

	success(message: string) {
		return toast.success(message)
	}

	error(err: LocalizedError, locale?: LOCALES) {
		const selectedLanguage = locale ?? this.defaultLocale

		if (err.localizedMessages) {
			return toast.error(err.localizedMessages[selectedLanguage], {
				duration: this.errorDuration
			})
		}

		return toast.error(err.message, { duration: this.errorDuration })
	}

	errorMessage(message: string) {
		toast.error(message, {
			duration: this.errorDuration
		})
	}

	axiosError(
		responseError: ResponseError,
		defaultMessage: string,
		locale?: string
	) {
		const selectedLanguage = locale ?? this.defaultLocale
		const parsedLanguage: LOCALES | undefined = isLocalization(selectedLanguage)
			? selectedLanguage
			: undefined

		if (responseError.response?.data) {
			return this.error(responseError.response?.data, parsedLanguage)
		}

		return this.errorMessage(defaultMessage)
	}
}

function isLocalization(locale: string | LOCALES): locale is LOCALES {
	return locale in LOCALES
}

export const ToastService = new ToastServiceClass()
