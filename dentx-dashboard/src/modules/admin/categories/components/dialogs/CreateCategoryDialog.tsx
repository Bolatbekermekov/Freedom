'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { memo, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { CreateCategoryDTO } from '../../models/category-dto.model'
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
	FormLabel,
	FormMessage
} from '@/core/ui/form'
import { Input } from '@/core/ui/input'

const MAX_IMAGE_SIZE = 5242880 // 5 MB

const createCategorySchema = z.object({
	name: z.string(),
	files: z.custom<File[]>()
})

type CreateCategorySchemaType = z.infer<typeof createCategorySchema>

interface CreateCategoryDialogProps extends DialogProps {}

export const CreateCategoryDialog = memo(
	({ isOpen, toggleOpen }: CreateCategoryDialogProps) => {
		const { t } = useTranslation()

		const form = useForm<CreateCategorySchemaType>({
			resolver: zodResolver(createCategorySchema)
		})

		const queryClient = useQueryClient()

		const fileRef = form.register('files')

		const { mutate, isPending } = useMutation({
			mutationKey: ['create-category'],
			mutationFn: (data: CreateCategoryDTO) =>
				adminCategoriesAPIService.createCategory(data),
			onSuccess: () => {
				toast.success('Успешно создана категория')
				form.reset()
				queryClient.refetchQueries({ queryKey: ['admin-categories'] })
			},
			onError: () => {
				toast.error('Не удалось создать категорию!')
			}
		})

		const onSubmit = useCallback(
			(values: CreateCategorySchemaType) => {
				const dto: CreateCategoryDTO = {
					name: values.name,
					file: values.files[0]
				}

				mutate(dto)
			},
			[mutate]
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
						<DialogTitle>{t('CATEGORIES.DIALOGS.CREATE.HEADER')}</DialogTitle>
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
												{t('CATEGORIES.DIALOGS.CREATE.NAME.LABEL')}
											</FormLabel>

											<FormControl>
												<Input
													placeholder={t(
														'CATEGORIES.DIALOGS.CREATE.NAME.PLACEHOLDER'
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
									name='files'
									render={() => (
										<FormItem>
											<FormLabel>
												{t('CATEGORIES.DIALOGS.CREATE.IMAGE.LABEL')}
											</FormLabel>
											<FormControl>
												<Input
													type='file'
													accept='image/*'
													max={MAX_IMAGE_SIZE}
													placeholder={t(
														'CATEGORIES.DIALOGS.CREATE.IMAGE.PLACEHOLDER'
													)}
													{...fileRef}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>
									)}
								/>

								<Button
									type='submit'
									className='mt-8'
									disabled={isPending}
								>
									{t('CATEGORIES.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CreateCategoryDialog.displayName = 'CreateCategoryDialog'
