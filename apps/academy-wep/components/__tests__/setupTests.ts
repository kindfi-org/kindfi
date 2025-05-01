// import { JSDOM } from 'jsdom'

// const dom = new JSDOM('<!DOCTYPE html><html><body></body></html>')
// global.document = dom.window.document
// global.window = dom.window as unknown as Window & typeof globalThis

// global.navigator = {
// 	userAgent: 'node.js',
// } as Navigator

import { JSDOM } from "jsdom";

const dom = new JSDOM("<!DOCTYPE html><html><body></body></html>", {
  url: "http://localhost",
  pretendToBeVisual: true,
});

global.window = dom.window as unknown as Window & typeof globalThis;
global.document = dom.window.document;
global.navigator = dom.window.navigator;
global.Node = dom.window.Node;
global.Element = dom.window.Element;
global.HTMLElement = dom.window.HTMLElement;
global.HTMLButtonElement = dom.window.HTMLButtonElement;
global.getComputedStyle = dom.window.getComputedStyle;
global.MutationObserver = dom.window.MutationObserver;
