import dynamic from 'next/dynamic'

import { ShoppingBasket } from 'lucide-react'
import { MouseEvent, useCallback, useMemo, useState } from 'react'

import { environment } from '@/core/config/environment.config'
import { IProducts } from '@/modules/admin/products/models/product.model'

const AppPromoDialog = dynamic(
	() =>
		import('@/core/components/dialogs/AppPromoDialog').then(
			m => m.AppPromoDialog
		),
	{ ssr: false }
)

interface ProductListProps {
	products: IProducts[]
}

export const ProductsList = ({ products }: ProductListProps) => {
	const renderedProducts = useMemo(
		() =>
			products.map(product => (
				<ProductCard
					product={product}
					key={product._id}
				/>
			)),
		[products]
	)

	return (
		<div className='grid grid-cols-160px grid-rows-none gap-8 gap-y-12 sm:grid-cols-240px'>
			{renderedProducts}
		</div>
	)
}

interface ProductCardProps {
	product: IProducts
}

export const ProductCard = ({ product }: ProductCardProps) => {
	const [promoModalState, setPromoModalState] = useState(false)

	const onAddCartClick = useCallback((event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation()
	}, [])

	const togglePromoModal = useCallback(() => {
		setPromoModalState(prev => !prev)
	}, [])

	const onProductClick = useCallback(() => {
		togglePromoModal()
	}, [togglePromoModal])

	return (
		<>
			<div
				className='relative grid cursor-pointer grid-rows-[auto,auto,1fr,auto] hover:text-primary'
				onClick={onProductClick}
			>
				<div className='h-60 w-full rounded-md bg-slate-200'>
					<picture className='h-full w-full'>
						<img
							className='h-full w-full rounded-md object-cover'
							src={`${environment.apiUrl}/${product.images?.[0]}`}
							alt={product.name}
							loading='lazy'
						/>
					</picture>
				</div>

				<div className='mt-2'>
					<p className='text-base font-extrabold !text-black md:text-lg'>
						{product.price}  
					</p>
				</div>

				<div className='mt-1'>
					<p className='line-clamp-1 cursor-pointer text-xs font-bold hover:text-primary sm:text-sm'>
						{product.name}
					</p>

					<p className='mt-1 line-clamp-2 text-xs text-slate-500 sm:text-sm'>
						{product.description}
					</p>
				</div>

				<div className='mt-5 hidden'>
					<button
						className='flex w-full items-center justify-center gap-2 rounded-md bg-[#7700ff] px-3 py-2 text-white'
						onClick={onAddCartClick}
					>
						<ShoppingBasket size={16} /> <p>Корзина</p>
					</button>
				</div>
			</div>

			{promoModalState && (
				<AppPromoDialog
					isOpen={promoModalState}
					toggleOpen={togglePromoModal}
				/>
			)}
		</>
	)
}
