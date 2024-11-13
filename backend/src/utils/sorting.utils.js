export const getSorting = sort => {
	const sortValues = {}

	if (sort) {
		const [field, direction] = sort.split(',')

		if (field && direction) {
			sortValues[field.trim()] = direction.trim().toLowerCase() === 'asc' ? 1 : -1
		}
	} else {
		sortValues.createdAt = -1
	}

	return sortValues
}
