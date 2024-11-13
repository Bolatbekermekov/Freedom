import debounce from 'lodash.debounce'
import { useEffect, useMemo } from 'react'
import { FieldValues, UseFormReturn } from 'react-hook-form'

interface UseFilterProps<T> {
	onFilterChange: (filter: T) => void
	defaultValues: T
	form: UseFormReturn<FieldValues>
}

const DEFAULT_DEBOUNCE_DELAY = 800

export function useFilter<T>({
	onFilterChange,
	defaultValues,
	form
}: UseFilterProps<T>) {
	const debouncedOnChangeFilter = useMemo(
		() => debounce(onFilterChange, DEFAULT_DEBOUNCE_DELAY),
		[onFilterChange]
	)

	useEffect(() => {
		onFilterChange(defaultValues)
		return () => debouncedOnChangeFilter.cancel()
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	useEffect(() => {
		const subscription = form.watch(values => {
			debouncedOnChangeFilter(values as T)
		})

		return () => {
			subscription.unsubscribe()
			debouncedOnChangeFilter.cancel()
		}
	}, [form, debouncedOnChangeFilter])

	return { debouncedOnChangeFilter }
}
