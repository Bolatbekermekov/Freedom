import '@testing-library/jest-dom'

import { getUserInitials } from '@/core/lib/user.utils'

describe('getUserInitials', () => {
	it('returns "NA" for an empty name', () => {
		expect(getUserInitials('')).toBe('NA')
	})

	it('returns first initial for a single-word name', () => {
		expect(getUserInitials('John')).toBe('J')
	})

	it('returns initials for a multi-word name', () => {
		expect(getUserInitials('John Doe')).toBe('JD')
	})

	it('handles names with extra spaces', () => {
		expect(getUserInitials('  John  Doe  ')).toBe('JD')
	})

	it('ignores middle initials with multiple dots', () => {
		expect(getUserInitials('John A. B. Doe')).toBe('JABD')
	})

	it('uses empty string for missing middle initial', () => {
		expect(getUserInitials('John Doe Jr')).toBe('JDJ')
	})
})
