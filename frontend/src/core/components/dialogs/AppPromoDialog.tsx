'use client'

import Link from 'next/link'

import { QRCodeSVG } from 'qrcode.react'
import { memo } from 'react'

import {
	APPLE_APP_LINK,
	GOOGLE_PLAY_APP_LINK
} from '@/core/constants/apps.contstant'
import { DialogProps } from '@/core/models/dialogs.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'

interface AppPromoDialogProps extends DialogProps {}

export const AppPromoDialog = memo(
	({ isOpen, toggleOpen }: AppPromoDialogProps) => {
		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>Для заказа установите приложение DentX</DialogTitle>
					</DialogHeader>

					<div className='p-4'>
						<div className='flex flex-wrap items-center justify-center gap-8 lg:flex-nowrap'>
							<div className='w-[200px]'>
								<QRCodeSVG
									className='w-full'
									value='https://me-qr.com/KLhxad8k'
								/>
							</div>

							<div>
								<p className='text-slate-600'>
									Используйте QR или нажмите на кнопки снизу чтобы перейти в
									магазин для загрузки приложения
								</p>

								<div className='mt-2 flex items-center gap-4'>
									<Link
										href={APPLE_APP_LINK}
										target='_blank'
										passHref
									>
										<picture>
											<img
												className='h-[34px] w-full max-w-[160px]'
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
												className='h-[45px] w-full max-w-[160px]'
												src='/icons/google_play_badge.png'
												alt='Google Play Store'
											/>
										</picture>
									</Link>
								</div>
							</div>
						</div>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

AppPromoDialog.displayName = 'AppPromoDialog'
