import dayjs from 'dayjs'
import { memo, useRef } from 'react'
import Barcode from 'react-barcode'
import { useTranslation } from 'react-i18next'
import ReactToPrint from 'react-to-print'

import { Button } from '../../../../../core/ui/button'
import { IProducts } from '../../models/product.model'

import { CreateProductBarcode } from './CreateProductBarcode'
import { environment } from '@/core/config/environment.config'
import { DialogProps } from '@/core/models/dialogs.model'
import {
	Dialog,
	DialogContent,
	DialogHeader,
	DialogTitle
} from '@/core/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/core/ui/tabs'

const DEFAULT_EMPTY_VALUE = '-'

const pageStyle = `
  @page {
    size: auto;
    margin: 0mm;
  }

  @media all {
    .pageBreak {
      display: none;
    }
  }

  @media print {
    .pageBreak {
      page-break-before: always;
    }

    body {
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      width: 100vw;
    }
  }
`

interface ProductDetailDialogProps extends DialogProps {
	product: IProducts
}

export const ProductDetailDialog = memo(
	({ product, isOpen, toggleOpen }: ProductDetailDialogProps) => {
		const { t } = useTranslation()

		const printRef = useRef<Barcode>(null)

		return (
			<Dialog
				modal
				onOpenChange={toggleOpen}
				open={isOpen}
				defaultOpen={isOpen}
			>
				<DialogContent className='max-h-full overflow-y-auto bg-white sm:max-h-[90%]'>
					<DialogHeader>
						<DialogTitle>{t('PRODUCTS.DIALOGS.DETAILS.HEADER')}</DialogTitle>
					</DialogHeader>

					<Tabs
						defaultValue='information'
						className='w-full'
					>
						<TabsList className='grid w-full grid-cols-3'>
							<TabsTrigger value='information'>
								{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.LABEL')}
							</TabsTrigger>
							<TabsTrigger value='characteristics'>
								{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.LABEL')}
							</TabsTrigger>
							<TabsTrigger value='barcode'>
								{t('PRODUCTS.DIALOGS.DETAILS.BARCODE.LABEL')}
							</TabsTrigger>
						</TabsList>

						<TabsContent
							value='information'
							className='mt-8 space-y-4'
						>
							<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
								<div>
									<div className='mt-1 h-60 w-full rounded-md bg-slate-200'>
										<picture className='h-full w-full'>
											<img
												className='h-full w-full rounded-md border border-slate-200 object-cover'
												src={`${environment.apiUrl}/${product.images?.[0]}`}
												alt={product.name}
												loading='lazy'
											/>
										</picture>
									</div>
								</div>

								<div>
									<p className='text-slate-400'>#</p>
									<p className='mt-1 font-medium'>{product._id}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.NAME')}
									</p>
									<p className='mt-1 font-medium'>{product.name}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.DESCRIPTION')}
									</p>
									<p className='mt-1 font-medium'>{product.description}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.BARCODE')}
									</p>
									<p className='mt-1 font-medium'>{product.barcode}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.PRODUCT_CODE')}
									</p>
									<p className='mt-1 font-medium'>{product.productCode}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.PRICE')}
									</p>
									<p className='mt-1 font-medium'>{product.price}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.STOCK')}
									</p>
									<p className='mt-1 font-medium'>{product.stock}</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.SUB_CATEGORY')}
									</p>
									<p className='mt-1 font-medium'>
										{product.category.category}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.INFORMATION.CREATED_DATE')}
									</p>
									<p className='mt-1 font-medium'>
										{dayjs(product.createdAt).format('MMMM D, YYYY h:mm A')}
									</p>
								</div>
							</div>
						</TabsContent>

						<TabsContent
							value='characteristics'
							className='mt-8 space-y-4'
						>
							<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
								<div>
									<p className='text-slate-400'>
										{t(
											'PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.EXTRA_DESCRIPTION'
										)}
									</p>
									<p className='mt-1 font-medium'>
										{product.extraDescription ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.MEASURE_UNIT')}
									</p>
									<p className='mt-1 font-medium'>
										{product.measureUnit ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.SIZE')}
									</p>
									<p className='mt-1 font-medium'>
										{product.size ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.COLOR')}
									</p>
									<p className='mt-1 font-medium'>
										{product.color ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.MANUFACTURER')}
									</p>
									<p className='mt-1 font-medium'>
										{product.manufacturer ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t(
											'PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.ITEMS_PACKAGE'
										)}
									</p>
									<p className='mt-1 font-medium'>
										{product.packageSize ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.ONECNAME')}
									</p>
									<p className='mt-1 font-medium'>
										{product.onecname ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>

								<div>
									<p className='text-slate-400'>
										{t('PRODUCTS.DIALOGS.DETAILS.CHARACTERISTICS.LABELS')}
									</p>
									<p className='mt-1 font-medium'>
										{product.labels ?? DEFAULT_EMPTY_VALUE}
									</p>
								</div>
							</div>
						</TabsContent>

						<TabsContent
							value='barcode'
							className='mt-8 space-y-4'
						>
							<div className='flex flex-col gap-4 rounded-lg border border-slate-200 bg-[#fcfdff] p-5 text-sm'>
								<CreateProductBarcode
									ref={printRef}
									barcode={product.barcode}
								/>
							</div>
							<ReactToPrint
								trigger={() => (
									<Button>
										{t('PRODUCTS.DIALOGS.DETAILS.BARCODE.PRINT_BUTTON')}
									</Button>
								)}
								content={() => printRef.current}
								pageStyle={pageStyle}
							/>
						</TabsContent>
					</Tabs>
				</DialogContent>
			</Dialog>
		)
	}
)

ProductDetailDialog.displayName = 'ProductDetailDialog'
