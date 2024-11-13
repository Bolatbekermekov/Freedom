'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { UpdateOrderDTO } from '../../../models/orders-dto.model'
import {
	IOrderItems,
	IOrderItemsDTO,
	IOrders,
	PAYMENT_METHODS
} from '../../../models/orders.model'
import { adminOrdersAPIService } from '../../../services/orders-api.service'
import { AddOrderItemsTable } from '../components/AddOrderItemsTable'

import { REQUIRED_MESSAGE } from '@/core/constants/forms.constant'
import { useBarcodeInput } from '@/core/hooks/useBarcodeInput'
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
import { Input } from '@/core/ui/input'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'
import { ProductsAutocomplete } from '@/modules/admin/products/autocomplete/ProductsAutocomplete'
import { IProducts } from '@/modules/admin/products/models/product.model'
import { adminProductsAPIService } from '@/modules/admin/products/services/products-api.service'

const updateOrderSchema = z.object({
	address: z.string().min(1, { message: REQUIRED_MESSAGE }),
	city: z.string().min(1, { message: REQUIRED_MESSAGE }),
	country: z.string().min(1, { message: REQUIRED_MESSAGE }),
	paymentMethod: z.enum([PAYMENT_METHODS.COD, PAYMENT_METHODS.ONLINE]),
	shippingCharges: z.boolean(),
	customerName: z.string().min(1, { message: REQUIRED_MESSAGE }),
	customerPhone: z.string().min(1, { message: REQUIRED_MESSAGE })
})

type UpdateOrderSchemaType = z.infer<typeof updateOrderSchema>

interface UpdateOrderDialogProps extends DialogProps {
	order: IOrders
}

