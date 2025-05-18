import { fireEvent, render, screen } from '@testing-library/react'
import { KYCModal } from '~/components/shared/kyc/kyc-modal'
import { KycProvider } from '../hooks/kyc/useKycContext'
import '@testing-library/jest-dom'

// Definimos el tipo de las props de IdentityVerification
interface IdentityVerificationProps {
	onCancel: () => void
	onNext: (data: {
		fullName: string
		dateOfBirth: string
		nationality: string
	}) => void
}

// Mock de los componentes KYC
jest.mock('~/components/shared/kyc/kyc-1', () => ({
	IdentityVerification: ({ onCancel, onNext }: IdentityVerificationProps) => (
		<div>
			<button type="button" onClick={onCancel}>
				Cancelar
			</button>
			<button
				type="button"
				onClick={() =>
					onNext({
						fullName: 'Juan Pérez',
						dateOfBirth: '1990-01-01',
						nationality: 'MX',
					})
				}
			>
				Siguiente
			</button>
		</div>
	),
}))

// Mock de los otros componentes
jest.mock('~/components/shared/kyc/kyc-2/kyc-2-upload', () => () => (
	<div>Paso 2</div>
))
jest.mock('~/components/shared/kyc/kyc-3/kyc-3', () => () => <div>Paso 3</div>)
jest.mock('~/components/shared/kyc/kyc-4/kyc-4-upload', () => () => (
	<div>Paso 4</div>
))
jest.mock('~/components/shared/kyc/kyc-5/final-review', () => () => (
	<div>Paso 5</div>
))

describe('KYCModal', () => {
	test('renderiza el paso 1 y permite avanzar al paso 2', () => {
		render(
			<KycProvider>
				<KYCModal isOpen={true} onClose={() => {}} />
			</KycProvider>,
		)

		expect(screen.getByText('Siguiente')).toBeInTheDocument()
		fireEvent.click(screen.getByText('Siguiente'))
		expect(screen.getByText('Paso 2')).toBeInTheDocument()
	})

	test('cierra el modal al cancelar', () => {
		const onClose = jest.fn()
		render(
			<KycProvider>
				<KYCModal isOpen={true} onClose={onClose} />
			</KycProvider>,
		)

		fireEvent.click(screen.getByText('Cancelar'))
		expect(onClose).toHaveBeenCalled()
	})
})
