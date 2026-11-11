/// Domain failure model for clean error handling across layers.
abstract class Failure {
  final String message;
  final int? code;

  const Failure({required this.message, this.code});

  @override
  String toString() => '$runtimeType(message: $message, code: $code)';

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Failure &&
          runtimeType == other.runtimeType &&
          message == other.message &&
          code == other.code;

  @override
  int get hashCode => message.hashCode ^ code.hashCode;
}

class NetworkFailure extends Failure {
  const NetworkFailure({
    super.message = 'Unable to connect to the network.',
    super.code,
  });
}

class ServerFailure extends Failure {
  const ServerFailure({
    super.message = 'Server encountered an unexpected error.',
    super.code,
  });
}

class AuthFailure extends Failure {
  const AuthFailure({
    super.message = 'Authentication failed.',
    super.code = 401,
  });
}

class CacheFailure extends Failure {
  const CacheFailure({
    super.message = 'Local storage operation failed.',
    super.code,
  });
}

class ValidationFailure extends Failure {
  const ValidationFailure({
    super.message = 'Validation error occurred.',
    super.code = 422,
  });
}

class UnknownFailure extends Failure {
  const UnknownFailure({
    super.message = 'An unexpected error occurred.',
    super.code,
  });
}
