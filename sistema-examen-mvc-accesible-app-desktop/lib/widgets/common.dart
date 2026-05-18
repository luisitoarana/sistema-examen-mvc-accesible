import 'package:flutter/material.dart';

import '../theme/app_colors.dart';

class BrandMark extends StatelessWidget {
  const BrandMark({super.key});
  @override
  Widget build(BuildContext context) => Container(
    width: 52,
    height: 52,
    alignment: Alignment.center,
    decoration: BoxDecoration(
      gradient: const LinearGradient(colors: [AppColors.ink, AppColors.navy]),
      borderRadius: BorderRadius.circular(8),
    ),
    child: const Text(
      'MVC',
      style: TextStyle(color: Colors.white, fontWeight: FontWeight.w900),
    ),
  );
}

class Surface extends StatelessWidget {
  const Surface({super.key, required this.child});
  final Widget child;

  @override
  Widget build(BuildContext context) => Container(
    width: double.infinity,
    padding: const EdgeInsets.all(22),
    decoration: BoxDecoration(
      color: AppColors.surface,
      border: Border.all(color: AppColors.border),
      borderRadius: BorderRadius.circular(8),
      boxShadow: const [
        BoxShadow(
          color: Color(0x1F16201C),
          blurRadius: 28,
          offset: Offset(0, 14),
        ),
      ],
    ),
    child: child,
  );
}

class Notice extends StatelessWidget {
  const Notice({super.key, required this.text, required this.busy});
  final String text;
  final bool busy;

  @override
  Widget build(BuildContext context) => Semantics(
    liveRegion: true,
    label: text,
    child: Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppColors.accentSoft,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: const Color(0xFF9BC7BB)),
      ),
      child: Row(
        children: [
          Icon(busy ? Icons.sync : Icons.info, color: AppColors.accentDeep),
          const SizedBox(width: 10),
          Expanded(child: Text(text)),
        ],
      ),
    ),
  );
}

class SectionTitle extends StatelessWidget {
  const SectionTitle({
    super.key,
    required this.icon,
    required this.title,
    required this.subtitle,
  });
  final IconData icon;
  final String title;
  final String subtitle;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 16),
    child: Row(
      children: [
        Container(
          width: 46,
          height: 46,
          decoration: BoxDecoration(
            color: AppColors.accentSoft,
            shape: BoxShape.circle,
            border: Border.all(color: const Color(0x339BC7BB)),
          ),
          child: Icon(icon, color: AppColors.accentDeep, size: 26),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.w900,
                ),
              ),
              Text(subtitle, style: const TextStyle(color: AppColors.muted)),
            ],
          ),
        ),
      ],
    ),
  );
}

class AppTextInput extends StatelessWidget {
  const AppTextInput({
    super.key,
    required this.controller,
    required this.label,
    required this.icon,
    this.obscure = false,
    this.semanticHint,
  });
  final TextEditingController controller;
  final String label;
  final IconData icon;
  final bool obscure;
  final String? semanticHint;

  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.only(bottom: 12),
    child: Semantics(
      label: label,
      hint: semanticHint,
      textField: true,
      child: TextField(
        controller: controller,
        obscureText: obscure,
        decoration: InputDecoration(labelText: label, prefixIcon: Icon(icon)),
      ),
    ),
  );
}

class InfoItem {
  const InfoItem(this.value, this.label);
  final String value;
  final String label;
}

class InfoGrid extends StatelessWidget {
  const InfoGrid({super.key, required this.items});
  final List<InfoItem> items;

  @override
  Widget build(BuildContext context) {
    // Fila con cada tarjeta expandida (replica del CSS `repeat(N, 1fr)`).
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          for (var i = 0; i < items.length; i++) ...[
            if (i > 0) const SizedBox(width: 12),
            Expanded(child: _InfoTile(item: items[i])),
          ],
        ],
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  const _InfoTile({required this.item});
  final InfoItem item;

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: AppColors.tile,
        border: Border.all(color: AppColors.border),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            item.value,
            style: const TextStyle(fontSize: 22, fontWeight: FontWeight.w900),
          ),
          const SizedBox(height: 2),
          Text(item.label, style: const TextStyle(color: AppColors.muted)),
        ],
      ),
    );
  }
}

