import { afterEach } from 'bun:test'
import { JSDOM } from 'jsdom'

const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
global.document = dom.window.document
global.window = dom.window as unknown as Window & typeof globalThis

global.navigator = {
	userAgent: 'node.js',
	language: 'en-US',
	clipboard: {},
} as Navigator

afterEach(() => {
	document.body.innerHTML = ''
})
