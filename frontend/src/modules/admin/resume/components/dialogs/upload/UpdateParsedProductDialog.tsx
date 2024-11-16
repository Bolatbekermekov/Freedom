'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { ChangeEvent, memo, useCallback, useMemo, useState } from 'react'
import { useForm } from 'react-hook-form'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { z } from 'zod'

import { ParsedProduct } from '../../../models/product-dto.model'

import {
	MAX_IMAGE_SIZE,
	REQUIRED_MESSAGE
} from '@/core/constants/forms.constant'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'
import { Textarea } from '@/core/ui/textarea'

const updateParsedProductSchema = z.object({
	// Required Information
	name: z.string().min(1, { message: REQUIRED_MESSAGE }),
	description: z.string().min(1, { message: REQUIRED_MESSAGE }),
	productCode: z.string().min(1, { message: REQUIRED_MESSAGE }),
	price: z.coerce.number().min(1, { message: REQUIRED_MESSAGE }),
	stock: z.coerce.number().min(1, { message: REQUIRED_MESSAGE }),
	category: z.string().min(1, { message: REQUIRED_MESSAGE }),
	section: z.string().min(1, { message: REQUIRED_MESSAGE }),

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

type UpdateParsedProductSchemaType = z.infer<typeof updateParsedProductSchema>

interface UpdateParsedProductDialogProps extends DialogProps {
	product: ParsedProduct
	onSubmit: (product: ParsedProduct) => void
}

export const UpdateParsedProductDialog = memo(
	({
		isOpen,
		toggleOpen,
		product,
		onSubmit
	}: UpdateParsedProductDialogProps) => {
		const { t } = useTranslation()

		const [file, setFile] = useState<File | null>(product.file ?? null)

		const form = useForm<UpdateParsedProductSchemaType>({
			resolver: zodResolver(updateParsedProductSchema),
			defaultValues: {
				name: product.name,
				description: product.description,
				productCode: product.productCode,
				price: product.price,
				stock: product.stock,
				category: product.category,
				section: product.section,

				extraDescription: product.extraDescription ?? '',
				measureUnit: product.measureUnit ?? '',
				size: product.size ?? '',
				manufacturer: product.manufacturer ?? '',
				packageSize: product.packageSize ?? '',
				onecname: product.onecname ?? '',
				labels: product.labels ?? '',
				color: product.color ?? ''
			}
		})

		const onSelectFile = useCallback((e: ChangeEvent<HTMLInputElement>) => {
			if (e.target.files) {
				setFile(e.target.files[0])
			}
		}, [])

		const imageUrl = useMemo(() => {
			return file ? URL.createObjectURL(file) : null
		}, [file])

		const resetForm = useCallback(() => {
			form.reset()
			setFile(null)
		}, [form])

		const onSubmitForm = useCallback(
			(values: UpdateParsedProductSchemaType) => {
				if (!file) {
					return toast.warning('Выберите изображение товара')
				}

				if (!form.formState.isValid) {
					return toast.warning('Заполните все обязательные поля')
				}

				const dto: ParsedProduct = {
					// Required
					index: product.index,
					name: values.name,
					description: values.description,
					category: values.category,
					section: values.section,
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

				onSubmit(dto)
				toggleOpen()
				return
			},
			[file, form.formState.isValid, onSubmit, product.index, toggleOpen]
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
						<DialogTitle>Обновить детали товара</DialogTitle>
					</DialogHeader>

					<div className='!mt-2'>
						<Form {...form}>
							<form
								onSubmit={form.handleSubmit(onSubmitForm)}
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

										<FormField
											control={form.control}
											name='section'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Категория</FormLabel>
													<FormControl>
														<Input
															placeholder='Введите название категории'
															{...field}
														/>
													</FormControl>
													<FormMessage />
												</FormItem>
											)}
										/>

										<FormField
											control={form.control}
											name='category'
											render={({ field }) => (
												<FormItem>
													<FormLabel>Подкатегория</FormLabel>
													<FormControl>
														<Input
															placeholder='Введите название подкатегории'
															{...field}
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
													(Обязательное поле)
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

										{file && imageUrl && (
											<div className='mt-2 flex items-center gap-4'>
												<picture>
													<img
														src={imageUrl}
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
														<Textarea
															placeholder={t(
																'PRODUCTS.DIALOGS.CREATE.CHARACTERISTICS.EXTRA_DESCRIPTION.PLACEHOLDER'
															)}
															className='resize-none'
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
									disabled={!form.formState.isValid}
								>
									Изменить
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

UpdateParsedProductDialog.displayName = 'UpdateParsedProductDialog'
