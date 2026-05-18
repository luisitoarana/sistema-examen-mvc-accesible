import 'package:flutter/material.dart';

import '../../widgets/common.dart';
import '../shell/shell_state.dart';

/// Formulario de ingreso del estudiante. Equivalente a `StudentLogin.jsx`
/// de la web. NO se envuelve en Surface porque ya lo hace EntryPanel.
class StudentView extends StatelessWidget {
  const StudentView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const SectionTitle(
          icon: Icons.lock,
          title: 'Ingreso del estudiante',
          subtitle: 'Nombre, correo institucional y codigo del examen.',
        ),
        AppTextInput(
          controller: state.studentName,
          label: 'Nombre completo',
          icon: Icons.badge,
          semanticHint: 'Escribe tu nombre tal como figura en la matricula.',
        ),
        AppTextInput(
          controller: state.studentEmail,
          label: 'Correo institucional',
          icon: Icons.mail,
          semanticHint: 'Correo asignado por la institucion.',
        ),
        AppTextInput(
          controller: state.examCode,
          label: 'Codigo del examen',
          icon: Icons.key,
          semanticHint: 'Codigo entregado por el docente.',
        ),
        const SizedBox(height: 12),
        FilledButton.icon(
          onPressed: state.busy ? null : state.startAttempt,
          icon: const Icon(Icons.play_arrow),
          label: const Text('Continuar como estudiante'),
        ),
        const SizedBox(height: 18),
        const InfoGrid(
          items: [
            InfoItem(
              'Anti-copia web',
              'Bloqueo de acciones dentro del examen.',
            ),
            InfoItem(
              'Agente desktop',
              'Detecta ventana, proceso y titulo activo.',
            ),
            InfoItem(
              'Accesibilidad',
              'Lectura por voz de pregunta y respuestas.',
            ),
          ],
        ),
      ],
    );
  }
}
