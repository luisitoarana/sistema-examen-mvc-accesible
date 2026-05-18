import 'package:flutter/material.dart';

import '../../models/question_draft.dart';
import '../../theme/app_colors.dart';
import '../../widgets/common.dart';
import '../shell/shell_state.dart';

class TeacherBuilderView extends StatelessWidget {
  const TeacherBuilderView({super.key, required this.state});
  final ShellState state;

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        const SectionTitle(
          icon: Icons.add_circle,
          title: 'Crear examen',
          subtitle: 'Elige tipos de pregunta, codigo y duracion.',
        ),
        _BuilderSection(
          label: 'Datos del examen',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              AppTextInput(
                controller: state.builderCourse,
                label: 'Materia o curso',
                icon: Icons.menu_book,
              ),
              AppTextInput(
                controller: state.builderTitle,
                label: 'Titulo del examen',
                icon: Icons.title,
              ),
              Row(
                children: [
                  Expanded(
                    child: AppTextInput(
                      controller: state.builderCode,
                      label: 'Codigo del examen',
                      icon: Icons.key,
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 180,
                    child: AppTextInput(
                      controller: state.builderMinutes,
                      label: 'Minutos',
                      icon: Icons.timer,
                    ),
                  ),
                ],
              ),
            ],
          ),
        ),
        const SizedBox(height: 12),
        _BuilderSection(
          label: 'Banco de preguntas',
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            mainAxisSize: MainAxisSize.min,
            children: [
              for (var i = 0; i < state.builderQuestions.length; i++)
                _QuestionDraftCard(state: state, index: i),
            ],
          ),
        ),
        const SizedBox(height: 12),
        Row(
          children: [
            Expanded(
              child: OutlinedButton.icon(
                onPressed: state.addQuestion,
                icon: const Icon(Icons.add),
                label: const Text('Agregar pregunta'),
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: FilledButton.icon(
                onPressed: state.busy ? null : state.createExam,
                icon: const Icon(Icons.save),
                label: const Text('Crear examen'),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

class _BuilderSection extends StatelessWidget {
  const _BuilderSection({required this.label, required this.child});
  final String label;
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    padding: const EdgeInsets.all(14),
    decoration: BoxDecoration(
      color: AppColors.tile,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: AppColors.border),
    ),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      mainAxisSize: MainAxisSize.min,
      children: [
        Align(
          alignment: Alignment.centerLeft,
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
            decoration: BoxDecoration(
              color: AppColors.accentSoft,
              borderRadius: BorderRadius.circular(999),
            ),
            child: Text(
              label,
              style: const TextStyle(
                color: AppColors.accentDeep,
                fontSize: 12,
                fontWeight: FontWeight.w900,
              ),
            ),
          ),
        ),
        const SizedBox(height: 12),
        child,
      ],
    ),
  );
}

class _QuestionDraftCard extends StatelessWidget {
  const _QuestionDraftCard({required this.state, required this.index});
  final ShellState state;
  final int index;

  @override
  Widget build(BuildContext context) {
    final QuestionDraft draft = state.builderQuestions[index];
    return Card(
      elevation: 0,
      color: AppColors.tile,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.border),
      ),
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Expanded(
                  child: Text(
                    'Pregunta ${index + 1}',
                    style: const TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w900,
                    ),
                  ),
                ),
                DropdownButton<String>(
                  value: draft.type,
                  items: const [
                    DropdownMenuItem(
                      value: 'multiple_choice',
                      child: Text('Opcion multiple'),
                    ),
                    DropdownMenuItem(
                      value: 'true_false',
                      child: Text('Verdadero / falso'),
                    ),
                    DropdownMenuItem(
                      value: 'short_answer',
                      child: Text('Respuesta corta'),
                    ),
                  ],
                  onChanged: (value) => state.updateQuestionType(
                    index,
                    value ?? 'multiple_choice',
                  ),
                ),
              ],
            ),
            AppTextInput(
              controller: draft.prompt,
              label: 'Enunciado',
              icon: Icons.help,
            ),
            if (draft.type == 'multiple_choice') ...[
              for (var i = 0; i < 4; i++)
                AppTextInput(
                  controller: draft.options[i],
                  label: 'Opcion ${String.fromCharCode(65 + i)}',
                  icon: Icons.radio_button_checked,
                ),
              DropdownButtonFormField<String>(
                initialValue: draft.correctOption,
                decoration: const InputDecoration(
                  labelText: 'Respuesta correcta',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'a', child: Text('Opcion A')),
                  DropdownMenuItem(value: 'b', child: Text('Opcion B')),
                  DropdownMenuItem(value: 'c', child: Text('Opcion C')),
                  DropdownMenuItem(value: 'd', child: Text('Opcion D')),
                ],
                onChanged: (value) =>
                    state.updateCorrectOption(index, value ?? 'a'),
              ),
            ],
            if (draft.type == 'true_false')
              DropdownButtonFormField<String>(
                initialValue: draft.correctAnswer,
                decoration: const InputDecoration(
                  labelText: 'Respuesta correcta',
                  border: OutlineInputBorder(),
                ),
                items: const [
                  DropdownMenuItem(value: 'true', child: Text('Verdadero')),
                  DropdownMenuItem(value: 'false', child: Text('Falso')),
                ],
                onChanged: (value) =>
                    state.updateCorrectAnswer(index, value ?? 'true'),
              ),
            if (draft.type == 'short_answer')
              AppTextInput(
                controller: draft.shortAnswer,
                label: 'Respuesta esperada',
                icon: Icons.edit,
              ),
          ],
        ),
      ),
    );
  }
}
