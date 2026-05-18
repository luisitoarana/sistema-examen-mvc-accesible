import 'dart:async';

import 'package:flutter/services.dart';
import 'package:flutter/widgets.dart';

import '../models/api_models.dart';
import 'active_window_probe.dart';

typedef ProctorIncidentCallback = void Function(DesktopEvent event);

/// Apps marcadas como GRAVES (asistentes de IA, mensajeria con bots, control remoto).
const _graveKeywords = <String>[
  'chatgpt',
  'copilot',
  'claude',
  'gemini',
  'perplexity',
  'bard',
  'bing chat',
  'character.ai',
  'pi chat',
  'mistral',
  'deepseek',
  'openai',
  'facebook',
  'instagram',
  'tiktok',
  'twitter',
  'x.com',
  'reddit',
  'quora',
  'telegram',
  'whatsapp',
  'discord',
  'signal',
  'messenger',
  'anydesk',
  'teamviewer',
  'rustdesk',
  'parsec',
  'chrome remote',
  'rdp',
  'vnc',
];

/// Apps marcadas como MEDIAS (navegadores, grabadores, conferencias).
const _mediaKeywords = <String>[
  'chrome',
  'edge',
  'firefox',
  'brave',
  'opera',
  'vivaldi',
  'safari',
  'youtube',
  'google',
  'bing',
  'duckduckgo',
  'yahoo',
  'obs',
  'streamlabs',
  'bandicam',
  'camtasia',
  'sharex',
  'snipping tool',
  'screenpresso',
  'screencast',
  'lightshot',
  'flashback',
  'zoom',
  'teams',
  'meet',
  'webex',
  'skype',
  'slack',
  'cmd',
  'powershell',
  'terminal',
];

const _knownTargets = <String, String>{
  'chatgpt': 'ChatGPT',
  'openai': 'OpenAI',
  'claude': 'Claude',
  'copilot': 'Microsoft Copilot',
  'gemini': 'Gemini',
  'perplexity': 'Perplexity',
  'poe': 'Poe',
  'deepseek': 'DeepSeek',
  'facebook': 'Facebook',
  'instagram': 'Instagram',
  'tiktok': 'TikTok',
  'twitter': 'Twitter/X',
  'x.com': 'Twitter/X',
  'reddit': 'Reddit',
  'quora': 'Quora',
  'whatsapp': 'WhatsApp',
  'telegram': 'Telegram',
  'youtube': 'YouTube',
  'google': 'Google',
  'bing': 'Bing',
  'duckduckgo': 'DuckDuckGo',
  'obs': 'OBS Studio',
  'streamlabs': 'Streamlabs',
  'bandicam': 'Bandicam',
  'camtasia': 'Camtasia',
  'sharex': 'ShareX',
  'zoom': 'Zoom',
  'teams': 'Microsoft Teams',
  'meet': 'Google Meet',
  'anydesk': 'AnyDesk',
  'teamviewer': 'TeamViewer',
};

/// Apps de la propia app/examen — se ignoran.
const _selfKeywords = <String>[
  'exam_desktop',
  'sistema de examen desktop',
  'sistema_examen_mvc_accesible_app_desktop',
];

/// Servicio de supervision activa. Reune:
///   * Lectura periodica de la ventana en primer plano (desktop_active_window).
///   * Observador de ciclo de vida (desktop_lifecycle, desktop_window_minimized).
///   * Captura de teclado para PrintScreen y atajos sospechosos.
///   * Escaneo de procesos contra una lista negra (desktop_screen_recorder).
class ProctorService with WidgetsBindingObserver {
  ProctorService({required this.onIncident});

  final ProctorIncidentCallback onIncident;

  Timer? _windowTimer;
  Timer? _processScanTimer;
  String _lastWindow = '';
  bool _attached = false;
  AppLifecycleState? _lastLifecycle;
  final Set<String> _reportedRecorders = {};

  void start() {
    if (_attached) return;
    WidgetsBinding.instance.addObserver(this);
    HardwareKeyboard.instance.addHandler(_handleKey);
    _attached = true;
    _windowTimer = Timer.periodic(
      const Duration(seconds: 2),
      (_) => _inspectWindow(),
    );
    _processScanTimer = Timer.periodic(
      const Duration(seconds: 8),
      (_) => _scanProcesses(),
    );
    unawaited(_inspectWindow());
    unawaited(_scanProcesses());
  }

  void stop() {
    _windowTimer?.cancel();
    _processScanTimer?.cancel();
    _windowTimer = null;
    _processScanTimer = null;
    if (!_attached) return;
    WidgetsBinding.instance.removeObserver(this);
    HardwareKeyboard.instance.removeHandler(_handleKey);
    _attached = false;
    _lastWindow = '';
    _lastLifecycle = null;
    _reportedRecorders.clear();
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    if (state == _lastLifecycle) return;
    _lastLifecycle = state;
    final severity = switch (state) {
      AppLifecycleState.paused || AppLifecycleState.hidden => 'grave',
      AppLifecycleState.inactive => 'media',
      _ => 'leve',
    };
    onIncident(
      DesktopEvent(
        title: 'Estado de la ventana',
        details: 'Lifecycle Flutter: ${state.name}.',
        severity: severity,
        at: DateTime.now(),
      ),
    );
  }

