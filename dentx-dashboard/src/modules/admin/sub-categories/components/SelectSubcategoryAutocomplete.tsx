import { Check, ChevronsUpDown } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useAdminSubCategories } from '../hooks/useSubCategories'
import { ISubCategoryFilter } from '../models/sub-category-dto.model'

import { cn } from '@/core/lib/tailwind.utils'
import { Button } from '@/core/ui/button'
import {
	CommandDialog,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList
} from '@/core/ui/command'
import { Skeleton } from '@/core/ui/skeleton'

interface SelectSubcategoryAutocompleteProps {
	onSelectId: (v: string | null) => void
	selectedId?: string
	initialSearchValue?: string
	label: string
	placeholder: string
	filter: Partial<ISubCategoryFilter>
}

export const SelectSubcategoryAutocomplete = memo(
	({
		onSelectId,
		label,
		selectedId,
		placeholder,
		filter,
		initialSearchValue
	}: SelectSubcategoryAutocompleteProps) => {
		const [openBox, setOpenBox] = useState(false)
		const [searchValue, setSearchValue] = useState<string | undefined>(
			initialSearchValue
		)

		const { data, isPending } = useAdminSubCategories({
			filter: { ...filter },
			pagination: { paginate: false }
		})

		const onSearchValueChange = useCallback((v: string | null) => {
			setSearchValue(v ? v.trim() : undefined)
		}, [])

		useEffect(() => {
			if (!selectedId) {
				onSearchValueChange(null)
			}
		}, [onSearchValueChange, selectedId])

		const renderedLoadingSkeletons = useMemo(() => {
			const skeletons = new Array(10).fill(null)
			return skeletons.map((skeleton, index) => (
				<CommandItem key={index}>
					<Skeleton className='h-[32px] w-full' />
				</CommandItem>
			))
		}, [])

		const renderedList = useMemo(
			() =>
				data?.docs.map(subcategory => (
					<CommandItem
						key={subcategory._id}
						value={subcategory._id}
						onSelect={() => {
							onSearchValueChange(subcategory.category)
							onSelectId(subcategory._id)
							setOpenBox(false)
						}}
					>
						<Check
							className={cn(
								'mr-2 h-4 w-4',
								subcategory._id === selectedId ? 'opacity-100' : 'opacity-0'
							)}
						/>
						{subcategory.category}
					</CommandItem>
				)),
			[data?.docs, onSearchValueChange, onSelectId, selectedId]
		)

		return (
			<>
				<Button
					variant='outline'
					type='button'
					role='combobox'
					onClick={() => setOpenBox(p => !p)}
					className='w-full justify-between truncate'
				>
					{searchValue ?? label}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>

				<CommandDialog
					open={openBox}
					onOpenChange={setOpenBox}
				>
					<CommandInput placeholder={placeholder} />
					<CommandList>
						<CommandEmpty></CommandEmpty>
						{data && (
							<CommandGroup>
								<CommandItem
									key={0}
									value={''}
									onSelect={() => {
										onSearchValueChange(null)
										onSelectId(null)
									}}
								>
									<Check className='mr-2 h-4 w-4 opacity-0' />
									Не выбрано
								</CommandItem>

								{renderedList}
							</CommandGroup>
						)}
						{isPending && (
							<CommandGroup>{renderedLoadingSkeletons}</CommandGroup>
						)}
					</CommandList>
				</CommandDialog>
			</>
		)
	}
)

SelectSubcategoryAutocomplete.displayName = 'SelectSubcategoryAutocomplete'
