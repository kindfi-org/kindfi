import { json } from 'body-parser'
import express from 'express'
import { errorHandler } from './middlewares/error-handler'
import { analyzeSentiment, verifyBiometrics } from './services/ai'

const app = express()
const PORT = process.env.PORT || 3000

app.use(json())

app.post('/analyze-sentiment', async (req, res) => {
	try {
		const { text } = req.body
		const result = await analyzeSentiment(text)
		res.json(result)
	} catch (error) {
		errorHandler(error, req, res)
	}
})

app.post('/verify-biometrics', async (req, res) => {
	try {
		const { image } = req.body // Assuming image is sent as a Buffer
		const result = await verifyBiometrics(image)
		res.json(result)
	} catch (error) {
		errorHandler(error, req, res)
	}
})

app.use(errorHandler)

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`)
})
