import 'package:flutter/material.dart';

import '../../models/api_models.dart';
import '../../services/error_format.dart';
import '../../services/windows_speech.dart';
import '../../theme/app_colors.dart';
import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class ExamView extends StatelessWidget {
  const ExamView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    final current = state.attempt;
    if (current == null) {
      return Surface(child: const Text('No hay un intento activo.'));
    }
    final answered = state.answers.values
        .where((value) => value.trim().isNotEmpty)
        .length;

    return Row(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        SizedBox(
          width: 330,
          child: Surface(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                Text(
                  current.attempt.examTitle,
                  style: const TextStyle(
                    fontSize: 30,
                    fontWeight: FontWeight.w900,
                    height: 1,
                  ),
                ),
                const SizedBox(height: 8),
                Text(
                  current.attempt.course,
                  style: const TextStyle(color: AppColors.muted),
                ),
                const SizedBox(height: 16),
                Metric(
                  label: 'Tiempo',
                  value: formatTime(state.remaining),
                  icon: Icons.timer,
                ),
                Metric(
                  label: 'Incidentes desktop',
                  value: '${state.desktopEvents.length}',
                  icon: Icons.security,
                ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: () => WindowsSpeech.say(
                    '${current.attempt.examTitle}. Tiempo restante ${formatTime(state.remaining)}. $answered de ${current.questions.length} preguntas respondidas.',
                  ),
                  icon: const Icon(Icons.record_voice_over),
                  label: const Text('Leer estado'),
                ),
                const SizedBox(height: 12),
                LinearProgressIndicator(
                  value: current.questions.isEmpty
                      ? 0
                      : answered / current.questions.length,
                ),
                const SizedBox(height: 8),
                Text(
                  '$answered de ${current.questions.length} preguntas respondidas',
                ),
                const SizedBox(height: 16),
                const Text(
                  'Eventos recientes',
                  style: TextStyle(fontWeight: FontWeight.w900),
                ),
                for (final event in state.desktopEvents.take(8))
                  ListTile(
                    dense: true,
                    contentPadding: EdgeInsets.zero,
                    leading: Icon(
                      Icons.warning,
                      color: severityColor(event.severity),
                    ),
                    title: Text(event.title),
                    subtitle: Text(
                      event.details,
                      maxLines: 3,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
              ],
            ),
          ),
        ),
        const SizedBox(width: 16),
        Expanded(
          child: Surface(
            child: ListView(
              padding: EdgeInsets.zero,
              children: [
                for (var i = 0; i < current.questions.length; i++)
                  _ExamQuestionCard(
                    state: state,
                    question: current.questions[i],
                    index: i,
                  ),
                const SizedBox(height: 12),
                FilledButton.icon(
                  onPressed: state.busy ? null : () => state.submitExam(),
                  icon: const Icon(Icons.send),
                  label: const Text('Enviar examen'),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _ExamQuestionCard extends StatelessWidget {
  const _ExamQuestionCard({
    required this.state,
    required this.question,
    required this.index,
  });
  final ShellState state;
  final ExamQuestion question;
  final int index;

  void _speakQuestion() {
    final buffer = StringBuffer('Pregunta ${index + 1}. ${question.prompt}. ');
    for (final option in question.options) {
      final label = option.id == 'true'
          ? 'Verdadero'
          : option.id == 'false'
          ? 'Falso'
          : option.id.toUpperCase();
      buffer.write('Opcion $label: ${option.text}. ');
    }
    WindowsSpeech.say(buffer.toString());
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 0,
      color: Colors.white,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Pregunta ${index + 1} - ${labelQuestionType(question.questionType)}',
                    style: const TextStyle(
                      color: AppColors.accentDeep,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                OutlinedButton.icon(
                  onPressed: _speakQuestion,
                  icon: const Icon(Icons.volume_up),
                  label: const Text('Leer pregunta y respuestas'),
                ),
              ],
            ),
            Text(
              question.prompt,
              style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w800),
            ),
            const SizedBox(height: 12),
            if (question.questionType == 'short_answer')
              TextField(
                decoration: const InputDecoration(
                  labelText: 'Respuesta',
                  border: OutlineInputBorder(),
                ),
                onChanged: (value) => state.answerQuestion(question.id, value),
              )
            else
              for (final option in question.options)
                OptionChoice(
                  selected: state.answers[question.id] == option.id,
                  label: '${optionLabel(option.id)}. ${option.text}',
                  onTap: () => state.answerQuestion(question.id, option.id),
                ),
          ],
        ),
      ),
    );
  }
}
