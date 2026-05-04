import 'package:flutter/material.dart';

/// Paleta unificada con la web (frontend/src/styles.css).
/// El frontend usa: --accent #0f766e, --navy #22355f, --gold #b68b2c,
/// --paper #f5f1e7, --surface #fffdfa, --ink #16201c.
class AppColors {
  AppColors._();

  static const ink = Color(0xFF16201C);
  static const paper = Color(0xFFF5F1E7);
  static const surface = Color(0xFFFFFDFA);
  static const accent = Color(0xFF0F766E);
  static const accentSoft = Color(0xFFE8F3EF);
  static const accentDeep = Color(0xFF006B60);
  static const navy = Color(0xFF22355F);
  static const gold = Color(0xFFB68B2C);
  static const danger = Color(0xFFA12626);
  static const warning = Color(0xFF8A5800);
  static const success = Color(0xFF226C42);
  static const focus = Color(0xFF1647D8);
  static const muted = Color(0xFF5B6861);
  static const border = Color(0xFFD8CFBD);
  static const tile = Color(0xFFFBFAF5);
}

ThemeData buildAppTheme() {
  return ThemeData(
    useMaterial3: true,
    colorScheme: ColorScheme.fromSeed(
      seedColor: AppColors.accent,
      primary: AppColors.accent,
      secondary: AppColors.navy,
      tertiary: AppColors.gold,
      error: AppColors.danger,
    ),
    scaffoldBackgroundColor: AppColors.paper,
    fontFamily: 'Segoe UI',
    inputDecorationTheme: const InputDecorationTheme(
      border: OutlineInputBorder(),
      isDense: true,
    ),
    cardTheme: CardThemeData(
      color: AppColors.surface,
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: AppColors.border),
      ),
    ),
  );
}
