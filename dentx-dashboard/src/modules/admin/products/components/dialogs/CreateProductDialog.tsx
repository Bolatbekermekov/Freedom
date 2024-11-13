'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'
import { ChangeEvent, memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { CreateProductDTO } from '../../models/product-dto.model'
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
import { CategoryAutocomplete } from '@/modules/admin/categories/components/CategoryAutocomplete'
import {
	ICategories,
	ISubCategories
} from '@/modules/admin/categories/models/category.model'
import { adminCategoriesAPIService } from '@/modules/admin/categories/services/admin-categories-api.service'
import { SelectSubcategoryAutocomplete } from '@/modules/admin/sub-categories/components/SelectSubcategoryAutocomplete'
import { adminSubCategoriesAPIService } from '@/modules/admin/sub-categories/services/sub-categories-api.service'

const createProductSchema = z.object({
	// Required Information
	name: z.string().min(1, { message: REQUIRED_MESSAGE }),
	barcode: z.string().min(1, { message: REQUIRED_MESSAGE }),
	description: z.string().min(1, { message: REQUIRED_MESSAGE }),
	productCode: z.string().min(1, { message: REQUIRED_MESSAGE }),
	price: z.coerce.number().min(1, { message: REQUIRED_MESSAGE }),
	stock: z.coerce.number().min(1, { message: REQUIRED_MESSAGE }),
	subCategoryId: z.string().min(1, { message: REQUIRED_MESSAGE }),

	// Additional Characteristics
	extraDescription: z.string().optional(),
	measureUnit: z.string().optional(),
	size: z.string().optional(),
	manufacturer: z.string().optional(),
	packageSize: z.string().optional(),
	onecname: z.string().optional(),
	labels: z.string().optional(),
	color: z.string().optional()
})

type CreateProductSchemaType = z.infer<typeof createProductSchema>

const DEFAULT_VALUES: CreateProductSchemaType = {
	name: '',
	barcode: '',
	description: '',
	productCode: '',
	price: 1,
	stock: 1,
	subCategoryId: '',

	// Additional Characteristics
	extraDescription: undefined,
	measureUnit: undefined,
	size: undefined,
	manufacturer: undefined,
	packageSize: undefined,
	onecname: undefined,
	labels: undefined,
	color: undefined
}

interface CreateProductDialogProps extends DialogProps {}

export const CreateProductDialog = memo(
	({ isOpen, toggleOpen }: CreateProductDialogProps) => {
		const {
			t,
			i18n: { language }
		} = useTranslation()

		const [selectedCategory, setSelectedCategory] = useState<
			ICategories | undefined
		>(undefined)

		const [selectedSubCategory, setSelectedSubCategory] = useState<
			ISubCategories | undefined
		>(undefined)

		const [file, setFile] = useState<File | null>(null)

		const form = useForm<CreateProductSchemaType>({
			resolver: zodResolver(createProductSchema),
			defaultValues: DEFAULT_VALUES
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['create-product'],
			mutationFn: (data: CreateProductDTO) =>
				adminProductsAPIService.createProduct(data),
			onSuccess: () => {
				toast.success('Продукт успешно создан')
				queryClient.refetchQueries({ queryKey: ['admin-products'] })
				resetForm()
			},
			onError: (err: ResponseError) => {
				ToastService.axiosError(err, 'Не удалось создать продукт', language)
			}
		})

		const { mutate: generateBarcode, isPending: isGenerating } = useMutation({
			mutationKey: ['generate-barcode'],
			mutationFn: () => adminProductsAPIService.generateBarcode(),
			onSuccess: data => {
				form.setValue('barcode', data.barcode)
				toast.success('Штрих-код успешно сгенерирован')
			},
			onError: (err: ResponseError) => {
				ToastService.axiosError(
					err,
					'Не удалось сгенерировать штрих-код',
					language
				)
			}
		})

		const onSelectFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files && e.target.files[0]) {
				const selectedFileFromEvent = e.target.files[0]

				if (selectedFileFromEvent.size > MAX_IMAGE_SIZE) {
					toast.warning(
						`Файл не может привышать размер ${getFormattedFileSize(MAX_IMAGE_SIZE)}`
					)

					return
				}

				setFile(e.target.files[0])
			}
		}, [])

		const getImageUrl = useCallback((file: File) => {
			return URL.createObjectURL(file)
		}, [])

		const onSelectSubcategoryId = useCallback(
			async (id: string | null) => {
				if (id) {
					const res = await adminSubCategoriesAPIService.getSubCategory(id)
					setSelectedSubCategory(res)
					form.setValue('subCategoryId', id)
				} else {
					setSelectedSubCategory(undefined)
					form.resetField('subCategoryId')
				}
			},
			[form]
		)

		const onSelectCategoryId = useCallback(async (id: string | null) => {
			if (id) {
				const res = await adminCategoriesAPIService.getCategory(id)
				setSelectedCategory(res)
			} else {
				setSelectedCategory(undefined)
			}
		}, [])

		const resetForm = useCallback(() => {
			form.reset()
			onSelectCategoryId(null)
			onSelectSubcategoryId(null)
			setFile(null)
		}, [form, onSelectCategoryId, onSelectSubcategoryId])

		const onSubmit = useCallback(
			(values: CreateProductSchemaType) => {
				if (!file) {
					toast.warning('Файл отсутсвует')
					return
				}

				if (!selectedSubCategory) {
					toast.warning('Подкатегория не выбрана')
					return
				}

				const dto: CreateProductDTO = {
					// Required
					name: values.name,
					barcode: values.barcode,
					description: values.description,
					subCategoryId: selectedSubCategory._id,
					price: Number(values.price),
					stock: Number(values.stock),
					productCode: values.productCode,
					file: file,

					// Optional
					extraDescription: values.extraDescription,
					measureUnit: values.measureUnit,
					size: values.size,
					manufacturer: values.manufacturer,
					packageSize: values.packageSize,
					onecname: values.onecname,
					labels: values.labels,
					color: values.color
				}

				mutate(dto)
			},
			[file, mutate, selectedSubCategory]
		)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-full overflow-y-auto bg-white sm:max-h-[90%]'>
					<DialogHeader>
						<DialogTitle>{t('PRODUCTS.DIALOGS.CREATE.HEADER')}</DialogTitle>
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
									<TabsList className='grid w-full grid-cols-2'>
										<TabsTrigger value='information'>
											{t('PRODUCTS.DIALOGS.CREATE.INFORMATION.LABEL')}
										</TabsTrigger>
										<TabsTrigger value='characteristics'>
											{t('PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.LABEL')}
										</TabsTrigger>
									</TabsList>

									<TabsContent
										value='information'
										className='mt-8 space-y-4'
									>
										<FormField
											control={form.control}
											name='name'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.NAME.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.NAME.PLACEHOLDER'
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
											name='description'
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

										<FormField
											control={form.control}
											name='barcode'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.BARCODE.LABEL'
														)}
													</FormLabel>
													<div className='flex gap-2'>
														<FormControl>
															<Input
																placeholder={t(
																	'PRODUCTS.DIALOGS.CREATE.INFORMATION.BARCODE.PLACEHOLDER'
																)}
																{...field}
															/>
														</FormControl>
														<Button
															type='button'
															onClick={() => generateBarcode()}
															disabled={isGenerating}
														>
															{isGenerating && <LoaderIcon />}{' '}
															{t('PRODUCTS.DIALOGS.CREATE.GENERATE_BUTTON')}
														</Button>
													</div>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='productCode'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.PRODUCT_CODE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.PRODUCT_CODE.PLACEHOLDER'
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
											name='price'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.PRICE.LABEL'
														)}
													</FormLabel>
													<FormControl>
														<Input
															type='number'
															min={1}
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.PRICE.PLACEHOLDER'
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
											name='stock'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.STOCK.LABEL'
														)}
													</FormLabel>
													<FormControl>
														<Input
															type='number'
															min={1}
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.STOCK.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormItem>
											<FormLabel>
												{t(
													'PRODUCTS.DIALOGS.CREATE.INFORMATION.CATEGORY.LABEL'
												)}
											</FormLabel>

											<FormControl>
												<CategoryAutocomplete
													onSelectId={onSelectCategoryId}
													selectedId={selectedCategory?.id}
													initialSearchValue={selectedCategory?.section}
													label={t(
														'PRODUCTS.DIALOGS.CREATE.INFORMATION.CATEGORY.LABEL'
													)}
													placeholder={t(
														'PRODUCTS.DIALOGS.CREATE.INFORMATION.CATEGORY.PLACEHOLDER'
													)}
												/>
											</FormControl>

											<FormMessage />
										</FormItem>

										<FormField
											control={form.control}
											name='subCategoryId'
											render={() => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.INFORMATION.SUB_CATEGORY.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<SelectSubcategoryAutocomplete
															onSelectId={onSelectSubcategoryId}
															selectedId={selectedSubCategory?._id}
															initialSearchValue={selectedSubCategory?.category}
															filter={{ categoryId: selectedCategory?.id }}
															label={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.SUB_CATEGORY.LABEL'
															)}
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.INFORMATION.SUB_CATEGORY.PLACEHOLDER'
															)}
														/>
													</FormControl>

													<FormMessage />
												</FormItem>
											)}
										/>

										<FormItem>
											<FormLabel>
												{t('PRODUCTS.DIALOGS.CREATE.INFORMATION.IMAGE.LABEL')}{' '}
												<span className='text-slate-500'>
													(Обязательное поле, макс.{' '}
													{getFormattedFileSize(MAX_IMAGE_SIZE)})
												</span>
											</FormLabel>
											<FormControl>
												<Input
													type='file'
													placeholder={t(
														'PRODUCTS.DIALOGS.CREATE.INFORMATION.IMAGE.PLACEHOLDER'
													)}
													size={MAX_IMAGE_SIZE}
													accept='image/*'
													onChange={e => onSelectFile(e)}
												/>
											</FormControl>
											<FormMessage />
										</FormItem>

										{file && (
											<div className='mt-2 flex items-center gap-4'>
												<picture>
													<img
														src={getImageUrl(file)}
														className='h-[140px] w-[120px] rounded-lg border border-slate-300 object-contain'
														alt='Preview'
													/>
												</picture>

												<div>
													<p className='text-slate-500'>Выбранный файл</p>
													<p>{file.name}</p>
												</div>
											</div>
										)}
									</TabsContent>

									<TabsContent
										value='characteristics'
										className='mt-8 space-y-4'
									>
										<FormField
											control={form.control}
											name='extraDescription'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.EXTRA_DESCRIPTION.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.EXTRA_DESCRIPTION.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='measureUnit'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.MEASURE_UNIT.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.MEASURE_UNIT.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='size'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.SIZE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.SIZE.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='manufacturer'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.MANUFACTURER.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.MANUFACTURER.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='packageSize'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.ITEMS_PACKAGE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.ITEMS_PACKAGE.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='onecname'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.ONECNAME.PLACEHOLDER'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.ONECNAME.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='color'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.COLOR.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.COLOR.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='labels'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.LABELS.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.LABELS.PLACEHOLDER'
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
									className='mt-8 w-full gap-3'
									disabled={isPending}
								>
									{isPending && <LoaderIcon />}{' '}
									{t('PRODUCTS.DIALOGS.CREATE.CREATE_BUTTON')}
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

CreateProductDialog.displayName = 'CreateProductDialog'
