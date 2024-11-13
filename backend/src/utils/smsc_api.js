import FormData from 'form-data'
import fs from 'fs'

class SMSApi {
	constructor() {
		'use strict'
		this.ssl = false
		this.def_fmt = 3
		this.host = 'smsc.kz'
		this.charset = 'utf-8'
		this.login = process.env.SMSC_LOGIN
		this.password = process.env.SMSC_PASSWORD
		this.log = console.log

		this.PHONE_TYPES = {
			string: 1,
			number: 2,
		}
	}

	get_host(www) {
		if (!www) www = ''
		return `${(this.ssl ? 'https://' : 'http://') + www + this.host}/sys/`
	}

	isInArr(arr, val) {
		if (!arr || !arr.length) return false
		return arr.indexOf(val) !== -1
	}

	convert_data(data, notConvert) {
		if (data.fmt) delete data.fmt
		if (data.msg) {
			data.mes = data.msg
			delete data.msg
		}
		if (data.message) {
			data.mes = data.message
			delete data.message
		}
		if (data.phone && !this.isInArr(notConvert, 'phone')) {
			data.phones = data.phone
			delete data.phone
		}
		if (data.number) {
			data.phones = data.number
			delete data.number
		}

		if (data.list) {
			let list = ''
			for (const i in data.list) {
				list += `${i}:${data.list[i]}\n`
			}
			data.list = list
			delete data.mes
		}

		if (data.phones && !((typeof data.phones) in this.PHONE_TYPES))
			data.phones = data.phones.join(',')
	}

	convert_files(form, data) {
		if (!data.files) return

		if (typeof data.files === 'string') {
			const f = data.files
			const bin = fs.readFileSync(f)
			form.append(bin, {
				filename: f,
			})
			return
		}

		for (const i in data.files) {
			const f = data.files[i]
			const bin = fs.readFileSync(f)
			form.append(i, bin, {
				filename: f,
			})
		}

		delete data.files
	}

	read_url(prs, clb, notConvert) {
		const fmt = prs.fmt ? prs.fmt : this.def_fmt

		const fd = new FormData()

		fd.append('fmt', fmt)
		fd.append('login', this.login)
		fd.append('psw', this.password)
		fd.append('charset', this.charset)
		if (prs.type) fd.append(prs.type, 1)

		if (prs.data) {
			this.convert_data(prs.data, notConvert)

			if (prs.data.files) {
				this.convert_files(fd, prs.data)
			}

			for (const i in prs.data) {
				fd.append(i, prs.data[i])
			}
		}
		let www = ''
		let count = 0
		const submit = () => {
			fd.submit(this.get_host(www) + prs.file, (err, res) => {
				if (err) {
					if (count++ < 5) {
						www = `www${count !== 1 ? count : ''}.`
						submit()
					} else {
						const error = {
							error: 'Connection Error',
							error_code: 100,
						}
						clb(error, JSON.stringify(error), error.error, error.error_code)
					}
					return
				}

				res.setEncoding(this.charset)

				let full_data = ''

				res.on('data', data => {
					full_data += data
				})

				res.on('end', () => {
					if (clb) {
						const d = JSON.parse(full_data)
						clb(d, full_data, d.error_code ? d.error : null, d.error_code ? d.error_code : null)
					}
				})
			})
		}

		submit()
	}

	// Configuration
	configure(prs) {
		this.ssl = !!prs.ssl
		this.login = prs.login
		this.password = prs.password
		if (prs.charset) this.charset = prs.charset
	}

	// Sending any type of message
	send(type, data, clb) {
		if (typeof data !== 'object') data = {}
		const opts = {
			file: 'send.php',
			data: data,
		}
		opts['type'] = type
		this.read_url(opts, clb)
	}

	// Sending a simple SMS message
	send_sms(data, clb) {
		if (typeof data !== 'object') data = {}
		this.read_url(
			{
				file: 'send.php',
				data: data,
			},
			clb,
		)
	}

	// Getting the status of a message
	get_status(data, clb) {
		if (data.phones) {
			data.phone = data.phones
			delete data.phones
		}
		if (data.number) {
			data.phone = data.number
			delete data.number
		}

		if (data.phone && !((typeof data.phone) in this.PHONE_TYPES)) {
			data.phone = data.phone.join(',')
		}

		this.read_url(
			{
				file: 'status.php',
				data: data,
			},
			clb,
			['phone'],
		)
	}

	// Getting the balance
	get_balance(clb) {
		this.read_url(
			{
				file: 'balance.php',
				data: {
					cur: 1,
				},
			},
			(b, r, e, c) => {
				clb(e ? 0 : b.balance, r, e, c)
			},
		)
	}

	// Getting the cost of a message
	get_sms_cost(data, clb) {
		if (typeof data !== 'object') data = {}
		if (!data.cost) data.cost = 1
		this.read_url(
			{
				file: 'send.php',
				data: data,
			},
			(b, r, e, c) => {
				clb(e ? 0 : b.cost, r, e, c)
			},
		)
	}

	// API request
	raw(file, data, clb) {
		this.read_url(
			{
				file: file,
				data: data,
			},
			clb,
		)
	}

	// Testing connection and authentication data
	test(clb) {
		this.read_url(
			{
				file: 'balance.php',
			},
			(d, r, err) => {
				clb(err)
			},
		)
	}
}

export default new SMSApi()
