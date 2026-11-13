# Questly 2.0 Motion & Micro-Interaction Guidelines

This document specifies the motion design system, animation tokens, easing curves, and accessibility constraints for Questly 2.0.

---

## 1. Motion Design Principles

1. **Spring-Based Tactile Feedback**:
   - Every interactive element (buttons, cards, tiles) provides subtle scale feedback upon user touch (`0.96` scale factor for buttons, `0.985` for cards) with rapid return.
2. **Zero Input Latency**:
   - Animations never block user taps or typing. State updates occur optimistically before the transition finishes.
3. **Restrained Celebrations**:
   - Celebrations (level-ups, achievement unlocks) are purposeful and snappy. Avoid long, blocking particle animations that disrupt workflow.

---

## 2. Animation Tokens & Durations

| Token | Duration | Curve | Usage |
| :--- | :---: | :--- | :--- |
| `motion.press` | `120ms` | `Curves.easeInOut` | Button and card press scale feedback. |
| `motion.toggle` | `180ms` | `Curves.easeOutCubic` | Subtask checkbox fill, switch toggle. |
| `motion.transition`| `240ms` | `Curves.fastOutSlowIn` | Screen transitions, tab switches, sheet openings. |
| `motion.reveal` | `360ms` | `Curves.easeOutBack` | Achievement badge entrance, modal presentation. |
| `motion.celebrate` | `600ms` | Custom Spring | Confetti burst, level-up XP counter count-up. |

---

## 3. Reduced Motion Accessibility

* **OS and User Preference Respect**:
  * Both Flutter and Next.js evaluate system accessibility flags (`prefers-reduced-motion` in CSS, `MediaQuery.of(context).disableAnimations` in Flutter).
  * In `user_preferences.reduced_motion = true`, all scale transforms and slide transitions are replaced with instantaneous opacity swaps (`0ms` to `100ms` fade).
