import { json } from 'body-parser'
import express from 'express'
import { errorHandler } from './middlewares/error-handler'
import { analyzeSentiment, verifyBiometrics } from './services/ai'

const app = express()
const PORT = process.env.PORT || 3000

app.use(json())

/**
 * Express route handler for analyzing sentiment from text.
 *
 * @returns {Promise<SentimentAnalysisResult>} A promise that resolves to the sentiment analysis result.
 */
app.post('/analyze-sentiment', async (req, res) => {
	try {
		/** @param {string} text - The text to be analyzed for sentiment. */
		const { text } = req.body

		const result = await analyzeSentiment(text)
		res.json(result)
	} catch (error) {
		errorHandler(error, req, res)
	}
})

/**
 * Express route handler for verifying biometrics.
 *
 * @returns {Promise<BiometricsVerificationResult>} A promise that resolves to the biometrics verification result.
 */
app.post('/verify-biometrics', async (req, res) => {
	try {
		/** @property {Buffer} image - The image sent in the request body as a Buffer. */
		const { image } = req.body
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
