'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { z } from 'zod'

import {
	UsersFilterDTO,
	UsersSortTypes,
	UsersViewTypes
} from '../../models/users-dto.model'

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

const usersFilterSchema = z.object({
	searchValue: z.string().optional(),
	sort: z.string().optional(),
	view: z.string().optional()
})

type UsersFilterSchemaType = z.infer<typeof usersFilterSchema>

interface UsersFilterProps {
	filter: UsersFilterDTO
	onFilterChange: (filter: UsersFilterDTO) => void
}

const DEFAULT_VALUES: UsersFilterDTO = {
	searchValue: '',
	sort: UsersSortTypes.DATE_DESC,
	view: UsersViewTypes.TABLE
}

export const UsersFilter = memo(
	({ filter, onFilterChange }: Readonly<UsersFilterProps>) => {
		const { t } = useTranslation()

		const form = useForm<UsersFilterSchemaType>({
			resolver: zodResolver(usersFilterSchema),
			defaultValues: {
				searchValue: filter.searchValue ?? DEFAULT_VALUES.searchValue,
				sort: filter.sort ?? DEFAULT_VALUES.sort,
				view: filter.view ?? DEFAULT_VALUES.view
			}
		})

		useFilter({
			form,
			onFilterChange,
			defaultValues: DEFAULT_VALUES
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
													placeholder={t('USERS.FILTER.TERM')}
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
															<SelectItem value={UsersSortTypes.DATE_ASC}>
																{t('USERS.FILTER.SORT.DATE_ASC')}
															</SelectItem>
															<SelectItem value={UsersSortTypes.DATE_DESC}>
																{t('USERS.FILTER.SORT.DATE_DESC')}
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
															<SelectItem value={UsersViewTypes.TABLE}>
																{t('USERS.FILTER.VIEW.TABLE')}
															</SelectItem>
															{/* <SelectItem value={UsersViewTypes.LIST}>
																{t('USERS.FILTER.VIEW.LIST')}
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

UsersFilter.displayName = 'UsersFilter'
