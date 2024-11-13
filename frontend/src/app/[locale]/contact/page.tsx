import { Metadata } from 'next'

import PrimaryLayout from '@/core/layouts/primary/PrimaryLayout'
import { ContactForm } from '@/modules/help/components/ContactForm'

export const metadata: Metadata = {
	title: 'Контакты'
}

export default async function Page() {
	return (
		<PrimaryLayout>
			<div className='mx-auto mt-8 max-w-lg px-4'>
				<h1 className='text-2xl font-bold'>Свяжитесь с нами</h1>

				<div className='mt-6'>
					<ContactForm />
				</div>
			</div>
		</PrimaryLayout>
	)
}
