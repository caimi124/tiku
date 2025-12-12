For Cursor – Yikaobiguo Cache Read Template (Short-term Memory Rules)

1. Project Background

This project is an AI-powered question-bank and knowledge-graph website for Chinese professional exams, with current focus on the 执业药师 (Licensed Pharmacist) exam.

The core product flow we want to build is:

User selects which exam they are preparing for (currently mainly 执业药师).

User takes an AI diagnostic test: a set of questions designed to estimate their mastery of each knowledge point.

AI analyzes the answers and produces a knowledge mastery report, showing:

Which knowledge points are strong / weak

Which chapters / sections are high priority

From the report, user can directly jump to the knowledge graph to learn specific knowledge points.

Each knowledge point page should contain:

“Textbook-style” serious explanation (based on the official textbook structure)

A humorous “老司机带路” section to help with memory (stories, analogies, mnemonics).

After learning, user can:

Practice questions for that specific knowledge point

Do chapter-based practice

Do mock exams / prediction papers (押题卷).

The system should be able to track user progress:

Which knowledge points are learned

Which tests/exams have been done

Correct rates per knowledge point or chapter.

There will also be extra modules in the future:

A simple forum / community

A dashboard comparing different institutes’ prediction papers and their hit rates, to help users choose better study materials.

2. Current Website Direction & Constraints

When editing or extending the code for this project, keep these constraints in mind:

Do NOT change the product direction.
The main value is:

AI diagnostic → knowledge mastery report

Knowledge graph based on textbook → targeted learning

Practice + prediction papers → verify learning

The knowledge graph must reflect the textbook chapter structure:

Chapter → Section → Knowledge Point (考点)

Each knowledge point should be linkable to a detail view.

For each knowledge point, keep the following structure stable (even if some fields are empty for now):

id

chapter / section reference

title

is_high_frequency (or some mark for high-frequency points)

weight / approximate score contribution (if available)

content_textbook (serious)

content_laoshi (humorous “老司机带路” content)

related_questions (ids or list)

If you need to add missing fields, follow the existing naming and structure in the codebase instead of inventing new patterns.

3. AI Diagnostic & Question Logic (Conceptual Rules)

When implementing or modifying logic around AI tests or question selection:

The AI diagnostic test should:

Cover key chapters and representative questions.

Allow us to map each question to one or more knowledge points.

After the test, compute a mastery score per knowledge point (even if it’s a simple heuristic at first).

The knowledge mastery report should:

Group results by chapter / section

Clearly label:

Strong points

Weak points

High-priority points (high frequency or high score weight).

When you need to create backend / API endpoints, prefer:

Simple, clear, REST-style routes

Explicit parameters like exam_type, chapter_id, knowledge_point_id, user_id.

For now, if full AI modeling is not implemented yet:

Create clear stubs or TODO comments.

Use simple deterministic logic as a placeholder (e.g., based on correct/incorrect rate per knowledge point).

Do NOT overcomplicate the implementation unless explicitly requested.

4. Feature Modules and Priorities

When working on this project, prioritize modules in this order:

Knowledge Graph & Detail Pages

Ensure every knowledge point can be clicked and opens a detail view.

Ensure the detail layout has both:

Textbook content

“老司机带路” content (even if temporarily empty).

Question Bank Integration

Questions should be linked to:

Chapter

Section

Knowledge point(s)

Pages for:

Per-knowledge-point practice

Per-chapter practice

Full mock / prediction papers.

User Progress Tracking

Mark which knowledge points are “viewed / studied”.

Track per-knowledge-point correctness over time.

AI Diagnostic Flow

Entry flow from exam selection → diagnostic test → report → targeted learning.

Even if not fully complete, the skeleton should reflect this ideal flow.

Forum & Prediction-paper comparison

Lower priority; should not break or complicate the main learning experience.

5. Coding & Editing Rules (Very Important)

To keep the codebase stable and reduce unnecessary cost:

Minimal, local changes

Fix only what is needed for the current task.

Avoid refactoring or renaming unless the user clearly asks for it.

Preserve existing conventions

Keep file structure, naming, and patterns consistent with what already exists.

When adding new code, follow the established style.

Prefer data fixes over complex logic changes

If a knowledge point doesn’t open a detail page, first check data (IDs, missing entries, routes).

Only modify logic if the data is already correct.

Explain your changes in simple terms

Always list:

Which files you changed

What you changed

Why it fixes the problem.

Use simple, non-technical language because the user is a beginner.

Avoid scanning or rewriting the entire project

Search narrowly using keywords when possible (e.g. chapter titles, section names, knowledge point titles).

Only open and show relevant parts of files.

6. Short-term Memory / Conversation Rules

When using this template in a conversation:

Treat everything in this template as persistent context for this chat.

For each new task, the user will describe it after this template.

Use this project context to:

Interpret the user’s intent

Avoid suggesting features that do not fit the product vision

Choose the simplest implementation that aligns with the goal.

If something is unclear but not critical, make a reasonable assumption and state it, instead of asking too many follow-up questions.

Prioritize accuracy and safety over trying to be clever.

7. This Session’s Task (to be filled by the user)

At the start of each session, the user will add a short description here. Example:

This session’s task:

Fix the issue where Chapter 13 → Section 7 → “妇科外用药” → 考点1 does not open a detail page.

Make sure all knowledge points in this section correctly open detail pages using the same pattern as other chapters.

(For a new session, replace the above with the actual task description.)