import { BarChart2, CheckCircle2, Loader } from 'lucide-react'

export const OrdersDashboardStatistics = () => {
	return (
		<div className='3xl:grid-cols-6 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-3'>
			<div className='shadow-3xl relative flex items-center justify-between gap-6 rounded-2xl bg-[#c8e5fd] p-5 shadow-black/20'>
				<div>
					<p className='font-bold'>Total Products</p>

					<p className='mt-2 text-2xl font-bold text-[#385286]'>4200</p>
				</div>

				<div className='flex h-16 w-16 items-center justify-center rounded-full bg-secondary p-3'>
					<BarChart2
						size={30}
						className='text-[#385286]'
					/>
				</div>
			</div>

			<div className='shadow-3xl relative flex items-center justify-between gap-6 rounded-2xl bg-[#e6e0ff] px-5 py-2 shadow-black/20'>
				<div>
					<p className='font-bold'>Categories</p>

					<p className='mt-2 text-2xl font-bold text-[#4D4285]'>123</p>
				</div>

				<div className='flex h-16 w-16 items-center justify-center rounded-full bg-secondary p-3'>
					<Loader
						size={30}
						className='text-[#4D4285]'
					/>
				</div>
			</div>

			<div className='shadow-3xl relative flex items-center justify-between gap-6 rounded-2xl bg-[#FFECE6] px-5 py-2 shadow-black/20'>
				<div>
					<p className='font-bold'>Out of Stock Products</p>

					<p className='mt-2 text-2xl font-bold text-[#eb8f7b]'>23</p>
				</div>

				<div className='flex h-16 w-16 items-center justify-center rounded-full bg-secondary p-3'>
					<CheckCircle2
						size={30}
						className='text-[#eb8f7b]'
					/>
				</div>
			</div>
		</div>
	)
}
