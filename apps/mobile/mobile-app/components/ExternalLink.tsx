import { Link } from 'expo-router'
import * as WebBrowser from 'expo-web-browser'
import type React from 'react'
import { Platform } from 'react-native'

export function ExternalLink({
	href,
	...props
}: React.ComponentProps<typeof Link>) {
	return (
		<Link
			target="_blank"
			{...props}
			href={href}
			onPress={(e) => {
				if (Platform.OS !== 'web') {
					// Prevent the default behavior of linking to the default browser on native.
					e.preventDefault()
					// Open the link in an in-app browser.
					WebBrowser.openBrowserAsync(href as string)
				}
			}}
		/>
	)
}
