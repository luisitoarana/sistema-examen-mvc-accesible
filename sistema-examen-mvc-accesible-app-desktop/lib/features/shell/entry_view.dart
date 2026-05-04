import 'package:flutter/material.dart';

import '../../theme/app_colors.dart';
import '../../widgets/common.dart';
import '../views/student_view.dart';
import '../views/teacher_auth_view.dart';
import '../views/teacher_builder_view.dart';
import '../views/teacher_dashboard_view.dart';
import '../views/teacher_review_view.dart';
import 'shell_state.dart';

/// Replica del "entry-screen" de la web. Dos columnas en pantallas anchas:
///   * izquierda: eyebrow + titulo + lead + grid de tres tiles
///   * derecha: control segmentado (Estudiante/Docente) + vista activa
class EntryView extends StatelessWidget {
  const EntryView({super.key, required this.state});
  final ShellState state;

  bool get _isStudent => state.mode == AppMode.student;

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width > 980;
    final copy = const _EntryCopy();
    final panel = _EntryPanel(state: state, isStudent: _isStudent);

    if (wide) {
      // Cada columna scrollea por su cuenta (evitamos Row con altura intrinseca).
      return Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          Expanded(flex: 85, child: SingleChildScrollView(child: copy)),
          const SizedBox(width: 32),
          Expanded(flex: 115, child: SingleChildScrollView(child: panel)),
        ],
      );
    }
    return SingleChildScrollView(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          copy,
          const SizedBox(height: 24),
          panel,
        ],
      ),
    );
  }
}

class _EntryCopy extends StatelessWidget {
  const _EntryCopy();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text(
          'Sistema de examen supervisado',
          style: TextStyle(
            color: AppColors.accentDeep,
            fontWeight: FontWeight.w900,
            letterSpacing: 1.2,
            fontSize: 12,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Examenes por codigo',
          style: TextStyle(
            fontSize: 38,
            fontWeight: FontWeight.w900,
            height: 1.05,
          ),
        ),
        const SizedBox(height: 12),
        const Text(
          'El docente crea y revisa. El estudiante entra solo con nombre, '
          'correo institucional y codigo.',
          style: TextStyle(color: AppColors.muted, fontSize: 16, height: 1.4),
        ),
        const SizedBox(height: 22),
        const IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Expanded(
                child: _AssuranceTile(
                  icon: Icons.school,
                  title: 'Docente',
                  text: 'Crea preguntas y revisa resultados.',
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _AssuranceTile(
                  icon: Icons.key,
                  title: 'Codigo',
                  text: 'Abre el examen correcto.',
                ),
              ),
              SizedBox(width: 12),
              Expanded(
                child: _AssuranceTile(
                  icon: Icons.verified_user,
                  title: 'Anti-trampa',
                  text: 'Detecta ventanas, atajos y grabadores.',
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _AssuranceTile extends StatelessWidget {
  const _AssuranceTile({
    required this.icon,
    required this.title,
    required this.text,
  });
  final IconData icon;
  final String title;
  final String text;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.surface,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppColors.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(icon, color: AppColors.accentDeep, size: 28),
          const SizedBox(height: 10),
          Text(
            title,
            style: const TextStyle(
              fontWeight: FontWeight.w900,
              fontSize: 16,
            ),
          ),
          const SizedBox(height: 4),
          Text(
            text,
            style: const TextStyle(color: AppColors.muted, fontSize: 13),
          ),
        ],
      ),
    );
  }
}

class _EntryPanel extends StatelessWidget {
  const _EntryPanel({required this.state, required this.isStudent});
  final ShellState state;
  final bool isStudent;

  @override
  Widget build(BuildContext context) {
    final body = isStudent
        ? StudentView(state: state)
        : _TeacherFlow(state: state);

    return Surface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _RoleSegmented(state: state, isStudent: isStudent),
          const SizedBox(height: 16),
          body,
        ],
      ),
    );
  }
}

class _RoleSegmented extends StatelessWidget {
  const _RoleSegmented({required this.state, required this.isStudent});
  final ShellState state;
  final bool isStudent;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Tipo de ingreso',
      child: SegmentedButton<bool>(
        segments: const [
          ButtonSegment(
            value: true,
            icon: Icon(Icons.person),
            label: Text('Estudiante'),
          ),
          ButtonSegment(
            value: false,
            icon: Icon(Icons.school),
            label: Text('Docente'),
          ),
        ],
        selected: {isStudent},
        onSelectionChanged: (selection) {
          state.switchMode(
            selection.first
                ? AppMode.student
                : (state.teacher == null
                    ? AppMode.teacherAuth
                    : AppMode.teacherDashboard),
          );
        },
      ),
    );
  }
}

class _TeacherFlow extends StatelessWidget {
  const _TeacherFlow({required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    if (state.teacher == null) {
      return TeacherAuthView(state: state);
    }
    final view = switch (state.teacherTab) {
      TeacherTab.dashboard => TeacherDashboardView(state: state),
      TeacherTab.builder => TeacherBuilderView(state: state),
      TeacherTab.review => TeacherReviewView(state: state),
    };

    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    state.teacher!.fullName,
                    style: const TextStyle(fontWeight: FontWeight.w900),
                  ),
                  Text(
                    state.teacher!.email,
                    style: const TextStyle(color: AppColors.muted),
                  ),
                ],
              ),
            ),
            TextButton.icon(
              onPressed: state.teacherLogout,
              icon: const Icon(Icons.logout),
              label: const Text('Salir'),
            ),
          ],
        ),
        const SizedBox(height: 12),
        SegmentedButton<TeacherTab>(
          segments: const [
            ButtonSegment(
              value: TeacherTab.dashboard,
              icon: Icon(Icons.dashboard),
              label: Text('Mis examenes'),
            ),
            ButtonSegment(
              value: TeacherTab.builder,
              icon: Icon(Icons.add_circle),
              label: Text('Crear'),
            ),
            ButtonSegment(
              value: TeacherTab.review,
              icon: Icon(Icons.fact_check),
              label: Text('Revision'),
            ),
          ],
          selected: {state.teacherTab},
          onSelectionChanged: (selection) =>
              state.selectTeacherTab(selection.first),
        ),
        const SizedBox(height: 16),
        view,
      ],
    );
  }
}
