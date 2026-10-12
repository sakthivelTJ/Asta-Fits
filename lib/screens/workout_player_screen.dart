import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'dart:async';
import 'workout_summary_screen.dart';

class WorkoutPlayerScreen extends StatefulWidget {
  final Map<String, dynamic> quest;
  const WorkoutPlayerScreen({super.key, required this.quest});

  @override
  State<WorkoutPlayerScreen> createState() => _WorkoutPlayerScreenState();
}

enum WorkoutPhase { warmUp, active, coolDown, done }

class _WorkoutPlayerScreenState extends State<WorkoutPlayerScreen>
    with TickerProviderStateMixin {
  WorkoutPhase _phase = WorkoutPhase.warmUp;
  int _currentTaskIndex = 0;
  int _currentSet = 0;
  bool _resting = false;
  int _restSecondsLeft = 60;
  Timer? _restTimer;
  late DateTime _startedAt;

  final List<Map<String, dynamic>> _completedTasks = [];
  late AnimationController _pulseController;
  late AnimationController _phaseController;

  @override
  void initState() {
    super.initState();
    _startedAt = DateTime.now();
    _pulseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat(reverse: true);
    _phaseController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    );
    _phaseController.forward();
  }

  @override
  void dispose() {
    _restTimer?.cancel();
    _pulseController.dispose();
    _phaseController.dispose();
    super.dispose();
  }

  List<Map<String, dynamic>> get _tasks =>
      List<Map<String, dynamic>>.from(widget.quest['tasks'] ?? []);

  Map<String, dynamic>? get _currentTask =>
      _currentTaskIndex < _tasks.length ? _tasks[_currentTaskIndex] : null;

  void _startRest() {
    setState(() {
      _resting = true;
      _restSecondsLeft = 60;
    });
    HapticFeedback.mediumImpact();
    _restTimer?.cancel();
    _restTimer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_restSecondsLeft <= 1) {
        t.cancel();
        HapticFeedback.heavyImpact();
        setState(() => _resting = false);
      } else {
        setState(() => _restSecondsLeft--);
      }
    });
  }

  void _completeSet() {
    if (_resting) return;
    final task = _currentTask;
    if (task == null) return;

    final targetSets = task['targetSets'] ?? 3;
    final newSet = _currentSet + 1;

    if (newSet >= targetSets) {
      // Task complete
      _completedTasks.add({
        ...task,
        'completedSets': newSet,
        'completedReps': (task['targetReps'] ?? 0) * newSet,
      });
      setState(() {
        _currentTaskIndex++;
        _currentSet = 0;
      });

      if (_currentTaskIndex >= _tasks.length) {
        _phaseController.reset();
        _phaseController.forward();
        setState(() => _phase = WorkoutPhase.coolDown);
      } else {
        HapticFeedback.lightImpact();
      }
    } else {
      setState(() => _currentSet = newSet);
      _startRest();
    }
  }

  Future<void> _finishAndSave({required bool warmUpDone, required bool coolDownDone}) async {
    final uid = FirebaseAuth.instance.currentUser!.uid;
    final db = FirebaseFirestore.instance;

    final workoutRef = db
        .collection('users')
        .doc(uid)
        .collection('workouts')
        .doc();

    await workoutRef.set({
      'date': DateTime.now().toIso8601String().split('T')[0],
      'startedAt': Timestamp.fromDate(_startedAt),
      'endedAt': Timestamp.fromDate(DateTime.now()),
      'warmUpDone': warmUpDone,
      'coolDownDone': coolDownDone,
      'tasks': _completedTasks,
      'validated': false,
      'questId': widget.quest['date'],
    });

    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(
          builder: (_) => WorkoutSummaryScreen(workoutId: workoutRef.id),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0F1A),
      body: SafeArea(
        child: FadeTransition(
          opacity: _phaseController,
          child: _buildPhaseBody(),
        ),
      ),
    );
  }

  Widget _buildPhaseBody() {
    switch (_phase) {
      case WorkoutPhase.warmUp:
        return _WarmUpPanel(
          onDone: () {
            _phaseController.reset();
            _phaseController.forward();
            setState(() => _phase = WorkoutPhase.active);
          },
        );
      case WorkoutPhase.active:
        return _ActivePanel(
          task: _currentTask,
          currentSet: _currentSet,
          resting: _resting,
          restSecondsLeft: _restSecondsLeft,
          completedCount: _completedTasks.length,
          totalTasks: _tasks.length,
          pulseController: _pulseController,
          onSetComplete: _completeSet,
          onSkipRest: () {
            _restTimer?.cancel();
            setState(() => _resting = false);
          },
        );
      case WorkoutPhase.coolDown:
        return _CoolDownPanel(
          onDone: () => _finishAndSave(warmUpDone: true, coolDownDone: true),
          onSkip: () => _finishAndSave(warmUpDone: true, coolDownDone: false),
        );
      case WorkoutPhase.done:
        return const SizedBox.shrink();
    }
  }
}

