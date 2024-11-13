import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrders, PAYMENT_METHODS } from '../../models/orders.model'

interface OrderCustomerInfoProps {
	order: IOrders
}

const PAYMENT_METHODS_LOCALE: Record<PAYMENT_METHODS, string> = {
	COD: 'ORDER_TRACK.PAYMENT_METHODS.COD',
	ONLINE: 'ORDER_TRACK.PAYMENT_METHODS.ONLINE'
}

export const OrderCustomerInfo = memo(({ order }: OrderCustomerInfoProps) => {
	const { t } = useTranslation()

	return (
		<div className='mt-4 flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
			<div>
				<p className='text-slate-400'>
					{t('ORDER_TRACK.CUSTOMER_DETAILS.TABLE.NAME')}
				</p>
				<p className='mt-1 font-medium'>{order.customer.name}</p>
			</div>

			<div>
				<p className='text-slate-400'>
					{t('ORDER_TRACK.CUSTOMER_DETAILS.TABLE.PHONE')}
				</p>
				<p className='mt-1 font-medium'>{order.customer.phone}</p>
			</div>

			<div>
				<p className='text-slate-400'>
					{t('ORDER_TRACK.CUSTOMER_DETAILS.TABLE.ADDRESS')}
				</p>
				<p className='mt-1 font-medium'>
					{order.shippingInfo.address}, {order.shippingInfo.city},{' '}
					{order.shippingInfo.country}
				</p>
			</div>

			<div>
				<p className='text-slate-400'>
					{t('ORDER_TRACK.CUSTOMER_DETAILS.TABLE.PAYMENT_METHOD')}
				</p>
				<p className='mt-1 font-medium'>
					{t(PAYMENT_METHODS_LOCALE[order.paymentMethod])}
				</p>
			</div>
		</div>
	)
})

OrderCustomerInfo.displayName = 'OrderCustomerInfo'
