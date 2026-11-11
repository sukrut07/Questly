/// Base exception class for Questly runtime errors.
abstract class AppException implements Exception {
  final String message;
  final int? statusCode;
  final dynamic details;

  const AppException({required this.message, this.statusCode, this.details});

  @override
  String toString() => '$runtimeType: $message (code: $statusCode)';
}

class NetworkException extends AppException {
  const NetworkException({
    super.message = 'No internet connection or network failure.',
    super.statusCode,
    super.details,
  });
}

class ServerException extends AppException {
  const ServerException({
    super.message = 'A server error occurred. Please try again later.',
    super.statusCode,
    super.details,
  });
}

class UnauthorizedException extends AppException {
  const UnauthorizedException({
    super.message = 'Session expired or unauthenticated. Please log in again.',
    super.statusCode = 401,
    super.details,
  });
}

class NotFoundException extends AppException {
  const NotFoundException({
    super.message = 'The requested resource was not found.',
    super.statusCode = 404,
    super.details,
  });
}

class CacheException extends AppException {
  const CacheException({
    super.message = 'Failed to read or write cached data.',
    super.statusCode,
    super.details,
  });
}

class ValidationException extends AppException {
  const ValidationException({
    super.message = 'Input validation failed.',
    super.statusCode = 422,
    super.details,
  });
}
