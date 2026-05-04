import 'package:flutter/material.dart';

import '../../models/api_models.dart';
import '../../services/error_format.dart';
import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class TeacherReviewView extends StatefulWidget {
  const TeacherReviewView({super.key, required this.state});
  final ShellState state;

  @override
  State<TeacherReviewView> createState() => _TeacherReviewViewState();
}

class _TeacherReviewViewState extends State<TeacherReviewView> {
  Future<ExamReview>? _future;

  @override
  void initState() {
    super.initState();
    _future = widget.state.loadReview();
  }

  void _refresh() {
    setState(() => _future = widget.state.loadReview());
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const SectionTitle(
          icon: Icons.fact_check,
          title: 'Revision docente',
          subtitle:
              'Estudiantes, nota, respuestas e incidentes por codigo.',
        ),
        Row(children: [
          Expanded(
            child: AppTextInput(
              controller: widget.state.reviewCode,
              label: 'Codigo del examen',
              icon: Icons.key,
            ),
          ),
          const SizedBox(width: 12),
          FilledButton.icon(
            onPressed: _refresh,
            icon: const Icon(Icons.search),
            label: const Text('Buscar'),
          ),
        ]),
        const SizedBox(height: 12),
        FutureBuilder<ExamReview>(
          future: _future,
          builder: (context, snapshot) {
            if (snapshot.connectionState == ConnectionState.waiting) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 24),
                child: Center(child: CircularProgressIndicator()),
              );
            }
            if (snapshot.hasError) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 12),
                child: Text(cleanError(snapshot.error)),
              );
            }
            final review = snapshot.data;
            if (review == null) {
              return const Padding(
                padding: EdgeInsets.symmetric(vertical: 12),
                child: Text('Sin datos.'),
              );
            }
            return Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                InfoGrid(items: [
                  InfoItem(
                    '${review.stats['totalAttempts'] ?? 0}',
                    'Estudiantes registrados',
                  ),
                  InfoItem(
                    '${review.stats['finishedAttempts'] ?? 0}',
                    'Intentos finalizados',
                  ),
                  InfoItem(
                    '${review.stats['penalizedAttempts'] ?? 0}',
                    'Con penalizacion',
                  ),
                ]),
                const SizedBox(height: 12),
                for (final item in review.attempts)
                  ReviewCard(
                    name: item['fullName']?.toString() ?? 'Estudiante',
                    email: item['email']?.toString() ?? '',
                    score:
                        '${item['score'] ?? 0} / ${item['totalQuestions'] ?? 0}',
                    status: item['status']?.toString() ?? '',
                    events:
                        (item['events'] as List? ?? []).cast<dynamic>(),
                  ),
              ],
            );
          },
        ),
      ],
    );
  }
}
