'use client'

import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { DialogProps } from '@/core/models/dialogs.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'

interface OrderPdfDialogProps extends DialogProps {
	blobUrl: string
}

export const OrderPdfDialog = memo(
	({ blobUrl, isOpen, toggleOpen }: OrderPdfDialogProps) => {
		const { t } = useTranslation()

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-[95vh] max-w-[1200px] overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle className='leading-7'>
							{t('ORDER_TRACK.RECEIPT.LABEL')}
						</DialogTitle>
					</DialogHeader>

					<div className='!mt-2 h-full'>
						<iframe
							className='h-[80vh] w-full'
							src={blobUrl}
						/>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

OrderPdfDialog.displayName = 'OrderPdfDialog'
