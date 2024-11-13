import { X } from 'lucide-react'
import { Dispatch, SetStateAction, memo, useCallback, useMemo } from 'react'
import { useTranslation } from 'react-i18next'

import { IOrderItemsDTO } from '../../../models/orders.model'

import { Input } from '@/core/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

interface AddOrderItemsTableProps {
	orderItems: IOrderItemsDTO[]
	setOrderItems: Dispatch<SetStateAction<IOrderItemsDTO[]>>
}

export const AddOrderItemsTable = memo(
	({ orderItems, setOrderItems }: AddOrderItemsTableProps) => {
		const { t } = useTranslation()

		const changeItemQuantity = useCallback(
			(productId: string, quantity: string) => {
				const existingProductIndex = orderItems.findIndex(
					orderItem => orderItem.product._id === productId
				)

				const qty = isNaN(Number(quantity)) ? 0 : Number(quantity)

				if (existingProductIndex === -1) return

				const updatedOrderItems = [...orderItems]
				updatedOrderItems[existingProductIndex].quantity = qty <= 0 ? 0 : qty

				setOrderItems(updatedOrderItems)
			},
			[orderItems, setOrderItems]
		)

		const removeOrderItem = useCallback(
			(productId: string) => {
				setOrderItems(prev =>
					prev.filter(item => item.product._id !== productId)
				)
			},
			[setOrderItems]
		)

		const getProductTotalPrice = useCallback((orderItem: IOrderItemsDTO) => {
			return orderItem.product.price * orderItem.quantity
		}, [])

		const totalPrice = useMemo(() => {
			return orderItems.reduce(
				(acc, orderItem) =>
					(acc += orderItem.product.price * orderItem.quantity),
				0
			)
		}, [orderItems])

		const renderedList = useMemo(
			() =>
				orderItems.map(orderItem => (
					<TableRow
						key={orderItem.product._id}
						className='w-full'
					>
						<TableCell className='w-full'>{orderItem.product.name}</TableCell>
						<TableCell>
							<Input
								value={orderItem.quantity}
								onChange={e =>
									changeItemQuantity(orderItem.product._id, e.target.value)
								}
							/>
						</TableCell>
						<TableCell className='truncate'>
							{getProductTotalPrice(orderItem).toLocaleString()}
						</TableCell>
						<TableCell className='text-right'>
							<button onClick={() => removeOrderItem(orderItem.product._id)}>
								<X
									className='text-slate-500'
									size={18}
								/>
							</button>
						</TableCell>
					</TableRow>
				)),
			[changeItemQuantity, getProductTotalPrice, orderItems, removeOrderItem]
		)

		return (
			<div className='overflow-hidden rounded-lg border border-slate-200'>
				<Table className='bg-[#fcfdff]'>
					<TableHeader className='border-collapse'>
						<TableRow>
							<TableHead>
								{t('ORDERS.DIALOGS.CREATE.PRODUCTS.TABLE.NAME')}
							</TableHead>
							<TableHead>
								{t('ORDERS.DIALOGS.CREATE.PRODUCTS.TABLE.QUANTITY')}
							</TableHead>
							<TableHead>
								{t('ORDERS.DIALOGS.CREATE.PRODUCTS.TABLE.PRICE')}
							</TableHead>
							<TableHead></TableHead>
						</TableRow>
					</TableHeader>

					<TableBody className='border-collapse'>{renderedList}</TableBody>

					<TableFooter className='bg-slate-100'>
						<TableRow>
							<TableCell
								colSpan={4}
								className='font-bold'
							>
								{t('ORDERS.DIALOGS.CREATE.PRODUCTS.TABLE.TOTAL')}
							</TableCell>
							<TableCell className='w-full truncate text-right font-bold'>
								{totalPrice.toLocaleString()}
							</TableCell>
						</TableRow>
					</TableFooter>
				</Table>
			</div>
		)
	}
)

AddOrderItemsTable.displayName = 'AddOrderItemsTable'
