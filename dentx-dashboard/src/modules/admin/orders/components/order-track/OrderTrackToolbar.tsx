import dynamic from 'next/dynamic'
import { useRouter } from 'next/navigation'

import { useMutation } from '@tanstack/react-query'
import { ArrowLeft, Pen } from 'lucide-react'
import { memo, useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'

import {
	UpdateOrderDTO,
	UpdateOrderPaymentDTO
} from '../../models/orders-dto.model'
import {
	IOrders,
	ORDER_PAYMENT_STATUSES,
	ORDER_STATUSES
} from '../../models/orders.model'
import { adminOrdersAPIService } from '../../services/orders-api.service'

import { Button } from '@/core/ui/button'
import { Label } from '@/core/ui/label'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'

const UpdateOrderDialog = dynamic(
	() =>
		import('../dialogs/update-order-dialog/UpdateOrderDialog').then(
			m => m.UpdateOrderDialog
		),
	{
		ssr: false
	}
)

interface OrderTrackToolbarProps {
	order: IOrders
}

const SELECT_STATUS_OPTIONS = [
	{
		status: ORDER_STATUSES.CREATED,
		label: 'ORDER_TRACK.ORDER_STATUSES.CREATED'
	},
	{
		status: ORDER_STATUSES.DELIVERED,
		label: 'ORDER_TRACK.ORDER_STATUSES.DELIVERED'
	},
	{
		status: ORDER_STATUSES.NEXT_DAY_SHIPPING,
		label: 'ORDER_TRACK.ORDER_STATUSES.NEXT_DAY_SHIPPING'
	},
	{
		status: ORDER_STATUSES.PREPARING,
		label: 'ORDER_TRACK.ORDER_STATUSES.PREPARING'
	},
	{
		status: ORDER_STATUSES.REVIEW_REJECTED_BY_USER,
		label: 'ORDER_TRACK.ORDER_STATUSES.REVIEW_REJECTED_BY_USER'
	},
	{
		status: ORDER_STATUSES.SHIPPED,
		label: 'ORDER_TRACK.ORDER_STATUSES.SHIPPED'
	},
	{
		status: ORDER_STATUSES.UPDATED_BY_ADMIN,
		label: 'ORDER_TRACK.ORDER_STATUSES.UPDATED_BY_ADMIN'
	},
	{
		status: ORDER_STATUSES.CANCELLED,
		label: 'ORDER_TRACK.ORDER_STATUSES.CANCELLED'
	}
]

export const OrderTrackToolbar = memo(({ order }: OrderTrackToolbarProps) => {
	const { t } = useTranslation()

	const router = useRouter()

	const [updateModalOpen, setUpdateModalOpen] = useState(false)

	const [selectedOrderStatus, setSelectedOrderStatus] =
		useState<ORDER_STATUSES>(order.orderStatus)

	const [selectedPaymentStatus, setSelectedPaymentStatus] =
		useState<ORDER_PAYMENT_STATUSES>(
			order.isPaid ? ORDER_PAYMENT_STATUSES.PAID : ORDER_PAYMENT_STATUSES.UNPAID
		)

	const { mutate: updateOrder } = useMutation({
		mutationKey: ['update-order-status'],
		mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderDTO }) =>
			adminOrdersAPIService.updateOrder(id, dto),
		onSuccess: () => {
			toast.success('Изменен статус заказа')
		},
		onError: () => {
			toast.success('Не удалось изменить статус заказа')
		}
	})

	const { mutate: updateOrderPayment } = useMutation({
		mutationKey: ['update-order-payment'],
		mutationFn: ({ id, dto }: { id: string; dto: UpdateOrderPaymentDTO }) =>
			adminOrdersAPIService.updatePayment(id, dto),
		onSuccess: () => {
			toast.success('Изменен статус платежа!')
		},
		onError: () => {
			toast.error('Не удалось изменить статус платежа')
		}
	})

	const onBackClick = () => {
		router.back()
	}

	const toggleUpdateModal = useCallback(() => {
		setUpdateModalOpen(prev => !prev)
	}, [])

	const onOrderStatusChange = useCallback(
		(status: ORDER_STATUSES) => {
			setSelectedOrderStatus(status)
			updateOrder({ id: order._id, dto: { status } })
		},
		[order._id, updateOrder]
	)

	const onPaymentStatusChange = useCallback(
		(status: ORDER_PAYMENT_STATUSES) => {
			setSelectedPaymentStatus(status)
			updateOrderPayment({
				id: order._id,
				dto: { isPaid: status === ORDER_PAYMENT_STATUSES.PAID }
			})
		},
		[order._id, updateOrderPayment]
	)

	return (
		<div className='flex flex-wrap items-center justify-between gap-x-2 gap-y-6'>
			<div className='flex items-center gap-7'>
				<button
					className='flex items-center justify-center rounded-lg border border-slate-300 p-2'
					onClick={onBackClick}
				>
					<ArrowLeft className='h-5 w-5 text-slate-600' />
				</button>
				<div className='flex flex-col gap-1'>
					<p className='text-2xl font-bold'>
						{t('ORDER_TRACK.HEADER')} #{order.autoId}
					</p>
					<p className='text-xs text-slate-600'>{order._id}</p>
				</div>
			</div>

			<div className='flex flex-wrap items-end gap-x-4 gap-y-3'>
				<div>
					<Label className='font-normal text-slate-400'>
						{t('ORDER_TRACK.ORDER_STATUSES.LABEL')}
					</Label>
					<Select
						onValueChange={onOrderStatusChange}
						value={selectedOrderStatus}
					>
						<SelectTrigger className='mt-1 w-[180px] border border-slate-300'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>
									{t('ORDER_TRACK.ORDER_STATUSES.LABEL')}
								</SelectLabel>
								{SELECT_STATUS_OPTIONS.map(item => (
									<SelectItem
										value={item.status}
										key={item.status}
									>
										{t(item.label)}
									</SelectItem>
								))}
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<div>
					<Label className='font-normal text-slate-400'>
						{t('ORDER_TRACK.PAYMENT_STATUS.LABEL')}
					</Label>
					<Select
						onValueChange={onPaymentStatusChange}
						value={selectedPaymentStatus}
					>
						<SelectTrigger className='mt-1 w-[180px] border border-slate-300'>
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectGroup>
								<SelectLabel>
									{t('ORDER_TRACK.PAYMENT_STATUS.LABEL')}
								</SelectLabel>
								<SelectItem value={ORDER_PAYMENT_STATUSES.PAID}>
									{t('ORDER_TRACK.PAYMENT_STATUS.PAID')}
								</SelectItem>
								<SelectItem value={ORDER_PAYMENT_STATUSES.UNPAID}>
									{t('ORDER_TRACK.PAYMENT_STATUS.UNPAID')}
								</SelectItem>
							</SelectGroup>
						</SelectContent>
					</Select>
				</div>

				<Button
					className='gap-3 border'
					onClick={toggleUpdateModal}
				>
					<Pen size={18} />
					Изменить
				</Button>

				{updateModalOpen && (
					<UpdateOrderDialog
						order={order}
						toggleOpen={toggleUpdateModal}
						isOpen={updateModalOpen}
					/>
				)}
			</div>
		</div>
	)
})

OrderTrackToolbar.displayName = 'OrderTrackToolbar'
