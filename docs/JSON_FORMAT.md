# API2App JSON Format Documentation

JSON format used by API2App to define web applications. Designed for LLMs to generate application JSON from user descriptions.

---

## Application Structure

```json
{
    "name": "Application Name",
    "language": "en",
    "shared": true,
    "hidden": false,
    "maintenance": false,
    "advertising": true,
    "adultsOnly": false,
    "gridColumns": 2,
    "tabs": [
        "Tab 1",
        "Tab 2"
    ],
    "blocks": []
}
```

| Field         | Type       | Description                                           |
|---------------|------------|-------------------------------------------------------|
| `name`        | string     | Application name                                      |
| `language`    | string     | Language code: `"en"`, `"ru"`, `"fr"`, `"de"`, `"es"` |
| `shared`      | boolean    | Publicly shared                                       |
| `hidden`      | boolean    | Hidden from listing                                   |
| `maintenance` | boolean    | Maintenance mode                                      |
| `advertising` | boolean    | Advertising enabled                                   |
| `adultsOnly`  | boolean    | Adults only content                                   |
| `gridColumns` | number     | Grid columns: 1, 2, or 3                              |
| `tabs`        | string[]   | Tab names for navigation                              |
| `blocks`      | AppBlock[] | Array of blocks containing elements                   |

---

## Block Structure

```json
{
    "options": {
        "tabIndex": 0,
        "orderIndex": 0,
        "gridColumnSpan": 1,
        "maxHeight": 0,
        "messageSuccess": "Form submitted successfully.",
        "autoClear": false,
        "showLoading": true,
        "isStickyPosition": false
    },
    "elements": [],
    "tabIndex": 0
}
```

| Field                      | Type              | Description                                |
|----------------------------|-------------------|--------------------------------------------|
| `options.tabIndex`         | number            | Tab index (0-based)                        |
| `options.orderIndex`       | number            | Block order within tab                     |
| `options.gridColumnSpan`   | number            | Column span (1-3)                          |
| `options.maxHeight`        | number            | Max container height in px (0 = unlimited) |
| `options.messageSuccess`   | string            | Success message after form submission      |
| `options.autoClear`        | boolean           | Clear inputs after submission              |
| `options.showLoading`      | boolean           | Show loading indicator                     |
| `options.isStickyPosition` | boolean           | Sticky position on scroll                  |
| `elements`                 | AppBlockElement[] | Array of elements                          |
| `tabIndex`                 | number            | Tab index (matches `options.tabIndex`)     |

---

## Base Element Properties

All elements share these common fields:

