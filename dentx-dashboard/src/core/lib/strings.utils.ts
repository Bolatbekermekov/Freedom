class StringUtilsService {
	isEmpty(str: string | null) {
		return !str || str.trim().length === 0
	}

	isNotEmpty(str: string | null) {
		return !this.isEmpty(str)
	}

	isBlank(str: string | null) {
		return !str || /^\s*$/.test(str)
	}

	isNotBlank(str: string | null) {
		return !this.isBlank(str)
	}

	equalsIgnoreCase(str1: string, str2: string) {
		return str1.toLowerCase() === str2.toLowerCase()
	}
}

export const StringUtils = new StringUtilsService()
