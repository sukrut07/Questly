import 'package:dio/dio.dart';
import 'package:questly/config/environment.dart';
import 'package:questly/core/errors/app_exception.dart';
import 'package:questly/core/network/api_interceptor.dart';
import 'package:questly/core/storage/secure_storage.dart';

class ApiClient {
  late final Dio _dio;

  ApiClient({
    Dio? dio,
    EnvironmentConfig? config,
    required SecureStorage secureStorage,
  }) {
    final conf = config ?? EnvironmentConfig.current;
    _dio = dio ??
        Dio(
          BaseOptions(
            baseUrl: conf.apiBaseUrl,
            connectTimeout: conf.connectTimeout,
            receiveTimeout: conf.receiveTimeout,
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          ),
        );

    _dio.interceptors.add(
      ApiInterceptor(
        secureStorage: secureStorage,
        enableLogging: conf.enableLogging,
      ),
    );
  }

  Future<Response<T>> get<T>(
    String path, {
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.get<T>(
        path,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> post<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.post<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> put<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.put<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  Future<Response<T>> delete<T>(
    String path, {
    dynamic data,
    Map<String, dynamic>? queryParameters,
    Options? options,
    CancelToken? cancelToken,
  }) async {
    try {
      return await _dio.delete<T>(
        path,
        data: data,
        queryParameters: queryParameters,
        options: options,
        cancelToken: cancelToken,
      );
    } on DioException catch (e) {
      throw _handleDioError(e);
    }
  }

  AppException _handleDioError(DioException error) {
    switch (error.type) {
      case DioExceptionType.connectionTimeout:
      case DioExceptionType.sendTimeout:
      case DioExceptionType.receiveTimeout:
      case DioExceptionType.connectionError:
        return NetworkException(
          message: 'Connection timed out. Please check your network connection.',
          details: error.message,
        );
      case DioExceptionType.badResponse:
        final statusCode = error.response?.statusCode;
        final data = error.response?.data;
        if (statusCode == 401 || statusCode == 403) {
          return UnauthorizedException(
            statusCode: statusCode,
            details: data,
          );
        } else if (statusCode == 404) {
          return NotFoundException(
            statusCode: statusCode,
            details: data,
          );
        } else if (statusCode == 422 || statusCode == 400) {
          return ValidationException(
            message: data is Map && data['message'] != null
                ? data['message'].toString()
                : 'Validation failed.',
            statusCode: statusCode,
            details: data,
          );
        } else {
          return ServerException(
            message: data is Map && data['message'] != null
                ? data['message'].toString()
                : 'Server returned error $statusCode.',
            statusCode: statusCode,
            details: data,
          );
        }
      case DioExceptionType.cancel:
        return const NetworkException(message: 'Request was cancelled.');
      case DioExceptionType.unknown:
      default:
        return NetworkException(
          message: error.message ?? 'Unknown network failure occurred.',
          details: error.error,
        );
    }
  }
}
