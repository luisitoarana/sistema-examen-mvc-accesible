import 'dart:async';

import 'package:flutter/material.dart';

import '../../models/api_models.dart';
import '../../models/question_draft.dart';
import '../../services/api_client.dart';
import '../../services/error_format.dart';
import '../../services/proctor_service.dart';

enum AppMode { student, teacherAuth, teacherDashboard, exam, result }

enum TeacherTab { dashboard, builder, review }

/// Estado central de la app. Controla autenticacion, intento, supervision
/// y cambios de modo. Las vistas escuchan via [ChangeNotifier].
class ShellState extends ChangeNotifier {
  ShellState(this.api) {
    proctor = ProctorService(onIncident: _onProctorIncident);
  }

  final ApiClient api;
  late final ProctorService proctor;

  // Modo y tab
  AppMode mode = AppMode.student;
  TeacherTab teacherTab = TeacherTab.dashboard;

  // Sesiones
  TeacherSession? teacher;
  AttemptSession? attempt;
  ExamResult? result;

  // UI
  String notice = 'Sistema listo para iniciar.';
  bool busy = false;
  int remaining = 0;
  Map<String, String> answers = {};
  final desktopEvents = <DesktopEvent>[];

  // Controllers de formularios
  final studentName = TextEditingController();
  final studentEmail = TextEditingController();
  final examCode = TextEditingController(text: 'HCI2026');
  final teacherName = TextEditingController(text: 'Docente Demo');
  final teacherEmail = TextEditingController(text: 'demo@institucion.edu');
  final teacherPassword = TextEditingController();
  final reviewCode = TextEditingController(text: 'HCI2026');
  final builderTitle = TextEditingController();
  final builderCourse = TextEditingController();
  final builderCode = TextEditingController();
  final builderMinutes = TextEditingController(text: '10');
  final builderQuestions = <QuestionDraft>[QuestionDraft()];

  Timer? _countdown;

  @override
  void dispose() {
    _countdown?.cancel();
    proctor.stop();
    for (final controller in [
      studentName,
      studentEmail,
      examCode,
      teacherName,
      teacherEmail,
      teacherPassword,
      reviewCode,
      builderTitle,
      builderCourse,
      builderCode,
      builderMinutes,
    ]) {
      controller.dispose();
    }
    for (final draft in builderQuestions) {
      draft.dispose();
    }
    super.dispose();
  }

  Future<void> _runGuarded(Future<void> Function() action) async {
    busy = true;
    notifyListeners();
    try {
      await action();
    } catch (error) {
      notice = cleanError(error);
    } finally {
      busy = false;
      notifyListeners();
    }
  }

  // Navegacion
  void switchMode(AppMode next) {
    if (next == AppMode.exam || next == AppMode.result) return;
    if (mode == AppMode.exam || mode == AppMode.result) {
      _stopExamSession();
    }
    mode = next;
    notifyListeners();
  }

  void selectTeacherTab(TeacherTab tab) {
    teacherTab = tab;
    notifyListeners();
  }

  // Estudiante
  Future<void> startAttempt() => _runGuarded(() async {
        final session = await api.startAttempt(
          fullName: studentName.text,
          email: studentEmail.text,
          accessCode: examCode.text,
        );
        attempt = session;
        result = null;
        answers = {};
        remaining = session.durationSeconds;
        desktopEvents.clear();
        notice = 'Examen iniciado. Supervision desktop activa.';
        mode = AppMode.exam;
        _startTimers();
        proctor.start();
      });

  void answerQuestion(String questionId, String value) {
    answers[questionId] = value;
    notifyListeners();
  }

  Future<void> submitExam({bool auto = false}) => _runGuarded(() async {
        final current = attempt;
        if (current == null) return;
        _stopExamSession();
        final outcome = await api.submitAttempt(current.attemptId, answers);
        result = outcome;
        mode = AppMode.result;
        notice = auto
            ? 'Tiempo terminado. El examen fue enviado automaticamente.'
            : 'Examen enviado.';
      });

  void resetStudent() {
    mode = AppMode.student;
    attempt = null;
    result = null;
    desktopEvents.clear();
    answers = {};
    notice = 'Sistema listo para iniciar.';
    notifyListeners();
  }

