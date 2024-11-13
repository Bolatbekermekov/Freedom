'use client'

import { memo, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrders } from '../../../models/orders.model'

import { OrdersTableViewItem } from './OrdersTableViewItem'
import {
	Table,
	TableBody,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface OrdersTableViewProps {
	orders: IOrders[]
}

export const OrdersTableView = memo(
	({ orders }: Readonly<OrdersTableViewProps>) => {
		const { t } = useTranslation()

		const renderedList = useMemo(
			() =>
				orders.map(order => (
					<OrdersTableViewItem
						key={order._id}
						order={order}
					/>
				)),
			[orders]
		)

		return (
			<div>
				<Table className='rounded-2xl bg-white p-6'>
					<TableHeader>
						<TableRow>
							<TableHead></TableHead>
							<TableHead className='truncate'>#</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.PRODUCTS')}
							</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.DATE')}
							</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.QUANTITY')}
							</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.TOTAL')}
							</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.STATUS')}
							</TableHead>
							<TableHead className='truncate'>
								{t('ORDERS.TABLE.ASSIGNEE')}
							</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>{renderedList}</TableBody>
				</Table>
			</div>
		)
	}
)

OrdersTableView.displayName = 'OrdersTableView'
