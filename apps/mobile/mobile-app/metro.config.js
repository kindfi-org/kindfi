const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

// Get the default config
const config = getDefaultConfig(__dirname)

const { assetExts, sourceExts } = config.resolver
config.transformer.babelTransformerPath = require.resolve(
	'react-native-svg-transformer',
)
config.resolver.assetExts = assetExts.filter((ext) => ext !== 'svg')
config.resolver.sourceExts = [...sourceExts, 'svg']

config.server = {
	enhanceMiddleware: (middleware) => {
		return (req, res, next) => {
			if (req.url.endsWith('.bundle') || req.url.endsWith('.js')) {
				res.setHeader('Content-Type', 'application/javascript')
			}
			return middleware(req, res, next)
		}
	},
}

module.exports = withNativeWind(config, { input: './global.css' })
