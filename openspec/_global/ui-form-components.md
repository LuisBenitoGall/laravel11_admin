## Regla transversal de formularios (obligatoria)

### Form components policy (obligatoria)
- Todos los formularios del proyecto DEBEN construirse exclusivamente con componentes existentes en resources/js/components.
- Está PROHIBIDO usar directamente elementos HTML de formulario (<input>, <select>, <textarea>, <button>) dentro de páginas o formularios, salvo que sea dentro del componente UI correspondiente.
- Los errores de validación DEBEN mostrarse mediante InputError.jsx (y el patrón estándar del proyecto con Inertia errors).

### Mapa de componentes permitidos (fuente de verdad)
Usar siempre estos componentes en lugar de HTML nativo:
- Checkbox → Checkbox.jsx
- Selector color → ColorPicker.jsx
- Botón principal → PrimaryButton.jsx
- Botón secundario → SecondaryButton.jsx
- Botón peligro/confirmación destructiva → DangerButton.jsx
- Select estándar → SelectInput.jsx
- Select con búsqueda/autocomplete genérico → SelectSearch.jsx
- Autocomplete de usuarios → UserSearch.jsx
- Textarea/WYSIWYG → Textarea.jsx
- Input text/number → TextInput.jsx
- Fecha en formularios → DatePickerToForm.jsx
- Fecha como filtro en DataTables → DatePicker.jsx
- Subida archivo individual → FileInput.jsx
- Subida múltiple/galería → DropzoneGallery.jsx
- Radio → RadioButton.jsx
- Selectores anidados ubicación → LocationSelects.jsx

### Regla de parada (STOP-THE-LINE)
- Si para un formulario se requiere un control que no tiene componente en resources/js/components (por ejemplo: DateTime picker, Time picker, multi-select avanzado, etc.), el desarrollo del formulario DEBE DETENERSE.
- En ese caso, el agente debe:
  - 1. Proponer el nuevo componente necesario (nombre del archivo, props, comportamiento, ejemplo de uso).
  - 2. Implementar el componente en resources/js/components.
  - 3. Integrarlo en el formulario.
- En ningún caso se permite “resolverlo rápido” con HTML nativo provisional.