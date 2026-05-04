import 'dart:io';

class WindowsSpeech {
  static Future<void> say(String text) async {
    if (!Platform.isWindows) return;
    final safe = text.replaceAll("'", "''");
    final script =
        "Add-Type -AssemblyName System.Speech; \$s = New-Object System.Speech.Synthesis.SpeechSynthesizer; \$s.Rate = 0; \$s.Speak('$safe')";
    await Process.start('powershell', ['-NoProfile', '-Command', script]);
  }
}
