'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { CreateOrderDTO } from '../../../models/orders-dto.model'
import {
	IOrderItems,
	IOrderItemsDTO,
	PAYMENT_METHODS
} from '../../../models/orders.model'
import { adminOrdersAPIService } from '../../../services/orders-api.service'
import { AddOrderItemsTable } from '../components/AddOrderItemsTable'

import { useBarcodeInput } from '@/core/hooks/useBarcodeInput'
import { ResponseError } from '@/core/models/axios.models'
import { DialogProps } from '@/core/models/dialogs.model'
import { ToastService } from '@/core/services/toast.service'
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

const createOrderSchema = z.object({
	address: z.string(),
	city: z.string(),
	country: z.string(),
	paymentMethod: z.enum([PAYMENT_METHODS.COD, PAYMENT_METHODS.ONLINE]),
	shippingCharges: z.boolean(),
	customerName: z.string(),
	customerPhone: z.string()
})

type CreateOrderSchemaType = z.infer<typeof createOrderSchema>

interface CreateOrderDialogProps extends DialogProps {}

export const CreateOrderDialog = memo(
	({ isOpen, toggleOpen }: CreateOrderDialogProps) => {
		const {
			t,
			i18n: { language }
		} = useTranslation()

		const [orderItems, setOrderItems] = useState<IOrderItemsDTO[]>([])

		const form = useForm<CreateOrderSchemaType>({
			resolver: zodResolver(createOrderSchema),
			defaultValues: {
				address: undefined,
				city: undefined,
				country: undefined,
				paymentMethod: PAYMENT_METHODS.COD,
				shippingCharges: false
			}
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['create-order'],
			mutationFn: (data: CreateOrderDTO) =>
				adminOrdersAPIService.createOrder(data),
			onSuccess: () => {
				toast.success('Успешное создание заказа')
				form.reset()
				queryClient.refetchQueries({ queryKey: ['admin-orders'] })
				setOrderItems([])
			},
			onError: (err: ResponseError) => {
				ToastService.axiosError(err, 'Не удалось создать заказ', language)
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
					toast.warning('Select a product')
					return
				}

				const product = await adminProductsAPIService.getProductById(productId)

				if (!product) {
					toast.error('Product not found')
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
						toast.warning('Product not found for the scanned barcode.')
						return
					}

					updateOrderItems(foundProduct)
					toast.success('Продукт найден')
				} catch (error) {
					toast.warning('Product not found for the scanned barcode.')
				}
			},
			[updateOrderItems]
		)

		const onSubmit = useCallback(
			(values: CreateOrderSchemaType) => {
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
					toast.error('Please fill the order items table')
					return
				}

				const dto: CreateOrderDTO = {
					shippingInfo: {
						address: values.address,
						city: values.city,
						country: values.country
					},
					customerName: values.customerName,
					customerPhone: values.customerPhone,
					paymentMethod: values.paymentMethod,
					taxPrice: 0,
					shippingCharges: Boolean(values.shippingCharges),
					orderItems: orderItemsForm
				}

				mutate(dto)
			},
			[mutate, orderItems]
		)

		useBarcodeInput(findAndSelectProductByBarcode)

		return (
			<Dialog
				onOpenChange={toggleOpen}
				open={isOpen}
				modal
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen max-w-3xl overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>{t('ORDERS.DIALOGS.CREATE.HEADER')}</DialogTitle>
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
									{t('ORDERS.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CreateOrderDialog.displayName = 'CreateOrderDialog'
