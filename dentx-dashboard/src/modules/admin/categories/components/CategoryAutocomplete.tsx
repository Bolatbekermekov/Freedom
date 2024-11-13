import { Check, ChevronsUpDown } from 'lucide-react'
import { memo, useCallback, useEffect, useMemo, useState } from 'react'

import { useAdminCategories } from '../hooks/useCategories'

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

interface CategoryAutocompleteProps {
	onSelectId: (id: string | null) => void
	selectedId?: string
	initialSearchValue?: string
	label: string
	placeholder: string
}

const skeletons = new Array(10).fill(null)

export const CategoryAutocomplete = memo(
	({
		onSelectId,
		label,
		placeholder,
		selectedId,
		initialSearchValue
	}: CategoryAutocompleteProps) => {
		const [openBox, setOpenBox] = useState(false)
		const [searchValue, setSearchValue] = useState<string | undefined>(
			initialSearchValue
		)

		const { data, isPending } = useAdminCategories({
			filter: {},
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
			return skeletons.map((skeleton, index) => (
				<CommandItem key={index}>
					<Skeleton className='h-[32px] w-full' />
				</CommandItem>
			))
		}, [])

		const renderedList = useMemo(
			() =>
				data?.docs.map(category => (
					<CommandItem
						key={category.id}
						value={category.section}
						onSelect={() => {
							onSearchValueChange(category.section)
							onSelectId(category.id)
							setOpenBox(false)
						}}
					>
						<Check
							className={cn(
								'mr-2 h-4 w-4',
								selectedId === category.id ? 'opacity-100' : 'opacity-0'
							)}
						/>
						{category.section}
					</CommandItem>
				)),
			[data?.docs, onSearchValueChange, onSelectId, selectedId]
		)

		return (
			<>
				<Button
					variant='outline'
					role='combobox'
					type='button'
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

CategoryAutocomplete.displayName = 'CategoryAutocomplete'
