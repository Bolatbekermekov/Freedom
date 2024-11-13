export const getUserInitials = (name: string) => {
	if (!name) {
		return 'NA'
	}

	const trimmedName = name.trim()
	const words = trimmedName.split(/\s+/)
	const initials = words.map(word => word[0].toUpperCase())

	return initials.join('')
}

export const getFirstName = (name: string) => {
	if (!name) {
		return 'NA'
	}

	const nameParts = name.trim().split(' ')
	return nameParts[0]
}