| Field             | Type    | Description                                                                               |
|-------------------|---------|-------------------------------------------------------------------------------------------|
| `type`            | string  | **Required.** Element type identifier                                                     |
| `name`            | string  | Unique element name within the app                                                        |
| `blockIndex`      | number  | Index of the parent block                                                                 |
| `orderIndex`      | number  | Display order within the block                                                            |
| `value`           | any     | Element value (type depends on element)                                                   |
| `hiddenByDefault` | boolean | Hidden until value is retrieved                                                           |
| `hiddenByField`   | string  | Conditional visibility expression (see [Conditional Visibility](#conditional-visibility)) |
| `options`         | object  | API binding options (see [API Integration](#api-integration))                             |

If the field is hidden (hiddenByDefault=true), it becomes visible when the value is received.

---

## Element Types

Available types: `text-header`, `text`, `button`, `input-text`, `input-textarea`, `input-number`, `input-slider`, `input-hidden`, `input-switch`, `input-select`, `input-radio`, `input-tags`, `input-date`, `input-color`, `input-file`, `image`, `video`, `audio`, `image-comparison`, `input-chart-line`, `input-pagination`, `status`, `progress`, `table`, `input-select-image`, `user-subscription`, `crop-image`, `iframe`.

## List output

Elements that support list output (by `valueArr` field): `text`, `image`, `video`, `table` (the table only supports the `valueArr` field).

### Display Elements

#### `text-header`

Section header text.

| Field         | Type    | Description                                    |
|---------------|---------|------------------------------------------------|
| `icon`        | string  | Bootstrap icon class (e.g. `"bi-info-circle"`) |
| `alignCenter` | boolean | Center alignment                               |

#### `text`

Text display element with rich formatting options.

| Field             | Type     | Description                                                             |
|-------------------|----------|-------------------------------------------------------------------------|
| `label`           | string   | Label above text                                                        |
| `icon`            | string   | Bootstrap icon class                                                    |
| `color`           | string   | `"Black"`, `"Gray"`, `"Green"`, `"Blue"`, `"Cyan"`, `"Violet"`, `"Red"` |
| `fontSize`        | string   | `"Small"`, `"Medium"`, `"Large"`                                        |
| `prefixText`      | string   | Text before value                                                       |
| `suffixText`      | string   | Text after value                                                        |
| `maxHeight`       | number   | Max container height in px (0 = unlimited)                              |
| `keys`            | string[] | Value keys for extracting nested data                                   |
| `valueArr`        | object[] | An array of objects with entries to be displayed in list mode           |
| `itemFieldName`   | string   | Field name in data array                                                |
| `markdown`        | boolean  | Render value as Markdown                                                |
| `whiteSpacePre`   | boolean  | Preserve line breaks                                                    |
| `alignCenter`     | boolean  | Center alignment                                                        |
| `showHeader`      | boolean  | Show title                                                              |
| `border`          | boolean  | Show border                                                             |
| `borderShadow`    | boolean  | Show shadow                                                             |
| `fullWidth`       | boolean  | Full container width                                                    |
| `showOnlyInVK`    | boolean  | Show only in VK mini app                                                |
| `hiddenByDefault` | boolean  | Hidden until API response                                               |

### Input Elements

#### `input-text`

Single-line text input.

| Field                      | Type    | Description               |
|----------------------------|---------|---------------------------|
| `label`                    | string  | Field label               |
| `placeholder`              | string  | Placeholder text          |
| `icon`                     | string  | Bootstrap icon class      |
| `prefixText`               | string  | Prefix text               |
| `suffixText`               | string  | Suffix text               |
| `readOnly`                 | boolean | Read only mode            |
| `required`                 | boolean | Required field            |
| `hiddenByDefault`          | boolean | Hidden until API response |
| `speechRecognitionEnabled` | boolean | Voice typing              |
| `speechSynthesisEnabled`   | boolean | Text-to-speech            |
| `copyToClipboardEnabled`   | boolean | Copy button               |
| `storeValue`               | boolean | Persist in localStorage   |

#### `input-textarea`

Multi-line text input.

Same fields as `input-text`, plus:

| Field        | Type    | Description                          |
|--------------|---------|--------------------------------------|
| `max`        | number  | Maximum text length (0 = unlimited)  |
| `rows`       | number  | Number of visible lines (default: 6) |
| `autoHeight` | boolean | Auto-adjust height                   |

#### `input-number`

Numeric input.

| Field   | Type   | Description   |
|---------|--------|---------------|
| `label` | string | Field label   |
| `min`   | number | Minimum value |
| `max`   | number | Maximum value |

#### `input-slider`

Range slider.

| Field   | Type   | Description    |
|---------|--------|----------------|
| `label` | string | Field label    |
| `min`   | number | Minimum value  |
| `max`   | number | Maximum value  |
| `step`  | number | Step increment |

#### `input-hidden`

Hidden field for passing data between APIs.

| Field        | Type    | Description                           |
|--------------|---------|---------------------------------------|
| `label`      | string  | Label (for editor only)               |
| `prefixText` | string  | Prefix for value                      |
| `suffixText` | string  | Suffix for value                      |
| `valueFrom`  | string  | Copy value from another field by name |
| `storeValue` | boolean | Persist in localStorage               |
| `required`   | boolean | Required field                        |

#### `input-switch`

Toggle switch.

| Field     | Type    | Description           |
|-----------|---------|-----------------------|
| `label`   | string  | Field label           |
| `enabled` | boolean | Default enabled state |

#### `input-select`

Dropdown select.

| Field                   | Type     | Description                                             |
|-------------------------|----------|---------------------------------------------------------|
| `label`                 | string   | Field label                                             |
| `placeholder`           | string   | Placeholder text                                        |
| `choices`               | string[] | Simple string options                                   |
| `valueArr`              | object[] | Key-value options `[{"name": "Label", "value": "val"}]` |
| `itemFieldNameForTitle` | string   | Title field in `valueArr` objects                       |
| `itemFieldNameForValue` | string   | Value field in `valueArr` objects                       |
| `loadValueInto`         | string   | Load selected value into another field                  |
| `clearable`             | boolean  | Allow clearing selection                                |
| `searchable`            | boolean  | Enable search                                           |
| `addTag`                | boolean  | Allow adding custom values                              |
| `selectDefaultFirst`    | boolean  | Auto-select first option                                |
| `required`              | boolean  | Required field                                          |
| `hiddenByDefault`       | boolean  | Hidden until API response                               |

#### `input-radio`

Radio button group.

| Field        | Type     | Description             |
|--------------|----------|-------------------------|
| `label`      | string   | Field label             |
| `choices`    | string[] | Options list            |
| `required`   | boolean  | Required field          |
| `storeValue` | boolean  | Persist in localStorage |

#### `input-tags`

Tag/chip input for multiple values.

| Field         | Type    | Description      |
|---------------|---------|------------------|
| `label`       | string  | Field label      |
| `placeholder` | string  | Placeholder text |
| `required`    | boolean | Required field   |

#### `input-date`

Date/time picker.

| Field        | Type    | Description                             |
|--------------|---------|-----------------------------------------|
| `label`      | string  | Field label                             |
| `format`     | string  | Date format (e.g. `"YYYY-MM-DD HH:mm"`) |
| `offset`     | number  | Default days offset from today          |
| `useDefault` | boolean | Use current date as default             |
| `required`   | boolean | Required field                          |

#### `input-color`

Color picker.

| Field   | Type   | Description |
|---------|--------|-------------|
| `label` | string | Field label |

#### `input-file`

File upload.

| Field           | Type    | Description                            |
|-----------------|---------|----------------------------------------|
| `label`         | string  | Field label                            |
| `placeholder`   | string  | Button text                            |
| `accept`        | string  | Accepted file types (e.g. `"image/*"`) |
| `multiple`      | boolean | Allow multiple files                   |
| `loadValueInto` | string  | Load file preview into another field   |
| `required`      | boolean | Required field                         |

### Media Elements

#### `image`

Image display.

| Field                      | Type     | Description                                                   |
|----------------------------|----------|---------------------------------------------------------------|
| `label`                    | string   | Optional label                                                |
| `itemFieldName`            | string   | Field name for array of images                                |
| `valueArr`                 | object[] | An array of objects with entries to be displayed in list mode |
| `itemThumbnailFieldName`   | string   | Thumbnail field name                                          |
| `prefixText`               | string   | URL prefix                                                    |
| `cropperAspectRatioString` | string   | Crop ratio: `"1:1"`, `"4:3"`, `"16:9"`, etc.                  |
| `useLink`                  | boolean  | Image is URL (not base64)                                     |
| `useCropper`               | boolean  | Enable crop tool                                              |
| `useLightbox`              | boolean  | Click to zoom                                                 |
| `fullWidth`                | boolean  | Full container width                                          |
| `roundedCorners`           | boolean  | Rounded corners                                               |
| `borderShadow`             | boolean  | Shadow effect                                                 |
| `required`                 | boolean  | Required field                                                |

#### `video`

Video player.

Same as `image` except: no `cropperAspectRatioString`/`useCropper`, plus:

| Field       | Type   | Description          |
|-------------|--------|----------------------|
| `posterUrl` | string | Poster/thumbnail URL |

#### `audio`

Audio player.

| Field        | Type    | Description    |
|--------------|---------|----------------|
| `label`      | string  | Optional label |
| `prefixText` | string  | URL prefix     |
| `required`   | boolean | Required field |

#### `image-comparison`

Before/after image comparison slider.

| Field         | Type   | Description      |
|---------------|--------|------------------|
| `label`       | string | Label            |
| `valueFirst`  | string | First image URL  |
| `valueSecond` | string | Second image URL |

### Interactive Elements

#### `button`

Action button that triggers API calls.

| Field              | Type    | Description                                                  |
|--------------------|---------|--------------------------------------------------------------|
| `text`             | string  | Button label                                                 |
| `icon`             | string  | Bootstrap icon class                                         |
| `color`            | string  | `"Green"`, `"Blue"`, `"Cyan"`, `"Violet"`, `"Red"`, `"Gray"` |
| `prefixText`       | string  | Prefix for resulting value                                   |
| `suffixText`       | string  | Suffix for resulting value                                   |
| `valueFrom`        | string  | Take value from another field                                |
| `hiddenByDefault`  | boolean | Hidden until value is retrieved                              |
| `isClearForm`      | boolean | Reset form on click                                          |
| `isDownloadMode`   | boolean | Download file on click                                       |
| `isStickyPosition` | boolean | Sticky on scroll                                             |

The button can receive a value, but it doesn't display that value. It only uses it for download mode (if it's a URL) or opening the link in a new browser tab. If the button is hidden, it becomes visible when it receives a value.

#### `input-select-image`

Visual image picker (gallery).

| Field       | Type     | Description                                              |
|-------------|----------|----------------------------------------------------------|
| `label`     | string   | Field label                                              |
| `data`      | object[] | Options `[{"name": "Style", "imageUrl": "https://..."}]` |
| `maxHeight` | number   | Max container height in px                               |
| `showTitle` | boolean  | Show image titles                                        |
| `required`  | boolean  | Required field                                           |

### Data Display Elements

#### `table`

Data table.

| Field             | Type     | Description                            |
|-------------------|----------|----------------------------------------|
| `label`           | string   | Table title                            |
| `headers`         | string[] | Column headers                         |
| `keys`            | string[] | Object keys for each column            |
| `valueArr`        | object[] | An array of objects with table entries |
| `isHTML`          | boolean  | Render values as HTML                  |
| `hiddenByDefault` | boolean  | Hidden until API response              |

#### `input-chart-line`

Line chart.

| Field            | Type    | Description              |
|------------------|---------|--------------------------|
| `label`          | string  | Chart title              |
| `itemTitle`      | string  | Series name              |
| `fieldNameAxisX` | string  | X axis field             |
| `fieldNameAxisY` | string  | Y axis field             |
| `itemFieldName`  | string  | Field name in data array |
| `isXAxisDate`    | boolean | X axis values are dates  |
| `format`         | string  | Date format for X axis   |

#### `input-pagination`

Pagination control.

| Field         | Type    | Description                          |
|---------------|---------|--------------------------------------|
| `perPage`     | number  | Items per page                       |
| `maxSize`     | number  | Max visible page buttons             |
| `autoHide`    | boolean | Hide when single page                |
| `useAsOffset` | boolean | Return offset instead of page number |

### Status Elements

#### `status`

Status indicator with text messages.

| Field                      | Type    | Description               |
|----------------------------|---------|---------------------------|
| `statusPending`            | string  | Pending status value      |
| `statusProcessing`         | string  | Processing status value   |
| `statusCompleted`          | string  | Completed status value    |
| `statusError`              | string  | Error status value        |
| `statusCompletedText`      | string  | Completed display text    |
| `statusCompletedTextForVK` | string  | Completed text for VK app |
| `statusProcessingText`     | string  | Processing display text   |
| `statusErrorText`          | string  | Error display text        |
| `isBooleanValue`           | boolean | Status is true/false      |
| `hiddenByDefault`          | boolean | Hidden until API response |

#### `progress`

Progress bar with queue tracking.

| Field                      | Type    | Description              |
|----------------------------|---------|--------------------------|
| `statusPending`            | string  | Pending status value     |
| `statusProcessing`         | string  | Processing status value  |
| `statusCompleted`          | string  | Completed status value   |
| `statusError`              | string  | Error status value       |
| `statusFieldName`          | string  | Status field in response |
| `queueNumberFieldName`     | string  | Queue position field     |
| `taskIdFieldName`          | string  | Task ID field            |
| `operationDurationSeconds` | number  | Estimated duration       |
| `isBooleanValue`           | boolean | Status is true/false     |

### Special Elements

#### `iframe`

Embedded web content.

| Field                 | Type    | Description                       |
|-----------------------|---------|-----------------------------------|
| `label`               | string  | Frame label                       |
| `height`              | number  | Frame height in px                |
| `valueFrom`           | string  | Take URL from another field       |
| `htmlContent`         | string  | HTML content (alternative to URL) |
| `useResizer`          | boolean | Allow resizing                    |
| `useRefreshButton`    | boolean | Show refresh button               |
| `useFullscreenButton` | boolean | Show fullscreen button            |
| `border`              | boolean | Show border                       |
| `hiddenByDefault`     | boolean | Hidden until API response         |

This element supports inserting content (htmlContent) from another element. In this case, content from the element named "content_code" will be inserted:

```html
<!doctype html>
<html lang="en">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Demo</title>
    <style>
        body {
            padding: 20px;
            font-family: sans-serif;
        }

        h1 {
            margin: 0;
            padding: 0;
        }
    </style>
</head>
<body>
<h1>Hello, world!</h1>
{content_code}
</body>
</html>
```

#### `user-subscription`

Subscription widget (VK apps).

| Field            | Type    | Description              |
|------------------|---------|--------------------------|
| `label`          | string  | Label text               |
| `subscriptionId` | string  | Subscription ID          |
| `icon`           | string  | Bootstrap icon class     |
| `showOnlyInVK`   | boolean | Show only in VK mini app |

---

## API Integration

Elements connect to API endpoints via the `options` object.

### Input Binding (sending data)

```json
{
    "options": {
        "inputApiUuid": "api-endpoint-uuid",
        "inputApiFieldName": "data.question",
        "inputApiFieldType": "input"
    }
}
```

- `inputApiUuid` — UUID of the API endpoint
- `inputApiFieldName` — Path in request body (dot notation: `data.question`)
- `inputApiFieldType` — `input` for body fields, `url` for URL parameters, `params` for query parameters, `headers` for headers

If you need to use `inputApiFieldType`="url", the `inputApiFieldName` specifies the position of the parameter (number from 0) between the separators `/`.

### Output Binding (receiving data)

```json
{
    "options": {
        "outputApiUuid": "api-endpoint-uuid",
        "outputApiFieldName": "result_data.answer",
        "outputApiFieldType": "output"
    }
}
```

- `outputApiUuid` — UUID of the API endpoint
- `outputApiFieldName` — Path in response (dot notation)
- `outputApiFieldType` — Always `"output"`

### Button Submit Binding

```json
{
    "name": "submit",
    "type": "button",
    "text": "Send",
    "options": {
        "inputApiUuid": "api-endpoint-uuid",
        "inputApiFieldName": "submit",
        "inputApiFieldType": "input"
    }
}
```

### Passing Values Between APIs

Hidden fields can bridge output from one API to input of another:

```json
{
    "name": "taskId",
    "type": "input-hidden",
    "storeValue": true,
    "required": true,
    "options": {
        "outputApiUuid": "first-api-uuid",
        "outputApiFieldName": "uuid",
        "outputApiFieldType": "output",
        "inputApiUuid": "second-api-uuid",
        "inputApiFieldName": 1,
        "inputApiFieldType": "url"
    }
}
```

---

## Conditional Visibility

Elements can be shown/hidden based on other field values using `hiddenByField`.

The element is **shown** when the condition matches, **hidden** otherwise.

| Syntax             | Description                                   |
|--------------------|-----------------------------------------------|
| `fieldName`        | Shown when switch `fieldName` is on           |
| `fieldName==value` | Shown when `fieldName` equals `value`         |
| `fieldName!=value` | Shown when `fieldName` does not equal `value` |

---

## Complete Example

A text generation app with input, API call, and result display:

```json
{
    "name": "Text Generator",
    "language": "en",
    "shared": true,
    "hidden": false,
    "maintenance": false,
    "advertising": true,
    "adultsOnly": false,
    "gridColumns": 2,
    "tabs": [
        "Generate"
    ],
    "blocks": [
        {
            "options": {
                "orderIndex": 0,
                "gridColumnSpan": 1,
                "autoClear": false,
                "showLoading": true,
                "messageSuccess": "Request sent successfully."
            },
            "elements": [
                {
                    "name": "header",
                    "type": "text-header",
                    "value": "Text Generator",
                    "icon": "bi-magic",
                    "blockIndex": 0,
                    "orderIndex": 0
                },
                {
                    "name": "topic",
                    "type": "input-text",
                    "label": "Topic",
                    "placeholder": "Enter your topic",
                    "required": true,
                    "blockIndex": 0,
                    "orderIndex": 1,
                    "options": {
                        "inputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
                        "inputApiFieldName": "data.topic",
                        "inputApiFieldType": "input"
                    }
                },
                {
                    "name": "style",
                    "type": "input-select",
                    "label": "Style",
                    "placeholder": "Select style",
                    "choices": [
                        "Formal",
                        "Casual",
                        "Creative"
                    ],
                    "selectDefaultFirst": true,
                    "required": true,
                    "blockIndex": 0,
                    "orderIndex": 2,
                    "options": {
                        "inputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
                        "inputApiFieldName": "data.style",
                        "inputApiFieldType": "input"
                    }
                },
                {
                    "name": "length",
                    "type": "input-slider",
                    "label": "Max Words",
                    "min": 50,
                    "max": 500,
                    "step": 50,
                    "value": 200,
                    "blockIndex": 0,
                    "orderIndex": 3,
                    "options": {
                        "inputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
                        "inputApiFieldName": "data.max_words",
                        "inputApiFieldType": "input"
                    }
                },
                {
                    "name": "submit",
                    "type": "button",
                    "text": "Generate",
                    "icon": "bi-stars",
                    "color": "Blue",
                    "isStickyPosition": true,
                    "blockIndex": 0,
                    "orderIndex": 4,
                    "options": {
                        "inputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    }
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "orderIndex": 1,
                "gridColumnSpan": 1,
                "showLoading": true,
                "messageSuccess": ""
            },
            "elements": [
                {
                    "name": "result",
                    "type": "text",
                    "label": "Result",
                    "color": "Black",
                    "fontSize": "Medium",
                    "markdown": true,
                    "border": true,
                    "borderShadow": true,
                    "fullWidth": true,
                    "whiteSpacePre": true,
                    "blockIndex": 1,
                    "orderIndex": 0,
                    "options": {
                        "outputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
                        "outputApiFieldName": "result_data.text",
                        "outputApiFieldType": "output"
                    }
                },
                {
                    "name": "info",
                    "type": "text",
                    "value": "Enter a topic and click **Generate** to create text.",
                    "color": "Gray",
                    "fontSize": "Small",
                    "markdown": true,
                    "border": true,
                    "borderShadow": true,
                    "fullWidth": true,
                    "blockIndex": 1,
                    "orderIndex": 1
                }
            ],
            "tabIndex": 0
        }
    ]
}
```

---

## Best Practices

1. **Unique names** — each element must have a unique `name` within the app
2. **Block/order index** — use `blockIndex` and `orderIndex` to control layout
3. **API UUIDs** — must match configured API endpoints
4. **Conditional logic** — use `hiddenByField` for dynamic elements
5. **Output elements** — set `hiddenByDefault: true` for elements showing API results
6. **Required fields** — mark important inputs with `required: true`
7. **Store values** — use `storeValue: true` for values persisting across sessions
8. **Grid layout** — use `gridColumnSpan` to control block widths
9. **Sticky buttons** — use `isStickyPosition: true` for primary action buttons
10. **Bootstrap Icons** — reference: https://icons.getbootstrap.com/
