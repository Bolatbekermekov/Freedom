'use client'

import { FileSpreadsheet, Landmark, ReceiptText, User } from 'lucide-react'
import { useTranslation } from 'react-i18next'

import { OrderCustomerInfo } from '../components/order-track/OrderCustomerInfo'
import { OrderItemsTable } from '../components/order-track/OrderItemsTable'
import { OrderReceiptDetails } from '../components/order-track/OrderReceiptDetails'
import { OrderTrackToolbar } from '../components/order-track/OrderTrackToolbar'
import { OrdersPaidTable } from '../components/order-track/OrdersPaidTable'
import { useAdminOrder } from '../hooks/useOrder'

interface OrderTrackPageProps {
	orderId: string
}

export const OrderTrackPage = ({ orderId }: OrderTrackPageProps) => {
	const { t } = useTranslation()
	const { data } = useAdminOrder(orderId)

	return (
		<>
			{data && (
				<div>
					<OrderTrackToolbar order={data} />

					<div className='mt-6 flex flex-wrap gap-8 md:mt-10'>
						<div className='order-2 flex-1 md:order-1'>
							<div>
								<h3 className='flex items-center gap-3 text-lg font-medium'>
									<FileSpreadsheet className='h-5 w-5' />
									{t('ORDER_TRACK.ORDER_DETAILS.LABEL')}
								</h3>

								<div className='mt-4 overflow-hidden rounded-lg border border-slate-200'>
									<OrderItemsTable orderItems={data.orderItems} />
								</div>
							</div>

							<div className='mt-8'>
								<div className='flex items-center justify-between gap-3'>
									<h3 className='flex items-center gap-3 text-lg font-medium'>
										<Landmark className='h-5 w-5' />
										{t('ORDER_TRACK.PAYMENT_DETAILS.LABEL')}
									</h3>
								</div>

								<div className='mt-4 overflow-hidden rounded-lg border border-slate-200'>
									<OrdersPaidTable order={data} />
								</div>
							</div>
						</div>

						<div className='order-1 w-full md:order-2 lg:max-w-[350px]'>
							<div>
								<h3 className='flex items-center gap-3 text-lg font-medium'>
									<User className='h-5 w-5' />
									{t('ORDER_TRACK.CUSTOMER_DETAILS.LABEL')}
								</h3>
								<OrderCustomerInfo order={data} />
							</div>

							<div className='mt-8'>
								<h3 className='flex items-center gap-3 text-lg font-medium'>
									<ReceiptText className='h-5 w-5' />
									{t('ORDER_TRACK.RECEIPT.LABEL')}
								</h3>
								<OrderReceiptDetails order={data} />
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}
