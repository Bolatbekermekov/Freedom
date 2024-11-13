export interface PaginatedResult<T> {
	docs: T
	totalDocs: number
	offset: number
	limit: number
	totalPages: number
	page: number
	pagingCounter: number
	hasPrevPage: boolean
	hasNextPage: boolean
	prevPage: number | null
	nextPage: number | null
}

export interface Pageable {
	page: number
	size: number
	paginate?: boolean
}

export const INITIAL_PAGINATION: Pageable = {
	page: 0,
	size: 10,
	paginate: true
}
