import '@testing-library/jest-dom'

import { cn } from './tailwind.utils'

describe('cn utility', () => {
	it('combines multiple class names correctly', () => {
		const classes = ['class1', 'class2', 'active']
		const combinedClasses = cn(...classes)
		expect(combinedClasses).toBe('class1 class2 active')
	})

	it('handles empty input', () => {
		expect(cn()).toBe('')
	})

	it('handles single class name', () => {
		const className = 'single-class'
		expect(cn(className)).toBe(className)
	})

	it('works with falsy values', () => {
		expect(cn(undefined, null, false)).toBe('')
		expect(cn(0)).toBe('')
	})
})
