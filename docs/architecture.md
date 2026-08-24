# SOKOZA Architecture Overview

## Ecosystem Topology

```
+-------------------------------------------------------------------+
|                        React Web Frontend                         |
|                         (apps/web - Vite)                         |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                         NestJS REST API                           |
|                       (apps/api - Port 3001)                      |
|                                                                   |
| [Auth]  [Users]  [Businesses]  [Products]  [Orders]  [Deliveries] |
| [Riders]  [Payments]  [Reviews]  [Notifications]  [FeatureReqs]   |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                             Prisma ORM                            |
+-------------------------------------------------------------------+
                                  |
                                  v
+-------------------------------------------------------------------+
|                        PostgreSQL Database                        |
+-------------------------------------------------------------------+
```

## Shared Packages

- `@sokoza/types`: Shared TypeScript interfaces and enums across frontend and backend.
- `@sokoza/config`: Core business configuration, geographic boundaries (Juja, Ruiru, Thika, Kiambu, Nairobi), commission formulas, and default settings.
- `@sokoza/validation`: Zod schemas for request validation across API and forms.

## Geographic Strategy

Initial deployment targets **Juja, Kenya** (Latitude: `-1.1026`, Longitude: `37.0132`). The data schema and API models store coordinates (`latitude`, `longitude`) and area strings without hardcoding logic, enabling seamless multi-town scaling.