export const UpdateOrderDialog = memo(
	({ isOpen, toggleOpen, order }: UpdateOrderDialogProps) => {
		const { t } = useTranslation()

		const existingOrderItemsDto: IOrderItemsDTO[] = useMemo(() => {
			return order.orderItems.map(o => ({
				product: o.product,
				quantity: o.quantity
			}))
		}, [order.orderItems])

		const [orderItems, setOrderItems] = useState<IOrderItemsDTO[]>(
			existingOrderItemsDto
		)

		const form = useForm<UpdateOrderSchemaType>({
			resolver: zodResolver(updateOrderSchema),
			defaultValues: {
				address: order.shippingInfo.address,
				city: order.shippingInfo.city,
				country: order.shippingInfo.country,
				paymentMethod: order.paymentMethod,
				shippingCharges: order.shippingCharges,
				customerName: order.customer.name,
				customerPhone: order.customer.phone
			}
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['update-order'],
			mutationFn: (data: UpdateOrderDTO) =>
				adminOrdersAPIService.updateOrder(order._id, data),
			onSuccess: () => {
				toast.success('Заказ успешно обновлен')
				queryClient.invalidateQueries({ queryKey: ['admin-orders'] })
				queryClient.invalidateQueries({ queryKey: ['admin-order', order._id] })
			},
			onError: () => {
				toast.error('Не удалось обновить заказ')
			}
		})

		const updateOrderItems = useCallback(
			(product: IProducts) => {
				const existingProductIndex = orderItems.findIndex(
					orderItem => orderItem.product._id === product._id
				)

				if (existingProductIndex !== -1) {
					const updatedOrderItems = [...orderItems]
					updatedOrderItems[existingProductIndex].quantity += 1
					setOrderItems(updatedOrderItems)
				} else {
					setOrderItems(prev => [...prev, { product, quantity: 1 }])
				}
			},
			[orderItems]
		)

		const addOrderItem = useCallback(
			async (productId: string) => {
				if (!productId) {
					toast.warning('Выберите продукт')
					return
				}

				const product = await adminProductsAPIService.getProductById(productId)

				if (!product) {
					toast.warning('Продукт не найден')
					return
				}

				updateOrderItems(product)
				toast.success('Продукт найден')
			},
			[updateOrderItems]
		)

		const findAndSelectProductByBarcode = useCallback(
			async (barcode: string) => {
				try {
					const foundProduct =
						await adminProductsAPIService.getProductByBarcode(barcode)

					if (!foundProduct) {
						toast.warning('Продукт по данному артикулу не найден')
						return
					}

					updateOrderItems(foundProduct)
					toast.success('Продукт найден')
				} catch (error) {
					toast.warning('Продукт по данному артикулу не найден')
				}
			},
			[updateOrderItems]
		)

		const onSubmit = useCallback(
			(values: UpdateOrderSchemaType) => {
				const orderItemsForm: IOrderItems[] = orderItems
					.filter(orderItem => orderItem.quantity > 0)
					.map(orderItem => ({
						product: orderItem.product,
						quantity: orderItem.quantity,
						name: orderItem.product.name,
						price: orderItem.quantity * orderItem.product.price,
						image: orderItem.product.images[0],
						barcode: orderItem.product.barcode
					}))

				if (orderItemsForm.length === 0) {
					toast.error('Выберите как минимум один товар')
					return
				}

				const dto: UpdateOrderDTO = {
					shippingInfo: {
						address: values.address,
						city: values.city,
						country: values.country
					},
					customerName: values.customerName,
					customerPhone: values.customerPhone,
					paymentMethod: values.paymentMethod,
					shippingCharges: Boolean(values.shippingCharges),
					orderItems: orderItemsForm,
					status: order.orderStatus
				}

				mutate(dto)
			},
			[mutate, order.orderStatus, orderItems]
		)

		useBarcodeInput(findAndSelectProductByBarcode)

		return (
			<Dialog
				onOpenChange={toggleOpen}
				open={isOpen}
				modal
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-[90vh] max-w-3xl overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>{t('ORDERS.DIALOGS.UPDATE.HEADER')}</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='flex w-full flex-col gap-4'
							>
								<Tabs
									defaultValue='orderItems'
									className='w-full'
								>
									<TabsList className='grid w-full grid-cols-2'>
										<TabsTrigger value='orderItems'>
											{t('ORDERS.DIALOGS.CREATE.PRODUCTS.LABEL')}
										</TabsTrigger>
										<TabsTrigger value='shipping'>
											{t('ORDERS.DIALOGS.CREATE.SHIPPING.LABEL')}
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value='orderItems'
										className='mt-8 space-y-4'
									>
										<AddOrderItemsTable
											orderItems={orderItems}
											setOrderItems={setOrderItems}
										/>

										<div className='flex items-center gap-5'>
											<ProductsAutocomplete
												onSelectId={addOrderItem}
												label={t(
													'ORDERS.DIALOGS.CREATE.PRODUCTS.SELECT_PRODUCT'
												)}
												placeholder={t(
													'ORDERS.DIALOGS.CREATE.PRODUCTS.SELECT_PRODUCT'
												)}
											/>
										</div>
									</TabsContent>

									<TabsContent
										value='shipping'
										className='mt-8 space-y-4'
									>
										<FormField
											control={form.control}
											name='customerName'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'ORDERS.DIALOGS.CREATE.SHIPPING.CUSTOMER_NAME.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'ORDERS.DIALOGS.CREATE.SHIPPING.CUSTOMER_NAME.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='customerPhone'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'ORDERS.DIALOGS.CREATE.SHIPPING.CUSTOMER_PHONE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															type='tel'
															placeholder={t(
																'ORDERS.DIALOGS.CREATE.SHIPPING.CUSTOMER_PHONE.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='paymentMethod'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('ORDERS.DIALOGS.CREATE.SHIPPING.PAYMENT.LABEL')}
													</FormLabel>
													<Select
														onValueChange={field.onChange}
														defaultValue={field.value}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue
																	placeholder={t(
																		'ORDERS.DIALOGS.CREATE.SHIPPING.PAYMENT.PLACEHOLDER'
																	)}
																/>
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value={PAYMENT_METHODS.COD}>
																{t(
																	'ORDERS.DIALOGS.CREATE.SHIPPING.PAYMENT.COD'
																)}
															</SelectItem>
															<SelectItem value={PAYMENT_METHODS.ONLINE}>
																{t(
																	'ORDERS.DIALOGS.CREATE.SHIPPING.PAYMENT.ONLINE'
																)}
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='shippingCharges'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'ORDERS.DIALOGS.CREATE.SHIPPING.SHIPPING_CHARGES.LABEL'
														)}
													</FormLabel>
													<Select
														onValueChange={value =>
															field.onChange(value === 'true')
														}
														defaultValue={field.value.toString()}
													>
														<FormControl>
															<SelectTrigger>
																<SelectValue
																	placeholder={t(
																		'ORDERS.DIALOGS.CREATE.SHIPPING.SHIPPING_CHARGES.PLACEHOLDER'
																	)}
																/>
															</SelectTrigger>
														</FormControl>
														<SelectContent>
															<SelectItem value='true'>
																{t(
																	'ORDERS.DIALOGS.CREATE.SHIPPING.SHIPPING_CHARGES.FREE'
																)}
															</SelectItem>
															<SelectItem value='false'>
																{t(
																	'ORDERS.DIALOGS.CREATE.SHIPPING.SHIPPING_CHARGES.PAID'
																)}
															</SelectItem>
														</SelectContent>
													</Select>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='address'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('ORDERS.DIALOGS.CREATE.SHIPPING.ADDRESS.LABEL')}
													</FormLabel>

													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'ORDERS.DIALOGS.CREATE.SHIPPING.ADDRESS.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='country'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('ORDERS.DIALOGS.CREATE.SHIPPING.COUNTRY.LABEL')}
													</FormLabel>

													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'ORDERS.DIALOGS.CREATE.SHIPPING.COUNTRY.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='city'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t('ORDERS.DIALOGS.CREATE.SHIPPING.CITY.LABEL')}
													</FormLabel>

													<FormControl>
														<Input
															type='text'
															placeholder={t(
																'ORDERS.DIALOGS.CREATE.SHIPPING.CITY.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>
									</TabsContent>
								</Tabs>

								<Button
									type='submit'
									className='mt-8'
									disabled={isPending}
								>
									{t('ORDERS.DIALOGS.UPDATE.UPDATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

UpdateOrderDialog.displayName = 'UpdateOrderDialog'
