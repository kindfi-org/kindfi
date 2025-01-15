import type { Request, Response } from 'express'

class IndexController {
	getIndex(req: Request, res: Response): void {
		res.sendFile('index.html', { root: 'public' })
	}
}

export default IndexController
