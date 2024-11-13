// 'use client'

// import Link from 'next/link'

// import { Minus, Plus } from 'lucide-react'

// import PrimaryLayout from '@/core/layouts/primary/PrimaryLayout'
// import { Button } from '@/core/ui/button'
// import { Skeleton } from '@/core/ui/skeleton'
// import { ProductsList } from '@/modules/products/components/ProductCard'
// import { useProducts } from '@/modules/products/hooks/useProducts'

// export const CartPage = () => {
// 	const orderItems = new Array(0).fill(0)
// 	const { data: products, isPending } = useProducts({})
// 	const productsSkeletons = new Array(12).fill(0)

// 	return (
// 		<PrimaryLayout>
// 			{orderItems.length > 0 && (
// 				<div className='gap-8 grid grid-cols-4 mt-12 px-4'>
// 					<div className='border-slate-200 col-span-4 md:col-span-3 md:pr-8 md:border-r'>
// 						<div>
// 							<h4 className='font-bold text-2xl'>Корзина</h4>
// 							<p>1 товар</p>
// 						</div>

// 						<div className='flex flex-col gap-6 mt-5'>
// 							{orderItems.map((p, index) => (
// 								<>
// 									<div
// 										key={index}
// 										className='items-center gap-5 md:gap-12 grid grid-cols-8'
// 									>
// 										<div className='flex items-center gap-6 col-span-8 md:col-span-4'>
// 											<div className='bg-slate-400 rounded-md min-w-20 h-20'></div>

// 											<div>
// 												<p className='line-clamp-1 font-bold'>
// 													Футболка однотонная оверсайз хлопок
// 												</p>

// 												<p className='mt-1 line-clamp-2'>
// 													Oверсайз хлопокOверсайз хлопокOверсайз хлопокOверсайз
// 													хлопокOверсайз хлопокOверсайз хлопок
// 												</p>
// 											</div>
// 										</div>

// 										<div className='flex md:justify-center items-center gap-2 col-span-4 md:col-span-2'>
// 											<button className='bg-slate-200 p-2 rounded-md'>
// 												<Minus size={16} />
// 											</button>

// 											<input
// 												type='text'
// 												className='w-10 text-center'
// 												min={1}
// 												value={1}
// 											/>

// 											<button className='bg-slate-200 p-2 rounded-md'>
// 												<Plus size={16} />
// 											</button>
// 										</div>

// 										<div className='col-span-4 md:col-span-2'>
// 											<p className='font-bold text-end text-lg'>1 776 </p>
// 										</div>
// 									</div>

// 									<div className='bg-slate-200 w-full h-[1px]' />
// 								</>
// 							))}
// 						</div>
// 					</div>

// 					<div className='col-span-4 md:col-span-1'>
// 						<h4 className='font-bold text-xl'>Детали заказа</h4>

// 						<div className='flex flex-col gap-3 mt-5'>
// 							<div className='flex justify-between items-center gap-2'>
// 								<p>Способ оплаты</p>
// 								<p className='font-bold text-end'>При получении</p>
// 							</div>

// 							<div className='flex justify-between items-center gap-2'>
// 								<p>Покупатель</p>
// 								<p className='font-bold text-end'>Диар Бегисбаев</p>
// 							</div>

// 							<div className='flex justify-between items-start gap-2'>
// 								<p>Доставка</p>
// 								<p className='font-bold text-end'>
// 									Астана, Улица Ахмета Байтурсынова 2
// 								</p>
// 							</div>
// 						</div>

// 						<div className='flex flex-col gap-2 border-slate-200 mt-4 pt-4 border-t'>
// 							<div className='flex justify-between items-center gap-2'>
// 								<p>Товары (1)</p>
// 								<p className='font-bold'>3 014 </p>
// 							</div>

// 							<div className='flex justify-between items-center gap-2'>
// 								<p>Скидка</p>
// 								<p className='font-bold'>0 </p>
// 							</div>

// 							<div className='flex justify-between items-center gap-2'>
// 								<p>Доставка</p>
// 								<p className='font-bold'>0 </p>
// 							</div>
// 						</div>

// 						<div className='border-slate-200 mt-4 pt-4 border-t'>
// 							<div className='flex justify-between items-center gap-2'>
// 								<p className='font-bold text-lg'>Общая стоимость</p>
// 								<p className='font-bold text-lg'>3 014 </p>
// 							</div>
// 						</div>

// 						<div className='mt-8 w-full'>
// 							<Button className='w-full'>Заказать</Button>
// 						</div>
// 					</div>
// 				</div>
// 			)}

// 			{orderItems.length === 0 && (
// 				<div className='flex flex-col items-center mt-12'>
// 					<h4 className='font-bold text-2xl'>В корзине пока пусто</h4>
// 					<p className='mt-2 text-center text-slate-400'>
// 						Загляните на главную, чтобы выбрать товары
// 						<br />
// 						или найдите нужное в поиске
// 					</p>

// 					<Button className='mt-5'>
// 						<Link href='/'>Перейти на главную</Link>
// 					</Button>
// 				</div>
// 			)}

// 			<div className='mt-12 px-4'>
// 				<p className='font-bold text-xl'>Хит продаж</p>

// 				<section className='mt-4'>
// 					{products && <ProductsList products={products} />}
// 					{isPending && (
// 						<div className='gap-5 gap-y-8 grid grid-cols-160px sm:grid-cols-240px grid-rows-none'>
// 							{productsSkeletons.map((s, i) => (
// 								<Skeleton
// 									key={i}
// 									className='grid grid-rows-[auto,auto,1fr,auto] h-[400px]'
// 								/>
// 							))}
// 						</div>
// 					)}
// 				</section>
// 			</div>
// 		</PrimaryLayout>
// 	)
// }

export const CartPage = () => {
	return <div></div>
}
