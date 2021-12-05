# `ParameterFilter`

## Description

Describes different features of parameters for filtering.

## Import

```ts
import { ParameterFilter } from '@baileyherbert/reflection';
```

## Values

| Name               | Value | Description                                                    |
| ------------------ | ----- | -------------------------------------------------------------- |
| `Meta`             | `1`   | Filter parameters that have reflection metadata available.     |
| `WithDefault`      | `2`   | Filter parameters that have ES6 default values.                |
| `WithoutDefault`   | `4`   | Filter parameters that don't have default values.              |
| `PrimitiveType`    | `8`   | Filter parameters that expect a primitive type.                |
| `NonPrimitiveType` | `16`  | Filter parameters that have specific object or function types. |
| `KnownType`        | `32`  | Filter parameters that have specific, unambiguous types.       |
| `UnknownType`      | `64`  | Filter parameters that have unknown or ambiguous types.        |
