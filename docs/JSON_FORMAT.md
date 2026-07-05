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

Fields whose values match the defaults documented below do not have to be included in generated JSON. After AI-generated application data is created, missing block and element fields are filled from the default values.

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

| Field             | Type    | Default     | Description                                                                               |
|-------------------|---------|-------------|-------------------------------------------------------------------------------------------|
| `type`            | string  | Required    | **Required.** Element type identifier                                                     |
| `name`            | string  | by type     | Unique element name within the app                                                        |
| `blockIndex`      | number  | `0`         | Index of the parent block                                                                 |
| `orderIndex`      | number  | `0`         | Display order within the block                                                            |
| `value`           | any     | by type     | Element value (type depends on element)                                                   |
| `hiddenByDefault` | boolean | `false`     | Hidden until value is retrieved                                                           |
| `hiddenByField`   | string  | `""`        | Conditional visibility expression (see [Conditional Visibility](#conditional-visibility)) |
| `options`         | object  | `{}`        | API binding options (see [API Integration](#api-integration))                             |

If the field is hidden (hiddenByDefault=true), it becomes visible when the value is received.

---

## Element Types

Available types: `text-header`, `text`, `button`, `input-text`, `input-textarea`, `input-number`, `input-rating`, `input-slider`, `input-hidden`, `input-switch`, `input-select`, `input-radio`, `input-tags`, `input-date`, `input-color`, `input-file`, `image`, `video`, `audio`, `image-comparison`, `input-chart-line`, `input-chart-pie`, `input-pagination`, `status`, `progress`, `table`, `input-select-image`, `user-subscription`, `iframe`, `messages`.

## List output

Elements that support list output (by `valueArr` field): `text`, `image`, `video`, `table` (the table only supports the `valueArr` field).

### Display Elements

#### `text-header`

Section header text.

| Field         | Type    | Default               | Description                                    |
|---------------|---------|-----------------------|------------------------------------------------|
| `icon`        | string  | `""`                  | Bootstrap icon class (e.g. `"bi-info-circle"`) |
| `value`       | string  | `"Header Example Text"` | Header text                                  |
| `alignCenter` | boolean | `false`               | Center alignment                               |
| `hiddenByField` | string | `""`                | Conditional visibility                         |

#### `text`

Text display element with rich formatting options.

| Field             | Type     | Default          | Description                                                             |
|-------------------|----------|------------------|-------------------------------------------------------------------------|
| `label`           | string   | `""`             | Label above text                                                        |
| `value`           | string   | `"Example Text"` | Text value                                                              |
| `icon`            | string   | `""`             | Bootstrap icon class                                                    |
| `color`           | string   | `"Black"`        | `"Black"`, `"Gray"`, `"Green"`, `"Blue"`, `"Cyan"`, `"Violet"`, `"Red"` |
| `fontSize`        | string   | `"Medium"`       | `"Small"`, `"Medium"`, `"Large"`                                        |
| `prefixText`      | string   | `""`             | Text before value                                                       |
| `suffixText`      | string   | `""`             | Text after value                                                        |
| `maxHeight`       | number   | `0`              | Max container height in px (0 = unlimited)                              |
| `keys`            | string[] | `[]`             | Value keys for extracting nested data                                   |
| `valueArr`        | object[] | `undefined`      | An array of objects with entries to be displayed in list mode           |
| `itemFieldName`   | string   | `""`             | Field name in data array                                                |
| `hiddenByField`   | string   | `""`             | Conditional visibility                                                  |
| `markdown`        | boolean  | `false`          | Render value as Markdown                                                |
| `whiteSpacePre`   | boolean  | `false`          | Preserve line breaks                                                    |
| `alignCenter`     | boolean  | `false`          | Center alignment                                                        |
| `showHeader`      | boolean  | `false`          | Show title                                                              |
| `border`          | boolean  | `false`          | Show border                                                             |
| `borderShadow`    | boolean  | `false`          | Show shadow                                                             |
| `fullWidth`       | boolean  | `true`           | Full container width                                                    |
| `showOnlyInVK`    | boolean  | `false`          | Show only in VK mini app                                                |
| `hiddenByDefault` | boolean  | `false`          | Hidden until API response                                               |

### Input Elements

#### `input-text`

Single-line text input.

| Field                      | Type    | Default             | Description               |
|----------------------------|---------|---------------------|---------------------------|
| `label`                    | string  | `"Name"`            | Field label               |
| `placeholder`              | string  | `"Enter your name"` | Placeholder text          |
| `icon`                     | string  | `""`                | Bootstrap icon class      |
| `prefixText`               | string  | `""`                | Prefix text               |
| `suffixText`               | string  | `""`                | Suffix text               |
| `value`                    | string  | `""`                | Default value             |
| `readOnly`                 | boolean | `false`             | Read only mode            |
| `required`                 | boolean | `true`              | Required field            |
| `hiddenByDefault`          | boolean | `false`             | Hidden until API response |
| `hiddenByField`            | string  | `""`                | Conditional visibility    |
| `speechRecognitionEnabled` | boolean | `false`             | Voice typing              |
| `speechSynthesisEnabled`   | boolean | `false`             | Text-to-speech            |
| `copyToClipboardEnabled`   | boolean | `false`             | Copy button               |
| `storeValue`               | boolean | `false`             | Persist in localStorage   |

#### `input-textarea`

Multi-line text input.

| Field                      | Type    | Default                     | Description                         |
|----------------------------|---------|-----------------------------|-------------------------------------|
| `label`                    | string  | `"Content"`                 | Field label                         |
| `placeholder`              | string  | `"Enter your message here"` | Placeholder text                    |
| `prefixText`               | string  | `""`                        | Prefix text                         |
| `suffixText`               | string  | `""`                        | Suffix text                         |
| `value`                    | string  | `null`                      | Default value                       |
| `max`                      | number  | `0`                         | Maximum text length (0 = unlimited) |
| `rows`                     | number  | `6`                         | Number of visible lines             |
| `readOnly`                 | boolean | `false`                     | Read only mode                      |
| `required`                 | boolean | `true`                      | Required field                      |
| `autoHeight`               | boolean | `true`                      | Auto-adjust height                  |
| `hiddenByDefault`          | boolean | `false`                     | Hidden until API response           |
| `hiddenByField`            | string  | `""`                        | Conditional visibility              |
| `speechRecognitionEnabled` | boolean | `false`                     | Voice typing                        |
| `speechSynthesisEnabled`   | boolean | `false`                     | Text-to-speech                      |
| `copyToClipboardEnabled`   | boolean | `false`                     | Copy button                         |
| `storeValue`               | boolean | `false`                     | Persist in localStorage             |

#### `input-number`

Numeric input.

| Field           | Type   | Default    | Description            |
|-----------------|--------|------------|------------------------|
| `label`         | string | `"Number"` | Field label            |
| `min`           | number | `0`        | Minimum value          |
| `max`           | number | `10`       | Maximum value          |
| `value`         | any    | `1`        | Default value          |
| `hiddenByField` | string | `""`       | Conditional visibility |

#### `input-rating`

Star rating input. Displays five Bootstrap icon star buttons without text.

| Field           | Type           | Default | Description                                      |
|-----------------|----------------|---------|--------------------------------------------------|
| `value`         | number\|string | `0`     | Selected rating from 1 to 5. Use 0 or empty value for no rating. Strings are converted to number |
| `hiddenByField` | string         | `""`    | Conditional visibility                           |
| `required`      | boolean        | `true`  | Required field                                   |

Example:

```json
{
    "type": "input-rating",
    "name": "rating",
    "value": 0,
    "required": true,
    "options": {
        "inputApiUuid": "api-uuid",
        "inputApiFieldName": "rating",
        "inputApiFieldType": "input"
    }
}
```

#### `input-slider`

Range slider.

| Field           | Type   | Default   | Description            |
|-----------------|--------|-----------|------------------------|
| `label`         | string | `"Range"` | Field label            |
| `min`           | number | `0`       | Minimum value          |
| `max`           | number | `100`     | Maximum value          |
| `step`          | number | `1`       | Step increment         |
| `value`         | number | `0`       | Default value          |
| `hiddenByField` | string | `""`      | Conditional visibility |

#### `input-hidden`

Hidden field for passing data between APIs.

| Field           | Type    | Default    | Description                           |
|-----------------|---------|------------|---------------------------------------|
| `label`         | string  | `"Hidden"` | Label (for editor only)               |
| `prefixText`    | string  | `""`       | Prefix for value                      |
| `suffixText`    | string  | `""`       | Suffix for value                      |
| `value`         | string  | `""`       | Default value                         |
| `valueFrom`     | string  | `""`       | Copy value from another field by name |
| `hiddenByField` | string  | `""`       | Conditional visibility                |
| `storeValue`    | boolean | `true`     | Persist in localStorage               |
| `required`      | boolean | `true`     | Required field                        |

#### `input-switch`

Toggle switch.

| Field           | Type    | Default     | Description                  |
|-----------------|---------|-------------|------------------------------|
| `label`         | string  | `"Enabled"` | Field label                  |
| `value`         | string  | `"1"`       | Value submitted when enabled |
| `hiddenByField` | string  | `""`        | Conditional visibility       |
| `enabled`       | boolean | `true`      | Default enabled state        |

#### `input-select`

Dropdown select.

| Field                   | Type     | Default                            | Description                                             |
|-------------------------|----------|------------------------------------|---------------------------------------------------------|
| `label`                 | string   | `"Example Select"`                 | Field label                                             |
| `placeholder`           | string   | `"Please Select"`                  | Placeholder text                                        |
| `choices`               | string[] | `["Value1", "Value2", "Value3"]` | Simple string options                                   |
| `valueArr`              | object[] | `null`                             | Key-value options `[{"name": "Label", "value": "val"}]` |
| `itemFieldNameForTitle` | string   | `"name"`                           | Title field in `valueArr` objects                       |
| `itemFieldNameForValue` | string   | `"value"`                          | Value field in `valueArr` objects                       |
| `loadValueInto`         | string   | `""`                               | Load selected value into another field; use comma-separated names for multiple fields |
| `value`                 | any      | `"Value1"`                         | Default selected value                                  |
| `hiddenByField`         | string   | `""`                               | Conditional visibility                                  |
| `clearable`             | boolean  | `true`                             | Allow clearing selection                                |
| `searchable`            | boolean  | `true`                             | Enable search                                           |
| `addTag`                | boolean  | `false`                            | Allow adding custom values                              |
| `selectDefaultFirst`    | boolean  | `true`                             | Auto-select first option                                |
| `required`              | boolean  | `true`                             | Required field                                          |
| `hiddenByDefault`       | boolean  | `false`                            | Hidden until API response                               |

#### `input-radio`

Radio button group.

| Field           | Type     | Default                            | Description             |
|-----------------|----------|------------------------------------|-------------------------|
| `label`         | string   | `"Example Radio Buttons"`          | Field label             |
| `choices`       | string[] | `["Value1", "Value2", "Value3"]` | Options list            |
| `value`         | string   | `"Value1"`                         | Default selected value  |
| `hiddenByField` | string   | `""`                               | Conditional visibility  |
| `required`      | boolean  | `true`                             | Required field          |
| `storeValue`    | boolean  | `false`                            | Persist in localStorage |

#### `input-tags`

Tag/chip input for multiple values.

| Field             | Type     | Default                            | Description             |
|-------------------|----------|------------------------------------|-------------------------|
| `label`           | string   | `"Tags"`                           | Field label             |
| `placeholder`     | string   | `"Please Add Tags"`                | Placeholder text        |
| `choices`         | string[] | `[]`                               | Available choices       |
| `value`           | string[] | `["Value1", "Value2", "Value3"]` | Default tags            |
| `hiddenByField`   | string   | `""`                               | Conditional visibility  |
| `hiddenByDefault` | boolean  | `false`                            | Hidden until API response |
| `required`        | boolean  | `true`                             | Required field          |

#### `input-date`

Date/time picker.

| Field                | Type     | Default             | Description                             |
|----------------------|----------|---------------------|-----------------------------------------|
| `label`              | string   | `"Date"`            | Field label                             |
| `format`             | string   | `"YYYY-MM-DD HH:mm"` | Date format (e.g. `"YYYY-MM-DD HH:mm"`) |
| `value`              | string   | `""`                | Default date value                      |
| `offset`             | number   | `0`                 | Default days offset from today          |
| `hiddenByField`      | string   | `""`                | Conditional visibility                  |
| `useDefault`         | boolean  | `false`             | Use current date as default             |
| `includeTime`        | boolean  | `true`              | Enable time selection                   |
| `compactView`        | boolean  | `false`             | Compact calendar view                   |
| `rangeMode`          | boolean  | `false`             | Enable date range selection             |
| `busyDates`          | string[] | `[]`                | List of unavailable dates               |
| `busyDatesFieldName` | string   | `""`                | Field name for busy dates from API      |
| `required`           | boolean  | `true`              | Required field                          |

#### `input-color`

Color picker.

| Field           | Type   | Default   | Description            |
|-----------------|--------|-----------|------------------------|
| `label`         | string | `"Color"` | Field label            |
| `value`         | string | `""`      | Default color value    |
| `hiddenByField` | string | `""`      | Conditional visibility |

#### `input-file`

File upload.

| Field           | Type    | Default         | Description                                                                       |
|-----------------|---------|-----------------|-----------------------------------------------------------------------------------|
| `label`         | string  | `"File"`        | Field label                                                                       |
| `placeholder`   | string  | `"Upload File"` | Button text                                                                       |
| `accept`        | string  | `"image/*"`     | Accepted file types (e.g. `"image/*"`)                                            |
| `value`         | any[]   | `[]`            | Uploaded file value                                                               |
| `multiple`      | boolean | `false`         | Allow multiple files                                                              |
| `loadValueInto` | string  | `""`            | Load file value into another field; use comma-separated names for multiple fields |
| `hiddenByField` | string  | `""`            | Conditional visibility                                                            |
| `required`      | boolean | `true`          | Required field                                                                    |

### Media Elements

#### `image`

Image display.

| Field                      | Type     | Default     | Description                                                   |
|----------------------------|----------|-------------|---------------------------------------------------------------|
| `label`                    | string   | `"Image"`   | Optional label                                                |
| `itemFieldName`            | string   | `""`        | Field name for array of images                                |
| `valueArr`                 | object[] | `undefined` | An array of objects with entries to be displayed in list mode |
| `itemThumbnailFieldName`   | string   | `""`        | Thumbnail field name                                          |
| `prefixText`               | string   | `""`        | URL prefix                                                    |
| `value`                    | string   | `""`        | Image URL or base64 value                                     |
| `hiddenByField`            | string   | `""`        | Conditional visibility                                        |
| `cropperAspectRatioString` | string   | `""`        | Crop ratio: `"1:1"`, `"4:3"`, `"16:9"`, etc.                  |
| `useLink`                  | boolean  | `true`      | Image is URL (not base64)                                     |
| `useCropper`               | boolean  | `false`     | Enable crop tool                                              |
| `useLightbox`              | boolean  | `false`     | Click to zoom                                                 |
| `fullWidth`                | boolean  | `false`     | Full container width                                          |
| `roundedCorners`           | boolean  | `false`     | Rounded corners                                               |
| `borderShadow`             | boolean  | `false`     | Shadow effect                                                 |
| `vkUseSendToFiles`         | boolean  | `false`     | VK: upload/send image to My Files                             |
| `hiddenByDefault`          | boolean  | `false`     | Hidden until API response                                     |
| `required`                 | boolean  | `false`     | Required field                                                |

#### `video`

Video player.

| Field                    | Type     | Default     | Description                                                   |
|--------------------------|----------|-------------|---------------------------------------------------------------|
| `label`                  | string   | `""`        | Optional label                                                |
| `itemFieldName`          | string   | `""`        | Field name for array of videos                                |
| `valueArr`               | object[] | `undefined` | An array of objects with entries to be displayed in list mode |
| `itemThumbnailFieldName` | string   | `""`        | Thumbnail field name                                          |
| `prefixText`             | string   | `""`        | URL prefix                                                    |
| `value`                  | string   | `""`        | Video URL or base64 value                                     |
| `posterUrl`              | string   | `""`        | Poster/thumbnail URL                                          |
| `hiddenByField`          | string   | `""`        | Conditional visibility                                        |
| `useLink`                | boolean  | `true`      | Video is URL (not base64)                                     |
| `useLightbox`            | boolean  | `false`     | Click to zoom/open                                            |
| `fullWidth`              | boolean  | `false`     | Full container width                                          |
| `roundedCorners`         | boolean  | `false`     | Rounded corners                                               |
| `borderShadow`           | boolean  | `false`     | Shadow effect                                                 |
| `vkUseSendToFiles`       | boolean  | `false`     | VK: upload/send video to My Files                             |
| `hiddenByDefault`        | boolean  | `false`     | Hidden until API response                                     |
| `required`               | boolean  | `false`     | Required field                                                |

#### `audio`

Audio player.

| Field              | Type    | Default | Description                   |
|--------------------|---------|---------|-------------------------------|
| `label`            | string  | `""`    | Optional label                |
| `prefixText`       | string  | `""`    | URL prefix                    |
| `value`            | string  | `""`    | Audio URL                     |
| `hiddenByField`    | string  | `""`    | Conditional visibility        |
| `hiddenByDefault`  | boolean | `false` | Hidden until API response     |
| `fullWidth`        | boolean | `false` | Full container width          |
| `vkUseSendToFiles` | boolean | `false` | VK: upload/send audio to My Files |
| `required`         | boolean | `false` | Required field                |

#### `image-comparison`

Before/after image comparison slider.

| Field           | Type   | Default              | Description            |
|-----------------|--------|----------------------|------------------------|
| `label`         | string | `"Image comparison"` | Label                  |
| `hiddenByField` | string | `""`                 | Conditional visibility |
| `valueFirst`    | string | `""`                 | First image URL        |
| `valueSecond`   | string | `""`                 | Second image URL       |
| `value`         | string | `""`                 | Current value          |

### Interactive Elements

#### `button`

Action button that triggers API calls.

| Field              | Type    | Default    | Description                                                  |
|--------------------|---------|------------|--------------------------------------------------------------|
| `text`             | string  | `"Submit"` | Button label                                                 |
| `icon`             | string  | `""`       | Bootstrap icon class                                         |
| `color`            | string  | `"Green"`  | `"Green"`, `"Blue"`, `"Cyan"`, `"Violet"`, `"Red"`, `"Gray"` |
| `prefixText`       | string  | `""`       | Prefix for resulting value                                   |
| `suffixText`       | string  | `""`       | Suffix for resulting value                                   |
| `confirmationText` | string  | `""`       | Confirmation prompt text before click action                 |
| `valueFrom`        | string  | `""`       | Take value from another field                                |
| `linkedField`      | string  | `""`       | Name of another button whose API will be automatically triggered after this button's API call completes |
| `hiddenByField`    | string  | `""`       | Conditional visibility                                       |
| `hiddenByDefault`  | boolean | `false`    | Hidden until value is retrieved                              |
| `isClearForm`      | boolean | `false`    | Reset form on click                                          |
| `isDownloadMode`   | boolean | `false`    | Download file on click                                       |
| `isStickyPosition` | boolean | `false`    | Sticky on scroll                                             |
| `allowAutoSubmit`  | boolean | `false`    | Allow one automatic API call when a linked field value changes  |

The button can receive a value, but it doesn't display that value. It only uses it for download mode (if it's a URL or base64) or opening the link in a new browser tab. If the button is hidden, it becomes visible when it receives a value.

To make `isDownloadMode` work, you can send the same value to the button as to the media.

#### `input-select-image`

Visual image picker (gallery).

| Field           | Type     | Default          | Description                                              |
|-----------------|----------|------------------|----------------------------------------------------------|
| `label`         | string   | `"Select image"` | Field label                                              |
| `data`          | object[] | `[]`             | Options `[{"name": "Style", "imageUrl": "https://..."}]` |
| `maxHeight`     | number   | `0`              | Max container height in px                               |
| `value`         | string   | `null`           | Default selected value                                   |
| `hiddenByField` | string   | `""`             | Conditional visibility                                   |
| `showTitle`     | boolean  | `true`           | Show image titles                                        |
| `required`      | boolean  | `false`          | Required field                                           |

### Data Display Elements

#### `table`

Data table.

| Field             | Type     | Default                            | Description                            |
|-------------------|----------|------------------------------------|----------------------------------------|
| `label`           | string   | `""`                               | Table title                            |
| `headers`         | string[] | `["Column1", "Column2", "Column3"]` | Column headers                         |
| `keys`            | string[] | `["key1", "key2", "key3"]`       | Object keys for each column            |
| `valueArr`        | object[] | `undefined`                        | An array of objects with table entries |
| `loadValueInto`   | string   | `""`                               | Target identifier field name(s) to receive the selected table row value; use comma-separated names for multiple fields. The same value is loaded into all listed fields |
| `itemFieldName`   | string   | `"id"`                             | Source field name in the selected table row; this field's value is loaded into every field listed in `loadValueInto` |
| `hiddenByField`   | string   | `""`                               | Conditional visibility                 |
| `isHTML`          | boolean  | `false`                            | Render values as HTML                  |
| `editable`        | boolean  | `false`                            | Enable inline editing                  |
| `vertical`        | boolean  | `false`                            | Vertical layout mode                   |
| `hiddenByDefault` | boolean  | `false`                            | Hidden until API response              |

#### `input-chart-line`

Line chart.

| Field            | Type    | Default         | Description              |
|------------------|---------|-----------------|--------------------------|
| `label`          | string  | `"Line Chart"`  | Chart title              |
| `itemTitle`      | string  | `"Item Title"`  | Series name              |
| `fieldNameAxisX` | string  | `""`            | X axis field             |
| `fieldNameAxisY` | string  | `""`            | Y axis field             |
| `itemFieldName`  | string  | `"id"`          | Field name in data array |
| `isXAxisDate`    | boolean | `false`         | X axis values are dates  |
| `format`         | string  | `"MMM DD, HH:mm"` | Date format for X axis |
| `hiddenByField`  | string  | `""`            | Conditional visibility   |
| `hiddenByDefault` | boolean | `false`        | Hidden until API response |

#### `input-chart-pie`

Pie chart.

| Field               | Type   | Default        | Description              |
|---------------------|--------|----------------|--------------------------|
| `label`             | string | `"Pie Chart"`  | Chart title              |
| `itemTitle`         | string | `"Item Title"` | Dataset name             |
| `fieldNameCategory` | string | `"category"`   | Category field           |
| `fieldNameValue`    | string | `"value"`      | Numeric value field      |
| `itemFieldName`     | string | `"id"`         | Field name in data array |
| `hiddenByField`     | string | `""`           | Conditional visibility   |
| `hiddenByDefault`   | boolean | `false`       | Hidden until API response |

#### `input-pagination`

Pagination control.

| Field         | Type    | Default | Description                          |
|---------------|---------|---------|--------------------------------------|
| `perPage`     | number  | `20`    | Items per page                       |
| `maxSize`     | number  | `9`     | Max visible page buttons             |
| `autoHide`    | boolean | `false` | Hide when single page                |
| `useAsOffset` | boolean | `false` | Return offset instead of page number |
| `value`       | number  | `1`     | Current page                         |

### Status Elements

#### `status`

Status indicator with text messages.

| Field                      | Type    | Default                       | Description               |
|----------------------------|---------|-------------------------------|---------------------------|
| `statusPending`            | string  | `"pending"`                   | Pending status value      |
| `statusProcessing`         | string  | `"processing"`                | Processing status value   |
| `statusCompleted`          | string  | `"completed"`                 | Completed status value    |
| `statusError`              | string  | `"error"`                     | Error status value        |
| `statusCompletedText`      | string  | `"Completed"`                 | Completed display text    |
| `statusCompletedTextForVK` | string  | `"Completed"`                 | Completed text for VK app |
| `statusProcessingText`     | string  | `"Performing an operation..."` | Processing display text  |
| `statusErrorText`          | string  | `"Error"`                     | Error display text        |
| `hiddenByField`            | string  | `""`                          | Conditional visibility    |
| `isBooleanValue`           | boolean | `false`                       | Status is true/false      |
| `hiddenByDefault`          | boolean | `false`                       | Hidden until API response |
| `value`                    | any     | `null`                        | Current status value      |

#### `progress`

Progress bar with queue tracking.

| Field                      | Type    | Default        | Description              |
|----------------------------|---------|----------------|--------------------------|
| `statusPending`            | string  | `"pending"`    | Pending status value     |
| `statusProcessing`         | string  | `"processing"` | Processing status value  |
| `statusCompleted`          | string  | `"completed"`  | Completed status value   |
| `statusError`              | string  | `"error"`      | Error status value       |
| `statusFieldName`          | string  | `"status"`     | Status field in response |
| `queueNumberFieldName`     | string  | `"number"`     | Queue position field     |
| `taskIdFieldName`          | string  | `"uuid"`       | Task ID field            |
| `operationDurationSeconds` | number  | `20`           | Estimated duration       |
| `hiddenByField`            | string  | `""`           | Conditional visibility   |
| `isBooleanValue`           | boolean | `false`        | Status is true/false     |
| `value`                    | any     | `null`         | Current progress value   |
| `valueObj`                 | object  | `null`         | Current queue/status object |

### Chat Elements

#### `messages`

Chat-style messaging interface for conversational interactions with an API.

| Field             | Type    | Default | Description                           |
|-------------------|---------|---------|---------------------------------------|
| `label`           | string  | `""`    | Label displayed above the chat window |
| `placeholder`     | string  | `""`    | Placeholder text in the message input field |
| `maxHeight`       | number  | `400`   | Max height of the messages area in px |
| `hiddenByField`   | string  | `""`    | Conditional visibility                |
| `hiddenByDefault` | boolean | `false` | Hidden until API response             |
| `value`           | string  | `""`    | Current outgoing/incoming message value |

**Behavior:**

- Displays a chat bubble UI with a scrollable message history and a text input at the bottom.
- **Outgoing messages** (sent by the user) appear on the right in blue.
- **Incoming messages** (received from the API) appear on the left in white.
- Each message shows a timestamp (`HH:mm`).
- The user types a message and submits it by pressing **Enter** or clicking the send button. The typed text becomes the element's value and triggers the bound API call.
- When the API returns a response, it is automatically added as an incoming message in the chat.
- Message history is preserved for the duration of the session.

**API binding:**

- Bind the element as **input** to send the user's message text to the API.
- Bind the element as **output** to receive the API response and display it as an incoming message.

**Example — chat bot block:**

```json
{
    "name": "chat",
    "type": "messages",
    "label": "Chat",
    "placeholder": "Type a message...",
    "maxHeight": 500,
    "blockIndex": 0,
    "orderIndex": 0,
    "options": {
        "inputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
        "inputApiFieldName": "data.message",
        "inputApiFieldType": "input",
        "outputApiUuid": "aaaaaaaa-0000-0000-0000-000000000001",
        "outputApiFieldName": "result_data.reply",
        "outputApiFieldType": "output"
    }
}
```

### Special Elements

#### `iframe`

Embedded web content.

| Field                 | Type    | Default    | Description                       |
|-----------------------|---------|------------|-----------------------------------|
| `label`               | string  | `"Iframe"` | Frame label                       |
| `height`              | number  | `500`      | Frame height in px                |
| `value`               | string  | `""`       | Page URL                          |
| `valueFrom`           | string  | `""`       | Take URL from another field       |
| `htmlContent`         | string  | `""`       | HTML content (alternative to URL) |
| `useResizer`          | boolean | `false`    | Allow resizing                    |
| `useRefreshButton`    | boolean | `false`    | Show refresh button               |
| `useFullscreenButton` | boolean | `false`    | Show fullscreen button            |
| `border`              | boolean | `true`     | Show border                       |
| `hiddenByField`       | string  | `""`       | Conditional visibility            |
| `hiddenByDefault`     | boolean | `false`    | Hidden until API response         |

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

| Field            | Type    | Default             | Description              |
|------------------|---------|---------------------|--------------------------|
| `label`          | string  | `"My subscription"` | Label text               |
| `subscriptionId` | string  | `""`                | Subscription ID          |
| `icon`           | string  | `""`                | Bootstrap icon class     |
| `hiddenByField`  | string  | `""`                | Conditional visibility   |
| `showOnlyInVK`   | boolean | `true`              | Show only in VK mini app |
| `value`          | any     | `null`              | Current value            |

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

If you need to use `inputApiFieldType`="url", the `inputApiFieldName` specifies the zero-based index of the URL path parameter, counted from left to right between `/` separators, excluding the domain.

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

Displaying a list of categories in a table, adding, editing, deleting:

```json
{
    "name": "Categories",
    "language": "ru",
    "gridColumns": 2,
    "tabs": [
        "Categories"
    ],
    "blocks": [
        {
            "elements": [
                {
                    "icon": "bi-list",
                    "name": "header-1-2",
                    "type": "text-header",
                    "value": "Categories",
                    "alignCenter": true
                },
                {
                    "keys": [
                        "id",
                        "nazvanie",
                        "created_at"
                    ],
                    "name": "table-categories",
                    "type": "table",
                    "isHTML": true,
                    "headers": [
                        "id",
                        "Name",
                        "Time of creation"
                    ],
                    "options": {
                        "outputApiUuid": "cf959f36-73cc-11f1-9c31-525400f8f94f",
                        "outputApiFieldName": "results",
                        "outputApiFieldType": "output"
                    },
                    "orderIndex": 1,
                    "loadValueInto": "category-id-edit,category-id-delete"
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "autoClear": true,
                "orderIndex": 1,
                "messageSuccess": "Category added successfully!"
            },
            "elements": [
                {
                    "icon": "bi-plus-circle",
                    "name": "header-2-1",
                    "type": "text-header",
                    "value": "Add category",
                    "blockIndex": 1,
                    "alignCenter": true
                },
                {
                    "name": "name-2-2",
                    "type": "input-text",
                    "label": "Category name",
                    "options": {
                        "inputApiUuid": "cf9d4146-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": "nazvanie",
                        "inputApiFieldType": "input"
                    },
                    "blockIndex": 1,
                    "orderIndex": 1,
                    "placeholder": "Enter the name here"
                },
                {
                    "icon": "bi-plus-lg",
                    "name": "submit-2-3",
                    "text": "Add category",
                    "type": "button",
                    "color": "Blue",
                    "options": {
                        "inputApiUuid": "cf9d4146-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    },
                    "blockIndex": 1,
                    "orderIndex": 2,
                    "linkedField": "table-categories"
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "autoClear": true,
                "orderIndex": 2,
                "messageSuccess": "Category edited successfully"
            },
            "elements": [
                {
                    "icon": "bi-pencil",
                    "name": "header-3-2",
                    "type": "text-header",
                    "value": "Edit category",
                    "blockIndex": 2,
                    "alignCenter": true
                },
                {
                    "name": "category-id-edit",
                    "type": "input-number",
                    "label": "Category ID",
                    "value": "",
                    "options": {
                        "inputApiUuid": "cfa58518-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": 5,
                        "inputApiFieldType": "url"
                    },
                    "blockIndex": 2,
                    "orderIndex": 1
                },
                {
                    "name": "name-3-3",
                    "type": "input-text",
                    "label": "Category name",
                    "options": {
                        "inputApiUuid": "cfa58518-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": "nazvanie",
                        "inputApiFieldType": "input"
                    },
                    "blockIndex": 2,
                    "orderIndex": 2,
                    "placeholder": "Enter the name here"
                },
                {
                    "icon": "bi-pencil",
                    "name": "submit-3-4",
                    "text": "Edit category",
                    "type": "button",
                    "options": {
                        "inputApiUuid": "cfa58518-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    },
                    "blockIndex": 2,
                    "orderIndex": 3,
                    "linkedField": "table-categories"
                }
            ],
            "tabIndex": 0
        },
        {
            "options": {
                "orderIndex": 3,
                "messageSuccess": "The category has been removed."
            },
            "elements": [
                {
                    "icon": "bi-trash",
                    "name": "header-4-2",
                    "type": "text-header",
                    "value": "Delete category",
                    "blockIndex": 3,
                    "alignCenter": true
                },
                {
                    "name": "category-id-delete",
                    "type": "input-number",
                    "label": "Category ID",
                    "value": "",
                    "options": {
                        "inputApiUuid": "cfabbb04-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": 5,
                        "inputApiFieldType": "url"
                    },
                    "blockIndex": 3,
                    "orderIndex": 1
                },
                {
                    "icon": "bi-trash",
                    "name": "submit-4-4",
                    "text": "Delete category",
                    "type": "button",
                    "color": "Red",
                    "options": {
                        "inputApiUuid": "cfabbb04-73cc-11f1-9c31-525400f8f94f",
                        "inputApiFieldName": "submit",
                        "inputApiFieldType": "input"
                    },
                    "blockIndex": 3,
                    "orderIndex": 2,
                    "linkedField": "table-categories",
                    "confirmationText": "Are you sure you want to delete this category?"
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
3. **API UUIDs** — must match the UUIDs from the API data provided by the user
4. **Conditional logic** — use `hiddenByField` for dynamic elements
5. **Output elements** — set `hiddenByDefault: true` for elements showing API results
6. **Required fields** — mark important inputs with `required: true`
7. **Store values** — use `storeValue: true` only for values that need to persist across sessions, for example a task identifier received from an API
8. **Grid layout** — use `gridColumnSpan` to control block widths
9. **Sticky buttons** — use `isStickyPosition: true` for primary action buttons
10. **Bootstrap Icons** — reference: https://icons.getbootstrap.com/
