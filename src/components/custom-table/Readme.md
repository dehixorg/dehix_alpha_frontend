# Custom Table API

## Table Props

| Name     |  Type  |                                                   Description |
| -------- | :----: | ------------------------------------------------------------: |
| title    | String |                       The title of the table to be displayed. |
| uniqueId* | String | The unique id to identify each row uniquely for example \_id. |
| api*      | String |                               The API endpoint to fetch data. |
|fields*| Array<Field> | An array of field data. You can checkout the field props |
|filterData| Array<FilterData> | An array of filters. You can checkout the filters props |
| searchColumn | Array<String> | The array of names of the fields to apply search on |
| isFilter | Boolean | Flag to apply filters or not |
| isDownload | Boolean | Flag to have download button for the table or not |
| tableHeaderActions | Array | The array of either custom components or type Header Actions to apply on table header. If you are rendering a custom component then you will get access to a function called refetch() which when called, will refetch the data. |
| mainTableActions | Array | The array of either custom components or type Header Actions to apply on main table. If you are rendering a custom component then you will get access to a function called refetch() which when called, will refetch the data. |


## Field Props


| Name            |       Type        | Description                                                                                       |
| --------------- | :---------------: | -------------------------------------------------------------------------------------------------: |
| fieldName       |      String       | The name of the key for the field in the API response                                              |
| textValue*      |      String       | The text to be displayed in the table header                                                       |
| type*           |    FieldType      | The type of the field                                                                              |
| width           |      Number       | The width of the column                                                                            |
| formating       |      Object       | The formatting options for the field                                                               |
| link            |      String       | The placeholder link to be displayed if `type === FieldType.LINK`                                  |
| tooltip         |     Boolean       | Flag to indicate if a tooltip should be displayed                                                  |
| tooltipContent  |      String       | The content of the tooltip to be displayed if `tooltip === true`                                   |
| className       |      String       | Custom Tailwind classes to be added to the table cell                                              |
| arrayName       |      String       | The key in the API response if `type === FieldType.ARRAY_VALUE` and the value is an array of objects or strings |
| onToggle        | Function(Boolean, String) | Function to be called when a toggle action occurs                                                  |
| actions         |      Actions      | Metadata for actions if `type === FieldType.ACTIONS`                                               |
| currency        |     Currency      | The currency type if `type === FieldType.CURRENCY`, default is INR                                 |
| statusFormats   | Array<{ bgColor?: String, textColor?: String, isUppercase?: Boolean, value: String, textValue: String }> | Formatting options for different statuses if `type === FieldType.STATUS`                           |
| wordsCnt        |      Number       | The number of words to show if `type === FieldType.LongText`. If the value exceeds this, the element will become a tooltip to show remaining text |
| CustomComponent | Function({ id, data, refetch }) => React.JSX.Element | Custom component to render if `type === FieldType.CUSTOM`                                          |


## FiltersArrayElem Props

| Name       |   Type   | Description                                                                                       |
| ---------- | :------: | ------------------------------------------------------------------------------------------------- |
| fieldName  |  String  | The name of the key for the field in the API response                                              |
| textValue  |  String  | The text to be displayed in the filter                                                             |
| value      |  String  | The value of the filter                                                                            |
| arrayName  |  String  | The key in the API response if the value is an array of objects or strings (optional)              |


## HeaderActions Props

| Name       |   Type   | Description                                                                                       |
| ---------- | :------: | ------------------------------------------------------------------------------------------------- |
| name       |  String  | The name of the action                                                                            |
| handler    | Function | The function to be called when the action is triggered                                            |
| icon       |  JSX.Element | The icon to be displayed for the action (optional)                                            |
| className  |  String  | Custom Tailwind classes to be added to the action button (optional)                               |