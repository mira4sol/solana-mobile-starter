// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const { withNativeWind } = require('nativewind/metro')

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname)

const resolveRequestWithPackageExports = (context, moduleName, platform) => {
  // Package exports in `isows` are incorrect, so we need to disable them
  if (moduleName === 'isows') {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }
  // Package exports in `zustand@4` are incorrect, so we need to disable them
  if (moduleName.startsWith('zustand')) {
    const ctx = {
      ...context,
      unstable_enablePackageExports: false,
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }
  // Package exports in `jose` are incorrect, so we need to force the browser version
  if (moduleName === 'jose') {
    const ctx = {
      ...context,
      unstable_conditionNames: ['browser'],
    }
    return ctx.resolveRequest(ctx, moduleName, platform)
  }

  return context.resolveRequest(context, moduleName, platform)
}

config.resolver.resolveRequest = resolveRequestWithPackageExports
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  crypto: require.resolve('react-native-get-random-values'),
  // crypto: require.resolve('expo-crypto'),
  buffer: require.resolve('@craftzdog/react-native-buffer'),
  fs: require.resolve('./libs/fsPolyfills'),
  'text-encoding': require.resolve('text-encoding'),
  stream: require.resolve('stream-browserify'),
  // Add web streams API polyfill
  'web-streams-polyfill': require.resolve('web-streams-polyfill'),
  // Add events polyfill
  events: require.resolve('events'),
}

module.exports = withNativeWind(config, { input: './global.css' })
