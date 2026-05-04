import 'package:flutter/material.dart';

import 'features/shell/desktop_shell.dart';
import 'theme/app_colors.dart';

void main() {
  runApp(const ExamDesktopApp());
}

class ExamDesktopApp extends StatelessWidget {
  const ExamDesktopApp({super.key});

  static const _apiBaseUrl = String.fromEnvironment(
    'EXAM_API_URL',
    defaultValue: 'http://localhost:3000',
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'Sistema de Examen Desktop',
      theme: buildAppTheme(),
      home: const DesktopShell(apiBaseUrl: _apiBaseUrl),
    );
  }
}
