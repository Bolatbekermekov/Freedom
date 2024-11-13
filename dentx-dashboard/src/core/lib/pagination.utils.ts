import { INITIAL_PAGINATION, Pageable } from '../models/paginated.model'

export const getPagination = (pageable: Partial<Pageable>): Pageable => {
	const size =
		pageable?.size === 0
			? INITIAL_PAGINATION.size
			: pageable?.size ?? INITIAL_PAGINATION.size

	return {
		page: pageable?.page ?? INITIAL_PAGINATION.page,
		size: size,
		paginate: pageable?.paginate ?? INITIAL_PAGINATION.paginate
	}
}
