import 'package:questly/features/focus/domain/models/focus_session.dart';

abstract class FocusRepository {
  Future<List<FocusSession>> getRecentSessions();
  Future<FocusSession> saveSession(FocusSession session);
  Future<int> getTotalFocusMinutes();
}

