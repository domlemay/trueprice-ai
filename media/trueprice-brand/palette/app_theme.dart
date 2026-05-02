// lib/core/theme/app_theme.dart
// TruePriceAI — Thème Flutter officiel

import 'package:flutter/material.dart';

/// Couleurs de la marque TruePriceAI
abstract class TrueColors {
  // ── Couleur signature Cyan ──────────────────────
  static const cyan50  = Color(0xFFE0FFFE);
  static const cyan100 = Color(0xFFB3FEFA);
  static const cyan200 = Color(0xFF80FDF7);
  static const cyan300 = Color(0xFF4DFFF8); // Highlight / glow
  static const cyan400 = Color(0xFF00E5DB);
  static const cyan500 = Color(0xFF00D4C8); // ★ PRIMAIRE
  static const cyan600 = Color(0xFF00A89E); // Hover
  static const cyan700 = Color(0xFF0D9488); // Mode clair
  static const cyan800 = Color(0xFF007A72); // Pressed
  static const cyan900 = Color(0xFF005C56);

  // ── Navy (fond dark) ───────────────────────────
  static const navy50  = Color(0xFFE8EDF5);
  static const navy600 = Color(0xFF0D2140); // Header / Sidebar
  static const navy700 = Color(0xFF0A1628); // ★ FOND DARK
  static const navy800 = Color(0xFF071020);
  static const navy900 = Color(0xFF040A14);

  // ── Sémantiques ────────────────────────────────
  static const success = Color(0xFF2D9E5F);
  static const warning = Color(0xFFF5A623);
  static const error   = Color(0xFFE53935);
  static const info    = Color(0xFF1976D2);

  // ── Neutres ────────────────────────────────────
  static const white = Color(0xFFFFFFFF);
  static const black = Color(0xFF040A14);
}

/// Thème sombre TruePriceAI
ThemeData truePriceDarkTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.dark,
    scaffoldBackgroundColor: TrueColors.navy700,
    colorScheme: const ColorScheme.dark(
      primary:          TrueColors.cyan500,
      onPrimary:        TrueColors.navy700,
      secondary:        TrueColors.cyan700,
      onSecondary:      TrueColors.white,
      surface:          Color(0xFF0F1E36),
      onSurface:        TrueColors.white,
      background:       TrueColors.navy700,
      onBackground:     TrueColors.white,
      error:            TrueColors.error,
      onError:          TrueColors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: Color(0xFF0D2140),
      foregroundColor: TrueColors.white,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: const Color(0xFF112040),
      elevation: 4,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: TrueColors.cyan500.withOpacity(0.15),
          width: 1,
        ),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: TrueColors.cyan500,
        foregroundColor: TrueColors.navy700,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
        padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: const Color(0xFF0D1E38),
      border: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: BorderSide(
          color: TrueColors.cyan500.withOpacity(0.15),
        ),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(8),
        borderSide: const BorderSide(
          color: TrueColors.cyan500,
          width: 1.5,
        ),
      ),
    ),
    textTheme: const TextTheme(
      displayLarge:  TextStyle(color: TrueColors.white, fontWeight: FontWeight.w700),
      displayMedium: TextStyle(color: TrueColors.white, fontWeight: FontWeight.w700),
      headlineLarge: TextStyle(color: TrueColors.white, fontWeight: FontWeight.w600),
      headlineMedium:TextStyle(color: TrueColors.white, fontWeight: FontWeight.w600),
      bodyLarge:     TextStyle(color: TrueColors.white),
      bodyMedium:    TextStyle(color: Color(0xB3FFFFFF)), // 70%
      labelLarge:    TextStyle(color: TrueColors.cyan500, fontWeight: FontWeight.w600),
    ),
    dividerTheme: const DividerThemeData(
      color: Color(0x1A00D4C8), // cyan 10%
    ),
  );
}

/// Thème clair TruePriceAI
ThemeData truePriceLightTheme() {
  return ThemeData(
    useMaterial3: true,
    brightness: Brightness.light,
    scaffoldBackgroundColor: TrueColors.white,
    colorScheme: const ColorScheme.light(
      primary:       TrueColors.cyan700,
      onPrimary:     TrueColors.white,
      secondary:     TrueColors.cyan500,
      onSecondary:   TrueColors.navy700,
      surface:       Color(0xFFF8FBFE),
      onSurface:     TrueColors.navy700,
      background:    TrueColors.white,
      onBackground:  TrueColors.navy700,
      error:         TrueColors.error,
      onError:       TrueColors.white,
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: TrueColors.white,
      foregroundColor: TrueColors.navy700,
      elevation: 0,
    ),
    cardTheme: CardTheme(
      color: const Color(0xFFF8FBFE),
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(
          color: TrueColors.cyan700.withOpacity(0.2),
          width: 1,
        ),
      ),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: TrueColors.cyan700,
        foregroundColor: TrueColors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
        ),
      ),
    ),
  );
}
