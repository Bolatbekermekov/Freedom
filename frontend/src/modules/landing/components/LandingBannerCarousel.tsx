'use client'

import Image from 'next/image'

import Autoplay from 'embla-carousel-autoplay'

import { Carousel, CarouselContent, CarouselItem } from '@/core/ui/carousel'

export const LandingBannerCarousel = () => {
	return (
		<Carousel
			plugins={[
				Autoplay({
					delay: 3000
				})
			]}
			className='w-full overflow-clip rounded-lg bg-slate-300'
		>
			<CarouselContent>
				<CarouselItem className='relative h-[340px] w-full'>
					<Image
						fill={true}
						priority={true}
						quality={100}
						src='/images/banner/image-1.png'
						alt='Banner'
						style={{ objectFit: 'cover', borderRadius: '12px' }}
					/>
				</CarouselItem>
			</CarouselContent>
		</Carousel>
	)
}
