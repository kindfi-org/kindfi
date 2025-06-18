const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

const config = getDefaultConfig(__dirname)

// Preserve the default transformer while adding SVG support and enabling require.context
config.transformer = {
	...config.transformer,
	babelTransformerPath: require.resolve('react-native-svg-transformer'),
	unstable_allowRequireContext: true,
}

// Configure resolver for SVG files
config.resolver = {
	...config.resolver,
	assetExts: config.resolver.assetExts.filter((ext) => ext !== 'svg'),
	sourceExts: [...config.resolver.sourceExts, 'svg'],
}

// Apply NativeWind wrapper and ensure require.context is enabled
const finalConfig = withNativeWind(config, { input: './global.css' })

// Ensure the unstable_allowRequireContext setting persists after NativeWind wrapper
finalConfig.transformer = {
	...finalConfig.transformer,
	unstable_allowRequireContext: true,
}

module.exports = finalConfig
