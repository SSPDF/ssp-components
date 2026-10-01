# Design System

## Core Philosophy
- **Clean & Modern**: Less visual noise, rounded corners, soft interactions.
- **Card-based**: Interactive elements should feel like distinct, clickable zones where proper.
- **Premium**: High-quality typography, smooth transitions, consistent spacing.
- **Less Material, More Custom**: Moving away from the standard Material UI "Floating Label" and "Notched Outline" heavy look towards a simpler, structured design.

## Tokens

### Colors
- **Primary**: Inherited from Theme (`theme.palette.primary.main`).
- **Border**: `#E0E0E0` (Default), Primary (Active/Selected/Focus).
- **Background**: `white` (Default), `#F9FAFB` (Hover/Alt), `${primary}10` (Selected).
- **Text**: `text.primary` (Default), `primary.main` (Active). Theme paths like these only work inside `sx`; the `color` prop of `Typography` accepts palette names only since MUI 9 (`color='textPrimary'` / `color='primary'`), and a path there silently falls back to black.
- **Error**: `d32f2f` (Standard Error).

### Shapes
- **Border Radius**: `8px` (Standard for inputs, cards, buttons, containers).

### Typography
- **Font**: Inter (Global).
- **Labels**: Weight 500, Size 0.875rem, placed above the input (not floating inside).

## Components

### Radio (Reference)
- Container: Flex row/column.
- Option: Box with border, formatted as a card.
- Interaction: Color change and border highlight on selection.
- Accessibility: ARIA radiogroup pattern (`role="radiogroup"` named by the title, `role="radio"` + `aria-checked` per option). Keyboard: Tab enters the group at the checked option, arrows move the selection, Space/Enter checks. Focus outline (2px primary, 2px offset) only on `:focus-visible`, so mouse users see no change.

### Labels
- Every field's label is wired to it (`htmlFor` + `useId`; `aria-labelledby` on the pickers' section group), so screen readers and tests find the field by its title. A new field component must do the same.

### Inputs (TextFields, Selects)
- **Structure**: Label separates from the input container.
- **Container**:
    - Height: ~40px (Small/Medium).
    - Border Radius: 8px.
    - Border: 1px solid #E0E0E0.
    - Background: White.
    - Transition: All 0.2s ease.
- **States**:
    - **Hover**: Border color slightly darker (`grey[400]`).
    - **Focus**: Border width 2px, Border color Primary.
    - **Error**: Border width 2px, Border color Error, Background Error (Light), Text with Icon, Border Radius 8px.
    - **Disabled**: Background `grey[100]`, Opacity 0.6.
