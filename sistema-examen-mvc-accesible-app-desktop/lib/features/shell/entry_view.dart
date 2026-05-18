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

  bool get _isPreview => state.mode == AppMode.preview;
  bool get _isStudent => state.mode == AppMode.student;

  @override
  Widget build(BuildContext context) {
    final wide = MediaQuery.sizeOf(context).width > 980;
    final copy = const _EntryCopy();
    final panel = _EntryPanel(
      state: state,
      isPreview: _isPreview,
      isStudent: _isStudent,
    );

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
        children: [copy, const SizedBox(height: 24), panel],
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
          'Sistema supervisado inteligente',
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
          'Plataforma educativa con ingreso por codigo, revision docente y '
          'supervision anti-copia en tiempo real.',
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
                  title: 'Anti-copia',
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
            style: const TextStyle(fontWeight: FontWeight.w900, fontSize: 16),
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
  const _EntryPanel({
    required this.state,
    required this.isPreview,
    required this.isStudent,
  });
  final ShellState state;
  final bool isPreview;
  final bool isStudent;

  @override
  Widget build(BuildContext context) {
    final body = isPreview
        ? null
        : isStudent
        ? StudentView(state: state)
        : _TeacherFlow(state: state);

    return Surface(
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          const Text(
            'Selecciona el tipo de acceso',
            style: TextStyle(
              color: AppColors.accentDeep,
              fontSize: 12,
              fontWeight: FontWeight.w900,
            ),
          ),
          const SizedBox(height: 8),
          _RoleSegmented(
            state: state,
            isPreview: isPreview,
            isStudent: isStudent,
          ),
          const SizedBox(height: 16),
          if (isPreview)
            _AccessIntro(state: state)
          else
            _AccessContext(isStudent: isStudent),
          if (body != null) ...[
            const SizedBox(height: 16),
            AnimatedSwitcher(
              duration: const Duration(milliseconds: 420),
              switchInCurve: Curves.easeOutCubic,
              switchOutCurve: Curves.easeInCubic,
              transitionBuilder: (child, animation) => FadeTransition(
                opacity: animation,
                child: SlideTransition(
                  position: Tween<Offset>(
                    begin: const Offset(0, 0.04),
                    end: Offset.zero,
                  ).animate(animation),
                  child: child,
                ),
              ),
              child: KeyedSubtree(key: ValueKey(state.mode), child: body),
            ),
          ],
        ],
      ),
    );
  }
}

class _RoleSegmented extends StatelessWidget {
  const _RoleSegmented({
    required this.state,
    required this.isPreview,
    required this.isStudent,
  });
  final ShellState state;
  final bool isPreview;
  final bool isStudent;

