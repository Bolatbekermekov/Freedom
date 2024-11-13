'use client'

import Link from 'next/link'

import RegisterStoreForm from '../components/RegisterStoreForm'

import { AUTH_PAGES } from '@/core/config/pages-url.config'
import { useProfile } from '@/core/hooks/useProfile'
import { Button } from '@/core/ui/button'
import { Skeleton } from '@/core/ui/skeleton'

export const RegisterStorePage = () => {
	const { data: currentUser, isPending: isCurrentUserLoading } = useProfile()

	return (
		<div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-r from-[#4776E6] to-[#8E54E9] p-4'>
			{currentUser && !isCurrentUserLoading && (
				<div className='w-[450px] rounded-xl bg-white p-8 shadow-md '>
					<h1 className='text-center text-2xl font-bold'>
						Регистрация магазина
					</h1>
					<h2 className='mt-1 text-center text-text_primary-light'>
						Введите информацию о вашем магазине, он будет автоматически присвоен
						к вашему аккаунту
					</h2>

					<div className='mt-8'>
						<RegisterStoreForm />
					</div>
				</div>
			)}

			{!currentUser && !isCurrentUserLoading && (
				<div className='w-[450px] rounded-xl bg-white p-8 shadow-md '>
					<h1 className='text-center text-2xl font-bold'>
						Для начала войдите в свой аккаунт
					</h1>
					<h2 className='mt-2 text-center text-text_primary-light'>
						Информация о магазине будет присвоена вашему аккаунту
					</h2>

					<Link
						prefetch
						href={AUTH_PAGES.LOGIN}
						className='w-full'
					>
						<Button className='!mt-8 w-full'>Войти</Button>
					</Link>
				</div>
			)}

			{isCurrentUserLoading && (
				<Skeleton className='h-[260px] w-[450px] rounded-xl' />
			)}
		</div>
	)
}
