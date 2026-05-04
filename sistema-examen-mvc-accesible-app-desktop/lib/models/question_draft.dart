import 'package:flutter/material.dart';

class QuestionDraft {
  String type = 'multiple_choice';
  String correctOption = 'a';
  String correctAnswer = 'true';
  final prompt = TextEditingController();
  final options = List.generate(4, (_) => TextEditingController());
  final shortAnswer = TextEditingController();

  Map<String, dynamic> toJson() => {
        'questionType': type,
        'prompt': prompt.text,
        'options': options.map((option) => option.text).toList(),
        'correctOption': correctOption,
        'correctAnswer':
            type == 'short_answer' ? shortAnswer.text : correctAnswer,
      };

  void dispose() {
    prompt.dispose();
    for (final option in options) {
      option.dispose();
    }
    shortAnswer.dispose();
  }
}
