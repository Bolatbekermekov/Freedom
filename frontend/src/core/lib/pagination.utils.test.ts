import '@testing-library/jest-dom'

import { INITIAL_PAGINATION, Pageable } from '../models/paginated.model'

import { getPagination } from './pagination.utils'

describe('getPagination', () => {
	it('returns Pageable with defaults for missing properties', () => {
		const pageable = { page: 2 }
		const result = getPagination(pageable)
		expect(result).toEqual({
			page: 2,
			size: INITIAL_PAGINATION.size,
			paginate: INITIAL_PAGINATION.paginate
		})
	})

	it('overrides size with INITIAL_PAGINATION size when input is 0', () => {
		const pageable = { size: 0 }
		const result = getPagination(pageable)
		expect(result).toEqual({
			page: INITIAL_PAGINATION.page,
			size: INITIAL_PAGINATION.size,
			paginate: INITIAL_PAGINATION.paginate
		})
	})

	it('uses all properties from Pageable input when complete', () => {
		const pageable: Pageable = { page: 3, size: 25, paginate: true }
		const result = getPagination(pageable)
		expect(result).toEqual(pageable)
	})
})
