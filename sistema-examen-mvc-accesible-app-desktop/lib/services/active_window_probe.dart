import 'dart:convert';
import 'dart:io';

import '../models/api_models.dart';

/// Lee la ventana activa de Windows usando user32.dll via PowerShell.
class ActiveWindowProbe {
  static Future<ActiveWindowSnapshot?> read() async {
    if (!Platform.isWindows) return null;
    const script = r'''
Add-Type @"
using System;
using System.Text;
using System.Runtime.InteropServices;
public class Win32 {
  [DllImport("user32.dll")]
  public static extern IntPtr GetForegroundWindow();
  [DllImport("user32.dll")]
  public static extern int GetWindowText(IntPtr hWnd, StringBuilder text, int count);
  [DllImport("user32.dll")]
  public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint processId);
}
"@
$handle = [Win32]::GetForegroundWindow()
$builder = New-Object System.Text.StringBuilder 512
[void][Win32]::GetWindowText($handle, $builder, $builder.Capacity)
$pid = 0
[void][Win32]::GetWindowThreadProcessId($handle, [ref]$pid)
$process = Get-Process -Id $pid -ErrorAction SilentlyContinue
[PSCustomObject]@{
  ProcessName = if ($process) { $process.ProcessName } else { "desconocido" }
  WindowTitle = $builder.ToString()
} | ConvertTo-Json -Compress
''';
    try {
      final result = await Process.run(
        'powershell',
        ['-NoProfile', '-Command', script],
      );
      if (result.exitCode != 0) return null;
      final decoded = jsonDecode(result.stdout.toString());
      return ActiveWindowSnapshot(
        processName: decoded['ProcessName']?.toString() ?? 'desconocido',
        windowTitle: decoded['WindowTitle']?.toString() ?? 'sin titulo',
      );
    } catch (_) {
      return null;
    }
  }

  /// Procesos en ejecucion. Util para detectar grabadores aunque no tengan foco.
  static Future<List<String>> runningProcesses() async {
    if (!Platform.isWindows) return const [];
    try {
      final result = await Process.run(
        'powershell',
        [
          '-NoProfile',
          '-Command',
          'Get-Process | Select-Object -ExpandProperty ProcessName | ConvertTo-Json -Compress',
        ],
      );
      if (result.exitCode != 0) return const [];
      final raw = result.stdout.toString().trim();
      if (raw.isEmpty) return const [];
      final decoded = jsonDecode(raw);
      if (decoded is List) {
        return decoded.map((entry) => entry.toString().toLowerCase()).toList();
      }
      return [decoded.toString().toLowerCase()];
    } catch (_) {
      return const [];
    }
  }
}
