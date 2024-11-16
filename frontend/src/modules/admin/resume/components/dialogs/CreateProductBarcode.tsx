import React from 'react'
import Barcode from 'react-barcode'

interface CreateProductBarcodeProps {
	barcode: string
}

export const CreateProductBarcode = React.forwardRef<
	Barcode,
	CreateProductBarcodeProps
>(({ barcode }, ref) => (
	<div
		style={{
			display: 'flex',
			justifyContent: 'center',
			alignItems: 'center'
		}}
	>
		{barcode ? (
			<Barcode
				ref={ref}
				value={barcode}
				format='CODE128'
				textAlign='center'
				displayValue={true}
				background='#ffffff'
				lineColor='#000000'
				width={2}
			/>
		) : (
			<p>Штрихкод недоступен</p>
		)}
	</div>
))

CreateProductBarcode.displayName = 'CreateProductBarcode'
