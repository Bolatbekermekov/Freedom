'use client'

import { useRouter } from 'next/navigation'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { UpdateSubCategoryDTO } from '../../models/sub-category-dto.model'
import { ISubCategories } from '../../models/sub-category.model'
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
	FormLabel
} from '@/core/ui/form'
import { Input } from '@/core/ui/input'

const updateSubCategorySchema = z.object({
	name: z.string()
})

type UpdateSubCategorySchemaType = z.infer<typeof updateSubCategorySchema>

interface UpdateSubCategoryDialogProps extends DialogProps {
	subCategory: ISubCategories
}

export const UpdateSubCategoryDialog = ({
	subCategory,
	isOpen,
	toggleOpen
}: UpdateSubCategoryDialogProps) => {
	const { t } = useTranslation()
	const router = useRouter()

	const form = useForm<UpdateSubCategorySchemaType>({
		resolver: zodResolver(updateSubCategorySchema),
		defaultValues: {
			name: subCategory.category
		}
	})

	const { mutate, isPending } = useMutation({
		mutationKey: ['update-sub-category'],
		mutationFn: ({ id, data }: { id: string; data: UpdateSubCategoryDTO }) =>
			adminSubCategoriesAPIService.updateSubCategory(id, data),
		onSuccess: () => {
			toast.success('Подкатегория обновлена')
			router.refresh()
		},
		onError: () => {
			toast.error('Не удалось обновить подкатегорию')
		}
	})

	const onSubmit = (values: UpdateSubCategorySchemaType) => {
		const dto: UpdateSubCategoryDTO = {
			name: values.name
		}

		mutate({ id: subCategory._id, data: dto })
	}

	return (
		<Dialog
			onOpenChange={toggleOpen}
			open={isOpen}
			modal
			defaultOpen={isOpen}
		>
			<DialogContent className='bg-white'>
				<DialogHeader>
					<DialogTitle>{t('SUB_CATEGORIES.DIALOGS.UPDATE.HEADER')}</DialogTitle>
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
											{t('SUB_CATEGORIES.DIALOGS.UPDATE.NAME.LABEL')}
										</FormLabel>

										<FormControl>
											<Input
												placeholder={t(
													'SUB_CATEGORIES.DIALOGS.UPDATE.NAME.PLACEHOLDER'
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
								{t('SUB_CATEGORIES.DIALOGS.UPDATE.SAVE_BUTTON')}
							</Button>
						</form>
					</Form>
				</div>
			</DialogContent>
		</Dialog>
	)
}
