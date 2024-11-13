'use client'

import Link from 'next/link'

import { useTranslation } from 'react-i18next'

import SignupForm from './components/SignupForm'
import { AUTH_PAGES } from '@/core/config/pages-url.config'

export default function SignupPage() {
	const { t } = useTranslation()

	return (
		<div className='flex min-h-screen w-full items-center justify-center bg-gradient-to-r from-[#4776E6] to-[#8E54E9] p-4'>
			<div className='w-[450px] rounded-xl bg-white p-8 shadow-md '>
				<h1 className='text-center text-2xl font-bold'>
					{t('AUTH.SIGNUP.HEADER')}
				</h1>
				<h2 className='mt-1 text-center text-text_primary-light'>
					{t('AUTH.SIGNUP.SUBTITLE')}
				</h2>

				<div className='mt-8'>
					<SignupForm />
				</div>

				<div className='mt-8'>
					<p className='text-center text-text_primary-light'>
						{t('AUTH.SIGNUP.ALTERNATIVES')}{' '}
						<Link
							href={AUTH_PAGES.LOGIN}
							className='text-primary underline'
						>
							{t('AUTH.LOGIN.LABEL')}
						</Link>
					</p>
				</div>
			</div>
		</div>
	)
}
