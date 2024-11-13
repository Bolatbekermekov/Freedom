import { useCallback, useEffect, useState } from 'react'

type OnScanCallback = (scannedBarcode: string) => void

const omittedKeys = [
	'Backspace',
	'Shift',
	'CapsLock',
	'Tab',
	'Control',
	'Alt',
	'Escape',
	'ArrowUp',
	'ArrowDown',
	'ArrowLeft',
	'ArrowRight'
]

export const useBarcodeInput = (onScan: OnScanCallback) => {
	const [scannedBarcode, setScannedBarcode] = useState('')

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			if (e.key === 'Enter' && scannedBarcode.length > 0) {
				e.preventDefault()
				onScan(scannedBarcode)
				setScannedBarcode('')
				return
			} else if (omittedKeys) {
				setScannedBarcode(prev => prev + e.key)
			}
		},
		[onScan, scannedBarcode]
	)

	useEffect(() => {
		document.addEventListener('keydown', handleKeyDown)
		return () => {
			document.removeEventListener('keydown', handleKeyDown)
		}
	}, [handleKeyDown, onScan])
}
