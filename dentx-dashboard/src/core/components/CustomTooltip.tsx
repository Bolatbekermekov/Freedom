import { PropsWithChildren } from 'react'

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger
} from '../ui/tooltip'

export interface CustomTooltipProps extends PropsWithChildren {
	delayDuration?: number
	tooltip: string
}

export const CustomTooltip = ({
	delayDuration = 0,
	tooltip,
	children
}: CustomTooltipProps) => {
	return (
		<TooltipProvider delayDuration={delayDuration}>
			<Tooltip>
				<TooltipTrigger asChild>{children}</TooltipTrigger>
				<TooltipContent className='z-[100]'>{tooltip}</TooltipContent>
			</Tooltip>
		</TooltipProvider>
	)
}
