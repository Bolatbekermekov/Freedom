const DEFAULT_PAGINATION = {
	page: 0,
	size: 25,
	pagination: true,
}

export const getPagination = (
	page = DEFAULT_PAGINATION.page,
	size = DEFAULT_PAGINATION.size,
	paginate = DEFAULT_PAGINATION.pagination,
) => {
	const limitOption = isNaN(Number(size)) ? DEFAULT_PAGINATION.size : Number(size)
	const offsetOption = isNaN(Number(page)) ? DEFAULT_PAGINATION.size : Number(page) * limitOption

	const paginateOption =
		typeof paginate === 'string' ? paginate.toLowerCase() === 'true' : !!paginate

	return { limit: limitOption, offset: offsetOption, paginate: paginateOption }
}
