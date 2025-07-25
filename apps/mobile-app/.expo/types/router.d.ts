/* eslint-disable */
import type * as Router from 'expo-router'

export * from 'expo-router'

declare module 'expo-router' {
	export namespace ExpoRouter {
		export interface __routes<_T extends string | object = string> {
			hrefInputParams:
				| {
						pathname: Router.RelativePathString
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: Router.ExternalPathString
						params?: Router.UnknownInputParams
				  }
				| { pathname: `/`; params?: Router.UnknownInputParams }
				| { pathname: `/modal`; params?: Router.UnknownInputParams }
				| { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
				| {
						pathname: `/tabs${'/(tabs)'}` | `/tabs`
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab1` | `/tabs/tab1`
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab2` | `/tabs/tab2`
						params?: Router.UnknownInputParams
				  }
				| { pathname: `/+not-found`; params: Router.UnknownInputParams & {} }
			hrefOutputParams:
				| {
						pathname: Router.RelativePathString
						params?: Router.UnknownOutputParams
				  }
				| {
						pathname: Router.ExternalPathString
						params?: Router.UnknownOutputParams
				  }
				| { pathname: `/`; params?: Router.UnknownOutputParams }
				| { pathname: `/modal`; params?: Router.UnknownOutputParams }
				| { pathname: `/_sitemap`; params?: Router.UnknownOutputParams }
				| {
						pathname: `/tabs${'/(tabs)'}` | `/tabs`
						params?: Router.UnknownOutputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab1` | `/tabs/tab1`
						params?: Router.UnknownOutputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab2` | `/tabs/tab2`
						params?: Router.UnknownOutputParams
				  }
				| { pathname: `/+not-found`; params: Router.UnknownOutputParams & {} }
			href:
				| Router.RelativePathString
				| Router.ExternalPathString
				| `/${`?${string}` | `#${string}` | ''}`
				| `/modal${`?${string}` | `#${string}` | ''}`
				| `/_sitemap${`?${string}` | `#${string}` | ''}`
				| `/tabs${'/(tabs)'}${`?${string}` | `#${string}` | ''}`
				| `/tabs${`?${string}` | `#${string}` | ''}`
				| `/tabs${'/(tabs)'}/tab1${`?${string}` | `#${string}` | ''}`
				| `/tabs/tab1${`?${string}` | `#${string}` | ''}`
				| `/tabs${'/(tabs)'}/tab2${`?${string}` | `#${string}` | ''}`
				| `/tabs/tab2${`?${string}` | `#${string}` | ''}`
				| {
						pathname: Router.RelativePathString
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: Router.ExternalPathString
						params?: Router.UnknownInputParams
				  }
				| { pathname: `/`; params?: Router.UnknownInputParams }
				| { pathname: `/modal`; params?: Router.UnknownInputParams }
				| { pathname: `/_sitemap`; params?: Router.UnknownInputParams }
				| {
						pathname: `/tabs${'/(tabs)'}` | `/tabs`
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab1` | `/tabs/tab1`
						params?: Router.UnknownInputParams
				  }
				| {
						pathname: `/tabs${'/(tabs)'}/tab2` | `/tabs/tab2`
						params?: Router.UnknownInputParams
				  }
				| `/+not-found`
				| { pathname: `/+not-found`; params: Router.UnknownInputParams & {} }
		}
	}
}
