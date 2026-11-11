class Validators {
  Validators._();

  static String? required(String? value, {String message = 'This field is required'}) {
    if (value == null || value.trim().isEmpty) {
      return message;
    }
    return null;
  }

  static String? email(String? value) {
    if (value == null || value.trim().isEmpty) {
      return 'Email is required';
    }
    final emailRegex = RegExp(r'^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$');
    if (!emailRegex.hasMatch(value.trim())) {
      return 'Please enter a valid email address';
    }
    return null;
  }

  static String? minLength(String? value, int minLength, {String? message}) {
    if (value == null || value.length < minLength) {
      return message ?? 'Must be at least $minLength characters';
    }
    return null;
  }

  static String? positiveNumber(String? value, {String message = 'Must be a positive number'}) {
    if (value == null || value.trim().isEmpty) return null;
    final parsed = int.tryParse(value);
    if (parsed == null || parsed <= 0) {
      return message;
    }
    return null;
  }
}
