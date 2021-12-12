# `PropertyFilter`

## Description

Describes different features of properties for filtering.

## Import

```ts
import { PropertyFilter } from '@baileyherbert/reflection';
```

## Values

| Name        | Value | Description                                               |
| ----------- | ----- | --------------------------------------------------------- |
| `Typed`     | `1`   | Filter properties that have type metadata available.      |
| `Inherited` | `2`   | Filter properties that are inherited from a parent class. |
| `Own`       | `4`  | Filter properties that are not inherited.                 |
