import { Metadata } from 'next'

import { NO_INDEX_PAGE } from '@/core/constants/seo.constant'
import { OrderTrackPage } from '@/modules/admin/orders/pages/OrderTrackPage'

export const metadata: Metadata = {
	title: 'Заказ',
	...NO_INDEX_PAGE
}

export default async function Page({
	params
}: Readonly<{ params: { orderId: string } }>) {
	return <OrderTrackPage orderId={params.orderId} />
}
