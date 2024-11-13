import dotenv from 'dotenv'
import OpenAI from 'openai'
import pkg from 'pdfjs-dist'

import { Candidate } from '../../models/candidate.model.js'
import { resumesService } from '../../services/images.service.js'

dotenv.config({
	path: './.env',
})

const { getDocument } = pkg
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const emailPattern = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/
const phonePattern = /\+?\d[\d\s-]{7,15}\d/

const extractTextFromPDF = async buffer => {
	const pdf = await getDocument({ data: buffer }).promise
	let text = ''
	for (let i = 1; i <= pdf.numPages; i++) {
		const page = await pdf.getPage(i)
		const content = await page.getTextContent()
		content.items.forEach(item => {
			text += item.str + ' '
		})
	}
	return text
}

const extractContactsAndName = resumeText => {
	const email = resumeText.match(emailPattern)?.[0] || 'Email не указан'
	const phone = resumeText.match(phonePattern)?.[0] || 'Телефон не указан'
	const name = resumeText.split(/\s+/).slice(0, 2).join(' ') || 'Имя не указано'
	return { name, email, phone }
}

const analyzeResume = async (resumeText, jobDescription) => {
	const prompt = `Сравните резюме и требования вакансии ниже.

Резюме:
${resumeText}

Требования вакансии:
${jobDescription}

На основе сравнения, укажите один из следующих статусов:
- Подходит
- Частично подходит
- Не подходит

Пожалуйста, укажите ваш ответ в следующем формате:

"Статус: [Подходит/Частично подходит/Не подходит]
Объяснение: [Объясните, почему кандидат подходит, частично подходит или не подходит.]"`

	const response = await openai.chat.completions.create({
		model: 'gpt-3.5-turbo',
		messages: [{ role: 'user', content: prompt }],
	})
	return response.choices[0].message.content
}

export const uploadResumes = async (req, res) => {
	try {
		const { jobDescription } = req.body
		const resumeFiles = req.files

		if (!resumeFiles || resumeFiles.length === 0) {
			return res.status(400).json({ message: 'Файлы резюме не загружены' })
		}

		const analyzedCandidates = []

		for (const resumeFile of resumeFiles) {
			const resumeText = await extractTextFromPDF(resumeFile.buffer)
			const { name, email, phone } = extractContactsAndName(resumeText)

			const candidate = await Candidate.create({
				name,
				email,
				phone,
				analysisResult: '',
				analysisStatus: 'ожидание',
			})

			const analysisResult = await analyzeResume(resumeText, jobDescription)
			console.log('Результат анализа для кандидата:', candidate.name)
			console.log('analysisResult:', analysisResult)

			const statusMatch = analysisResult.match(
				/Статус:\s*(Подходит|Частично подходит|Не подходит)\s*Объяснение:\s*([\s\S]*)/i,
			)

			if (statusMatch) {
				const status = statusMatch[1].toLowerCase()
				const explanation = statusMatch[2].trim()

				candidate.analysisStatus = status
				candidate.analysisResult = explanation

				if (status === 'подходит' || status === 'частично подходит') {
					const resumePath = resumesService.saveResumeFile(candidate._id.toString(), resumeFile)
					candidate.resumeFilePath = resumePath

					analyzedCandidates.push({
						name: candidate.name,
						email: candidate.email,
						phone: candidate.phone,
						analysisStatus: status,
						analysisResult: explanation,
						resumeFilePath: resumePath,
					})
				}
			} else {
				console.error('Не удалось распознать результат анализа:', analysisResult)
				candidate.analysisStatus = 'не подходит'
				candidate.analysisResult = 'Не удалось распознать результат анализа.'
			}

			await candidate.save()
		}

		res.status(200).json({
			message: 'Анализ завершен',
			suitableCandidates: analyzedCandidates,
		})
	} catch (error) {
		console.error('Ошибка при загрузке и анализе резюме:', error)
		res.status(500).json({ message: 'Ошибка при загрузке и анализе резюме' })
	}
}
