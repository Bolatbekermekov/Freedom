'use client'

import Link from 'next/link'

import { useTranslation } from 'react-i18next'

import LoginForm from './components/LoginForm'
import { AUTH_PAGES } from '@/core/config/pages-url.config'

export default function LoginPage() {
	const { t } = useTranslation()

	return (
		<div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-r from-[#4776E6] to-[#8E54E9] p-4'>
			<div className='w-[450px] rounded-xl bg-white p-8'>
				<h1 className='text-center text-2xl font-bold'>
					{t('AUTH.LOGIN.HEADER')}
				</h1>
				<h2 className='mt-1 text-center text-text_primary-light'>
					{t('AUTH.LOGIN.SUBTITLE')}
				</h2>

				<div className='mt-8'>
					<LoginForm />
				</div>

				<div className='mt-8'>
					<p className='text-center text-text_primary-light'>
						{t('AUTH.LOGIN.ALTERNATIVES')}{' '}
						<Link
							prefetch
							href={AUTH_PAGES.SIGNUP}
							className='text-primary underline'
						>
							{t('AUTH.SIGNUP.LABEL')}
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
