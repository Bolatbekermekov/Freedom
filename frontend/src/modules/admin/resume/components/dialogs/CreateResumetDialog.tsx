'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'
import { ChangeEvent, memo, useCallback, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { ICandidate } from '../../../products/models/product.model'
import { CreateResumeDTO } from '../../models/product-dto.model'
import { adminProductsAPIService } from '../../services/products-api.service'

import {
	MAX_IMAGE_SIZE,
	REQUIRED_MESSAGE
} from '@/core/constants/forms.constant'
import { getFormattedFileSize } from '@/core/lib/file-size.utils'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'
import { Textarea } from '@/core/ui/textarea'

const createResumechema = z.object({
	// Required Information

	jobDescription: z.string().min(1, { message: REQUIRED_MESSAGE }),
	files: z
		.array(z.instanceof(File))
		.min(1, 'Необходимо загрузить хотя бы один файл') // Минимум один файл
		.default([])
})

type CreateResumeSchemaType = z.infer<typeof createResumechema>

const DEFAULT_VALUES: CreateResumeSchemaType = {
	jobDescription: '',
	files: []
}

interface CreateResumeDialogProps extends DialogProps {
	onUpdateTable: (newCandidates: ICandidate[]) => void
}
export const CreateResumetDialog = memo(
	({ isOpen, toggleOpen, onUpdateTable }: CreateResumeDialogProps) => {
		const {
			t,
			i18n: { language }
		} = useTranslation()

		const form = useForm<CreateResumeSchemaType>({
			resolver: zodResolver(createResumechema),
			defaultValues: DEFAULT_VALUES
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['upload-resume'],
			mutationFn: (data: CreateResumeDTO) =>
				adminProductsAPIService.uploadResume(data),
			onSuccess: response => {
				toast.success('Резюме успешно загружено')
				const suitableCandidates = response.data.suitableCandidates
				console.log('Че таам:', suitableCandidates)

				// Обновляем таблицу с результатами
				if (suitableCandidates) {
					onUpdateTable(suitableCandidates) // Передаём кандидатов в таблицу
				}

				queryClient.refetchQueries({ queryKey: ['admin-resumes'] })
				resetForm()
				toggleOpen()
			},
			onError: (err: ResponseError) => {
				console.error('Ошибка сервера:', err.response?.data)

				ToastService.axiosError(err, 'Не удалось создать продукт', language)
			}
		})

		const onSelectFiles = useCallback(
			(e: ChangeEvent<HTMLInputElement>) => {
				if (e.target.files && e.target.files.length > 0) {
					const selectedFiles = Array.from(e.target.files)

					// Проверяем размер каждого файла
					const oversizedFiles = selectedFiles.filter(
						file => file.size > MAX_IMAGE_SIZE
					)
					if (oversizedFiles.length > 0) {
						toast.warning(
							`Файл(ы) не может(ут) превышать размер ${getFormattedFileSize(MAX_IMAGE_SIZE)}`
						)
						return
					}

					form.setValue('files', selectedFiles, { shouldValidate: true })
				}
			},
			[form]
		)

		const resetForm = useCallback(() => {
			form.reset()

			if (fileInputRef.current) {
				fileInputRef.current.value = ''
			}
		}, [form])

		const onSubmit = useCallback(
			(values: CreateResumeSchemaType) => {
				if (values.files.length === 0) {
					toast.warning('Необходимо загрузить хотя бы один файл')
					return
				}

				const dto: CreateResumeDTO = {
					jobDescription: values.jobDescription,
					files: values.files
				}

				mutate(dto)
			},
			[mutate]
		)

		const files = form.watch('files') // Отслеживаем состояние файлов в форме
		const fileInputRef = useRef<HTMLInputElement | null>(null)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-full overflow-y-auto bg-white sm:max-h-[90%]'>
					<DialogHeader>
						<DialogTitle>{t('RESUME.DIALOGS.CREATE.HEADER')}</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmit)}
								className='w-full'
							>
								<Tabs
									defaultValue='information'
									className='w-full'
								>
									<TabsList className='grid w-full grid-cols-1'>
										<TabsTrigger value='information'>
											{t('PRODUCTS.DIALOGS.CREATE.INFORMATION.LABEL')}
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value='information'
										className='mt-8 space-y-4'
									>
										<FormField
											control={form.control}
											name='jobDescription'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.DESCRIPTION.LABEL'
														)}
													</FormLabel>
													<FormControl>
														<Textarea
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.DESCRIPTION.PLACEHOLDER'
															)}
															className='resize-none'
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormItem>
											<FormLabel>
												{t('RESUME.DIALOGS.CREATE.INFORMATION.FILE.LABEL')}{' '}
												<span className='text-slate-500'>
													(Обязательное поле, PDF )
												</span>
											</FormLabel>
											<FormControl>
												<Input
													type='file'
													placeholder={t(
														'RESUME.DIALOGS.CREATE.INFORMATION.FILE.PLACEHOLDER'
													)}
													size={MAX_IMAGE_SIZE}
													accept='application/pdf'
													multiple
													ref={fileInputRef}
													onChange={onSelectFiles}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>

										{files.length > 0 && (
											<div className='mt-2'>
												<p className='text-slate-500'>Выбранные файлы:</p>
												<ul>
													{files.map((file, index) => (
														<li
															key={index}
															className='flex items-center gap-4'
														>
															<picture>
																<img
																	src={URL.createObjectURL(file)}
																	className='h-[140px] w-[120px] rounded-lg border border-slate-300 object-contain'
																	alt={`Preview ${file.name}`}
																/>
															</picture>
															<div>
																<p className='text-slate-500'>
																	Файл {index + 1}:
																</p>
																<p>{file.name}</p>
															</div>
														</li>
													))}
												</ul>
											</div>
										)}
									</TabsContent>
								</Tabs>

								<Button
									type='submit'
									className='mt-8 w-full gap-3'
									disabled={isPending}
								>
									{isPending && <LoaderIcon />}
									{t('RESUME.DIALOGS.CREATE.CREATE_BUTTON')}
								</Button>

								<Button
									type='button'
									className='mt-3 w-full'
									variant='outline'
									onClick={resetForm}
								>
									Сбросить
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

CreateResumetDialog.displayName = 'CreateResumetDialog'
