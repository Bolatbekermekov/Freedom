'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import { useAdminSubCategories } from '../../sub-categories/hooks/useSubCategories'
import {
	IProductsFilter,
	ProductsSortTypes,
	ProductsViewTypes
} from '../models/product-dto.model'

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

const productsFilterSchema = z.object({
	searchValue: z.string().optional(),
	sort: z.string().optional(),
	subCategoryId: z.string().optional(),
	view: z.string().optional()
})

type ProductsFilterSchemaType = z.infer<typeof productsFilterSchema>

interface ProductsFilterProps {
	filter: IProductsFilter
	onFilterChange: (filter: IProductsFilter) => void
}

const DEFAULT_VALUES: IProductsFilter = {
	searchValue: undefined,
	sort: ProductsSortTypes.DATE_DESC,
	view: ProductsViewTypes.TABLE,
	subCategoryId: undefined
}

export const ProductsFilter = memo(
	({ filter, onFilterChange }: Readonly<ProductsFilterProps>) => {
		const { t } = useTranslation()

		const { data: subCategories } = useAdminSubCategories({
			pagination: { paginate: false },
			filter: {}
		})

		const form = useForm<ProductsFilterSchemaType>({
			resolver: zodResolver(productsFilterSchema),
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? ProductsSortTypes.DATE_DESC,
				view: filter.view ?? ProductsViewTypes.TABLE,
				subCategoryId: filter.subCategoryId
			}
		})

		useFilter({
			form,
			onFilterChange,
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? ProductsSortTypes.DATE_DESC,
				view: filter.view ?? ProductsViewTypes.TABLE,
				subCategoryId: filter.subCategoryId
			}
		})

		const onSubmit = useCallback(
			(values: ProductsFilterSchemaType) => {
				onFilterChange({
					searchValue: values.searchValue,
					sort: values.sort,
					view: values.view,
					subCategoryId: values.subCategoryId
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
													placeholder={t('PRODUCTS.FILTER.TERM')}
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
															<SelectItem value={ProductsSortTypes.DATE_ASC}>
																{t('PRODUCTS.FILTER.SORT.DATE_ASC')}
															</SelectItem>
															<SelectItem value={ProductsSortTypes.DATE_DESC}>
																{t('PRODUCTS.FILTER.SORT.DATE_DESC')}
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
									name='subCategoryId'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Select
													onValueChange={field.onChange}
													defaultValue={field.value}
												>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'PRODUCTS.FILTER.SUB_CATEGORY.LABEL'
															)}
														/>
													</SelectTrigger>
													<SelectContent>
														<SelectItem value='None'>
															{t('PRODUCTS.FILTER.SUB_CATEGORY.NONE')}
														</SelectItem>
														{subCategories?.docs.map(subCategory => (
															<SelectItem
																value={subCategory._id}
																key={subCategory._id}
															>
																{subCategory.category}
															</SelectItem>
														))}
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
															<SelectItem value={ProductsViewTypes.TABLE}>
																{t('PRODUCTS.FILTER.VIEW.TABLE')}
															</SelectItem>
															{/* <SelectItem value={ProductsViewTypes.LIST}>
																{t('PRODUCTS.FILTER.VIEW.LIST')}
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

ProductsFilter.displayName = 'ProductsFilter'
