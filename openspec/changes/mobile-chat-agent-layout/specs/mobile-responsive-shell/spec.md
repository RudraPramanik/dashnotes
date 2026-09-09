## Purpose

Defines how the authenticated shell and Chat/Agent conversation surfaces behave on narrow viewports so primary tasks stay usable without changing IA or APIs.

## ADDED Requirements

### Requirement: Full-width conversation below desktop
On viewports below the `md` breakpoint, Chat and Agent MUST present the message column and composer at full available width. The thread or session list MUST NOT remain as a persistent side rail that shrinks the conversation column below a usable width.

#### Scenario: Phone-width chat composer
- **WHEN** an authenticated user opens Chat on a viewport narrower than `md`
- **THEN** the composer and message area MUST occupy the main content width
- **AND** the thread list MUST NOT permanently occupy a fixed side column beside the conversation

#### Scenario: Phone-width agent composer
- **WHEN** an authenticated user opens Agent on a viewport narrower than `md`
- **THEN** the composer and message area MUST occupy the main content width
- **AND** the session list MUST NOT permanently occupy a fixed side column beside the conversation

### Requirement: Thread and session list still reachable
Below `md`, users MUST still be able to open the thread list (Chat) or session list (Agent), create a new conversation, and select an existing one. The list MAY appear as a sheet, drawer, or equivalent overlay that closes after selection.

#### Scenario: Switch conversation on mobile
- **WHEN** the user opens the mobile thread or session list and selects an existing item
- **THEN** the client MUST navigate to that conversation
- **AND** the overlay MUST close so the conversation remains full-width

#### Scenario: Start new conversation on mobile
- **WHEN** the user chooses New from the mobile thread or session list
- **THEN** the client MUST enter a new Chat or Agent conversation flow
- **AND** the conversation surface MUST remain full-width after the overlay closes

### Requirement: Context content as mobile sheet slot
When the desktop ContextPanel is hidden (below `lg`), Chat Sources and Agent Tools content MUST remain reachable through a bottom sheet (or equivalent) that is composed by the page as a slot — the shell MUST NOT import feature panels from a central switch, and citation/tool payload data MUST NOT be stored in the shell Zustand store.

#### Scenario: Open sources on mobile chat
- **WHEN** the user is on Chat below `lg` and Sources content is available
- **THEN** the user MUST be able to open a sheet that lists the same Sources content the desktop ContextPanel would show
- **AND** the shell MUST NOT own citation data in chrome state

#### Scenario: Open tools on mobile agent
- **WHEN** the user is on Agent below `lg` and Tools content is available
- **THEN** the user MUST be able to open a sheet that lists the same Tools timeline the desktop ContextPanel would show
- **AND** the shell MUST NOT own tool-trace data in chrome state

### Requirement: Composer clears bottom chrome
On mobile, the sticky Chat/Agent composer MUST remain visible and tappable above the bottom tab bar. Layout MUST account for header height, bottom tab bar height, and safe scrolling of the message list.

#### Scenario: Composer not covered by tabs
- **WHEN** the user focuses or uses the Chat or Agent composer on a phone-width viewport
- **THEN** the send control and text field MUST NOT be covered by the bottom tab bar

### Requirement: Mobile primary nav honesty
Primary destination switching on viewports below `md` MUST work via the bottom tab bar (Notes, Files, Chat, Agent, More). Any header control labeled as opening navigation MUST either open a working nav surface or MUST NOT be shown.

#### Scenario: Dead hamburger forbidden
- **WHEN** the user is below `md` and a header control claims to open navigation
- **THEN** activating it MUST reveal a working navigation surface
- **OR** that control MUST be absent so only the bottom tab bar owns primary nav
