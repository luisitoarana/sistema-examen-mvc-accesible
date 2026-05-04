String cleanError(Object? error) =>
    error.toString().replaceFirst('Exception: ', '');

String extractError(dynamic data) {
  if (data is Map && data['errors'] is List) {
    return (data['errors'] as List).join(' ');
  }
  if (data is Map && data['error'] != null) {
    return data['error'].toString();
  }
  return 'No se pudo completar la solicitud.';
}

String formatTime(int seconds) {
  final minutes = (seconds ~/ 60).toString().padLeft(2, '0');
  final rest = (seconds % 60).toString().padLeft(2, '0');
  return '$minutes:$rest';
}

String labelQuestionType(String type) => switch (type) {
      'true_false' => 'Verdadero / falso',
      'short_answer' => 'Respuesta corta',
      _ => 'Opcion multiple',
    };

String optionLabel(String id) =>
    id == 'true' ? 'V' : id == 'false' ? 'F' : id.toUpperCase();