  // Docente
  Future<void> teacherLogin({required bool register}) => _runGuarded(() async {
        final session = register
            ? await api.registerTeacher(
                teacherName.text,
                teacherEmail.text,
                teacherPassword.text,
              )
            : await api.loginTeacher(
                teacherEmail.text,
                teacherPassword.text,
              );
        teacher = session;
        mode = AppMode.teacherDashboard;
        teacherTab = TeacherTab.dashboard;
        notice = 'Sesion docente activa: ${session.fullName}.';
      });

  void teacherLogout() {
    teacher = null;
    api.clearTokens();
    mode = AppMode.teacherAuth;
    notice = 'Sesion docente cerrada.';
    notifyListeners();
  }

  Future<void> createExam() => _runGuarded(() async {
        final current = teacher;
        if (current == null) {
          throw Exception('Primero inicia sesion como docente.');
        }
        final created = await api.createExam(
          teacherId: current.id,
          createdBy: current.fullName,
          title: builderTitle.text,
          course: builderCourse.text,
          accessCode: builderCode.text,
          durationMinutes: int.tryParse(builderMinutes.text) ?? 10,
          questions: builderQuestions,
        );
        reviewCode.text = created['accessCode']?.toString() ?? builderCode.text;
        notice = 'Examen creado. Codigo: ${reviewCode.text}.';
        mode = AppMode.teacherDashboard;
        teacherTab = TeacherTab.review;
      });

  Future<List<dynamic>> loadTeacherExams() {
    final current = teacher;
    if (current == null) return Future.value([]);
    return api.teacherExams(current.id);
  }

  Future<ExamReview> loadReview() => api.examReview(reviewCode.text);

  void addQuestion() {
    builderQuestions.add(QuestionDraft());
    notifyListeners();
  }

  void updateQuestionType(int index, String type) {
    builderQuestions[index].type = type;
    notifyListeners();
  }

  void updateCorrectOption(int index, String option) {
    builderQuestions[index].correctOption = option;
    notifyListeners();
  }

  void updateCorrectAnswer(int index, String answer) {
    builderQuestions[index].correctAnswer = answer;
    notifyListeners();
  }

  void selectExam(String accessCode) {
    reviewCode.text = accessCode;
    teacherTab = TeacherTab.review;
    notifyListeners();
  }

  // Supervision
  void _onProctorIncident(DesktopEvent event) {
    desktopEvents.insert(0, event);
    notice = event.details;
    final current = attempt;
    if (current == null) {
      notifyListeners();
      return;
    }
    api
        .securityEvent(
          current.attemptId,
          _eventTypeFor(event),
          event.details,
          severity: event.severity,
          source: 'desktop',
        )
        .catchError((_) {});
    notifyListeners();
  }

  String _eventTypeFor(DesktopEvent event) {
    final lower = event.title.toLowerCase();
    if (lower.contains('captura')) return 'desktop_screenshot_attempt';
    if (lower.contains('grabacion')) return 'desktop_screen_recorder';
    if (lower.contains('estado')) return 'desktop_lifecycle';
    if (lower.contains('teclado') || lower.contains('atajo')) {
      return 'desktop_keyboard_block';
    }
    return 'desktop_active_window';
  }

  void _startTimers() {
    _countdown?.cancel();
    _countdown = Timer.periodic(const Duration(seconds: 1), (_) {
      if (remaining <= 1) {
        _countdown?.cancel();
        unawaited(submitExam(auto: true));
      } else {
        remaining -= 1;
        notifyListeners();
      }
    });
  }

  void _stopExamSession() {
    _countdown?.cancel();
    proctor.stop();
  }

  int navIndex() => switch (mode) {
        AppMode.student || AppMode.exam || AppMode.result => 0,
        AppMode.teacherAuth || AppMode.teacherDashboard => 1,
      };

  void navigateNav(int index) {
    if (index == 0) {
      switchMode(AppMode.student);
    } else if (index == 1) {
      switchMode(teacher == null ? AppMode.teacherAuth : AppMode.teacherDashboard);
    }
  }
}
