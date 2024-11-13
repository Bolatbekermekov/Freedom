'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
	IOrdersFilter,
	OrdersSortTypes,
	OrdersViewTypes
} from '../../models/orders-dto.model'
import { ORDER_STATUSES } from '../../models/orders.model'

import { useFilter } from '@/core/hooks/useFilter'
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger
} from '@/core/ui/accordion'
import { Form, FormControl, FormField, FormItem } from '@/core/ui/form'
import { Input } from '@/core/ui/input'
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectLabel,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'

const SELECT_STATUS_OPTIONS = [
	{
		status: ORDER_STATUSES.ALL,
		label: 'ORDERS.FILTER.STATUSES.ALL'
	},
	{
		status: ORDER_STATUSES.ACTIVE,
		label: 'ORDERS.FILTER.STATUSES.ACTIVE'
	},
	{
		status: ORDER_STATUSES.CREATED,
		label: 'ORDERS.FILTER.STATUSES.CREATED'
	},
	{
		status: ORDER_STATUSES.DELIVERED,
		label: 'ORDERS.FILTER.STATUSES.DELIVERED'
	},
	{
		status: ORDER_STATUSES.NEXT_DAY_SHIPPING,
		label: 'ORDERS.FILTER.STATUSES.NEXT_DAY_SHIPPING'
	},
	{
		status: ORDER_STATUSES.PREPARING,
		label: 'ORDERS.FILTER.STATUSES.PREPARING'
	},
	{
		status: ORDER_STATUSES.REVIEW_REJECTED_BY_USER,
		label: 'ORDERS.FILTER.STATUSES.REVIEW_REJECTED_BY_USER'
	},
	{
		status: ORDER_STATUSES.SHIPPED,
		label: 'ORDERS.FILTER.STATUSES.SHIPPED'
	},
	{
		status: ORDER_STATUSES.UPDATED_BY_ADMIN,
		label: 'ORDERS.FILTER.STATUSES.UPDATED_BY_ADMIN'
	},
	{
		status: ORDER_STATUSES.CANCELLED,
		label: 'ORDERS.FILTER.STATUSES.CANCELLED'
	}
]

const ordersFilterSchema = z.object({
	searchValue: z.string().optional(),
	sort: z.string().optional(),
	status: z.nativeEnum(ORDER_STATUSES).optional(),
	view: z.string().optional()
})

type OrdersFilterSchemaType = z.infer<typeof ordersFilterSchema>

interface OrdersFilterProps {
	filter: IOrdersFilter
	onFilterChange: (filter: IOrdersFilter) => void
}

const DEFAULT_VALUES: IOrdersFilter = {
	searchValue: undefined,
	sort: OrdersSortTypes.DATE_DESC,
	view: OrdersViewTypes.TABLE,
	status: ORDER_STATUSES.ACTIVE
}

export const OrdersFilter = memo(
	({ filter, onFilterChange }: Readonly<OrdersFilterProps>) => {
		const { t } = useTranslation()

		const form = useForm<OrdersFilterSchemaType>({
			resolver: zodResolver(ordersFilterSchema),
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? DEFAULT_VALUES.sort,
				view: filter.view ?? DEFAULT_VALUES.view,
				status: filter.status ?? DEFAULT_VALUES.status
			}
		})

		useFilter({
			form,
			onFilterChange,
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? DEFAULT_VALUES.sort,
				view: filter.view ?? DEFAULT_VALUES.view,
				status: filter.status ?? DEFAULT_VALUES.status
			}
		})

		const onSubmit = useCallback(
			(values: OrdersFilterSchemaType) => {
				onFilterChange({
					searchValue: values.searchValue,
					sort: values.sort,
					view: values.view,
					status: values.status
				})
			},
			[onFilterChange]
		)

		return (
			<Accordion
				type='single'
				collapsible
				className='rounded-2xl bg-white px-6 py-4'
			>
				<AccordionItem
					value='filter'
					className='border-none'
				>
					<AccordionTrigger className='p-0'>
						{t('FILTERS.LABEL')}
					</AccordionTrigger>
					<AccordionContent className='p-4'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='3xl:grid-cols-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3'
							>
								<FormField
									control={form.control}
									name='searchValue'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder={t('ORDERS.FILTER.TERM')}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='sort'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder={t('FILTERS.SORT')} />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>{t('FILTERS.SORT')}</SelectLabel>
															<SelectItem value={OrdersSortTypes.DATE_ASC}>
																{t('ORDERS.FILTER.SORT.DATE_ASC')}
															</SelectItem>
															<SelectItem value={OrdersSortTypes.DATE_DESC}>
																{t('ORDERS.FILTER.SORT.DATE_DESC')}
															</SelectItem>
														</SelectGroup>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='status'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder={t('FILTERS.STATUS')} />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>{t('FILTERS.STATUS')}</SelectLabel>
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
											</FormControl>
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='view'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue placeholder={t('FILTERS.VIEW')} />
													</SelectTrigger>
													<SelectContent>
														<SelectGroup>
															<SelectLabel>{t('FILTERS.VIEW')}</SelectLabel>
															<SelectItem value={OrdersViewTypes.TABLE}>
																{t('ORDERS.FILTER.VIEW.TABLE')}
															</SelectItem>
															{/* <SelectItem value={OrdersViewTypes.LIST}>
																{t('ORDERS.FILTER.VIEW.LIST')}
															</SelectItem> */}
														</SelectGroup>
													</SelectContent>
												</Select>
											</FormControl>
										</FormItem>
									)}
								/>
							</form>
						</Form>
					</AccordionContent>
				</AccordionItem>
			</Accordion>
		)
	}
)

OrdersFilter.displayName = 'OrdersFilter'
