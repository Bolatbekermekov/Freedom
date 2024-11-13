'use client'

import debounce from 'lodash.debounce'
import { ChevronsUpDown } from 'lucide-react'
import { memo, useMemo, useState } from 'react'

import { useAdminProducts } from '../hooks/useProducts'

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

interface ProductsAutocompleteProps {
	onSelectId: (id: string) => void
	label: string
	placeholder: string
}
const skeletons = new Array(10).fill(null)

export const ProductsAutocomplete = memo(
	({ onSelectId, label, placeholder }: ProductsAutocompleteProps) => {
		const [openBox, setOpenBox] = useState(false)
		const [searchValue, setSearchValue] = useState('')

		const { data, isLoading } = useAdminProducts({
			filter: { searchValue },
			pagination: { size: 40 }
		})

		const debouncedSearch = useMemo(
			() => debounce(value => setSearchValue(value), 500),
			[]
		)

		const renderedLoadingSkeletons = useMemo(() => {
			return skeletons.map((_, index) => (
				<CommandItem key={index}>
					<Skeleton className='h-[26px] w-full' />
				</CommandItem>
			))
		}, [])

		const renderedList = useMemo(() => {
			return data?.docs.map(product => (
				<CommandItem
					key={product._id}
					value={`${product.name}_${product._id}`}
					onSelect={() => {
						onSelectId(product._id)
						setOpenBox(false)
					}}
				>
					{product.name}
				</CommandItem>
			))
		}, [data?.docs, onSelectId])

		return (
			<>
				<Button
					variant='outline'
					onClick={() => setOpenBox(open => !open)}
					className='w-full justify-between truncate'
					type='button'
				>
					{label}
					<ChevronsUpDown className='ml-2 h-4 w-4 shrink-0 opacity-50' />
				</Button>

				<CommandDialog
					open={openBox}
					onOpenChange={setOpenBox}
				>
					<CommandInput
						placeholder={placeholder}
						onValueChange={debouncedSearch}
					/>
					<CommandList>
						<CommandEmpty></CommandEmpty>
						{isLoading && (
							<CommandGroup>{renderedLoadingSkeletons}</CommandGroup>
						)}
						{data && <CommandGroup>{renderedList}</CommandGroup>}
					</CommandList>
				</CommandDialog>
			</>
		)
	}
)

ProductsAutocomplete.displayName = 'ProductsAutocomplete'
