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
    "name": "Application Name",          // Application name (string)
    "language": "en",                     // Language code: "en", "ru", "fr", "de", "es" (string)
    "shared": true,                       // Whether the app is publicly shared (boolean)
    "hidden": false,                      // Whether the app is hidden (boolean)
    "maintenance": false,                 // Whether the app is in maintenance mode (boolean)
    "advertising": true,                  // Whether advertising is enabled (boolean)
    "adultsOnly": false,                  // Whether the app is for adults only (boolean)
    "gridColumns": 2,                     // Number of grid columns for layout: 1, 2, or 3 (number)
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
| `name` | string | Yes | Display name of the application |
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
or:
```
hiddenByField: "fieldName!=value"
```
input-switch:
```
hiddenByField: "fieldName"
```

The element is **shown** when the condition matches, **hidden** otherwise.

### Examples

Show only if the switch is on:
```json
{
    "name": "advancedOptions",
    "type": "text",
    "value": "Advanced options are enabled",
    "hiddenByField": "mode"
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

Show when category is not "premium":
```json
{
    "name": "basicFeatures",
    "type": "text",
    "value": "Basic features available",
    "hiddenByField": "category!=premium"
}
```

---

## Complete Example

Here's a complete example of an image processing application:

```json
{
    "url": "https://api2app.org/ru/api/v1/applications/276",
    "id": 276,
    "date_created": "2025-09-04T09:21:36.212962Z",
    "name": "Реставрация старых фотографий",
    "language": "ru",
    "uuid": "8e1d7b2e-8970-11f0-983f-525400f8f94f",
    "shared": true,
    "hidden": false,
    "maintenance": false,
    "advertising": true,
    "adultsOnly": false,
    "gridColumns": 2,
    "tabs": [
        "Отреставрировать фото",
        "Примеры",
        "Контакты"
    ],
    "blocks": [
        {
            "options": {
                "enabled": true,
                "autoClear": true,
                "orderIndex": 0,
                "showLoading": true,
                "gridColumnSpan": 1,
                "messageSuccess": "Запрос успешно отправлен."
            },
            "elements": [
                {
                    "info": "1:1, 4:3, 3:4, 16:9, 9:16",
                    "name": "image",
                    "type": "image",
                    "label": "",
                    "value": "https://api2app.org/media/uploads/1757114218_banner_3_3.jpg",
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "useLink": false,
                    "fullWidth": false,
                    "blockIndex": 0,
                    "orderIndex": 0,
                    "prefixText": "",
                    "useCropper": false,
                    "useLightbox": false,
                    "borderShadow": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "roundedCorners": true,
                    "hiddenByDefault": false,
                    "itemThumbnailFieldName": "",
                    "cropperAspectRatioString": ""
                },
                {
                    "name": "file",
                    "type": "input-file",
                    "label": "Файл изображения",
                    "value": [],
                    "accept": "image/*",
                    "hidden": false,
                    "enabled": false,
                    "options": {
                        "inputApiUuid": null,
                        "inputApiFieldName": null,
                        "inputApiFieldType": null
                    },
                    "multiple": false,
                    "required": false,
                    "blockIndex": 0,
                    "orderIndex": 1,
                    "placeholder": "Загрузить Файл (.jpg, .png)",
                    "hiddenByField": "",
                    "loadValueInto": "image_input"
                },
                {
                    "info": "1:1, 4:3, 3:4, 16:9, 9:16",
                    "name": "image_input",
                    "type": "image",
                    "label": "Изображение",
                    "value": "",
                    "hidden": false,
                    "enabled": true,
                    "options": {
                        "inputApiUuid": "11eda37a-f848-11f0-b365-525400f8f94f",
                        "inputApiFieldName": "image_file",
                        "inputApiFieldType": "input"
                    },
                    "useLink": true,
                    "required": true,
                    "valueArr": null,
                    "valueObj": null,
                    "fullWidth": false,
                    "blockIndex": 0,
                    "orderIndex": 2,
                    "prefixText": "",
                    "useCropper": true,
                    "useLightbox": false,
                    "borderShadow": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "roundedCorners": false,
                    "hiddenByDefault": false,
                    "itemThumbnailFieldName": "",
                    "cropperAspectRatioString": ""
                },
                {
                    "name": "mode",
                    "type": "input-select",
                    "label": "Режим",
                    "value": "default",
                    "addTag": false,
                    "choices": [],
                    "enabled": false,
                    "options": {
                        "inputApiUuid": "11eda37a-f848-11f0-b365-525400f8f94f",
                        "inputApiFieldName": "data.mode",
                        "inputApiFieldType": "input"
                    },
                    "required": true,
                    "valueArr": [
                        {
                            "name": "Улучшение качества",
                            "value": "default"
                        },
                        {
                            "name": "Реставрация",
                            "value": "restore"
                        },
                        {
                            "name": "Реставрация и улучшение (авто)",
                            "value": "restore_upscale"
                        }
                    ],
                    "clearable": false,
                    "blockIndex": 0,
                    "orderIndex": 3,
                    "searchable": false,
                    "placeholder": "Пожалуйста, выберите режим",
                    "hiddenByField": "",
                    "loadValueInto": "",
                    "hiddenByDefault": false,
                    "selectDefaultFirst": false,
                    "itemFieldNameForTitle": "name",
                    "itemFieldNameForValue": "value"
                },
                {
                    "icon": "bi-info-circle",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Blue",
                    "label": "",
                    "value": "Этот режим улучшает качество фото: убирает зернистость и искажения, а также удваивает разрешение с сохранением чёткости.",
                    "border": true,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 0,
                    "orderIndex": 4,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": false,
                    "hiddenByField": "mode==default",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "bi-info-circle",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Blue",
                    "label": "",
                    "value": "Этот режим автоматически удалит с фото все помятости, царапины и пятна, а также раскрасит чёрно-белый снимок.\nПожалуйста, введите описание изображения, это поможет искусственному интеллекту сделать корректную реставрацию.",
                    "border": true,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 0,
                    "orderIndex": 5,
                    "prefixText": "",
                    "showHeader": false,
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": false,
                    "hiddenByField": "mode==restore",
                    "itemFieldName": "",
                    "whiteSpacePre": true,
                    "hiddenByDefault": false
                },
                {
                    "icon": "bi-info-circle",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Blue",
                    "label": "",
                    "value": "Автоматический режим: реставрация и улучшение качества.",
                    "border": true,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 0,
                    "orderIndex": 6,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": false,
                    "hiddenByField": "mode==restore_upscale",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "max": 0,
                    "name": "description",
                    "rows": 2,
                    "type": "input-textarea",
                    "label": "Дополнительная информация (не обязательно)",
                    "value": "",
                    "enabled": false,
                    "options": {
                        "inputApiUuid": "11eda37a-f848-11f0-b365-525400f8f94f",
                        "inputApiFieldName": "data.description",
                        "inputApiFieldType": "input"
                    },
                    "readOnly": false,
                    "required": false,
                    "autoHeight": false,
                    "blockIndex": 0,
                    "orderIndex": 6,
                    "prefixText": "",
                    "storeValue": false,
                    "suffixText": "",
                    "placeholder": "Пример: платье у женщины зелёного цвета",
                    "hiddenByField": "mode==restore",
                    "hiddenByDefault": false,
                    "copyToClipboardEnabled": false,
                    "speechSynthesisEnabled": false,
                    "speechRecognitionEnabled": false
                },
                {
                    "icon": "bi-check2",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "name": "submit",
                    "text": "Отправить",
                    "type": "button",
                    "color": "Blue",
                    "value": null,
                    "hidden": false,
                    "enabled": true,
                    "options": {
                        "inputApiUuid": "11eda37a-f848-11f0-b365-525400f8f94f",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    },
                    "valueArr": null,
                    "valueObj": null,
                    "blockIndex": 0,
                    "orderIndex": 7,
                    "prefixText": "",
                    "suffixText": "",
                    "isClearForm": false,
                    "hiddenByField": "",
                    "isDownloadMode": false,
                    "hiddenByDefault": false,
                    "isStickyPosition": true
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "enabled": true,
                "autoClear": true,
                "orderIndex": 1,
                "showLoading": true,
                "gridColumnSpan": 1,
                "messageSuccess": "Запрос успешно отправлен."
            },
            "elements": [
                {
                    "info": "1:1, 4:3, 3:4, 16:9, 9:16",
                    "name": "image",
                    "type": "image",
                    "label": "",
                    "value": "",
                    "hidden": false,
                    "enabled": false,
                    "options": {
                        "outputApiUuid": "3fb6f554-f848-11f0-8915-525400f8f94f",
                        "outputApiFieldName": "result_data.result",
                        "outputApiFieldType": "output"
                    },
                    "useLink": true,
                    "valueArr": null,
                    "valueObj": null,
                    "fullWidth": false,
                    "blockIndex": 1,
                    "orderIndex": 3,
                    "prefixText": "",
                    "useCropper": false,
                    "useLightbox": true,
                    "borderShadow": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "roundedCorners": true,
                    "hiddenByDefault": false,
                    "itemThumbnailFieldName": "",
                    "cropperAspectRatioString": ""
                },
                {
                    "icon": "bi-download",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "name": "submit",
                    "text": "Скачать файл",
                    "type": "button",
                    "color": "Green",
                    "value": null,
                    "hidden": false,
                    "enabled": false,
                    "options": {
                        "outputApiUuid": "3fb6f554-f848-11f0-8915-525400f8f94f",
                        "outputApiFieldName": "result_data.public_url",
                        "outputApiFieldType": "output"
                    },
                    "valueArr": null,
                    "valueObj": null,
                    "blockIndex": 1,
                    "orderIndex": 4,
                    "prefixText": "",
                    "suffixText": "",
                    "isClearForm": false,
                    "hiddenByField": "",
                    "isDownloadMode": false,
                    "hiddenByDefault": true
                },
                {
                    "name": "task_uuid",
                    "type": "input-hidden",
                    "label": "ID задачи",
                    "value": "",
                    "hidden": false,
                    "enabled": true,
                    "options": {
                        "inputApiUuid": "3fb6f554-f848-11f0-8915-525400f8f94f",
                        "outputApiUuid": "11eda37a-f848-11f0-b365-525400f8f94f",
                        "inputApiFieldName": 1,
                        "inputApiFieldType": "url",
                        "outputApiFieldName": "uuid",
                        "outputApiFieldType": "output"
                    },
                    "required": true,
                    "valueArr": null,
                    "valueObj": null,
                    "valueFrom": "",
                    "blockIndex": 1,
                    "orderIndex": 5,
                    "prefixText": "",
                    "storeValue": true,
                    "suffixText": ""
                },
                {
                    "name": "progress",
                    "note": "Пожалуйста, выберите объект, который содержит данные о номере в очереди и статусе операции.",
                    "type": "progress",
                    "value": null,
                    "hidden": false,
                    "enabled": false,
                    "options": {
                        "outputApiUuid": "3fb6f554-f848-11f0-8915-525400f8f94f",
                        "outputApiFieldName": "value",
                        "outputApiFieldType": "output"
                    },
                    "valueArr": null,
                    "valueObj": null,
                    "blockIndex": 1,
                    "orderIndex": 3,
                    "statusError": "error",
                    "hiddenByField": "",
                    "statusPending": "",
                    "isBooleanValue": false,
                    "statusCompleted": "completed",
                    "statusFieldName": "status",
                    "taskIdFieldName": "uuid",
                    "statusProcessing": "",
                    "queueNumberFieldName": "number",
                    "operationDurationSeconds": 30
                },
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "Здесь Вы можете улучшить качество старого фото или увеличить разрешение маленького изображения в 2 раза.",
                    "border": false,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": false,
                    "maxHeight": 0,
                    "blockIndex": 1,
                    "orderIndex": 0,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "bi-info-circle",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Blue",
                    "label": "",
                    "value": "Ограничение: **15 фотографий** в день",
                    "border": true,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Small",
                    "markdown": true,
                    "fullWidth": false,
                    "maxHeight": 0,
                    "blockIndex": 1,
                    "orderIndex": 5,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Blue",
                    "label": "",
                    "value": "Результат будет сохранен в Вашем разделе [Файлы](https://vk.com/docs).",
                    "border": true,
                    "hidden": false,
                    "enabled": true,
                    "options": {},
                    "fontSize": "Small",
                    "markdown": true,
                    "fullWidth": false,
                    "blockIndex": 1,
                    "orderIndex": 2,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": true,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "bi-question-circle",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Gray",
                    "label": "",
                    "value": "Загрузите файл фотографии и нажмите кнопку \"Отправить\". \nДождитесь завершения операции, которая может занять до нескольких минут, в зависимости от Вашего номера в очереди.",
                    "border": true,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Small",
                    "markdown": false,
                    "fullWidth": false,
                    "maxHeight": 0,
                    "blockIndex": 1,
                    "orderIndex": 1,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": true,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Gray",
                    "label": "",
                    "value": "Версия: 2.5.0",
                    "border": false,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Small",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 1,
                    "orderIndex": 7,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "name": "image",
                    "type": "image",
                    "value": "https://api2app.org/media/uploads/1723375257_made-in-api2app.svg",
                    "hidden": false,
                    "options": {},
                    "blockIndex": 1,
                    "orderIndex": 7,
                    "prefixText": "",
                    "itemFieldName": "",
                    "hiddenByDefault": false,
                    "itemThumbnailFieldName": ""
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "enabled": false,
                "autoClear": false,
                "orderIndex": 2,
                "showLoading": true,
                "gridColumnSpan": 1,
                "messageSuccess": "Данные успешно отправлены.",
                "isStickyPosition": false
            },
            "elements": [
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "Улучшение качества",
                    "border": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 2,
                    "orderIndex": 0,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "name": "image-comparison",
                    "type": "image-comparison",
                    "label": "Сравнение изображений",
                    "value": "",
                    "options": {},
                    "blockIndex": 2,
                    "orderIndex": 1,
                    "valueFirst": "https://api2app.org/media/uploads/1764164596_001_input.jpg",
                    "valueSecond": "https://api2app.org/media/uploads/1764164609_001_output.jpg",
                    "hiddenByField": ""
                }
            ],
            "tabIndex": 1
        },
        {
            "options": {
                "enabled": false,
                "autoClear": false,
                "orderIndex": 3,
                "showLoading": true,
                "gridColumnSpan": 2,
                "messageSuccess": "Данные успешно отправлены.",
                "isStickyPosition": false
            },
            "elements": [
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "Если у Вас есть вопросы по работе приложения, Вы можете задать их в нашей группе.\nТакже в нашей группе новости проекта и обзоры нейросетей.",
                    "border": false,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 3,
                    "orderIndex": 0,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": true,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": true,
                    "hiddenByDefault": false
                },
                {
                    "info": "1:1, 4:3, 3:4, 16:9, 9:16",
                    "name": "image",
                    "type": "image",
                    "label": "",
                    "value": "https://api2app.org/media/uploads/1733921183_api2app-logo-small-nolabel.png",
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "useLink": false,
                    "fullWidth": false,
                    "blockIndex": 3,
                    "orderIndex": 0,
                    "prefixText": "",
                    "useCropper": false,
                    "useLightbox": false,
                    "borderShadow": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "roundedCorners": false,
                    "hiddenByDefault": false,
                    "itemThumbnailFieldName": "",
                    "cropperAspectRatioString": ""
                },
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "https://vk.com/api2app",
                    "border": false,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 3,
                    "orderIndex": 2,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": true,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "https://t.me/api2app",
                    "border": false,
                    "hidden": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 3,
                    "orderIndex": 2,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": true,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                }
            ],
            "tabIndex": 2
        },
        {
            "options": {
                "autoClear": false,
                "orderIndex": 0,
                "showLoading": true,
                "gridColumnSpan": 1,
                "messageSuccess": "Данные успешно отправлены.",
                "isStickyPosition": false
            },
            "elements": [
                {
                    "icon": "",
                    "info": "[Bootstrap Icons](https://icons.getbootstrap.com/)",
                    "keys": [],
                    "name": "text",
                    "type": "text",
                    "color": "Black",
                    "label": "",
                    "value": "Реставрация",
                    "border": false,
                    "enabled": false,
                    "options": {},
                    "fontSize": "Medium",
                    "markdown": false,
                    "fullWidth": true,
                    "maxHeight": 0,
                    "blockIndex": 4,
                    "orderIndex": 0,
                    "prefixText": "",
                    "suffixText": "",
                    "alignCenter": false,
                    "borderShadow": false,
                    "showOnlyInVK": false,
                    "hiddenByField": "",
                    "itemFieldName": "",
                    "whiteSpacePre": false,
                    "hiddenByDefault": false
                },
                {
                    "name": "image-comparison",
                    "type": "image-comparison",
                    "label": "Сравнение изображений",
                    "value": "",
                    "options": {},
                    "blockIndex": 4,
                    "orderIndex": 1,
                    "valueFirst": "https://api2app.org/media/uploads/1764164668_004_input.jpg",
                    "valueSecond": "https://api2app.org/media/uploads/1764164680_004_output.jpg",
                    "hiddenByField": ""
                }
            ],
            "tabIndex": 1
        }
    ],
    "image": "https://api2app.org/media/images/photo_restoration_icon_576_v6ZIKuw.png",
    "vkAppId": "",
    "vkSecretKey": "",
    "vkToken": "",
    "tgBotToken": "",
    "tgForwardToUserId": "",
    "tgKeyWord": "",
    "paymentEnabled": false,
    "pricePerUse": null,
    "gupshupApiKey": "",
    "favorite": true
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
