import { Skeleton } from '@/core/ui/skeleton'

export const ProductsSkeletonsList = () => {
	const productsSkeletons = new Array(12).fill({})

	return (
		<div className='grid grid-cols-160px grid-rows-none gap-8 gap-y-12 sm:grid-cols-240px'>
			{productsSkeletons.map((s, i) => (
				<Skeleton
					key={i}
					className='grid h-[300px] grid-rows-[auto,auto,1fr,auto]'
				/>
			))}
		</div>
	)
}
