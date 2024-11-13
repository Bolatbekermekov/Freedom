import dynamic from 'next/dynamic'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import Papa from 'papaparse'
import {
	ChangeEvent,
	SetStateAction,
	memo,
	useCallback,
	useMemo,
	useRef,
	useState
} from 'react'
import { toast } from 'sonner'

import {
	ParsedCreateProductDTO,
	ParsedProduct,
	RawParsedProduct
} from '../../../models/product-dto.model'
import { adminProductsAPIService } from '../../../services/products-api.service'

import { DialogProps } from '@/core/models/dialogs.model'
import { Button } from '@/core/ui/button'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'
import { Input } from '@/core/ui/input'
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow
} from '@/core/ui/table'

const UpdateParsedProductDialog = dynamic(
	() =>
		import('./UpdateParsedProductDialog').then(
			m => m.UpdateParsedProductDialog
		),
	{
		ssr: false
	}
)

interface UploadProductsDialogProps extends DialogProps {}

export const UploadProductsDialog = memo(
	({ isOpen, toggleOpen }: UploadProductsDialogProps) => {
		const errorSectionRef = useRef<HTMLDivElement | null>(null)

		const [parsedData, setParsedData] = useState<ParsedProduct[]>([])
		const [error, setError] = useState<string | null>(null)
		const [selectedProduct, setSelectedProduct] =
			useState<ParsedProduct | null>(null)
		const [updateModalOpen, setUpdateModalOpen] = useState(false)

		const toggleUpdateModal = useCallback(() => {
			setUpdateModalOpen(prev => !prev)
		}, [])

		const onChangeButtonClick = useCallback(
			(p: ParsedProduct | null) => {
				setSelectedProduct(p)
				toggleUpdateModal()
			},
			[toggleUpdateModal]
		)

		const onSetError = useCallback((value: SetStateAction<string | null>) => {
			setError(value)
			errorSectionRef.current?.scrollIntoView()
		}, [])

		const queryClient = useQueryClient()

		const { mutate, isPending } = useMutation({
			mutationKey: ['create-product'],
			mutationFn: (data: ParsedCreateProductDTO[]) =>
				adminProductsAPIService.uploadParsedProducts(data),
			onSuccess: () => {
				toast.success('Продукты успешно загружены')
				queryClient.refetchQueries({ queryKey: ['admin-products'] })
			},
			onError: () => {
				toast.error('Ошибка при обработки товаров')
			}
		})

		const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
			const file = event.target.files?.[0]
			if (!file) {
				return
			}

			Papa.parse<RawParsedProduct, File>(file, {
				header: true,
				skipEmptyLines: true,
				complete: results => {
					const parsedResult: ParsedProduct[] = results.data.map(
						(p, index) => ({
							index: index,
							name: p.name,
							description: p.description,
							category: p.category,
							section: p.section,
							price: p.price,
							stock: p.stock,
							productCode: p.productCode,
							size: p.size,
							manufacturer: p.manufacturer,
							packageSize: p.packageSize,
							onecname: p.onecname,
							extraDescription: p.extraDescription,
							labels: undefined,
							measureUnit: p.measureUnit,
							color: p.color,
							file: undefined
						})
					)
					setParsedData(parsedResult)
				},
				error: err => {
					onSetError(`Ошибка при конвертировании файла: ${err.message}`)
				}
			})
		}

		const onChangeProduct = useCallback((changedProduct: ParsedProduct) => {
			setParsedData(prev => {
				const updatedData = [...prev]
				updatedData[changedProduct.index] = changedProduct
				return updatedData
			})
		}, [])

		const getInvalidItemIndexes = useCallback(() => {
			const indexes: number[] = []
			parsedData.forEach((product, index) => {
				if (!product.file) {
					indexes.push(index + 1)
				}
			})

			return indexes
		}, [parsedData])

		const onUploadProducts = useCallback(() => {
			if (parsedData.length === 0) {
				return
			}

			const invalidIndexes = getInvalidItemIndexes()
			if (invalidIndexes.length > 0) {
				onSetError(
					`В продуктах с таким номером отсутствуют необходимые поля: ${invalidIndexes.join(', ')}`
				)
				return
			}

			const dto: ParsedCreateProductDTO[] = parsedData.map(product => ({
				name: product.name,
				description: product.description,
				category: product.category,
				section: product.section,
				price: product.price,
				stock: product.stock,
				productCode: product.productCode,
				size: product.size,
				manufacturer: product.manufacturer,
				packageSize: product.packageSize,
				onecname: product.onecname,
				extraDescription: product.extraDescription,
				labels: product.labels,
				measureUnit: product.measureUnit,
				color: product.color,
				file: product.file!
			}))

			mutate(dto)
		}, [getInvalidItemIndexes, mutate, onSetError, parsedData])

		const renderedData = useMemo(() => {
			return parsedData.map((item, index) => (
				<TableRow key={item.productCode}>
					<TableCell>{index + 1}</TableCell>
					<TableCell>{item.name}</TableCell>
					<TableCell className='max-w-72'>{item.description}</TableCell>
					<TableCell>{item.productCode}</TableCell>
					<TableCell>{item.price}</TableCell>
					<TableCell>{item.stock}</TableCell>
					<TableCell>{item.category}</TableCell>
					<TableCell>{item.file ? 'Загружено' : 'Не загружено'}</TableCell>
					<TableCell>
						<Button
							onClick={() => onChangeButtonClick(item)}
							variant='outline'
						>
							Изменить
						</Button>
					</TableCell>
				</TableRow>
			))
		}, [onChangeButtonClick, parsedData])

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-[90vh] max-w-[95vw] overflow-y-auto bg-white'>
					<DialogHeader>
						<DialogTitle>Загрузите товары из CSV</DialogTitle>
					</DialogHeader>

					<div className='mt-4'>
						<div>
							<Input
								type='file'
								placeholder='Выберите файл в формате CSV'
								accept='.csv'
								onChange={handleFileChange}
							/>
						</div>

						{error && (
							<div
								className='mt-6'
								ref={errorSectionRef}
							>
								<p className='text-red-400'>{error}</p>
							</div>
						)}

						<div className='mt-6 overflow-hidden rounded-lg border border-slate-200'>
							<Table className='w-full bg-[#fcfdff]'>
								<TableHeader className='border-collapse'>
									<TableRow>
										<TableHead>#</TableHead>
										<TableHead>Название</TableHead>
										<TableHead>Описание</TableHead>
										<TableHead>Код продукта</TableHead>
										<TableHead>Цена</TableHead>
										<TableHead>Доступно на складе</TableHead>
										<TableHead>Подкатегория</TableHead>
										<TableHead>Изображение</TableHead>
										<TableHead>Действия</TableHead>
									</TableRow>
								</TableHeader>

								<TableBody className='border-collapse'>
									{renderedData}
								</TableBody>
							</Table>
						</div>
					</div>

					{updateModalOpen && selectedProduct && (
						<UpdateParsedProductDialog
							isOpen={updateModalOpen}
							toggleOpen={toggleUpdateModal}
							product={selectedProduct}
							onSubmit={onChangeProduct}
						/>
					)}

					<div className='float-right'>
						<Button
							disabled={isPending}
							onClick={onUploadProducts}
						>
							Загрузить
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		)
	}
)

UploadProductsDialog.displayName = 'UploadProductsDialog'
