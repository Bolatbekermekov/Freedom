import mongoose from 'mongoose'
import validator from 'validator'

const bankInformationSchema = new mongoose.Schema({
	bankName: {
		type: String,
		required: false,
	},
	individualIdentityCode: {
		type: String,
		required: false,
		unique: true,
	},
	beneficiaryCode: {
		type: String,
		required: false,
	},
	bankIdentificationCode: {
		type: String,
		required: false,
		unique: true,
	},
	paymentCode: {
		type: String,
		required: false,
		unique: true,
	},
})

const companySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please Enter Name'],
		},
		phone: {
			type: String,
			unique: true,
			required: [true, 'Please Enter Phone'],
			validate: validator.isMobilePhone,
		},
		description: {
			type: String,
			required: false,
		},
		logo: {
			type: String,
			required: false,
		},
		address: {
			type: String,
			required: [true, 'Please Enter Address'],
		},
		city: {
			type: String,
			required: [true, 'Please Enter City'],
		},
		type: {
			type: String,
			enum: ['STORE', 'CLINIC'],
			required: [true, 'Please Enter Type'],
		},
		iinBin: {
			type: String,
			required: true,
			unique: true,
		},
		bankInformation: {
			type: bankInformationSchema,
			required: false,
		},
	},
	{
		toJSON: { virtuals: true },
		toObject: { virtuals: true },
	},
)

companySchema.virtual('logoUrl').get(function () {
	if (!this.logo) {
		return null
	}

	return `${process.env.BASE_URL}${this.logo}`
})

export const Company = mongoose.model('Company', companySchema)
