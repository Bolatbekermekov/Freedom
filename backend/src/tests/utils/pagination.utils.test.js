import { getPagination } from '../../utils/pagination.utils.js'

describe('getPagination', () => {
	it('returns default pagination when no arguments are provided', () => {
		const pagination = getPagination()
		expect(pagination).toEqual({ limit: 25, offset: 0, paginate: true })
	})

	it('overrides default pagination with provided arguments', () => {
		const pagination = getPagination(2, 10, false)
		expect(pagination).toEqual({ limit: 10, offset: 20, paginate: false })
	})
})
