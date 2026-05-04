import 'package:flutter/material.dart';

import '../../services/api_client.dart';
import '../../theme/app_colors.dart';
import '../../widgets/common.dart';
import '../views/exam_view.dart';
import '../views/result_view.dart';
import 'entry_view.dart';
import 'shell_state.dart';

/// Cascara visual de la app. Mantiene la misma estructura que la web:
///   * cabecera con la marca (BrandHeader)
///   * cuerpo (EntryView en modo estudiante/docente, ExamView en modo examen,
///     ResultView en modo resultado)
///   * pie con la firma de la practica
class DesktopShell extends StatefulWidget {
  const DesktopShell({super.key, required this.apiBaseUrl});
  final String apiBaseUrl;

  @override
  State<DesktopShell> createState() => _DesktopShellState();
}

class _DesktopShellState extends State<DesktopShell> {
  late final ShellState state = ShellState(ApiClient(widget.apiBaseUrl));

  @override
  void dispose() {
    state.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return ListenableBuilder(
      listenable: state,
      builder: (context, _) {
        final body = switch (state.mode) {
          AppMode.exam => ExamView(state: state),
          AppMode.result => ResultView(state: state),
          _ => EntryView(state: state),
        };

        return Scaffold(
          body: SafeArea(
            child: Column(
              children: [
                const _SiteHeader(),
                if (state.notice.isNotEmpty)
                  Padding(
                    padding: const EdgeInsets.fromLTRB(24, 12, 24, 0),
                    child: Center(
                      child: ConstrainedBox(
                        constraints: const BoxConstraints(maxWidth: 1600),
                        child: Notice(text: state.notice, busy: state.busy),
                      ),
                    ),
                  ),
                Expanded(
                  child: Center(
                    child: ConstrainedBox(
                      constraints: const BoxConstraints(maxWidth: 1600),
                      child: Padding(
                        padding: const EdgeInsets.all(24),
                        child: body,
                      ),
                    ),
                  ),
                ),
                const _SiteFooter(),
              ],
            ),
          ),
        );
      },
    );
  }
}

class _SiteHeader extends StatelessWidget {
  const _SiteHeader();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
      decoration: BoxDecoration(
        color: AppColors.paper.withValues(alpha: 0.92),
        border: const Border(
          bottom: BorderSide(color: AppColors.border),
        ),
      ),
      child: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 1180),
          child: Row(
            children: [
              const BrandMark(),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisSize: MainAxisSize.min,
                children: const [
                  Text(
                    'Sistema de Examen',
                    style: TextStyle(
                      fontWeight: FontWeight.w900,
                      fontSize: 18,
                      color: AppColors.ink,
                    ),
                  ),
                  Text(
                    'Docente + Estudiante + Supervision (escritorio)',
                    style: TextStyle(color: AppColors.muted, fontSize: 13),
                  ),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SiteFooter extends StatelessWidget {
  const _SiteFooter();

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 16),
      child: const Center(
        child: Text(
          'Practica de usabilidad, accesibilidad universal e Interaccion Ser Humano-Computadora.',
          style: TextStyle(color: AppColors.muted, fontSize: 13),
          textAlign: TextAlign.center,
        ),
      ),
    );
  }
}