// ─── WARM-UP PANEL ────────────────────────────────────────────────────────────
class _WarmUpPanel extends StatelessWidget {
  final VoidCallback onDone;
  const _WarmUpPanel({required this.onDone});

  static const _moves = [
    ('🔄', 'Neck Rolls', '30 sec'),
    ('🙆', 'Arm Circles', '30 sec'),
    ('🦵', 'Leg Swings', '30 sec'),
    ('🧘', 'Hip Opener', '30 sec'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '⚡ WARM-UP PHASE',
            style: TextStyle(color: Color(0xFF3D8BFF), fontSize: 13, letterSpacing: 2, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            'Prepare your body.',
            style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          const Text(
            'Completing warm-up earns you the +25% Quest Bonus.',
            style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 14),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.separated(
              itemCount: _moves.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final m = _moves[i];
                return Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF121829),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF1A2238)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    children: [
                      Text(m.$1, style: const TextStyle(fontSize: 28)),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(m.$2, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(m.$3, style: const TextStyle(color: Color(0xFF3D8BFF), fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 24),
          _GlowButton(label: "WARM-UP DONE — START QUEST", onTap: onDone, color: const Color(0xFF3D8BFF)),
        ],
      ),
    );
  }
}

// ─── ACTIVE PANEL ─────────────────────────────────────────────────────────────
class _ActivePanel extends StatelessWidget {
  final Map<String, dynamic>? task;
  final int currentSet;
  final bool resting;
  final int restSecondsLeft;
  final int completedCount;
  final int totalTasks;
  final AnimationController pulseController;
  final VoidCallback onSetComplete;
  final VoidCallback onSkipRest;

  const _ActivePanel({
    required this.task,
    required this.currentSet,
    required this.resting,
    required this.restSecondsLeft,
    required this.completedCount,
    required this.totalTasks,
    required this.pulseController,
    required this.onSetComplete,
    required this.onSkipRest,
  });

