export interface LoginDTO {
	phone: string
	password: string
}

export interface SignupDTO {
	name: string
	phone: string
	password: string
}

export interface AuthResponseDTO {
	success: boolean
	message: string
	token: string
}
