import 'package:questly/shared/models/user_profile.dart';

abstract class AuthRepository {
  Future<bool> isAuthenticated();
  Future<UserProfile?> getCurrentUser();
  Future<UserProfile> loginWithEmail(String email, String password);
  Future<UserProfile> registerWithEmail(String email, String password, String displayName);
  Future<void> logout();
}