  @override
  Widget build(BuildContext context) {
    if (task == null) return const Center(child: CircularProgressIndicator());

    final totalSets = task!['targetSets'] ?? 3;
    final targetReps = task!['targetReps'] ?? 0;
    final xp = task!['xpReward'] ?? 0;

    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        children: [
          const SizedBox(height: 16),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'TASK ${completedCount + 1} / $totalTasks',
                style: const TextStyle(color: Color(0xFF3D8BFF), fontWeight: FontWeight.bold, letterSpacing: 1.5),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
                decoration: BoxDecoration(
                  color: const Color(0xFF1A2238),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text('$xp XP', style: const TextStyle(color: Color(0xFF8B5CF6), fontWeight: FontWeight.bold)),
              ),
            ],
          ),
          const SizedBox(height: 32),
          Text(
            task!['title'] ?? 'Exercise',
            textAlign: TextAlign.center,
            style: const TextStyle(color: Colors.white, fontSize: 26, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 8),
          Text(
            '$targetReps REPS × $totalSets SETS',
            style: const TextStyle(color: Color(0xFF3D8BFF), fontSize: 16, letterSpacing: 1),
          ),
          const SizedBox(height: 40),

          // Set indicators
          Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(totalSets, (i) {
              final done = i < currentSet;
              final active = i == currentSet;
              return AnimatedBuilder(
                animation: pulseController,
                builder: (_, __) => Container(
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  width: active ? 48 : 40,
                  height: active ? 48 : 40,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: done
                        ? const Color(0xFF8BC34A)
                        : active
                            ? Color.lerp(const Color(0xFF3D8BFF), const Color(0xFF8B5CF6), pulseController.value)!
                            : const Color(0xFF1A2238),
                    border: active ? Border.all(color: const Color(0xFF3D8BFF), width: 2) : null,
                  ),
                  child: Center(
                    child: done
                        ? const Icon(Icons.check, color: Colors.white, size: 20)
                        : Text('${i + 1}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  ),
                ),
              );
            }),
          ),
          const Spacer(),

          if (resting) ...[
            const Text('REST', style: TextStyle(color: Color(0xFF3D8BFF), fontWeight: FontWeight.bold, letterSpacing: 4)),
            const SizedBox(height: 8),
            Text(
              '$restSecondsLeft',
              style: const TextStyle(color: Colors.white, fontSize: 72, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 16),
            TextButton(
              onPressed: onSkipRest,
              child: const Text('SKIP REST →', style: TextStyle(color: Color(0xFF8B5CF6))),
            ),
          ] else ...[
            _GlowButton(
              label: 'SET ${currentSet + 1} COMPLETE ✓',
              onTap: onSetComplete,
              color: const Color(0xFF8BC34A),
            ),
          ],
          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ─── COOL-DOWN PANEL ──────────────────────────────────────────────────────────
class _CoolDownPanel extends StatelessWidget {
  final VoidCallback onDone;
  final VoidCallback onSkip;
  const _CoolDownPanel({required this.onDone, required this.onSkip});

  static const _moves = [
    ('🤸', 'Hamstring Stretch', '40 sec'),
    ('💪', 'Chest Opener', '40 sec'),
    ('🧘', 'Child\'s Pose', '40 sec'),
  ];

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(24),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 16),
          const Text(
            '🌙 COOL-DOWN PHASE',
            style: TextStyle(color: Color(0xFF8BC34A), fontSize: 13, letterSpacing: 2, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const Text(
            'Almost there, Hunter.',
            style: TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 4),
          const Text(
            'Cool-down secures your +25% Quest Bonus.',
            style: TextStyle(color: Color(0xFF8B5CF6), fontSize: 14),
          ),
          const SizedBox(height: 32),
          Expanded(
            child: ListView.separated(
              itemCount: _moves.length,
              separatorBuilder: (_, __) => const SizedBox(height: 12),
              itemBuilder: (_, i) {
                final m = _moves[i];
                return Container(
                  decoration: BoxDecoration(
                    color: const Color(0xFF121829),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: const Color(0xFF1A2238)),
                  ),
                  padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 16),
                  child: Row(
                    children: [
                      Text(m.$1, style: const TextStyle(fontSize: 28)),
                      const SizedBox(width: 16),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(m.$2, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
                          Text(m.$3, style: const TextStyle(color: Color(0xFF8BC34A), fontSize: 13)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 16),
          _GlowButton(label: "COOL-DOWN DONE — CLAIM REWARDS", onTap: onDone, color: const Color(0xFF8B5CF6)),
          const SizedBox(height: 12),
          Center(
            child: TextButton(
              onPressed: onSkip,
              child: const Text('Skip cool-down (lose bonus)', style: TextStyle(color: Colors.white38, fontSize: 13)),
            ),
          ),
        ],
      ),
    );
  }
}

// ─── SHARED GLOW BUTTON ───────────────────────────────────────────────────────
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
          boxShadow: [
            BoxShadow(color: color.withOpacity(0.5), blurRadius: 20, spreadRadius: 2),
          ],
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
