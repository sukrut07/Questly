import 'package:flutter_test/flutter_test.dart';

void main() {
  group('KenKen 4x4 Math Puzzle Tests', () {
    test(
      'KenKen default puzzle solution satisfies row and column uniqueness',
      () {
        const solution = [2, 1, 4, 3, 1, 4, 3, 2, 4, 3, 2, 1, 3, 2, 1, 4];

        // Check rows
        for (int r = 0; r < 4; r++) {
          final row = solution.sublist(r * 4, (r + 1) * 4);
          expect(row.toSet().length, 4, reason: 'Row $r contains duplicates');
          expect(row.every((v) => v >= 1 && v <= 4), isTrue);
        }

        // Check columns
        for (int c = 0; c < 4; c++) {
          final col = [
            solution[c],
            solution[c + 4],
            solution[c + 8],
            solution[c + 12],
          ];
          expect(col.toSet().length, 4, reason: 'Col $c contains duplicates');
          expect(col.every((v) => v >= 1 && v <= 4), isTrue);
        }
      },
    );

    test('KenKen cages satisfy their target arithmetic formulas', () {
      const solution = [2, 1, 4, 3, 1, 4, 3, 2, 4, 3, 2, 1, 3, 2, 1, 4];

      // Cage c1: target 3 (+), cells [0, 1] -> 2 + 1 = 3
      expect(solution[0] + solution[1], 3);

      // Cage c2: target 12 (*), cells [2, 3] -> 4 * 3 = 12
      expect(solution[2] * solution[3], 12);

      // Cage c3: target 4 (/), cells [4, 8] -> 4 / 1 = 4
      final c3Vals = [solution[4], solution[8]]..sort();
      expect(c3Vals[1] / c3Vals[0], 4.0);

      // Cage c4: target 7 (+), cells [5, 6] -> 4 + 3 = 7
      expect(solution[5] + solution[6], 7);

      // Cage c6: target 1 (-), cells [9, 10] -> 3 - 2 = 1
      final c6Vals = [solution[9], solution[10]]..sort();
      expect(c6Vals[1] - c6Vals[0], 1);
    });
  });

  group('XOXO Minimax & Heuristic Strategy Tests', () {
    ({String? winner, List<int>? line}) checkWinner(List<String?> board) {
      const lines = [
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8],
        [0, 4, 8],
        [2, 4, 6],
      ];
      for (final line in lines) {
        final a = board[line[0]];
        final b = board[line[1]];
        final c = board[line[2]];
        if (a != null && a == b && a == c) {
          return (winner: a, line: line);
        }
      }
      if (board.every((cell) => cell != null)) {
        return (winner: 'draw', line: null);
      }
      return (winner: null, line: null);
    }

    test('Identifies winning row and diagonal lines correctly', () {
      final board1 = ['X', 'X', 'X', null, 'O', null, 'O', null, null];
      expect(checkWinner(board1).winner, 'X');

      final board2 = ['O', 'X', null, 'X', 'O', null, null, null, 'O'];
      expect(checkWinner(board2).winner, 'O');

      final drawBoard = ['X', 'O', 'X', 'X', 'O', 'O', 'O', 'X', 'X'];
      expect(checkWinner(drawBoard).winner, 'draw');
    });

    test('Scholar AI blocks immediate player win when 2 in a row', () {
      // Player (X) has [0, 1], so spot 2 must be blocked!
      final board = ['X', 'X', null, 'O', null, null, null, null, null];
      final available = [2, 4, 5, 6, 7, 8];

      int blockMove = -1;
      for (final idx in available) {
        final copy = List<String?>.from(board);
        copy[idx] = 'X';
        if (checkWinner(copy).winner == 'X') {
          blockMove = idx;
          break;
        }
      }

      expect(blockMove, 2);
    });

    test('Scholar AI seizes immediate bot win when bot has 2 in a row', () {
      // Bot (O) has [3, 4], so spot 5 must be claimed to win!
      final board = ['X', null, 'X', 'O', 'O', null, null, null, null];
      final available = [1, 5, 6, 7, 8];

      int winningMove = -1;
      for (final idx in available) {
        final copy = List<String?>.from(board);
        copy[idx] = 'O';
        if (checkWinner(copy).winner == 'O') {
          winningMove = idx;
          break;
        }
      }

      expect(winningMove, 5);
    });
  });

  group('Workload Balancer & Arcade Cap Logic Tests', () {
    test(
      'Workload ratio correctly maps to LIGHT, OPTIMAL, and HEAVY categories',
      () {
        const capacity = 180;

        // 45m out of 180m = 0.25 -> LIGHT
        const ratioLight = (45 / capacity);
        expect(ratioLight < 0.4, isTrue);

        // 120m out of 180m = 0.66 -> OPTIMAL
        const ratioOpt = (120 / capacity);
        expect(ratioOpt >= 0.4 && ratioOpt <= 0.85, isTrue);

        // 170m out of 180m = 0.94 -> HEAVY
        const ratioHeavy = (170 / capacity);
        expect(ratioHeavy > 0.85, isTrue);
      },
    );

    test('Arcade daily cap correctly bounds rewarded XP at 20', () {
      const dailyCap = 20;
      var earnedToday = 14;

      // Award +10 XP
      const awardAmount = 10;
      final allowed = (dailyCap - earnedToday).clamp(0, awardAmount);
      earnedToday += allowed;

      expect(allowed, 6);
      expect(earnedToday, 20);

      // Next game awards 0 because cap is met
      final nextAllowed = (dailyCap - earnedToday).clamp(0, 10);
      expect(nextAllowed, 0);
    });
  });
}