  @override
  Widget build(BuildContext context) {
    return Semantics(
      label: 'Tipo de ingreso',
      child: SegmentedButton<bool>(
        emptySelectionAllowed: true,
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
        selected: isPreview ? <bool>{} : {isStudent},
        onSelectionChanged: (selection) {
          if (selection.isEmpty) {
            state.switchMode(AppMode.preview);
            return;
          }
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

class _AccessIntro extends StatelessWidget {
  const _AccessIntro({required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(18),
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: AppColors.border),
      gradient: const LinearGradient(
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
        colors: [AppColors.surface, AppColors.accentSoft],
      ),
      boxShadow: const [
        BoxShadow(
          color: Color(0x1A16201C),
          blurRadius: 34,
          offset: Offset(0, 16),
        ),
      ],
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        const Text(
          'Inicio del sistema',
          style: TextStyle(
            color: AppColors.accentDeep,
            fontSize: 12,
            fontWeight: FontWeight.w900,
          ),
        ),
        const SizedBox(height: 6),
        const Text(
          'Elige como quieres ingresar',
          style: TextStyle(
            color: AppColors.ink,
            fontSize: 28,
            fontWeight: FontWeight.w900,
            height: 1,
          ),
        ),
        const SizedBox(height: 8),
        const Text(
          'El sistema separa claramente el acceso del estudiante y el espacio de trabajo del docente.',
          style: TextStyle(color: AppColors.muted, height: 1.35),
        ),
        const SizedBox(height: 16),
        LayoutBuilder(
          builder: (context, constraints) {
            final narrow = constraints.maxWidth < 560;
            final choices = [
              _AccessChoice(
                icon: Icons.person,
                title: 'Estudiante',
                text:
                    'Entrar al examen con nombre, correo institucional y codigo.',
                onTap: () => state.switchMode(AppMode.student),
              ),
              _AccessChoice(
                icon: Icons.school,
                title: 'Docente',
                text:
                    'Crear examenes, revisar resultados y ver incidentes anti-copia.',
                teacher: true,
                onTap: () => state.switchMode(
                  state.teacher == null
                      ? AppMode.teacherAuth
                      : AppMode.teacherDashboard,
                ),
              ),
            ];
            if (narrow) {
              return Column(
                children: [
                  choices.first,
                  const SizedBox(height: 12),
                  choices.last,
                ],
              );
            }
            return Row(
              children: [
                Expanded(child: choices.first),
                const SizedBox(width: 12),
                Expanded(child: choices.last),
              ],
            );
          },
        ),
        const SizedBox(height: 14),
        const _AccessFlow(),
      ],
    ),
  );
}

class _AccessChoice extends StatelessWidget {
  const _AccessChoice({
    required this.icon,
    required this.title,
    required this.text,
    required this.onTap,
    this.teacher = false,
  });
  final IconData icon;
  final String title;
  final String text;
  final VoidCallback onTap;
  final bool teacher;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    label: title,
    child: InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: Container(
        constraints: const BoxConstraints(minHeight: 150),
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: AppColors.surface.withValues(alpha: 0.94),
          borderRadius: BorderRadius.circular(8),
          border: Border.all(
            color: teacher ? AppColors.navy : AppColors.accent,
            width: 1.4,
          ),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              width: 46,
              height: 46,
              decoration: BoxDecoration(
                color: teacher ? AppColors.navy : AppColors.accent,
                shape: BoxShape.circle,
              ),
              child: Icon(icon, color: Colors.white),
            ),
            const SizedBox(height: 12),
            Text(
              title,
              style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900),
            ),
            const SizedBox(height: 6),
            Text(
              text,
              style: const TextStyle(color: AppColors.muted, height: 1.3),
            ),
          ],
        ),
      ),
    ),
  );
}

class _AccessFlow extends StatelessWidget {
  const _AccessFlow();

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.white.withValues(alpha: 0.7),
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: AppColors.border),
    ),
    child: const Wrap(
      alignment: WrapAlignment.center,
      spacing: 10,
      runSpacing: 6,
      crossAxisAlignment: WrapCrossAlignment.center,
      children: [
        Text('Selecciona perfil'),
        Icon(Icons.arrow_forward, size: 16, color: AppColors.accentDeep),
        Text('Completa datos'),
        Icon(Icons.arrow_forward, size: 16, color: AppColors.accentDeep),
        Text('Continua al sistema'),
      ],
    ),
  );
}

class _AccessContext extends StatelessWidget {
  const _AccessContext({required this.isStudent});
  final bool isStudent;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: AppColors.tile,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: AppColors.border),
    ),
    child: Row(
      children: [
        Container(
          width: 42,
          height: 42,
          decoration: BoxDecoration(
            color: isStudent ? AppColors.accent : AppColors.navy,
            shape: BoxShape.circle,
          ),
          child: Icon(
            isStudent ? Icons.person : Icons.school,
            color: Colors.white,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                isStudent ? 'Acceso de estudiante' : 'Acceso docente',
                style: const TextStyle(fontWeight: FontWeight.w900),
              ),
              Text(
                isStudent
                    ? 'Ingresa tus datos y el codigo entregado por el docente.'
                    : 'Administra examenes, estudiantes, calificaciones e incidentes.',
                style: const TextStyle(color: AppColors.muted),
              ),
            ],
          ),
        ),
      ],
    ),
  );
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
        Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: AppColors.tile,
            borderRadius: BorderRadius.circular(8),
            border: Border.all(color: AppColors.border),
          ),
          child: Row(
            children: [
              Container(
                width: 42,
                height: 42,
                decoration: const BoxDecoration(
                  color: AppColors.accent,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.person, color: Colors.white),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'Sesion docente activa',
                      style: TextStyle(
                        color: AppColors.accentDeep,
                        fontSize: 12,
                        fontWeight: FontWeight.w900,
                      ),
                    ),
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
              const SizedBox(width: 12),
              TextButton.icon(
                onPressed: state.teacherLogout,
                icon: const Icon(Icons.logout),
                label: const Text('Salir'),
              ),
            ],
          ),
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
