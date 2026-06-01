import { enNav, esNav } from './namespaces/nav'
import { enCommon, esCommon } from './namespaces/common'
import { enLanguage, esLanguage } from './namespaces/language'
import { enUser, esUser } from './namespaces/user'
import { enAria, esAria } from './namespaces/accessibility'
import { enHome, esHome } from './namespaces/home'
import { enProjects, esProjects } from './namespaces/projects'
import { enCommunity, esCommunity } from './namespaces/community'
import { enFaqs, esFaqs } from './namespaces/faqs'
import { enAuth, esAuth } from './namespaces/auth'
import { enAbout, esAbout } from './namespaces/about'
import { enFooter, esFooter } from './namespaces/footer'

export const translations = {
	en: {
		nav: enNav,
		common: enCommon,
		language: enLanguage,
		user: enUser,
		aria: enAria,
		home: enHome,
		projects: enProjects,
		community: enCommunity,
		faqs: enFaqs,
		auth: enAuth,
		about: enAbout,
		footer: enFooter,
	},
	es: {
		nav: esNav,
		common: esCommon,
		language: esLanguage,
		user: esUser,
		aria: esAria,
		home: esHome,
		projects: esProjects,
		community: esCommunity,
		faqs: esFaqs,
		auth: esAuth,
		about: esAbout,
		footer: esFooter,
	},
}
