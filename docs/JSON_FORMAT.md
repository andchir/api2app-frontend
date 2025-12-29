# API2App JSON Format Documentation

This document provides comprehensive documentation for the JSON format used by API2App to create web applications from JSON definitions. This documentation is designed to be used by LLMs to automatically generate application JSON based on user descriptions.

## Table of Contents

1. [Application Structure](#application-structure)
2. [Application Properties](#application-properties)
3. [Blocks Structure](#blocks-structure)
4. [Block Options](#block-options)
5. [Elements](#elements)
6. [Element Types](#element-types)
7. [API Integration](#api-integration)
8. [Conditional Visibility](#conditional-visibility)
9. [Complete Example](#complete-example)

---

## Application Structure

An application is defined as a JSON object with the following top-level structure:

```json
{
    "id": 123,                          // Unique application ID (number)
    "name": "Application Name",          // Application name (string)
    "uuid": "unique-uuid-string",         // Unique UUID for the application (string)
    "language": "en",                     // Language code: "en", "ru", "fr", "de", "es" (string)
    "shared": true,                       // Whether the app is publicly shared (boolean)
    "hidden": false,                      // Whether the app is hidden (boolean)
    "maintenance": false,                 // Whether the app is in maintenance mode (boolean)
    "advertising": true,                  // Whether advertising is enabled (boolean)
    "adultsOnly": false,                  // Whether the app is for adults only (boolean)
    "gridColumns": 2,                     // Number of grid columns for layout: 1, 2, or 3 (number)
    "image": "https://...",               // Application icon/image URL (string)
    "tabs": ["Tab 1", "Tab 2"],           // Tab names for navigation (string[])
    "blocks": [],                         // Array of blocks containing elements (AppBlock[])
    "paymentEnabled": false,              // Whether payment is enabled (boolean)
    "pricePerUse": null                   // Price per use if payment is enabled (number|null)
}
```

---

## Application Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| `id` | number | Yes | Unique identifier for the application |
| `name` | string | Yes | Display name of the application |
| `uuid` | string | Yes | Unique UUID for the application |
| `language` | string | Yes | Language code: `en`, `ru`, `fr`, `de`, `es` |
| `shared` | boolean | Yes | Whether the application is publicly accessible |
| `hidden` | boolean | Yes | Whether the application is hidden from listings |
| `gridColumns` | number | Yes | Number of columns in the layout grid (1-3) |
| `blocks` | AppBlock[] | Yes | Array of blocks that make up the application |
| `image` | string | No | URL to the application's icon or image |
| `tabs` | string[] | No | Array of tab names for navigation |
| `maintenance` | boolean | No | Whether the app is in maintenance mode |
| `advertising` | boolean | No | Whether ads are displayed |
| `adultsOnly` | boolean | No | Whether the app is for adults only |
| `paymentEnabled` | boolean | No | Whether payment is required |
| `pricePerUse` | number | No | Cost per use when payment is enabled |

### VK Integration Properties

| Property | Type | Description |
|----------|------|-------------|
| `vkAppId` | string | VK application ID |
| `vkSecretKey` | string | VK secret key |
| `vkToken` | string | VK access token |

### Telegram Integration Properties

| Property | Type | Description |
|----------|------|-------------|
| `tgBotToken` | string | Telegram bot token |
| `tgForwardToUserId` | number | User ID to forward messages to |
| `tgKeyWord` | string | Keyword trigger for the bot |

---

## Blocks Structure

Blocks are containers for elements. Each block represents a section of the application UI.

```json
{
    "elements": [],                       // Array of elements in this block (AppBlockElement[])
    "tabIndex": 0,                        // Which tab this block belongs to (number)
    "options": {                          // Block options (AppBlockOptions)
        "enabled": true,                  // Whether the block is enabled (boolean)
        "orderIndex": 0,                  // Order of the block (number)
        "gridColumnSpan": 1,              // How many grid columns this block spans (number, 1-3)
        "autoClear": false,               // Clear form after submission (boolean)
        "showLoading": true,              // Show loading indicator during API requests (boolean)
        "messageSuccess": "Success!",     // Message to show after successful submission (string)
        "isStickyPosition": false         // Whether the block has sticky positioning (boolean)
    }
}
```

### Block Options

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `enabled` | boolean | true | Whether the block is active |
| `orderIndex` | number | 0 | Display order of the block |
| `gridColumnSpan` | number | 1 | Number of grid columns the block spans (1-3) |
| `tabIndex` | number | 0 | Index of the tab this block belongs to |
| `autoClear` | boolean | false | Clear form fields after successful submission |
| `showLoading` | boolean | true | Show loading spinner during API calls |
| `messageSuccess` | string | "" | Success message displayed after form submission |
| `isStickyPosition` | boolean | false | Keep the block visible when scrolling |

---

## Elements

Elements are the building blocks of the UI. Each element has a type and various properties.

### Common Element Properties

All elements share these base properties:

```json
{
    "name": "fieldName",                  // Unique identifier for the element (string)
    "type": "input-text",                 // Element type (AppBlockElementType)
    "label": "Field Label",               // Display label (string)
    "value": "",                          // Current value (string|number|boolean|array)
    "blockIndex": 0,                      // Index of the parent block (number)
    "orderIndex": 0,                      // Display order within the block (number)
    "hidden": false,                      // Whether the element is hidden (boolean)
    "enabled": true,                      // Whether the element is enabled for input (boolean)
    "hiddenByField": "",                  // Conditional hide based on another field (string)
    "hiddenByDefault": false,             // Whether hidden until API response (boolean)
    "options": {}                         // API binding options (AppBlockElementOptions)
}
```

### API Binding Options

Elements can be bound to API inputs or outputs:

```json
{
    "options": {
        "inputApiUuid": "api-uuid",       // UUID of the API for input (string)
        "inputApiFieldName": "fieldName", // Field name in API request (string)
        "inputApiFieldType": "input",     // Type: "input" or "url" (string)
        "outputApiUuid": "api-uuid",      // UUID of the API for output (string)
        "outputApiFieldName": "response.field", // Path to field in API response (string)
        "outputApiFieldType": "output"    // Type: "output" (string)
    }
}
```

---

## Element Types

### Text Display Elements

#### `text-header`
Large header text.

```json
{
    "name": "header",
    "type": "text-header",
    "value": "Welcome to My App",         // Header text content (string)
    "icon": "bi-info-circle",             // Bootstrap icon class (string)
    "alignCenter": false,                 // Center align text (boolean)
    "hiddenByField": ""                   // Hide based on field value (string)
}
```

#### `text`
Regular text display with styling options.

```json
{
    "name": "description",
    "type": "text",
    "label": "",                          // Optional label above text (string)
    "value": "This is descriptive text",  // Text content (string)
    "icon": "bi-info-circle",             // Bootstrap icon class (string)
    "color": "Black",                     // Color: "Black", "Gray", "Green", "Blue", "Cyan", "Violet", "Red" (string)
    "fontSize": "Medium",                 // Size: "Small", "Medium", "Large" (string)
    "prefixText": "",                     // Text before the value (string)
    "suffixText": "",                     // Text after the value (string)
    "keys": [],                           // Value keys for object extraction (string[])
    "itemFieldName": "",                  // Field name for array items (string)
    "maxHeight": 0,                       // Max container height in px, 0 = unlimited (number)
    "markdown": false,                    // Render as markdown (boolean)
    "alignCenter": false,                 // Center align text (boolean)
    "whiteSpacePre": false,               // Preserve whitespace/line breaks (boolean)
    "showHeader": false,                  // Show label as header (boolean)
    "border": false,                      // Show border around text (boolean)
    "borderShadow": false,                // Add shadow to border (boolean)
    "fullWidth": true,                    // Use full width (boolean)
    "showOnlyInVK": false                 // Only show in VK mini app (boolean)
}
```

### Input Elements

#### `input-text`
Single-line text input.

```json
{
    "name": "username",
    "type": "input-text",
    "label": "Username",                  // Field label (string)
    "placeholder": "Enter username",      // Placeholder text (string)
    "value": "",                          // Default value (string)
    "icon": "",                           // Bootstrap icon class (string)
    "prefixText": "",                     // Text prefix (string)
    "suffixText": "",                     // Text suffix (string)
    "readOnly": false,                    // Read-only mode (boolean)
    "required": true,                     // Field is required (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false,             // Hidden until API response (boolean)
    "speechRecognitionEnabled": false,    // Enable voice input (boolean)
    "speechSynthesisEnabled": false,      // Enable text-to-speech (boolean)
    "copyToClipboardEnabled": false,      // Show copy button (boolean)
    "storeValue": false                   // Persist value in localStorage (boolean)
}
```

#### `input-textarea`
Multi-line text input.

```json
{
    "name": "message",
    "type": "input-textarea",
    "label": "Message",                   // Field label (string)
    "placeholder": "Enter your message",  // Placeholder text (string)
    "value": "",                          // Default value (string)
    "rows": 6,                            // Number of visible rows (number)
    "max": 0,                             // Maximum character length, 0 = unlimited (number)
    "prefixText": "",                     // Text prefix (string)
    "suffixText": "",                     // Text suffix (string)
    "readOnly": false,                    // Read-only mode (boolean)
    "required": true,                     // Field is required (boolean)
    "autoHeight": true,                   // Auto-expand height (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false,             // Hidden until API response (boolean)
    "speechRecognitionEnabled": false,    // Enable voice input (boolean)
    "speechSynthesisEnabled": false,      // Enable text-to-speech (boolean)
    "copyToClipboardEnabled": false,      // Show copy button (boolean)
    "storeValue": false                   // Persist value in localStorage (boolean)
}
```

#### `input-number`
Numeric input field.

```json
{
    "name": "quantity",
    "type": "input-number",
    "label": "Quantity",                  // Field label (string)
    "value": 1,                           // Default value (number)
    "min": 0,                             // Minimum value (number)
    "max": 100,                           // Maximum value (number)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-slider`
Range slider input.

```json
{
    "name": "volume",
    "type": "input-slider",
    "label": "Volume",                    // Field label (string)
    "value": 50,                          // Default value (number)
    "min": 0,                             // Minimum value (number)
    "max": 100,                           // Maximum value (number)
    "step": 1,                            // Step increment (number)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-hidden`
Hidden input for passing data.

```json
{
    "name": "taskId",
    "type": "input-hidden",
    "label": "Task ID",                   // Internal label (string)
    "value": "",                          // Value (string)
    "prefixText": "",                     // Prefix added to value (string)
    "suffixText": "",                     // Suffix added to value (string)
    "valueFrom": "",                      // Copy value from another field (string)
    "required": true,                     // Field is required (boolean)
    "storeValue": true                    // Persist value in localStorage (boolean)
}
```

#### `input-switch`
Toggle switch (boolean).

```json
{
    "name": "notifications",
    "type": "input-switch",
    "label": "Enable Notifications",      // Field label (string)
    "value": "1",                         // Value when enabled (string)
    "enabled": true                       // Default state (boolean)
}
```

#### `input-select`
Dropdown select input.

```json
{
    "name": "category",
    "type": "input-select",
    "label": "Category",                  // Field label (string)
    "placeholder": "Select category",     // Placeholder text (string)
    "value": "",                          // Default selected value (string)
    "choices": ["Option 1", "Option 2"],  // Simple string options (string[])
    "valueArr": [                         // Or object options:
        {"name": "Display Name", "value": "actualValue"}
    ],
    "itemFieldNameForTitle": "name",      // Field name for display text (string)
    "itemFieldNameForValue": "value",     // Field name for value (string)
    "loadValueInto": "",                  // Field name to load selected value into (string)
    "clearable": true,                    // Allow clearing selection (boolean)
    "searchable": true,                   // Enable search/filter (boolean)
    "addTag": false,                      // Allow adding custom values (boolean)
    "selectDefaultFirst": false,          // Auto-select first option (boolean)
    "required": true,                     // Field is required (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `input-tags`
Tag/multi-value input.

```json
{
    "name": "tags",
    "type": "input-tags",
    "label": "Tags",                      // Field label (string)
    "placeholder": "Add tags",            // Placeholder text (string)
    "value": ["tag1", "tag2"],            // Default tags (string[])
    "choices": [],                        // Suggested choices (string[])
    "required": true,                     // Field is required (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-radio`
Radio button group.

```json
{
    "name": "gender",
    "type": "input-radio",
    "label": "Gender",                    // Field label (string)
    "value": "male",                      // Default selected value (string)
    "choices": ["male", "female", "other"], // Available options (string[])
    "required": true,                     // Field is required (boolean)
    "storeValue": false                   // Persist value in localStorage (boolean)
}
```

#### `input-date`
Date/time picker.

```json
{
    "name": "appointmentDate",
    "type": "input-date",
    "label": "Appointment Date",          // Field label (string)
    "value": "",                          // Default date (string)
    "format": "YYYY-MM-DD HH:mm",         // Date format string (string)
    "offset": 0,                          // Default days offset from today (number)
    "useDefault": false,                  // Use current date as default (boolean)
    "required": true,                     // Field is required (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-color`
Color picker.

```json
{
    "name": "themeColor",
    "type": "input-color",
    "label": "Theme Color",               // Field label (string)
    "value": "#000000",                   // Default color (string)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-file`
File upload input.

```json
{
    "name": "document",
    "type": "input-file",
    "label": "Upload Document",           // Field label (string)
    "placeholder": "Choose file",         // Button/placeholder text (string)
    "value": [],                          // Uploaded files (File[])
    "accept": "image/*",                  // Accepted file types (string)
    "multiple": false,                    // Allow multiple files (boolean)
    "loadValueInto": "preview",           // Field to load file preview into (string)
    "required": true,                     // Field is required (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

### Media Elements

#### `image`
Image display element.

```json
{
    "name": "photo",
    "type": "image",
    "label": "Photo",                     // Optional label (string)
    "value": "https://example.com/image.jpg", // Image URL (string)
    "itemFieldName": "",                  // Field name for array of images (string)
    "itemThumbnailFieldName": "",         // Field for thumbnail URL (string)
    "prefixText": "",                     // URL prefix (string)
    "cropperAspectRatioString": "",       // Aspect ratio: "1:1", "4:3", "16:9" etc. (string)
    "useLink": true,                      // Image is from URL, not base64 (boolean)
    "useCropper": false,                  // Enable image cropping tool (boolean)
    "useLightbox": false,                 // Enable click to zoom (boolean)
    "fullWidth": false,                   // Use full container width (boolean)
    "roundedCorners": false,              // Round the corners (boolean)
    "borderShadow": false,                // Add shadow (boolean)
    "required": false,                    // Required for form submission (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `video`
Video display element.

```json
{
    "name": "tutorial",
    "type": "video",
    "label": "Tutorial Video",            // Optional label (string)
    "value": "https://example.com/video.mp4", // Video URL (string)
    "posterUrl": "",                      // Poster/thumbnail URL (string)
    "itemFieldName": "",                  // Field name for array of videos (string)
    "itemThumbnailFieldName": "",         // Field for thumbnail URL (string)
    "prefixText": "",                     // URL prefix (string)
    "useLink": true,                      // Video is from URL (boolean)
    "useLightbox": false,                 // Enable fullscreen on click (boolean)
    "fullWidth": false,                   // Use full container width (boolean)
    "roundedCorners": false,              // Round the corners (boolean)
    "borderShadow": false,                // Add shadow (boolean)
    "required": false,                    // Required for form submission (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `audio`
Audio player element.

```json
{
    "name": "recording",
    "type": "audio",
    "label": "Audio Recording",           // Optional label (string)
    "value": "https://example.com/audio.mp3", // Audio URL (string)
    "prefixText": "",                     // URL prefix (string)
    "required": false,                    // Required for form submission (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `image-comparison`
Before/after image comparison slider.

```json
{
    "name": "comparison",
    "type": "image-comparison",
    "label": "Before & After",            // Label (string)
    "valueFirst": "https://example.com/before.jpg",   // First image URL (string)
    "valueSecond": "https://example.com/after.jpg",   // Second image URL (string)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

### Interactive Elements

#### `button`
Action button.

```json
{
    "name": "submit",
    "type": "button",
    "text": "Submit",                     // Button text (string)
    "icon": "bi-check2",                  // Bootstrap icon class (string)
    "color": "Green",                     // Color: "Green", "Blue", "Cyan", "Violet", "Red", "Gray" (string)
    "prefixText": "",                     // Prefix for value (string)
    "suffixText": "",                     // Suffix for value (string)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false,             // Hidden until API response (boolean)
    "isClearForm": false,                 // Reset form on click (boolean)
    "isDownloadMode": false,              // Download file on click (boolean)
    "isStickyPosition": false             // Keep visible when scrolling (boolean)
}
```

#### `input-select-image`
Visual image selection (gallery picker).

```json
{
    "name": "style",
    "type": "input-select-image",
    "label": "Select Style",              // Field label (string)
    "value": "",                          // Selected value (string)
    "data": [                             // Image options (object[])
        {"name": "Style 1", "imageUrl": "https://..."},
        {"name": "Style 2", "imageUrl": "https://..."}
    ],
    "maxHeight": 300,                     // Max container height in px (number)
    "showTitle": true,                    // Show image titles (boolean)
    "required": false,                    // Field is required (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

### Data Display Elements

#### `table`
Data table display.

```json
{
    "name": "results",
    "type": "table",
    "label": "Results",                   // Table title (string)
    "headers": ["Name", "Value", "Date"], // Column headers (string[])
    "keys": ["name", "value", "date"],    // Object keys for each column (string[])
    "valueArr": [],                       // Data rows (object[])
    "isHTML": false,                      // Render values as HTML (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `input-chart-line`
Line/area chart visualization.

```json
{
    "name": "chart",
    "type": "input-chart-line",
    "label": "Sales Chart",               // Chart title (string)
    "itemTitle": "Sales",                 // Series name (string)
    "fieldNameAxisX": "date",             // Field for X axis values (string)
    "fieldNameAxisY": "amount",           // Field for Y axis values (string)
    "itemFieldName": "",                  // Field name in data array (string)
    "isXAxisDate": true,                  // X axis values are dates (boolean)
    "format": "MMM DD, HH:mm",            // Date format for X axis (string)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

#### `input-pagination`
Pagination control.

```json
{
    "name": "pages",
    "type": "input-pagination",
    "value": 1,                           // Current page (number)
    "perPage": 20,                        // Items per page (number)
    "maxSize": 9,                         // Max visible page buttons (number)
    "autoHide": false,                    // Hide when only 1 page (boolean)
    "useAsOffset": false                  // Return offset instead of page number (boolean)
}
```

### Status Elements

#### `status`
Status indicator with text messages.

```json
{
    "name": "taskStatus",
    "type": "status",
    "value": null,                        // Current status value (string|null)
    "statusPending": "pending",           // Value indicating pending state (string)
    "statusProcessing": "processing",     // Value indicating processing state (string)
    "statusCompleted": "completed",       // Value indicating completed state (string)
    "statusError": "error",               // Value indicating error state (string)
    "statusCompletedText": "Done!",       // Text for completed state (string)
    "statusCompletedTextForVK": "Done!",  // Completed text for VK app (string)
    "statusProcessingText": "Processing...", // Text for processing state (string)
    "statusErrorText": "Error occurred",  // Text for error state (string)
    "isBooleanValue": false,              // Status is true/false instead of string (boolean)
    "hiddenByField": "",                  // Conditional hide (string)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `progress`
Progress bar with queue position and status.

```json
{
    "name": "progress",
    "type": "progress",
    "value": null,                        // Current progress data (object|null)
    "statusPending": "pending",           // Value indicating pending state (string)
    "statusProcessing": "processing",     // Value indicating processing state (string)
    "statusCompleted": "completed",       // Value indicating completed state (string)
    "statusError": "error",               // Value indicating error state (string)
    "statusFieldName": "status",          // Field name for status in response (string)
    "queueNumberFieldName": "number",     // Field name for queue position (string)
    "taskIdFieldName": "uuid",            // Field name for task ID (string)
    "operationDurationSeconds": 20,       // Estimated operation duration (number)
    "isBooleanValue": false,              // Status is true/false (boolean)
    "hiddenByField": ""                   // Conditional hide (string)
}
```

### Special Elements

#### `iframe`
Embedded web content.

```json
{
    "name": "preview",
    "type": "iframe",
    "label": "Preview",                   // Frame label (string)
    "value": "https://example.com",       // Page URL (string)
    "htmlContent": "",                    // Or HTML content (string)
    "height": 500,                        // Frame height in px (number)
    "valueFrom": "",                      // Take URL from another field (string)
    "useResizer": false,                  // Allow resizing (boolean)
    "useRefreshButton": false,            // Show refresh button (boolean)
    "useFullscreenButton": false,         // Show fullscreen button (boolean)
    "border": true,                       // Show border (boolean)
    "hiddenByDefault": false              // Hidden until API response (boolean)
}
```

#### `user-subscription`
VK subscription status (VK apps only).

```json
{
    "name": "subscription",
    "type": "user-subscription",
    "label": "My Subscription",           // Label text (string)
    "subscriptionId": "sub_123",          // Subscription ID (string)
    "icon": "bi-star",                    // Bootstrap icon class (string)
    "showOnlyInVK": true                  // Only show in VK mini app (boolean)
}
```

---

## API Integration

Elements can be connected to API endpoints for sending data (input) or receiving data (output).

### Input API Binding

Connects an element's value to an API request:

```json
{
    "name": "userInput",
    "type": "input-text",
    "label": "Your Question",
    "options": {
        "inputApiUuid": "a61f5882-8970-11f0-b625-525400f8f94f",
        "inputApiFieldName": "data.question",
        "inputApiFieldType": "input"
    }
}
```

- `inputApiUuid`: UUID of the API endpoint
- `inputApiFieldName`: Path in the request body (supports dot notation like `data.question`)
- `inputApiFieldType`: Usually `"input"` for body fields or `"url"` for URL parameters

### Output API Binding

Connects an element to display API response data:

```json
{
    "name": "result",
    "type": "text",
    "value": "",
    "options": {
        "outputApiUuid": "d69f5982-8aa4-11f0-9ea8-525400f8f94f",
        "outputApiFieldName": "result_data.answer",
        "outputApiFieldType": "output"
    }
}
```

- `outputApiUuid`: UUID of the API endpoint
- `outputApiFieldName`: Path to the field in the response (supports dot notation)
- `outputApiFieldType`: Always `"output"`

### Button Submit Binding

Buttons trigger API calls when clicked:

```json
{
    "name": "submit",
    "type": "button",
    "text": "Send",
    "enabled": true,
    "options": {
        "inputApiUuid": "a61f5882-8970-11f0-b625-525400f8f94f",
        "inputApiFieldName": "submit",
        "inputApiFieldType": "input"
    }
}
```

### Passing Values Between APIs

Hidden fields can receive output from one API and send it to another:

```json
{
    "name": "taskId",
    "type": "input-hidden",
    "label": "Task ID",
    "enabled": true,
    "storeValue": true,
    "options": {
        "inputApiUuid": "second-api-uuid",
        "inputApiFieldName": 1,
        "inputApiFieldType": "url",
        "outputApiUuid": "first-api-uuid",
        "outputApiFieldName": "uuid",
        "outputApiFieldType": "output"
    }
}
```

---

## Conditional Visibility

Elements can be shown/hidden based on other field values using `hiddenByField`.

### Syntax

```
hiddenByField: "fieldName==value"
```

The element is **shown** when the condition matches, **hidden** otherwise.

### Examples

Show only when mode equals "advanced":
```json
{
    "name": "advancedOptions",
    "type": "text",
    "value": "Advanced options are enabled",
    "hiddenByField": "mode==advanced"
}
```

Show when category is "premium":
```json
{
    "name": "premiumFeatures",
    "type": "text",
    "value": "Premium features available",
    "hiddenByField": "category==premium"
}
```

---

## Complete Example

Here's a complete example of an image processing application:

```json
{
    "id": 1,
    "name": "Photo Enhancer",
    "uuid": "8e1d7b2e-8970-11f0-983f-525400f8f94f",
    "language": "en",
    "shared": true,
    "hidden": false,
    "gridColumns": 2,
    "tabs": ["Enhance", "Results"],
    "image": "https://example.com/icon.png",
    "blocks": [
        {
            "tabIndex": 0,
            "options": {
                "enabled": true,
                "orderIndex": 0,
                "gridColumnSpan": 1,
                "autoClear": false,
                "showLoading": true,
                "messageSuccess": "Image processing started!"
            },
            "elements": [
                {
                    "name": "banner",
                    "type": "image",
                    "value": "https://example.com/banner.jpg",
                    "blockIndex": 0,
                    "orderIndex": 0,
                    "roundedCorners": true
                },
                {
                    "name": "file",
                    "type": "input-file",
                    "label": "Upload Image",
                    "placeholder": "Choose file (.jpg, .png)",
                    "accept": "image/*",
                    "multiple": false,
                    "required": true,
                    "loadValueInto": "preview",
                    "blockIndex": 0,
                    "orderIndex": 1,
                    "options": {}
                },
                {
                    "name": "preview",
                    "type": "image",
                    "label": "Preview",
                    "value": "",
                    "useLink": true,
                    "useCropper": true,
                    "blockIndex": 0,
                    "orderIndex": 2,
                    "options": {
                        "inputApiUuid": "api-uuid-1",
                        "inputApiFieldName": "image_file",
                        "inputApiFieldType": "input"
                    }
                },
                {
                    "name": "mode",
                    "type": "input-select",
                    "label": "Enhancement Mode",
                    "value": "enhance",
                    "valueArr": [
                        {"name": "Enhance Quality", "value": "enhance"},
                        {"name": "Upscale 2x", "value": "upscale"},
                        {"name": "Remove Background", "value": "remove_bg"}
                    ],
                    "itemFieldNameForTitle": "name",
                    "itemFieldNameForValue": "value",
                    "required": true,
                    "blockIndex": 0,
                    "orderIndex": 3,
                    "options": {
                        "inputApiUuid": "api-uuid-1",
                        "inputApiFieldName": "data.mode",
                        "inputApiFieldType": "input"
                    }
                },
                {
                    "name": "submit",
                    "type": "button",
                    "text": "Process Image",
                    "icon": "bi-magic",
                    "color": "Blue",
                    "blockIndex": 0,
                    "orderIndex": 4,
                    "isStickyPosition": true,
                    "enabled": true,
                    "options": {
                        "inputApiUuid": "api-uuid-1",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    }
                }
            ]
        },
        {
            "tabIndex": 0,
            "options": {
                "enabled": true,
                "orderIndex": 1,
                "gridColumnSpan": 1,
                "showLoading": true
            },
            "elements": [
                {
                    "name": "instructions",
                    "type": "text",
                    "value": "Upload an image and select an enhancement mode to get started.",
                    "color": "Gray",
                    "fontSize": "Small",
                    "blockIndex": 1,
                    "orderIndex": 0
                },
                {
                    "name": "result",
                    "type": "image",
                    "label": "Result",
                    "value": "",
                    "useLink": true,
                    "useLightbox": true,
                    "roundedCorners": true,
                    "hiddenByDefault": true,
                    "blockIndex": 1,
                    "orderIndex": 1,
                    "options": {
                        "outputApiUuid": "api-uuid-2",
                        "outputApiFieldName": "result_data.image_url",
                        "outputApiFieldType": "output"
                    }
                },
                {
                    "name": "download",
                    "type": "button",
                    "text": "Download Result",
                    "icon": "bi-download",
                    "color": "Green",
                    "hiddenByDefault": true,
                    "blockIndex": 1,
                    "orderIndex": 2,
                    "options": {
                        "outputApiUuid": "api-uuid-2",
                        "outputApiFieldName": "result_data.image_url",
                        "outputApiFieldType": "output"
                    }
                },
                {
                    "name": "taskId",
                    "type": "input-hidden",
                    "label": "Task ID",
                    "storeValue": true,
                    "enabled": true,
                    "blockIndex": 1,
                    "orderIndex": 3,
                    "options": {
                        "inputApiUuid": "api-uuid-2",
                        "inputApiFieldName": 1,
                        "inputApiFieldType": "url",
                        "outputApiUuid": "api-uuid-1",
                        "outputApiFieldName": "uuid",
                        "outputApiFieldType": "output"
                    }
                },
                {
                    "name": "progress",
                    "type": "progress",
                    "statusPending": "",
                    "statusProcessing": "",
                    "statusCompleted": "completed",
                    "statusError": "error",
                    "statusFieldName": "status",
                    "queueNumberFieldName": "number",
                    "taskIdFieldName": "uuid",
                    "operationDurationSeconds": 30,
                    "blockIndex": 1,
                    "orderIndex": 4,
                    "options": {
                        "outputApiUuid": "api-uuid-2",
                        "outputApiFieldName": "value",
                        "outputApiFieldType": "output"
                    }
                }
            ]
        }
    ]
}
```

---

## Bootstrap Icons

The application uses Bootstrap Icons. Reference: https://icons.getbootstrap.com/

Common icons used in applications:
- `bi-check2` - Checkmark for submit buttons
- `bi-download` - Download button
- `bi-info-circle` - Information text
- `bi-question-circle` - Help/question
- `bi-magic` - Processing/enhancement
- `bi-star` - Favorites/premium
- `bi-box-arrow-up-right` - External link

---

## Best Practices

1. **Unique Names**: Each element should have a unique `name` within the application
2. **Order Index**: Use `orderIndex` to control element order within a block
3. **Block Index**: Match `blockIndex` with the actual position in the blocks array
4. **API UUIDs**: Ensure API UUIDs match your configured API endpoints
5. **Conditional Logic**: Use `hiddenByField` to create dynamic forms
6. **Loading States**: Use `hiddenByDefault: true` for elements that show API results
7. **Required Fields**: Mark important inputs as `required: true`
8. **Store Values**: Use `storeValue: true` for values that should persist across sessions
9. **Grid Layout**: Use `gridColumnSpan` to control block widths in the grid
10. **Sticky Buttons**: Use `isStickyPosition: true` for important action buttons
