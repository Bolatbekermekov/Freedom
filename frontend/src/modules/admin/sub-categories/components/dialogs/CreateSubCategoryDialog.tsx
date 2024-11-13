'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { CreateSubCategoryDTO } from '../../models/sub-category-dto.model'
import { adminSubCategoriesAPIService } from '../../services/sub-categories-api.service'

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
import { useAdminCategories } from '@/modules/admin/categories/hooks/useCategories'

const createCategorySchema = z.object({
	name: z.string(),
	categoryId: z.string()
})

type CreateCategorySchemaType = z.infer<typeof createCategorySchema>

interface CreateSubCategoryDialogProps extends DialogProps {}

export const CreateSubCategoryDialog = memo(
	({ isOpen, toggleOpen }: CreateSubCategoryDialogProps) => {
		const { t } = useTranslation()

		const { data } = useAdminCategories({
			pagination: { paginate: false },
			filter: {}
		})

		const form = useForm<CreateCategorySchemaType>({
			resolver: zodResolver(createCategorySchema)
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['create-sub-category'],
			mutationFn: (data: CreateSubCategoryDTO) =>
				adminSubCategoriesAPIService.createSubCategory(data),
			onSuccess: () => {
				toast.success('Категория создана')
				form.reset()
				queryClient.refetchQueries({ queryKey: ['admin-sub-categories'] })
			},
			onError: () => {
				toast.error('Не удалось создать категорию')
			}
		})

		const onSubmit = (values: CreateCategorySchemaType) => {
			const dto: CreateSubCategoryDTO = {
				name: values.name,
				categoryId: values.categoryId
			}

			mutate(dto)
		}

		return (
			<Dialog
				onOpenChange={toggleOpen}
				open={isOpen}
				modal
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-screen overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>
							{t('SUB_CATEGORIES.DIALOGS.CREATE.HEADER')}
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
									name='name'
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{t('SUB_CATEGORIES.DIALOGS.CREATE.NAME.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													placeholder={t(
														'SUB_CATEGORIES.DIALOGS.CREATE.NAME.PLACEHOLDER'
													)}
													{...field}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>
									)}
								/>

								<FormField
									control={form.control}
									name='categoryId'
									render={({ field }) => (
										<FormItem>
											<FormLabel>
												{t('SUB_CATEGORIES.DIALOGS.CREATE.CATEGORY.LABEL')}
											</FormLabel>
											<Select
												onValueChange={field.onChange}
												defaultValue={field.value}
											>
												<FormControl>
													<SelectTrigger>
														<SelectValue
															placeholder={t(
																'SUB_CATEGORIES.DIALOGS.CREATE.CATEGORY.PLACEHOLDER'
															)}
														/>
													</SelectTrigger>
												</FormControl>
												<SelectContent>
													{data?.docs.map(category => (
														<SelectItem
															key={category.id}
															value={category.id}
														>
															{category.section}
														</SelectItem>
													))}
												</SelectContent>
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
									{t('SUB_CATEGORIES.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CreateSubCategoryDialog.displayName = 'CreateSubCategoryDialog'
