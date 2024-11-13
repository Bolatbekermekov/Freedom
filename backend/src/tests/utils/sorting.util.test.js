import { getSorting } from '../../utils/sorting.utils'

describe('getSorting utility', () => {
	it('returns default sort when no sort argument is provided', () => {
		const sortValues = getSorting()
		expect(sortValues).toEqual({ _id: 1 })
	})

	it('sorts by the specified field in ascending order', () => {
		const sortValues = getSorting('name,asc')
		expect(sortValues).toEqual({ name: 1 })
	})

	it('sorts by the specified field in descending order', () => {
		const sortValues = getSorting('age,desc')
		expect(sortValues).toEqual({ age: -1 })
	})

	it('handles invalid sort direction (case-insensitive)', () => {
		const sortValues = getSorting('price,INVALID')
		expect(sortValues).toEqual({ price: -1 })
	})

	it('handles empty sort string', () => {
		const sortValues = getSorting('')
		expect(sortValues).toEqual({ _id: 1 })
	})
})
