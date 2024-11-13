'use client'

import { ChevronDownIcon, ChevronUpIcon } from '@radix-ui/react-icons'
import { type FC, useEffect, useRef, useState } from 'react'

import { Button } from './button'
import { Calendar } from './calendar'
import { DateInput } from './date-input'
import { Label } from './label'
import { Popover, PopoverContent, PopoverTrigger } from './popover'
import { Switch } from './switch'

export interface DateRangePickerProps {
	/** Click handler for applying the updates from DateRangePicker. */
	onUpdate?: (values: { range: DateRange; rangeCompare?: DateRange }) => void
	/** Initial value for start date */
	initialDateFrom?: Date | string
	/** Initial value for end date */
	initialDateTo?: Date | string
	/** Initial value for start date for compare */
	initialCompareFrom?: Date | string
	/** Initial value for end date for compare */
	initialCompareTo?: Date | string
	/** Alignment of popover */
	align?: 'start' | 'center' | 'end'
	/** Option for locale */
	locale?: string
	/** Option for showing compare feature */
	showCompare?: boolean
}

const formatDate = (date: Date, locale: string = 'en-us'): string => {
	return date.toLocaleDateString(locale, {
		month: 'short',
		day: 'numeric',
		year: 'numeric'
	})
}

interface DateRange {
	from: Date
	to: Date | undefined
}

