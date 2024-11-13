import { memo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrders } from '../../models/orders.model'

import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableRow
} from '@/core/ui/table'

interface OrdersPaidTableProps {
	order: IOrders
}

const TableRowComponent = ({
	label,
	value
}: {
	label: string
	value: number | string
}) => (
	<TableRow>
		<TableCell className='font-medium text-slate-500'>{label}</TableCell>
		<TableCell
			colSpan={2}
			className='text-right font-medium text-slate-500'
		>
			{value.toLocaleString()}
		</TableCell>
	</TableRow>
)

export const OrdersPaidTable = memo(({ order }: OrdersPaidTableProps) => {
	const { t } = useTranslation()

	return (
		<Table className='bg-[#fcfdff]'>
			<TableBody>
				<TableRowComponent
					label={t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.SUBTOTAL')}
					value={order.itemsPrice}
				/>

				{order.shippingCharges ? (
					<TableRowComponent
						label={t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.SHIPPING')}
						value={t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.FREE_SHIPPING')}
					/>
				) : (
					<TableRowComponent
						label={t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.SHIPPING')}
						value={t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.PAID_SHIPPING')}
					/>
				)}

				{(order.discountPercentage ?? 0) > 0 && (
					<TableRowComponent
						label={`${t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.DISCOUNT')} (${order.discountPercentage}%)`}
						value={order.discount ?? 0}
					/>
				)}
			</TableBody>

			<TableFooter>
				<TableRow>
					<TableCell
						colSpan={2}
						className='font-bold'
					>
						{t('ORDER_TRACK.PAYMENT_DETAILS.TABLE.TOTAL')}
					</TableCell>
					<TableCell className='text-right font-bold'>
						{order.totalAmount.toLocaleString()}
					</TableCell>
				</TableRow>
			</TableFooter>
		</Table>
	)
})

OrdersPaidTable.displayName = 'OrdersPaidTable'
