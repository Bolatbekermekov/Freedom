'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { LoaderIcon } from 'lucide-react'
import { ChangeEvent, memo, useCallback, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { UpdateProductDTO } from '../../models/product-dto.model'
import { IProducts } from '../../models/product.model'
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
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue
} from '@/core/ui/select'
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

const updateProductSchema = z.object({
	// Required Information
	name: z.string().min(1, { message: REQUIRED_MESSAGE }),
	barcode: z.string().optional(),
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
	color: z.string().optional(),
	hidden: z.enum(['HIDDEN', 'VISIBLE']).optional()
})

type UpdateProductSchemaType = z.infer<typeof updateProductSchema>

interface UpdateProductDialogProps extends DialogProps {
	product: IProducts
}

export const UpdateProductDialog = memo(
	({ product, isOpen, toggleOpen }: UpdateProductDialogProps) => {
		const {
			t,
			i18n: { language }
		} = useTranslation()

		const [selectedCategory, setSelectedCategory] = useState<
			ICategories | undefined
		>(undefined)

		const [selectedSubCategory, setSelectedSubCategory] = useState<
			ISubCategories | undefined
		>(product.category)

		const [file, setFile] = useState<File | null>(null)

		const form = useForm<UpdateProductSchemaType>({
			resolver: zodResolver(updateProductSchema),
			defaultValues: {
				name: product.name,
				description: product.description,
				productCode: product.productCode,
				barcode: product.barcode,
				price: product.price,
				stock: product.stock,
				subCategoryId: product.category._id,
				extraDescription: product.extraDescription,
				measureUnit: product.measureUnit,
				size: product.size,
				manufacturer: product.manufacturer,
				packageSize: product.packageSize,
				onecname: product.onecname,
				labels: product.labels,
				color: product.color,
				hidden: product.hidden ? 'HIDDEN' : 'VISIBLE'
			}
		})

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['update-product'],
			mutationFn: ({ id, data }: { id: string; data: UpdateProductDTO }) =>
				adminProductsAPIService.updateProduct(id, data),
			onSuccess: () => {
				toast.success('Продукт обновлен')
				queryClient.refetchQueries({ queryKey: ['admin-products'] })
			},
			onError: (err: ResponseError) => {
				ToastService.axiosError(err, 'Не удалось обновить продукт', language)
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

		const onSubmit = useCallback(
			(values: UpdateProductSchemaType) => {
				const dto: UpdateProductDTO = {
					// Required
					name: values.name,
					description: values.description,
					barcode: product.barcode,
					subCategoryId: values.subCategoryId,
					price: values.price,
					stock: values.stock,
					productCode: values.productCode,
					file: file || undefined,

					// Optional
					extraDescription: values.extraDescription,
					measureUnit: values.measureUnit,
					size: values.size,
					manufacturer: values.manufacturer,
					packageSize: values.packageSize,
					onecname: values.onecname,
					labels: values.labels,
					color: values.color,
					hidden: values.hidden === 'HIDDEN' ? true : false
				}

				mutate({ id: product._id, data: dto })
			},
			[file, mutate, product._id, product.barcode]
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
						<DialogTitle>{t('PRODUCTS.DIALOGS.UPDATE.HEADER')}</DialogTitle>
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
											{t('PRODUCTS.DIALOGS.UPDATE.INFORMATION.LABEL')}
										</TabsTrigger>
										<TabsTrigger value='characteristics'>
											{t('PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.LABEL')}
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
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.NAME.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.NAME.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.DESCRIPTION.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Textarea
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.DESCRIPTION.PLACEHOLDER'
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
											disabled
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.BARCODE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.BARCODE.PLACEHOLDER'
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
											name='productCode'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.PRODUCT_CODE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.PRODUCT_CODE.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.PRICE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															type='number'
															min={1}
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.PRICE.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.INFORMATION.STOCK.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															type='number'
															min={1}
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.INFORMATION.STOCK.PLACEHOLDER'
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
												{t('PRODUCTS.DIALOGS.UPDATE.INFORMATION.IMAGE.LABEL')}
												<span className='text-slate-500'>
													(Макс. {getFormattedFileSize(MAX_IMAGE_SIZE)})
												</span>
											</FormLabel>
											<FormControl>
												<Input
													type='file'
													placeholder={t(
														'PRODUCTS.DIALOGS.UPDATE.INFORMATION.IMAGE.PLACEHOLDER'
													)}
													max={MAX_IMAGE_SIZE}
													accept='image/*'
													onChange={e => onSelectFile(e)}
												/>
											</FormControl>
										</FormItem>

										{file && (
											<div className='flex items-center gap-5'>
												<picture>
													<img
														src={getImageUrl(file)}
														className='h-[140px] w-[120px] border border-slate-300 object-contain'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.EXTRA_DESCRIPTION.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.EXTRA_DESCRIPTION.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.MEASURE_UNIT.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.MEASURE_UNIT.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.SIZE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.SIZE.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.MANUFACTURER.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.MANUFACTURER.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.ITEMS_PACKAGE.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.ITEMS_PACKAGE.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.ONECNAME.PLACEHOLDER'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.ONECNAME.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.COLOR.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.COLOR.PLACEHOLDER'
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
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.LABELS.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Input
															placeholder={t(
																'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.LABELS.PLACEHOLDER'
															)}
															{...field}
														/>
													</FormControl>
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='hidden'
											render={({ field }) => (
												<FormItem>
													<FormLabel>
														{t(
															'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.VISIBILITY.LABEL'
														)}
													</FormLabel>

													<FormControl>
														<Select
															onValueChange={field.onChange}
															defaultValue={field.value}
														>
															<SelectTrigger>
																<SelectValue
																	placeholder={t(
																		'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.VISIBILITY.PLACEHOLDER'
																	)}
																/>
															</SelectTrigger>
															<SelectContent>
																<SelectItem value={'VISIBLE'}>
																	{t(
																		'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.VISIBILITY.VISIBLE'
																	)}
																</SelectItem>
																<SelectItem value={'HIDDEN'}>
																	{t(
																		'PRODUCTS.DIALOGS.UPDATE.CHARACTERISTICS.VISIBILITY.HIDDEN'
																	)}
																</SelectItem>
															</SelectContent>
														</Select>
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
									{t('PRODUCTS.DIALOGS.UPDATE.UPDATE_BUTTON')}
								</Button>
							</form>
						</Form>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

UpdateProductDialog.displayName = 'UpdateProductDialog'
