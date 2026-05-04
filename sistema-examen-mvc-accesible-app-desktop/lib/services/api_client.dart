import 'dart:async';
import 'dart:convert';
import 'dart:io';

import '../models/api_models.dart';
import '../models/question_draft.dart';
import 'error_format.dart';

/// Cliente HTTP institucional. Soporta tokens Bearer y reintentos basicos.
class ApiClient {
  ApiClient(String baseUrl)
      : _baseUrl = baseUrl.replaceAll(RegExp(r'/$'), '');

  final String _baseUrl;
  String? _teacherToken;
  String? _studentToken;

  String get baseUrl => _baseUrl;
  set teacherToken(String? value) => _teacherToken = value;
  set studentToken(String? value) => _studentToken = value;

  void clearTokens() {
    _teacherToken = null;
    _studentToken = null;
  }

  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Object? body,
    bool authStudent = false,
    bool authTeacher = false,
  }) async {
    final client = HttpClient();
    client.connectionTimeout = const Duration(seconds: 8);
    try {
      final uri = Uri.parse('$_baseUrl$path');
      final HttpClientRequest request = switch (method) {
        'POST' => await client.postUrl(uri),
        'PATCH' => await client.patchUrl(uri),
        'DELETE' => await client.deleteUrl(uri),
        _ => await client.getUrl(uri),
      };
      request.headers.contentType = ContentType.json;
      final token = authTeacher ? _teacherToken : authStudent ? _studentToken : null;
      if (token != null && token.isNotEmpty) {
        request.headers.add('Authorization', 'Bearer $token');
      }
      if (body != null) {
        request.write(jsonEncode(body));
      }
      final response = await request.close();
      final text = await response.transform(utf8.decoder).join();
      final data = text.isEmpty ? <String, dynamic>{} : jsonDecode(text);
      if (response.statusCode >= 400) throw Exception(extractError(data));
      return data;
    } on SocketException {
      throw Exception('No se pudo contactar al servidor. Revisa tu conexion.');
    } finally {
      client.close();
    }
  }

  Future<TeacherSession> loginTeacher(String email, String password) async {
    final data = await request(
      '/api/teachers/login',
      method: 'POST',
      body: {'email': email, 'password': password},
    );
    final session = TeacherSession.fromResponse(data);
    _teacherToken = session.token;
    return session;
  }

  Future<TeacherSession> registerTeacher(
    String fullName,
    String email,
    String password,
  ) async {
    final data = await request(
      '/api/teachers/register',
      method: 'POST',
      body: {'fullName': fullName, 'email': email, 'password': password},
    );
    final session = TeacherSession.fromResponse(data);
    _teacherToken = session.token;
    return session;
  }

  Future<List<dynamic>> teacherExams(int teacherId) async {
    final data = await request(
      '/api/teachers/$teacherId/exams',
      authTeacher: true,
    );
    return (data['exams'] as List? ?? []);
  }

  Future<Map<String, dynamic>> createExam({
    required int teacherId,
    required String createdBy,
    required String title,
    required String course,
    required String accessCode,
    required int durationMinutes,
    required List<QuestionDraft> questions,
  }) async {
    final data = await request(
      '/api/exams',
      method: 'POST',
      authTeacher: true,
      body: {
        'teacherId': teacherId,
        'createdBy': createdBy,
        'title': title,
        'course': course,
        'accessCode': accessCode,
        'durationMinutes': durationMinutes,
        'questions': questions.map((question) => question.toJson()).toList(),
      },
    );
    return Map<String, dynamic>.from(data);
  }

  Future<AttemptSession> startAttempt({
    required String fullName,
    required String email,
    required String accessCode,
  }) async {
    final data = await request(
      '/api/attempts',
      method: 'POST',
      body: {
        'fullName': fullName,
        'email': email,
        'accessCode': accessCode,
      },
    );
    final session = AttemptSession.fromJson(data);
    _studentToken = session.token;
    return session;
  }

  Future<ExamResult> submitAttempt(
    int attemptId,
    Map<String, String> answers,
  ) async {
    final data = await request(
      '/api/attempts/$attemptId/submit',
      method: 'POST',
      authStudent: true,
      body: {'answers': answers},
    );
    return ExamResult.fromJson(data);
  }

  Future<void> securityEvent(
    int attemptId,
    String eventType,
    String details, {
    String severity = 'media',
    String source = 'desktop',
    Map<String, dynamic>? metadata,
  }) async {
    await request(
      '/api/security-event',
      method: 'POST',
      authStudent: true,
      body: {
        'attemptId': attemptId,
        'eventType': eventType,
        'details': details,
        'severity': severity,
        'source': source,
        'metadata': ?metadata,
      },
    );
  }

  Future<ExamReview> examReview(String code) async {
    final data = await request(
      '/api/exams/${Uri.encodeComponent(code)}/attempts',
      authTeacher: true,
    );
    return ExamReview.fromJson(data);
  }
}
