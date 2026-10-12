import 'package:flutter/material.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:cloud_functions/cloud_functions.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';

class WorkoutSummaryScreen extends StatefulWidget {
  final String workoutId;
  const WorkoutSummaryScreen({super.key, required this.workoutId});

  @override
  State<WorkoutSummaryScreen> createState() => _WorkoutSummaryScreenState();
}

class _WorkoutSummaryScreenState extends State<WorkoutSummaryScreen>
    with TickerProviderStateMixin {
  bool _validating = true;
  bool _flagged = false;
  Map<String, dynamic>? _result;
  StreamSubscription? _sub;

  late AnimationController _xpTickController;
  late AnimationController _levelGlowController;
  int _xpDisplay = 0;
  int _xpTarget = 0;

  @override
  void initState() {
    super.initState();

    _xpTickController = AnimationController(vsync: this, duration: const Duration(milliseconds: 1800));
    _levelGlowController = AnimationController(vsync: this, duration: const Duration(milliseconds: 600));

    _callValidateAndListen();
  }

  @override
  void dispose() {
    _sub?.cancel();
    _xpTickController.dispose();
    _levelGlowController.dispose();
    super.dispose();
  }

  Future<void> _callValidateAndListen() async {
    final uid = FirebaseAuth.instance.currentUser!.uid;

    // Call the server validator
    try {
      final callable = FirebaseFunctions.instance.httpsCallable('validateWorkout');
      await callable.call({'workoutId': widget.workoutId});
    } catch (e) {
      // If already validated or network error, still listen to Firestore
    }

    // Listen for the validated workout doc
    final workoutRef = FirebaseFirestore.instance
        .collection('users')
        .doc(uid)
        .collection('workouts')
        .doc(widget.workoutId);

    _sub = workoutRef.snapshots().listen((snap) {
      final data = snap.data();
      if (data == null || !data['validated']) return;

      _sub?.cancel();

      if (data['cheatFlag'] == true) {
        setState(() {
          _validating = false;
          _flagged = true;
        });
        return;
      }

      final xpAwarded = (data['xpAwarded'] ?? 0) as int;
      _xpTarget = xpAwarded;

      setState(() {
        _validating = false;
        _result = data;
      });

      // Animate XP ticker
      _xpTickController.addListener(() {
        setState(() {
          _xpDisplay = (_xpTickController.value * _xpTarget).round();
        });
      });
      _xpTickController.forward();

      if ((data['levelsGained'] ?? 0) > 0) {
        Future.delayed(const Duration(milliseconds: 1900), () {
          _levelGlowController.repeat(reverse: true);
        });
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_validating) {
      return const Scaffold(
        backgroundColor: Color(0xFF0B0F1A),
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              CircularProgressIndicator(color: Color(0xFF3D8BFF)),
              SizedBox(height: 24),
              Text('Calculating rewards...', style: TextStyle(color: Colors.white70)),
            ],
          ),
        ),
      );
    }

    if (_flagged) return _buildFlaggedScreen();

    return _buildResultScreen();
  }

  Widget _buildFlaggedScreen() {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F1A),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text('⚠️', style: TextStyle(fontSize: 64)),
              const SizedBox(height: 20),
              const Text(
                'SUSPICIOUS ACTIVITY DETECTED',
                textAlign: TextAlign.center,
                style: TextStyle(color: Color(0xFFFF5252), fontWeight: FontWeight.w900, fontSize: 20, letterSpacing: 1),
              ),
              const SizedBox(height: 12),
              const Text(
                'This workout was flagged by the system.\nNo XP has been awarded.',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.white54),
              ),
              const SizedBox(height: 40),
              _GlowButton(
                label: 'RETURN TO HOME',
                onTap: () => Navigator.popUntil(context, (r) => r.isFirst),
                color: const Color(0xFFFF5252),
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildResultScreen() {
    final r = _result!;
    final levelsGained = (r['levelsGained'] ?? 0) as int;
    final newLevel = (r['newLevel'] ?? 1) as int;
    final newStreak = (r['newStreak'] ?? 0) as int;
    final prs = List<String>.from(r['prExercises'] ?? []);
    final statGains = Map<String, dynamic>.from(r['statGains'] ?? {});

    return Scaffold(
      backgroundColor: const Color(0xFF0B0F1A),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              // Header
              Center(
                child: Column(
                  children: [
                    const Text('⚔️', style: TextStyle(fontSize: 52)),
                    const SizedBox(height: 8),
                    const Text(
                      'QUEST COMPLETE',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 28,
                        fontWeight: FontWeight.w900,
                        letterSpacing: 2,
                      ),
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '"Asta never gives up — and neither do you."',
                      style: TextStyle(color: Colors.white.withOpacity(0.4), fontSize: 13, fontStyle: FontStyle.italic),
                      textAlign: TextAlign.center,
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 40),

              // XP Card
              _SummaryCard(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('XP EARNED', style: TextStyle(color: Color(0xFF3D8BFF), fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5)),
                    const SizedBox(height: 8),
                    Row(
                      crossAxisAlignment: CrossAxisAlignment.end,
                      children: [
                        Text(
                          '+$_xpDisplay',
                          style: const TextStyle(color: Colors.white, fontSize: 52, fontWeight: FontWeight.w900),
                        ),
                        const Padding(
                          padding: EdgeInsets.only(bottom: 10, left: 6),
                          child: Text('XP', style: TextStyle(color: Color(0xFF3D8BFF), fontSize: 20, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                    if (levelsGained > 0) ...[
                      const SizedBox(height: 12),
                      AnimatedBuilder(
                        animation: _levelGlowController,
                        builder: (_, __) => Container(
                          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
                          decoration: BoxDecoration(
                            borderRadius: BorderRadius.circular(12),
                            color: Color.lerp(const Color(0xFF8B5CF6), const Color(0xFF3D8BFF), _levelGlowController.value),
                            boxShadow: [
                              BoxShadow(
                                color: const Color(0xFF8B5CF6).withOpacity(0.6 * _levelGlowController.value),
                                blurRadius: 20,
                              ),
                            ],
                          ),
                          child: Text(
                            '⬆ LEVEL UP! → LEVEL $newLevel',
                            style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 15, letterSpacing: 1),
                          ),
                        ),
                      ),
                    ],
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Streak
              _SummaryCard(
                child: Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('STREAK', style: TextStyle(color: Color(0xFFFFB300), fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5)),
                        const SizedBox(height: 4),
                        Text('$newStreak days 🔥', style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.w900)),
                      ],
                    ),
                    Text('+${newStreak}% bonus', style: TextStyle(color: Colors.white.withOpacity(0.5))),
                  ],
                ),
              ),
              const SizedBox(height: 16),

              // Stat Gains
              if (statGains.isNotEmpty) ...[
                _SummaryCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('STAT GAINS', style: TextStyle(color: Color(0xFF8BC34A), fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5)),
                      const SizedBox(height: 12),
                      ...statGains.entries.map((e) => Padding(
                        padding: const EdgeInsets.only(bottom: 6),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            Text(e.key.toUpperCase(), style: const TextStyle(color: Colors.white70)),
                            Text('+${e.value}', style: const TextStyle(color: Color(0xFF8BC34A), fontWeight: FontWeight.bold, fontSize: 16)),
                          ],
                        ),
                      )),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              // PRs
              if (prs.isNotEmpty) ...[
                _SummaryCard(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('🏆 NEW PERSONAL RECORDS', style: TextStyle(color: Color(0xFFFFD700), fontWeight: FontWeight.bold, fontSize: 13, letterSpacing: 1.5)),
                      const SizedBox(height: 8),
                      ...prs.map((pr) => Text('• ${pr.replaceAll('_', ' ').toUpperCase()}', style: const TextStyle(color: Colors.white70))),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
              ],

              const SizedBox(height: 8),
              _GlowButton(
                label: 'BACK TO HOME BASE',
                onTap: () => Navigator.popUntil(context, (r) => r.isFirst),
                color: const Color(0xFF3D8BFF),
              ),
              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryCard extends StatelessWidget {
  final Widget child;
  const _SummaryCard({required this.child});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: const Color(0xFF121829),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: const Color(0xFF1A2238)),
      ),
      child: child,
    );
  }
}

class _GlowButton extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  final Color color;
  const _GlowButton({required this.label, required this.onTap, required this.color});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        width: double.infinity,
        padding: const EdgeInsets.symmetric(vertical: 18),
        decoration: BoxDecoration(
          borderRadius: BorderRadius.circular(16),
          color: color,
          boxShadow: [BoxShadow(color: color.withOpacity(0.5), blurRadius: 20, spreadRadius: 2)],
        ),
        child: Text(
          label,
          textAlign: TextAlign.center,
          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w900, fontSize: 16, letterSpacing: 1),
        ),
      ),
    );
  }
}
