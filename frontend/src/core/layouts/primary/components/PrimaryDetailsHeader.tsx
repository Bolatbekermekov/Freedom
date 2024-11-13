import Link from 'next/link'

import { MapPin } from 'lucide-react'

export default async function PrimaryDetailsHeader() {
	return (
		<div className='flex w-full items-center justify-between gap-5'>
			<div className='flex cursor-pointer items-center gap-1'>
				<MapPin size={20} />
				<p className='font-bold'>Астана</p>
			</div>

			<div className='flex items-center gap-5 text-sm text-[#001a3499]'>
				<Link
					prefetch
					href='/store/register'
					className='rounded-sm bg-[#4400ff14] px-1 hover:text-primary'
				>
					Стать продавцом
				</Link>
				<Link
					href='/contact'
					className='hover:text-primary'
				>
					Помощь
				</Link>
			</div>
		</div>
	)
}
