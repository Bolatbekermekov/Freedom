import { Metadata } from 'next'

import PrimaryLayout from '@/core/layouts/primary/PrimaryLayout'
import { LandingAppBanner } from '@/modules/landing/components/LandingAppBanner'
import { HomePage } from '@/modules/landing/pages/HomePage'

export const metadata: Metadata = {
	title: 'Главная'
}

export default async function Page() {
	return (
		<PrimaryLayout>
			<div className='mt-4 px-4'>
				<LandingAppBanner />
			</div>

			<div className='mt-8 px-4'>
				<p className='text-xl font-bold'>Рекомендуем</p>

				<HomePage />
			</div>
		</PrimaryLayout>
	)
}
