import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import dayjs from 'dayjs'
import { Package, User } from 'lucide-react'
import { MouseEvent, memo, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrders } from '../../../models/orders.model'

import { CustomTooltip } from '@/core/components/CustomTooltip'
import { TableCell, TableRow } from '@/core/ui/table'

const AssignUserToOrderDialog = dynamic(
	() =>
		import('../../dialogs/AssignUserToOrderDialog').then(
			m => m.AssignUserToOrderDialog
		),
	{
		ssr: false
	}
)

interface OrdersTableViewItemProps {
	order: IOrders
}

const ORDERS_STATUSES_LOCALIZATION: { [key: string]: string } = {
	'Order Created': 'ORDER_TRACK.ORDER_STATUSES.CREATED',
	Preparing: 'ORDER_TRACK.ORDER_STATUSES.PREPARING',
	Shipped: 'ORDER_TRACK.ORDER_STATUSES.SHIPPED',
	Delivered: 'ORDER_TRACK.ORDER_STATUSES.DELIVERED',
	REVIEW_REJECTED_BY_USER: 'ORDER_TRACK.ORDER_STATUSES.REVIEW_REJECTED_BY_USER',
	UPDATED_BY_ADMIN: 'ORDER_TRACK.ORDER_STATUSES.UPDATED_BY_ADMIN',
	NEXT_DAY_SHIPPING: 'ORDER_TRACK.ORDER_STATUSES.NEXT_DAY_SHIPPING',
	Cancelled: 'ORDER_TRACK.ORDER_STATUSES.CANCELLED'
}

export const OrdersTableViewItem = memo(
	({ order }: OrdersTableViewItemProps) => {
		const { t } = useTranslation()
		const router = useRouter()

		const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false)

		const toggleAssignUserDialog = useCallback(() => {
			setAssignUserDialogOpen(prev => !prev)
		}, [])

		const onClickActionCell = useCallback(
			(event: MouseEvent<HTMLTableCellElement>) => {
				event.stopPropagation()
			},
			[]
		)

		const orderItemsNames = useMemo(() => {
			return order.orderItems.map(orderItem => orderItem.name).join(', ')
		}, [order.orderItems])

		const orderItemsQuantity = useMemo(() => {
			return order.orderItems.reduce(
				(acc, current) => acc + current.quantity,
				0
			)
		}, [order.orderItems])

		const onSelectOrder = (id: string) => {
			router.push(`./orders/${id}`)
		}

		return (
			<TableRow
				className='cursor-pointer hover:bg-slate-100'
				onClick={() => onSelectOrder(order._id)}
			>
				<TableCell onClick={e => onClickActionCell(e)}>
					<div className='flex items-center gap-5'>
						<button
							onClick={toggleAssignUserDialog}
							className='flex items-center justify-center'
						>
							<User className='h-5 w-5 text-slate-500' />
						</button>

						{assignUserDialogOpen && (
							<AssignUserToOrderDialog
								order={order}
								isOpen={assignUserDialogOpen}
								toggleOpen={toggleAssignUserDialog}
							/>
						)}

						<button
							className='flex items-center justify-center'
							onClick={() => onSelectOrder(order._id)}
						>
							<Package className='h-5 w-5 text-slate-500' />
						</button>
					</div>
				</TableCell>
				<TableCell className='truncate'>{order.autoId}</TableCell>
				<TableCell>
					<CustomTooltip tooltip={orderItemsNames}>
						<p className='max-w-72 truncate'>{orderItemsNames}</p>
					</CustomTooltip>
				</TableCell>
				<TableCell className='truncate'>
					{dayjs(order.createdAt).format('D.M.YYYY')}
				</TableCell>
				<TableCell className='truncate'>{orderItemsQuantity}</TableCell>
				<TableCell className='truncate'>
					{order.itemsPrice.toLocaleString()}
				</TableCell>
				<TableCell className='truncate'>
					{t(ORDERS_STATUSES_LOCALIZATION[order.orderStatus])}
				</TableCell>
				<TableCell className='truncate'>
					{order.assignee?.name ?? '-'}
				</TableCell>
			</TableRow>
		)
	}
)

OrdersTableViewItem.displayName = 'OrdersTableViewItem'
