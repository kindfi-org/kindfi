import { pipeDataStreamToResponse } from 'ai'
import 'dotenv/config'
import express, { type Request, type Response } from 'express'
import { createResponseStream } from '~/apps/ai-server/src/lib/streams/open-ai.stream'

const app = express()

app.post('/', async (req: Request, res: Response) => {
	const result = await createResponseStream(req)

	result.pipeDataStreamToResponse(res)
})

app.post('/stream-data', async (req: Request, res: Response) => {
	// immediately start streaming the response
	pipeDataStreamToResponse(res, {
		execute: async (dataStreamWriter) => {
			dataStreamWriter.writeData('initialized call')

			const result = await createResponseStream(req)

			result.mergeIntoDataStream(dataStreamWriter)
		},
		onError: (error) => {
			// Error messages are masked by default for security reasons.
			// If you want to expose the error message to the client, you can do so here:
			return error instanceof Error ? error.message : String(error)
		},
	})
})

app.listen(8080, () => {
	console.log(`Example app listening on port ${8080}`)
})
