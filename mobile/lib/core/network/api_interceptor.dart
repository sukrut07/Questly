import 'dart:developer' as dev;
import 'package:dio/dio.dart';
import 'package:questly/core/constants/api_constants.dart';
import 'package:questly/core/constants/app_constants.dart';
import 'package:questly/core/storage/secure_storage.dart';

class ApiInterceptor extends Interceptor {
  final SecureStorage _secureStorage;
  final bool _enableLogging;

  ApiInterceptor({
    required SecureStorage secureStorage,
    bool enableLogging = true,
  })  : _secureStorage = secureStorage,
        _enableLogging = enableLogging;

  @override
  Future<void> onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    // Inject Authorization token if present
    final token = await _secureStorage.read(AppConstants.authTokenKey);
    if (token != null && token.isNotEmpty) {
      options.headers[ApiConstants.headerAuthorization] = 'Bearer $token';
    }

    options.headers[ApiConstants.headerContentType] = ApiConstants.contentTypeJson;
    options.headers[ApiConstants.headerAccept] = ApiConstants.contentTypeJson;

    if (_enableLogging) {
      dev.log(
        '🌐 [REQ] ${options.method} ${options.uri}',
        name: 'ApiClient',
      );
      if (options.data != null) {
        dev.log('📦 Data: ${options.data}', name: 'ApiClient');
      }
    }

    return handler.next(options);
  }

  @override
  void onResponse(Response response, ResponseInterceptorHandler handler) {
    if (_enableLogging) {
      dev.log(
        '✅ [RESP] ${response.statusCode} ${response.requestOptions.uri}',
        name: 'ApiClient',
      );
    }
    return handler.next(response);
  }

  @override
  void onError(DioException err, ErrorInterceptorHandler handler) {
    if (_enableLogging) {
      dev.log(
        '❌ [ERR] ${err.response?.statusCode} ${err.requestOptions.uri} - ${err.message}',
        name: 'ApiClient',
        error: err.error,
      );
    }
    return handler.next(err);
  }
}
