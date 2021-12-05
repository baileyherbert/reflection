# `MethodFilter`

## Description

Describes different features of methods for filtering.

## Import

```ts
import { MethodFilter } from '@baileyherbert/reflection';
```

## Values

| Name        | Value | Description                                            |
| ----------- | ----- | ------------------------------------------------------ |
| `Static`    | `1`   | Filter methods that are static.                        |
| `Local`     | `2`   | Filter methods that are local (not static).            |
| `Typed`     | `4`   | Filter methods that have type metadata available.      |
| `Inherited` | `8`   | Filter methods that are inherited from a parent class. |
| `Own`       | `16`  | Filter methods that are not inherited.                 |
