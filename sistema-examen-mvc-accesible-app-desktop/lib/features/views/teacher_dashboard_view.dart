import 'package:flutter/material.dart';

import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class TeacherDashboardView extends StatelessWidget {
  const TeacherDashboardView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<dynamic>>(
      future: state.loadTeacherExams(),
      builder: (context, snapshot) {
        final exams = snapshot.data ?? [];
        return Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const SectionTitle(
              icon: Icons.dashboard,
              title: 'Mis examenes',
              subtitle:
                  'Selecciona un examen para revisar estudiantes, notas y penalizaciones.',
            ),
            Wrap(
              spacing: 12,
              children: [
                FilledButton.icon(
                  onPressed: () =>
                      state.selectTeacherTab(TeacherTab.builder),
                  icon: const Icon(Icons.add),
                  label: const Text('Crear examen'),
                ),
                OutlinedButton.icon(
                  onPressed: () =>
                      state.selectTeacherTab(TeacherTab.review),
                  icon: const Icon(Icons.fact_check),
                  label: const Text('Ir a revision'),
                ),
              ],
            ),
            const SizedBox(height: 18),
            if (snapshot.connectionState == ConnectionState.waiting)
              const LinearProgressIndicator(),
            for (final exam in exams)
              ExamRow(
                title: exam['title']?.toString() ?? 'Examen',
                subtitle:
                    '${exam['course']} - Codigo ${exam['accessCode']}',
                meta:
                    '${exam['questionCount']} preguntas - ${exam['finishedCount']}/${exam['attemptCount']} finalizados',
                onReview: () =>
                    state.selectExam(exam['accessCode']?.toString() ?? ''),
              ),
            if (snapshot.connectionState != ConnectionState.waiting &&
                exams.isEmpty)
              const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Text('Todavia no has creado examenes.'),
              ),
          ],
        );
      },
    );
  }
}
