'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
	CompanyUsersSortTypes,
	CompanyUsersViewTypes,
	ICompanyUsersFilter
} from '../../models/company-users-dto.model'

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

const companyUsersFilterSchema = z.object({
	searchValue: z.string().optional(),
	sort: z.string().optional(),
	view: z.string().optional()
})

type CompanyUsersFilterSchemaType = z.infer<typeof companyUsersFilterSchema>

interface CompanyUsersFilterProps {
	filter: ICompanyUsersFilter
	onFilterChange: (filter: ICompanyUsersFilter) => void
}

const DEFAULT_VALUES: ICompanyUsersFilter = {
	searchValue: undefined,
	sort: CompanyUsersSortTypes.DATE_DESC,
	view: CompanyUsersViewTypes.TABLE
}

export const CompanyUsersFilter = memo(
	({ filter, onFilterChange }: Readonly<CompanyUsersFilterProps>) => {
		const { t } = useTranslation()

		const form = useForm<CompanyUsersFilterSchemaType>({
			resolver: zodResolver(companyUsersFilterSchema),
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? DEFAULT_VALUES.sort,
				view: filter.view ?? DEFAULT_VALUES.view
			}
		})

		useFilter({
			form,
			onFilterChange,
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? DEFAULT_VALUES.sort,
				view: filter.view ?? DEFAULT_VALUES.view
			}
		})

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
							<form className='3xl:grid-cols-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3'>
								<FormField
									control={form.control}
									name='searchValue'
									render={({ field }) => (
										<FormItem>
											<FormControl>
												<Input
													placeholder={t('COMPANY_USERS.FILTER.TERM')}
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
															<SelectItem
																value={CompanyUsersSortTypes.DATE_ASC}
															>
																{t('COMPANY_USERS.FILTER.SORT.DATE_ASC')}
															</SelectItem>
															<SelectItem
																value={CompanyUsersSortTypes.DATE_DESC}
															>
																{t('COMPANY_USERS.FILTER.SORT.DATE_DESC')}
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
															<SelectItem value={CompanyUsersViewTypes.TABLE}>
																{t('COMPANY_USERS.FILTER.VIEW.TABLE')}
															</SelectItem>
															{/* <SelectItem value={CompanyUsersViewTypes.LIST}>
																{t('COMPANY_USERS.FILTER.VIEW.LIST')}
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

CompanyUsersFilter.displayName = 'CompanyUsersFilter'
