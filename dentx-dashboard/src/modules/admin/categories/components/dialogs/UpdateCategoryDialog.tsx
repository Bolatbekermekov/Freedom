'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { UpdateCategoryDTO } from '../../models/category-dto.model'
import { ICategories } from '../../models/category.model'
import { adminCategoriesAPIService } from '../../services/admin-categories-api.service'

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
	FormLabel
} from '@/core/ui/form'
import { Input } from '@/core/ui/input'

const updateCategorySchema = z.object({
	name: z.string()
})

type UpdateCategorySchemaType = z.infer<typeof updateCategorySchema>

interface UpdateCategoryDialog extends DialogProps {
	category: ICategories
}

export const UpdateCategoryDialog = memo(
	({ category, isOpen, toggleOpen }: UpdateCategoryDialog) => {
		const { t } = useTranslation()

		const router = useRouter()

		const form = useForm<UpdateCategorySchemaType>({
			resolver: zodResolver(updateCategorySchema),
			defaultValues: {
				name: category.section
			}
		})

		const { mutate, isPending } = useMutation({
			mutationKey: ['update-category'],
			mutationFn: ({ id, data }: { id: string; data: UpdateCategoryDTO }) =>
				adminCategoriesAPIService.updateCategory(id, data),
			onSuccess: () => {
				toast.success('Успешно обновлена')
				router.refresh()
			},
			onError: () => {
				toast.error('Не удалось добавить нового пользователя')
			}
		})

		const onSubmit = useCallback(
			(values: UpdateCategorySchemaType) => {
				const dto: UpdateCategoryDTO = {
					name: values.name
				}

				mutate({ id: category.id, data: dto })
			},
			[category.id, mutate]
		)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='bg-white'>
					<DialogHeader>
						<DialogTitle>{t('CATEGORIES.DIALOGS.UPDATE.HEADER')}</DialogTitle>
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
												{t('CATEGORIES.DIALOGS.UPDATE.NAME.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													placeholder={t(
														'CATEGORIES.DIALOGS.UPDATE.NAME.PLACEHOLDER'
													)}
													{...field}
												/>
											</FormControl>
										</FormItem>
									)}
								/>

								<Button
									type='submit'
									className='mt-8'
									disabled={isPending}
								>
									{t('CATEGORIES.DIALOGS.UPDATE.SAVE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

UpdateCategoryDialog.displayName = 'UpdateCategoryDialog'
