import dynamic from 'next/dynamic'

import { Download } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { orderReceiptService } from '../../services/order-receipt.service'

const OrderPdfDialog = dynamic(
	() => import('../dialogs/OrderPdfDialog').then(m => m.OrderPdfDialog),
	{
		ssr: false
	}
)

interface ViewOrderPDFProps {
	orderId: string
}

export const ViewOrderPdfButton = ({ orderId }: ViewOrderPDFProps) => {
	const { t } = useTranslation()

	const [isDownloading, setIsDownloading] = useState(false)
	const [orderPdfUrl, setOrderPdfUrl] = useState<string | null>(null)
	const [orderPdfDialogOpen, setOrderPdfDialogOpen] = useState(false)

	const toggleOrderPdfDialog = useCallback(() => {
		setOrderPdfDialogOpen(prev => !prev)
	}, [])

	const onOrderDownloadClick = useCallback(async () => {
		setIsDownloading(true)
		toggleOrderPdfDialog()

		const url = await orderReceiptService.getOrderPDFBlobUrl(orderId)
		setIsDownloading(false)
		setOrderPdfUrl(url)
	}, [orderId, toggleOrderPdfDialog])

	return (
		<div>
			<button
				className='flex items-center gap-2 hover:text-primary'
				onClick={onOrderDownloadClick}
				disabled={isDownloading}
			>
				{!isDownloading && (
					<>
						<Download className='h-4 w-4' />
						<p>{t('ORDER_TRACK.RECEIPT.DOWNLOAD')}</p>
					</>
				)}

				{isDownloading && (
					<p className='text-primary'>{t('ORDER_TRACK.RECEIPT.LOADING')}...</p>
				)}
			</button>

			{orderPdfDialogOpen && orderPdfUrl && (
				<OrderPdfDialog
					blobUrl={orderPdfUrl}
					isOpen={orderPdfDialogOpen}
					toggleOpen={toggleOrderPdfDialog}
				/>
			)}
		</div>
	)
}
