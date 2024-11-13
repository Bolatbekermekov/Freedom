'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useMemo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { AssignUserToOrderDTO } from '../../models/orders-dto.model'
import { IOrders } from '../../models/orders.model'
import { adminOrdersAPIService } from '../../services/orders-api.service'

import { DialogProps } from '@/core/models/dialogs.model'
import { Button } from '@/core/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage
} from '@/core/ui/form'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
import { useCompanyUsers } from '@/modules/admin/company-users/hooks/useCompanyUsers'

const assignUserToOrderSchema = z.object({
	userId: z.string()
})

type AssignUserToOrderSchemaType = z.infer<typeof assignUserToOrderSchema>

interface AssignUserToOrderProps extends DialogProps {
	order: IOrders
}

export const AssignUserToOrderDialog = memo(
	({ order, isOpen, toggleOpen }: AssignUserToOrderProps) => {
		const { t } = useTranslation()

		const { data: users } = useCompanyUsers({
			pagination: { paginate: false },
			filter: {}
		})

		const form = useForm<AssignUserToOrderSchemaType>({
			resolver: zodResolver(assignUserToOrderSchema),
			defaultValues: {
				userId: order.assignee?._id
			}
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['assign-user-order'],
			mutationFn: ({
				orderId,
				dto
			}: {
				orderId: string
				dto: AssignUserToOrderDTO
			}) => adminOrdersAPIService.assignUserToOrder(orderId, dto),
			onSuccess: () => {
				toast.success('Успешно назначен ответственный')
				queryClient.refetchQueries({ queryKey: ['admin-orders'] })
				form.reset()
			},
			onError: () => {
				toast.success('Не удалось назначить ответственного')
			}
		})

		const onSubmit = useCallback(
			(values: AssignUserToOrderSchemaType) => {
				const dto: AssignUserToOrderDTO = {
					userId: values.userId
				}

				mutate({ orderId: order._id, dto })
			},
			[mutate, order._id]
		)

		const renderedUsersList = useMemo(
			() =>
				users?.docs.map(user => (
					<SelectItem
						key={user._id}
						value={user._id}
					>
						{user.name}
					</SelectItem>
				)),
			[users?.docs]
		)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle className='leading-7'>
							{t('ORDERS.DIALOGS.ASSIGN.HEADER')}
						</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='flex w-full flex-col gap-4'
							>
								<FormField
									control={form.control}
									name='userId'
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{t('ORDERS.DIALOGS.ASSIGN.USER.LABEL')}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'ORDERS.DIALOGS.ASSIGN.USER.PLACEHOLDER'
															)}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>{renderedUsersList}</SelectContent>
											</Select>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type='submit'
									className='mt-8'
									disabled={isPending}
								>
									{t('ORDERS.DIALOGS.ASSIGN.ASSIGN_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

AssignUserToOrderDialog.displayName = 'AssignUserToOrderDialog'
