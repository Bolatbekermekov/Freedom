import Link from 'next/link'

import { QRCodeSVG } from 'qrcode.react'

import AppPromoBackground from '../../../../public/images/banner/app_promo_bg.webp'

import {
	APPLE_APP_LINK,
	GOOGLE_PLAY_APP_LINK
} from '@/core/constants/apps.contstant'

export const LandingAppBanner = () => {
	return (
		<div
			className='flex w-full justify-between gap-12 rounded-md p-8 md:p-12'
			style={{
				backgroundImage: `url(${AppPromoBackground.src})`,
				objectFit: 'cover'
			}}
		>
			<div>
				<h1 className='text-2xl font-bold text-white md:text-3xl md:leading-relaxed'>
					Удобный заказ в два касания <br /> Cкачайте приложение DentX!
				</h1>

				<div className='mt-3 flex items-center gap-4 md:mt-5'>
					<Link
						href={APPLE_APP_LINK}
						target='_blank'
						passHref
					>
						<picture>
							<img
								className='h-[45px] w-full max-w-[160px]'
								src='/icons/app_store_badge.svg'
								alt='App Store'
							/>
						</picture>
					</Link>
					<Link
						href={GOOGLE_PLAY_APP_LINK}
						target='_blank'
						passHref
					>
						<picture>
							<img
								className='h-[58px] w-full max-w-[160px]'
								src='/icons/google_play_badge.png'
								alt='Google Play Store'
							/>
						</picture>
					</Link>
				</div>
			</div>

			<div className='hidden items-center gap-4 rounded-md bg-white px-4 py-2 sm:flex md:gap-8'>
				<QRCodeSVG
					className='w-[100px] md:w-[150px]'
					value='https://me-qr.com/KLhxad8k'
				/>
				<p className='text-slate-600'>
					Наведите камеру <br /> и скачайте бесплатное <br />
					приложение DentX
				</p>
			</div>
		</div>
	)
}
