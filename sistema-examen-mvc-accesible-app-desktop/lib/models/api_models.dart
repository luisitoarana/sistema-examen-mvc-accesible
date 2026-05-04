class TeacherSession {
  const TeacherSession({
    required this.id,
    required this.fullName,
    required this.email,
    this.token,
  });
  final int id;
  final String fullName;
  final String email;
  final String? token;

  factory TeacherSession.fromResponse(dynamic json) {
    final teacher = json['teacher'] ?? json;
    return TeacherSession(
      id: teacher['id'] as int,
      fullName: teacher['fullName'].toString(),
      email: teacher['email'].toString(),
      token: json['token']?.toString(),
    );
  }
}

class AttemptInfo {
  const AttemptInfo({
    required this.examTitle,
    required this.course,
    required this.accessCode,
  });
  final String examTitle;
  final String course;
  final String accessCode;

  factory AttemptInfo.fromJson(dynamic json) => AttemptInfo(
        examTitle: json['examTitle'].toString(),
        course: json['course'].toString(),
        accessCode: json['accessCode'].toString(),
      );
}

class ExamOption {
  const ExamOption({required this.id, required this.text});
  final String id;
  final String text;

  factory ExamOption.fromJson(dynamic json) => ExamOption(
        id: json['id'].toString(),
        text: json['text'].toString(),
      );
}

class ExamQuestion {
  const ExamQuestion({
    required this.id,
    required this.questionType,
    required this.prompt,
    required this.options,
  });
  final String id;
  final String questionType;
  final String prompt;
  final List<ExamOption> options;

  factory ExamQuestion.fromJson(dynamic json) => ExamQuestion(
        id: json['id'].toString(),
        questionType: json['questionType'].toString(),
        prompt: json['prompt'].toString(),
        options: (json['options'] as List? ?? [])
            .map(ExamOption.fromJson)
            .toList(),
      );
}

class AttemptSession {
  const AttemptSession({
    required this.attemptId,
    required this.attempt,
    required this.durationSeconds,
    required this.questions,
    this.token,
  });
  final int attemptId;
  final AttemptInfo attempt;
  final int durationSeconds;
  final List<ExamQuestion> questions;
  final String? token;

  factory AttemptSession.fromJson(dynamic json) => AttemptSession(
        attemptId: json['attemptId'] as int,
        attempt: AttemptInfo.fromJson(json['attempt']),
        durationSeconds: json['durationSeconds'] as int,
        questions: (json['questions'] as List? ?? [])
            .map(ExamQuestion.fromJson)
            .toList(),
        token: json['token']?.toString(),
      );
}

class ExamResult {
  const ExamResult({
    required this.examTitle,
    required this.fullName,
    required this.score,
    required this.totalQuestions,
    required this.incidentCount,
  });
  final String examTitle;
  final String fullName;
  final int score;
  final int totalQuestions;
  final int incidentCount;

  factory ExamResult.fromJson(dynamic json) => ExamResult(
        examTitle: json['examTitle'].toString(),
        fullName: json['fullName'].toString(),
        score: (json['score'] ?? 0) as int,
        totalQuestions: (json['totalQuestions'] ?? 0) as int,
        incidentCount: (json['incidentCount'] ?? 0) as int,
      );
}

class ExamReview {
  const ExamReview({required this.stats, required this.attempts});
  final Map<String, dynamic> stats;
  final List<dynamic> attempts;

  factory ExamReview.fromJson(dynamic json) => ExamReview(
        stats: Map<String, dynamic>.from(json['stats'] ?? {}),
        attempts: (json['attempts'] as List? ?? []),
      );
}

class DesktopEvent {
  const DesktopEvent({
    required this.title,
    required this.details,
    required this.severity,
    required this.at,
  });
  final String title;
  final String details;
  final String severity;
  final DateTime at;
}

class ActiveWindowSnapshot {
  const ActiveWindowSnapshot({
    required this.processName,
    required this.windowTitle,
  });
  final String processName;
  final String windowTitle;
}
