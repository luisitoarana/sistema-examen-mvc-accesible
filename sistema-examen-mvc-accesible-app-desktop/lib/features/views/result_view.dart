import 'package:flutter/material.dart';

import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class ResultView extends StatelessWidget {
  const ResultView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    final current = state.result;
    if (current == null) {
      return const Surface(child: Text('No hay resultado para mostrar.'));
    }
    return SingleChildScrollView(
      child: Surface(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.stretch,
          mainAxisSize: MainAxisSize.min,
          children: [
            const SectionTitle(
              icon: Icons.verified,
              title: 'Resultado',
              subtitle: 'Intento finalizado y guardado en el backend.',
            ),
            Text(
              current.examTitle,
              style: const TextStyle(
                fontSize: 30,
                fontWeight: FontWeight.w900,
              ),
            ),
            const SizedBox(height: 12),
            InfoGrid(items: [
              InfoItem(
                '${current.score} / ${current.totalQuestions}',
                'Nota',
              ),
              InfoItem(current.fullName, 'Estudiante'),
              InfoItem('${current.incidentCount}', 'Penalizaciones'),
            ]),
            const SizedBox(height: 18),
            Align(
              alignment: Alignment.centerLeft,
              child: FilledButton.icon(
                onPressed: state.resetStudent,
                icon: const Icon(Icons.person),
                label: const Text('Nuevo ingreso'),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
