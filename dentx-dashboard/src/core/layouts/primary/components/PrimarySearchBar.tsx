'use client'

import { useRouter, useSearchParams } from 'next/navigation'

import { Search } from 'lucide-react'
import { useCallback, useEffect, useState } from 'react'

import { PRIMARY_PAGES } from '@/core/config/pages-url.config'

export const PrimarySearchBar = () => {
	const [searchValue, setSearchValue] = useState<string>('')
	const searchParams = useSearchParams()
	const router = useRouter()

	const onChangeSearchValue = useCallback((v: string) => {
		setSearchValue(v)
	}, [])

	useEffect(() => {
		onChangeSearchValue(searchParams.get('searchValue') ?? '')
	}, [onChangeSearchValue, searchParams])

	const onSearchClick = useCallback(() => {
		router.push(`${PRIMARY_PAGES.PRODUCTS}/?searchValue=${searchValue}`)
	}, [router, searchValue])

	const handleFormSubmit = useCallback(
		(event: React.FormEvent<HTMLFormElement>) => {
			event.preventDefault()
			onSearchClick()
		},
		[onSearchClick]
	)

	return (
		<form
			className='w-full'
			onSubmit={handleFormSubmit}
		>
			<div className='flex flex-1 items-center rounded-lg bg-primary p-[1px]'>
				<input
					type='text'
					className='w-full rounded-md border border-primary px-4 py-2'
					placeholder='Искать на DentX'
					value={searchValue}
					onChange={e => onChangeSearchValue(e.target.value)}
				/>

				<button
					type='submit'
					className='px-5 text-white'
					onClick={onSearchClick}
					disabled={!searchValue.length}
				>
					<Search size={20} />
				</button>
			</div>
		</form>
	)
}
