## Purpose

Defines the DashNotes visual language so Chat and Agent feel like a modern AI conversation product (Claude / ChatGPT / Grok class) while Notes remain a writing surface, using the existing shadcn and Geist stack without new packages.

## ADDED Requirements

### Requirement: Density split
Chat and Agent MUST use conversation density: a centered message column, generous vertical whitespace, assistant markdown with comfortable line-height, and a sticky bottom composer. Notes and Files MUST use writing/library density: the editor or file content is the hero, not a chat transcript. All authenticated surfaces MUST share the same token language (dark-first theme, quiet sidebar, existing sans and mono fonts).

#### Scenario: Chat is not a full-bleed admin table
- **WHEN** the user opens Chat with no messages
- **THEN** the main column MUST present a centered empty prompt and the composer
- **AND** MUST NOT present an empty data table as the primary empty state

### Requirement: Conversation composer
Chat and Agent MUST share composer chrome (rounded, sticky bottom, send control) and MUST differ by placeholder copy and inspector. Chat placeholder MUST teach asking about workspace knowledge. Agent placeholder MUST teach asking the assistant to search or create/update notes. The client MUST NOT present a model-picker dropdown.

#### Scenario: Placeholders distinguish modes
- **WHEN** the user focuses the Chat composer
- **THEN** the placeholder MUST describe asking about notes and files
- **WHEN** the user focuses the Agent composer
- **THEN** the placeholder MUST describe asking the assistant to do work in the workspace

### Requirement: Streaming and in-stream trust chips
While tokens stream, the assistant message MUST show a streaming caret or equivalent in-progress indicator. After chat `metadata`, the UI MUST render citation chips under the answer (title and score; open note when `note_id` is present) in addition to the Sources panel. During agent `tool_start` / `tool_end`, the UI MUST render inline tool-use blocks in the transcript in addition to the Tools panel.

#### Scenario: Citation chip without excerpt
- **WHEN** a citation object has `title` and `relevance_score` but no excerpt field
- **THEN** the chip MUST still render
- **AND** MUST NOT fabricate quoted excerpt text

### Requirement: Token and motion constraints
Visual implementation MUST use existing theme CSS variables, Geist fonts already loaded, and already-installed animation utilities. The client MUST NOT add a new font family, a new UI kit, or Vercel AI SDK to achieve this language. Auth screens MUST use the same quiet, centered, dark-first language (generous type, inline 429 countdown).

#### Scenario: No extra visual dependencies
- **WHEN** Phase 2 shell and later conversation surfaces implement this language
- **THEN** they MUST restyle via existing shadcn tokens and layout
- **AND** MUST NOT introduce a new component library or font package
