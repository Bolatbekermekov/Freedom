import { initReactI18next } from 'react-i18next/initReactI18next'

import { createInstance, i18n } from 'i18next'
import resourcesToBackend from 'i18next-resources-to-backend'
import { Config } from 'next-i18n-router/dist/types'

export enum LOCALES {
	KZ = 'kk',
	EN = 'en',
	RU = 'ru'
}

export const i18nConfig: Config = {
	locales: Object.values(LOCALES),
	defaultLocale: LOCALES.RU,
	localeDetector: false
}

export async function initTranslations(
	locale: string,
	namespaces: string[],
	i18nInstance?: i18n,
	resources?: any
) {
	i18nInstance = i18nInstance || createInstance()

	i18nInstance.use(initReactI18next)

	if (!resources) {
		i18nInstance.use(
			resourcesToBackend(
				(language: string) => import(`../locales/${language}.json`)
			)
		)
	}

	await i18nInstance.init({
		lng: locale,
		resources,
		fallbackLng: i18nConfig.defaultLocale,
		supportedLngs: i18nConfig.locales,
		defaultNS: namespaces[0],
		fallbackNS: namespaces[0],
		ns: namespaces,
		preload: resources ? [] : i18nConfig.locales
	})

	return {
		i18n: i18nInstance,
		resources: i18nInstance.services.resourceStore.data,
		t: i18nInstance.t
	}
}
