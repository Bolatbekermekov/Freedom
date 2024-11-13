import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrders } from '../../models/orders.model'

import { ViewOrderPdfButton } from './ViewOrderPDFButton'
import { StringUtils } from '@/core/lib/strings.utils'

interface OrderReceiptDetailsProps {
	order: IOrders
}

export const OrderReceiptDetails = memo(
	({ order }: OrderReceiptDetailsProps) => {
		const { t } = useTranslation()

		const status = order.receiptReview
			? order.receiptReview.approved
				? t('ORDER_TRACK.RECEIPT.APPROVED')
				: t('ORDER_TRACK.RECEIPT.REJECTED')
			: t('ORDER_TRACK.RECEIPT.UNREVIEWED')

		const comment =
			order.receiptReview?.comment &&
			StringUtils.isNotEmpty(order.receiptReview.comment)
				? order.receiptReview.comment
				: t('ORDER_TRACK.RECEIPT.EMPTY_COMMENT')

		return (
			<div className='mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
				<div>
					<p className='text-slate-400'>{t('ORDER_TRACK.RECEIPT.STATUS')}</p>
					<p className='mt-1 font-medium'>{status}</p>
				</div>

				<div>
					<p className='text-slate-400'>{t('ORDER_TRACK.RECEIPT.COMMENT')}</p>
					<p className='mt-1 font-medium'>{comment}</p>
				</div>

				<div>
					<p className='text-slate-400'>{t('ORDER_TRACK.RECEIPT.DOCUMENT')}</p>
					<div className='mt-2'>
						<ViewOrderPdfButton orderId={order._id} />
					</div>
				</div>
			</div>
		)
	}
)

OrderReceiptDetails.displayName = 'OrderReceiptDetails'
