import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrderItems } from '../../models/orders.model'

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface OrderItemsTableProps {
	orderItems: IOrderItems[]
}

export const OrderItemsTable = memo(({ orderItems }: OrderItemsTableProps) => {
	const { t } = useTranslation()

	return (
		<Table className='bg-[#fcfdff]'>
			<TableHeader className='border-collapse'>
				<TableRow>
					<TableHead>{t('ORDER_TRACK.ORDER_DETAILS.TABLE.NAME')}</TableHead>
					<TableHead>{t('ORDER_TRACK.ORDER_DETAILS.TABLE.QUANTITY')}</TableHead>
					<TableHead>{t('ORDER_TRACK.ORDER_DETAILS.TABLE.PRICE')}</TableHead>
					<TableHead>{t('ORDER_TRACK.ORDER_DETAILS.TABLE.TOTAL')}</TableHead>
				</TableRow>
			</TableHeader>
			<TableBody className='border-collapse'>
				{orderItems.map((orderItem, index) => (
					<TableRow key={orderItem.product?._id ?? index}>
						<TableCell className='font-medium'>{orderItem.name}</TableCell>
						<TableCell className='font-medium text-slate-500'>
							{orderItem.quantity}
						</TableCell>
						<TableCell className='font-medium text-slate-500'>
							{orderItem.product.price.toLocaleString()}
						</TableCell>
						<TableCell className='font-medium text-slate-500'>
							{orderItem.price.toLocaleString()}
						</TableCell>
					</TableRow>
				))}
			</TableBody>
		</Table>
	)
})

OrderItemsTable.displayName = 'OrderItemsTable'
