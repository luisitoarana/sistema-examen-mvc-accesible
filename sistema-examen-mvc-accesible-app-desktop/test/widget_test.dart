// This is a basic Flutter widget test.
//
// To perform an interaction with a widget in your test, use the WidgetTester
// utility in the flutter_test package. For example, you can send tap and scroll
// gestures. You can also use WidgetTester to find child widgets in the widget
// tree, read text, and verify that the values of widget properties are correct.

import 'dart:ui';

import 'package:flutter_test/flutter_test.dart';

import 'package:sistema_examen_mvc_accesible_app_desktop/main.dart';

void main() {
  testWidgets('muestra la app de examen desktop', (WidgetTester tester) async {
    tester.view.physicalSize = const Size(1600, 1000);
    tester.view.devicePixelRatio = 1;
    addTearDown(tester.view.resetPhysicalSize);
    addTearDown(tester.view.resetDevicePixelRatio);

    await tester.pumpWidget(const ExamDesktopApp());
    await tester.pump();

    expect(find.text('Sistema de Examen'), findsOneWidget);
    expect(find.text('Examenes por codigo'), findsOneWidget);
    expect(find.text('Ingreso del estudiante'), findsOneWidget);
    expect(find.text('Estudiante'), findsAtLeastNWidgets(1));
    expect(find.text('Docente'), findsAtLeastNWidgets(1));
  });
}