/** The DateRangePicker component allows a user to select a range of dates */
export const DateRangePicker: FC<DateRangePickerProps> & {
	filePath: string
} = ({
	initialDateFrom = new Date(new Date().setHours(0, 0, 0, 0)),
	initialDateTo,
	initialCompareFrom,
	initialCompareTo,
	onUpdate,
	align = 'end',
	locale = 'en-US',
	showCompare = true
}): JSX.Element => {
	const [isOpen, setIsOpen] = useState(false)

	const [range, setRange] = useState<DateRange>({
		from: new Date(new Date(initialDateFrom).setHours(0, 0, 0, 0)),
		to: initialDateTo
			? new Date(new Date(initialDateTo).setHours(0, 0, 0, 0))
			: new Date(new Date(initialDateFrom).setHours(0, 0, 0, 0))
	})
	const [rangeCompare, setRangeCompare] = useState<DateRange | undefined>(
		initialCompareFrom
			? {
					from: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0)),
					to: initialCompareTo
						? new Date(new Date(initialCompareTo).setHours(0, 0, 0, 0))
						: new Date(new Date(initialCompareFrom).setHours(0, 0, 0, 0))
				}
			: undefined
	)

	// Refs to store the values of range and rangeCompare when the date picker is opened
	const openedRangeRef = useRef<DateRange | undefined>()
	const openedRangeCompareRef = useRef<DateRange | undefined>()

	const [isSmallScreen, setIsSmallScreen] = useState(
		typeof window !== 'undefined' ? window.innerWidth < 960 : false
	)

	useEffect(() => {
		const handleResize = (): void => {
			setIsSmallScreen(window.innerWidth < 960)
		}

		window.addEventListener('resize', handleResize)

		// Clean up event listener on unmount
		return () => {
			window.removeEventListener('resize', handleResize)
		}
	}, [])

	const resetValues = (): void => {
		setRange({
			from:
				typeof initialDateFrom === 'string'
					? new Date(initialDateFrom)
					: initialDateFrom,
			to: initialDateTo
				? typeof initialDateTo === 'string'
					? new Date(initialDateTo)
					: initialDateTo
				: typeof initialDateFrom === 'string'
					? new Date(initialDateFrom)
					: initialDateFrom
		})
		setRangeCompare(
			initialCompareFrom
				? {
						from:
							typeof initialCompareFrom === 'string'
								? new Date(initialCompareFrom)
								: initialCompareFrom,
						to: initialCompareTo
							? typeof initialCompareTo === 'string'
								? new Date(initialCompareTo)
								: initialCompareTo
							: typeof initialCompareFrom === 'string'
								? new Date(initialCompareFrom)
								: initialCompareFrom
					}
				: undefined
		)
	}

	// Helper function to check if two date ranges are equal
	const areRangesEqual = (a?: DateRange, b?: DateRange) => {
		if (!a || !b) return a === b // If either is undefined, return true if both are undefined
		return (
			a.from.getTime() === b.from.getTime() &&
			(!a.to || !b.to || a.to.getTime() === b.to.getTime())
		)
	}

	useEffect(() => {
		if (isOpen) {
			openedRangeRef.current = range
			openedRangeCompareRef.current = rangeCompare
		}
	}, [isOpen, range, rangeCompare])

	return (
		<Popover
			modal={true}
			open={isOpen}
			onOpenChange={(open: boolean) => {
				if (!open) {
					resetValues()
				}
				setIsOpen(open)
			}}
		>
			<PopoverTrigger asChild>
				<Button
					size={'lg'}
					variant='outline'
					className='bg-transparent p-5'
				>
					<div className='text-right'>
						<div className='py-1'>
							<div>{`${formatDate(range.from, locale)}${
								range.to != null ? ' - ' + formatDate(range.to, locale) : ''
							}`}</div>
						</div>
						{rangeCompare != null && (
							<div className='-mt-1 text-xs opacity-60'>
								<>
									vs. {formatDate(rangeCompare.from, locale)}
									{rangeCompare.to != null
										? ` - ${formatDate(rangeCompare.to, locale)}`
										: ''}
								</>
							</div>
						)}
					</div>
					<div className='-mr-2 scale-125 pb-1 pl-1 opacity-60'>
						{isOpen ? (
							<ChevronUpIcon width={24} />
						) : (
							<ChevronDownIcon width={24} />
						)}
					</div>
				</Button>
			</PopoverTrigger>
			<PopoverContent
				align={align}
				className='w-auto'
			>
				<div className='flex py-2'>
					<div className='flex'>
						<div className='flex flex-col'>
							<div className='flex flex-col items-center justify-end gap-2 px-3 pb-4 lg:flex-row lg:items-start lg:pb-0'>
								<div className='flex items-center space-x-2 py-1 pr-4'>
									{showCompare && (
										<Switch
											defaultChecked={Boolean(rangeCompare)}
											onCheckedChange={(checked: boolean) => {
												if (checked) {
													if (!range.to) {
														setRange({
															from: range.from,
															to: range.from
														})
													}
													setRangeCompare({
														from: new Date(
															range.from.getFullYear(),
															range.from.getMonth(),
															range.from.getDate() - 365
														),
														to: range.to
															? new Date(
																	range.to.getFullYear() - 1,
																	range.to.getMonth(),
																	range.to.getDate()
																)
															: new Date(
																	range.from.getFullYear() - 1,
																	range.from.getMonth(),
																	range.from.getDate()
																)
													})
												} else {
													setRangeCompare(undefined)
												}
											}}
											id='compare-mode'
										/>
									)}
									<Label htmlFor='compare-mode'>Compare</Label>
								</div>
								<div className='flex flex-col gap-2'>
									<div className='flex gap-2'>
										<DateInput
											value={range.from}
											onChange={date => {
												const toDate =
													range.to == null || date > range.to ? date : range.to
												setRange(prevRange => ({
													...prevRange,
													from: date,
													to: toDate
												}))
											}}
										/>
										<div className='py-1'>-</div>
										<DateInput
											value={range.to}
											onChange={date => {
												const fromDate = date < range.from ? date : range.from
												setRange(prevRange => ({
													...prevRange,
													from: fromDate,
													to: date
												}))
											}}
										/>
									</div>
									{rangeCompare != null && (
										<div className='flex gap-2'>
											<DateInput
												value={rangeCompare?.from}
												onChange={date => {
													if (rangeCompare) {
														const compareToDate =
															rangeCompare.to == null || date > rangeCompare.to
																? date
																: rangeCompare.to
														setRangeCompare(prevRangeCompare => ({
															...prevRangeCompare,
															from: date,
															to: compareToDate
														}))
													} else {
														setRangeCompare({
															from: date,
															to: new Date()
														})
													}
												}}
											/>
											<div className='py-1'>-</div>
											<DateInput
												value={rangeCompare?.to}
												onChange={date => {
													if (rangeCompare && rangeCompare.from) {
														const compareFromDate =
															date < rangeCompare.from
																? date
																: rangeCompare.from
														setRangeCompare({
															...rangeCompare,
															from: compareFromDate,
															to: date
														})
													}
												}}
											/>
										</div>
									)}
								</div>
							</div>

							<div>
								<Calendar
									mode='range'
									onSelect={(value: { from?: Date; to?: Date } | undefined) => {
										if (value?.from != null) {
											setRange({ from: value.from, to: value?.to })
										}
									}}
									selected={range}
									numberOfMonths={isSmallScreen ? 1 : 2}
									defaultMonth={
										new Date(
											new Date().setMonth(
												new Date().getMonth() - (isSmallScreen ? 0 : 1)
											)
										)
									}
								/>
							</div>
						</div>
					</div>
				</div>
				<div className='flex justify-end gap-2 py-2 pr-4'>
					<Button
						onClick={() => {
							setIsOpen(false)
							resetValues()
						}}
						variant='ghost'
					>
						Cancel
					</Button>
					<Button
						onClick={() => {
							setIsOpen(false)
							if (
								!areRangesEqual(range, openedRangeRef.current) ||
								!areRangesEqual(rangeCompare, openedRangeCompareRef.current)
							) {
								onUpdate?.({ range, rangeCompare })
							}
						}}
					>
						Update
					</Button>
				</div>
			</PopoverContent>
		</Popover>
	)
}

DateRangePicker.displayName = 'DateRangePicker'
DateRangePicker.filePath =
	'libs/shared/ui-kit/src/lib/date-range-picker/date-range-picker.tsx'
