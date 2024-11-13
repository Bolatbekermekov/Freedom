import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import mongoosePaginate from 'mongoose-paginate-v2'
import validator from 'validator'

export const ROLES = {
	USER: 'user',
	ADMIN: 'admin',
	SUPER_ADMIN: 'superadmin',
}

export const ROLES_LIST = Object.values(ROLES)

const schema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: [true, 'Please Enter Name'],
		},
		phone: {
			type: String,
			required: [true, 'Please Enter Phone'],
			unique: [true, 'Phone Already Exist'],
			validate: validator.isMobilePhone,
		},
		password: {
			type: String,
			required: [true, 'Please Enter Password'],
			minLength: [6, 'Password must be at least 6 characters long'],
			select: false,
		},
		address: {
			type: String,
			required: false,
		},
		city: {
			type: String,
			required: false,
		},
		country: {
			type: String,
			required: false,
		},
		role: {
			type: String,
			enum: ROLES_LIST,
			default: 'user',
		},
		avatar: {
			public_id: String,
			url: String,
		},
		company: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Company',
			required: false,
		},
		promotion: {
			type: mongoose.Schema.Types.ObjectId,
			required: false,
			ref: 'Promotion',
		},
		used: {
			type: Boolean,
			default: false,
		},
		usedAt: {
			type: Date,
		},
		createdAt: {
			type: Date,
			default: Date.now,
		},
		otp: Number,
		otp_expire: Date,
	},
	{ timestamps: true },
)

schema.pre('save', async function (next) {
	if (!this.isModified('password')) return next()
	this.password = await bcrypt.hash(this.password, 10)
})

schema.methods.comparePassword = async function (enteredPassword) {
	return await bcrypt.compare(enteredPassword, this.password)
}

schema.methods.generateToken = function () {
	return jwt.sign({ _id: this._id }, process.env.JWT_SECRET, {
		expiresIn: '182d',
	})
}

const pushTokenSchema = new mongoose.Schema({
	token: {
		type: String,
		required: true,
	},
	userId: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: 'User',
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
	updatedAt: {
		type: Date,
		default: Date.now,
	},
})
pushTokenSchema.index({ token: 1, userId: 1 }, { unique: true })

schema.plugin(mongoosePaginate)

export const User = mongoose.model('User', schema)
export const PushToken = mongoose.model('PushToken', pushTokenSchema)
