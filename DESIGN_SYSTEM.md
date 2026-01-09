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
- **Text**: `text.primary` (Default), `primary.main` (Active).
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
