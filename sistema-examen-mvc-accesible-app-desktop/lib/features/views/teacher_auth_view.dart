import 'package:flutter/material.dart';

import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class TeacherAuthView extends StatelessWidget {
  const TeacherAuthView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const SectionTitle(
          icon: Icons.school,
          title: 'Cuenta docente',
          subtitle: 'Cada docente administra sus examenes y revisiones.',
        ),
        AppTextInput(
          controller: state.teacherName,
          label: 'Nombre docente',
          icon: Icons.person,
        ),
        AppTextInput(
          controller: state.teacherEmail,
          label: 'Correo docente',
          icon: Icons.mail,
        ),
        AppTextInput(
          controller: state.teacherPassword,
          label: 'Contrasena (minimo 8 caracteres)',
          icon: Icons.password,
          obscure: true,
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: FilledButton.icon(
                onPressed: state.busy
                    ? null
                    : () => state.teacherLogin(register: false),
                icon: const Icon(Icons.login),
                label: const Text('Acceder al panel docente'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: OutlinedButton.icon(
                onPressed: state.busy
                    ? null
                    : () => state.teacherLogin(register: true),
                icon: const Icon(Icons.person_add),
                label: const Text('Crear cuenta docente'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}