class Metric extends StatelessWidget {
  const Metric({
    super.key,
    required this.label,
    required this.value,
    required this.icon,
  });
  final String label;
  final String value;
  final IconData icon;

  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    color: AppColors.tile,
    child: ListTile(
      leading: Icon(icon, color: AppColors.accentDeep),
      title: Text(label),
      subtitle: Text(
        value,
        style: const TextStyle(fontSize: 26, fontWeight: FontWeight.w900),
      ),
    ),
  );
}

class OptionChoice extends StatelessWidget {
  const OptionChoice({
    super.key,
    required this.selected,
    required this.label,
    required this.onTap,
  });
  final bool selected;
  final String label;
  final VoidCallback onTap;

  @override
  Widget build(BuildContext context) => Semantics(
    button: true,
    selected: selected,
    label: label,
    child: InkWell(
      borderRadius: BorderRadius.circular(8),
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: selected ? AppColors.accentSoft : AppColors.tile,
          border: Border.all(
            color: selected ? AppColors.accent : AppColors.border,
            width: selected ? 2 : 1,
          ),
          borderRadius: BorderRadius.circular(8),
        ),
        child: Row(
          children: [
            Container(
              width: 34,
              height: 34,
              alignment: Alignment.center,
              decoration: BoxDecoration(
                color: selected ? AppColors.accent : AppColors.ink,
                shape: BoxShape.circle,
              ),
              child: Icon(
                selected ? Icons.check : Icons.circle_outlined,
                color: Colors.white,
                size: 18,
              ),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: const TextStyle(fontWeight: FontWeight.w800),
              ),
            ),
          ],
        ),
      ),
    ),
  );
}

class ExamRow extends StatelessWidget {
  const ExamRow({
    super.key,
    required this.title,
    required this.subtitle,
    required this.meta,
    required this.onReview,
  });
  final String title;
  final String subtitle;
  final String meta;
  final VoidCallback onReview;

  @override
  Widget build(BuildContext context) => Container(
    margin: const EdgeInsets.only(bottom: 10),
    padding: const EdgeInsets.all(12),
    decoration: BoxDecoration(
      color: Colors.white,
      borderRadius: BorderRadius.circular(8),
      border: Border.all(color: AppColors.border),
    ),
    child: Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(fontWeight: FontWeight.w900)),
              const SizedBox(height: 3),
              Text(
                '$subtitle\n$meta',
                style: const TextStyle(color: AppColors.muted),
              ),
            ],
          ),
        ),
        const SizedBox(width: 12),
        FilledButton.icon(
          onPressed: onReview,
          icon: const Icon(Icons.fact_check),
          label: const Text('Revisar'),
        ),
      ],
    ),
  );
}

class ReviewCard extends StatelessWidget {
  const ReviewCard({
    super.key,
    required this.name,
    required this.email,
    required this.score,
    required this.status,
    required this.events,
  });
  final String name;
  final String email;
  final String score;
  final String status;
  final List<dynamic> events;

  @override
  Widget build(BuildContext context) => Card(
    elevation: 0,
    color: Colors.white,
    shape: RoundedRectangleBorder(
      borderRadius: BorderRadius.circular(8),
      side: const BorderSide(color: AppColors.border),
    ),
    child: ExpansionTile(
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w900)),
      subtitle: Text(
        '$email - Nota $score - $status - ${events.length} incidentes',
      ),
      children: events.isEmpty
          ? const [ListTile(title: Text('Sin incidentes registrados.'))]
          : events
                .map(
                  (event) => ListTile(
                    leading: const Icon(Icons.warning),
                    title: Text(event['eventType']?.toString() ?? 'Evento'),
                    subtitle: Text(event['details']?.toString() ?? ''),
                  ),
                )
                .toList(),
    ),
  );
}

Color severityColor(String severity) => switch (severity) {
  'grave' => AppColors.danger,
  'media' => AppColors.warning,
  _ => AppColors.accent,
};