  bool _handleKey(KeyEvent event) {
    if (event is! KeyDownEvent) return false;

    final key = event.logicalKey;
    final pressed = HardwareKeyboard.instance.logicalKeysPressed;
    final shift =
        pressed.contains(LogicalKeyboardKey.shiftLeft) ||
        pressed.contains(LogicalKeyboardKey.shiftRight);
    final alt =
        pressed.contains(LogicalKeyboardKey.altLeft) ||
        pressed.contains(LogicalKeyboardKey.altRight);
    final ctrl =
        pressed.contains(LogicalKeyboardKey.controlLeft) ||
        pressed.contains(LogicalKeyboardKey.controlRight);
    final meta =
        pressed.contains(LogicalKeyboardKey.metaLeft) ||
        pressed.contains(LogicalKeyboardKey.metaRight);

    if (key == LogicalKeyboardKey.printScreen) {
      onIncident(
        DesktopEvent(
          title: 'Captura detectada',
          details: 'Se presiono PrintScreen.',
          severity: 'grave',
          at: DateTime.now(),
        ),
      );
      return false;
    }
    if (meta && shift && key == LogicalKeyboardKey.keyS) {
      onIncident(
        DesktopEvent(
          title: 'Recorte de pantalla',
          details: 'Se presiono Win+Shift+S (recorte de Windows).',
          severity: 'grave',
          at: DateTime.now(),
        ),
      );
      return false;
    }
    if (alt && key == LogicalKeyboardKey.tab) {
      onIncident(
        DesktopEvent(
          title: 'Cambio de aplicacion por teclado',
          details: 'Se presiono Alt+Tab.',
          severity: 'media',
          at: DateTime.now(),
        ),
      );
      return false;
    }
    if (ctrl && key == LogicalKeyboardKey.keyP) {
      onIncident(
        DesktopEvent(
          title: 'Atajo bloqueado',
          details: 'Ctrl+P (imprimir) bloqueado durante el examen.',
          severity: 'media',
          at: DateTime.now(),
        ),
      );
      return true;
    }
    if (ctrl &&
        (key == LogicalKeyboardKey.keyC || key == LogicalKeyboardKey.keyV)) {
      onIncident(
        DesktopEvent(
          title: 'Portapapeles',
          details:
              'Atajo Ctrl+${key == LogicalKeyboardKey.keyC ? 'C' : 'V'} en el examen.',
          severity: 'leve',
          at: DateTime.now(),
        ),
      );
    }
    return false;
  }

  Future<void> _inspectWindow() async {
    final snapshot = await ActiveWindowProbe.read();
    if (snapshot == null) return;
    final signature = '${snapshot.processName}|${snapshot.windowTitle}';
    if (signature == _lastWindow) return;
    _lastWindow = signature;
    if (_isSelf(snapshot)) return;
    final severity = _classify(snapshot.processName, snapshot.windowTitle);
    final target = _describeTarget(snapshot.processName, snapshot.windowTitle);
    onIncident(
      DesktopEvent(
        title: 'Cambio de aplicacion',
        details:
            '[${severity.toUpperCase()}] $target | Proceso: ${snapshot.processName} | Ventana: ${snapshot.windowTitle}',
        severity: severity,
        at: DateTime.now(),
      ),
    );
  }

  Future<void> _scanProcesses() async {
    final processes = await ActiveWindowProbe.runningProcesses();
    if (processes.isEmpty) return;
    for (final process in processes) {
      final isRecorder = _mediaKeywords.any(
        (keyword) =>
            (keyword.contains('obs') ||
                keyword.contains('bandicam') ||
                keyword.contains('camtasia') ||
                keyword.contains('sharex') ||
                keyword.contains('streamlabs')) &&
            process.contains(keyword),
      );
      if (!isRecorder) continue;
      if (_reportedRecorders.contains(process)) continue;
      _reportedRecorders.add(process);
      onIncident(
        DesktopEvent(
          title: 'Proceso de grabacion detectado',
          details: 'Proceso en ejecucion: $process',
          severity: 'grave',
          at: DateTime.now(),
        ),
      );
    }
  }

  bool _isSelf(ActiveWindowSnapshot snapshot) {
    final text = '${snapshot.processName} ${snapshot.windowTitle}'
        .toLowerCase();
    return _selfKeywords.any(text.contains);
  }

  String _classify(String processName, String title) {
    final text = '$processName $title'.toLowerCase();
    if (_graveKeywords.any(text.contains)) return 'grave';
    if (_mediaKeywords.any(text.contains)) return 'media';
    return 'leve';
  }

  String _describeTarget(String processName, String title) {
    final text = '$processName $title'.toLowerCase();
    for (final entry in _knownTargets.entries) {
      if (text.contains(entry.key)) {
        return 'Sitio o aplicacion detectada: ${entry.value}';
      }
    }
    final process = processName.trim().isEmpty ? 'desconocida' : processName;
    return 'Aplicacion externa detectada: $process';
  }
}
