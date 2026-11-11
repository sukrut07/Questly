/// Environment configuration for Questly Mobile.
enum AppEnvironment {
  development,
  staging,
  production,
}

class EnvironmentConfig {
  final AppEnvironment environment;
  final String appTitle;
  final String apiBaseUrl;
  final Duration connectTimeout;
  final Duration receiveTimeout;
  final bool enableLogging;
  final bool enableMockFallbacks;

  const EnvironmentConfig({
    required this.environment,
    required this.appTitle,
    required this.apiBaseUrl,
    this.connectTimeout = const Duration(seconds: 15),
    this.receiveTimeout = const Duration(seconds: 15),
    this.enableLogging = true,
    this.enableMockFallbacks = true,
  });

  static EnvironmentConfig current = development;

  static const EnvironmentConfig development = EnvironmentConfig(
    environment: AppEnvironment.development,
    appTitle: 'Questly (Dev)',
    apiBaseUrl: 'http://10.0.2.2:3000/api', // Android Emulator localhost bridge
    enableLogging: true,
    enableMockFallbacks: true,
  );

  static const EnvironmentConfig staging = EnvironmentConfig(
    environment: AppEnvironment.staging,
    appTitle: 'Questly (Staging)',
    apiBaseUrl: 'https://staging-api.questly.app/api',
    enableLogging: true,
    enableMockFallbacks: false,
  );

  static const EnvironmentConfig production = EnvironmentConfig(
    environment: AppEnvironment.production,
    appTitle: 'Questly',
    apiBaseUrl: 'https://api.questly.app/api',
    enableLogging: false,
    enableMockFallbacks: false,
  );
}
