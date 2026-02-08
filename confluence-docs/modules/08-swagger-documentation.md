# Module 08: Swagger / OpenAPI Documentation

**Jira story**: `JIRA-XXX` (replace with your story key)

## Description

Expose API documentation via Swagger (OpenAPI) so that frontend, third-party integrators, and QA can discover and test endpoints. Implement in the NestJS API and keep it in sync with routes and DTOs.

## Acceptance criteria

- Swagger UI is available at a documented path (e.g. `/api/docs` or `/docs`).
- OpenAPI 3.0 spec is exposed (e.g. `/api/docs-json` or `/docs-json`) for tooling and codegen.
- All public API routes (auth, profiles, search, chat, subscription, admin) are documented with summary, description, request/response schemas, and tags.
- Request body and query DTOs are reflected in the schema (e.g. via NestJS Swagger decorators or Zod-to-OpenAPI).
- Auth (Bearer JWT) is documented so “Authorize” in Swagger UI can be used for protected endpoints.
- Documentation stays up-to-date as part of normal development (decorators on controllers/DTOs or generated from Zod).

## Implementation notes

- **NestJS**: Use `@nestjs/swagger`; apply `DocumentBuilder` and `SwaggerModule` in `main.ts`; use `@ApiTags()`, `@ApiOperation()`, `@ApiResponse()`, `@ApiBody()`, `@ApiQuery()`, `@ApiBearerAuth()` on controllers and DTOs.
- **Auth in Swagger**: Add bearer auth security scheme in `DocumentBuilder`; annotate protected routes with `@ApiBearerAuth()`.
- **Paths**: e.g. `GET /docs` (UI), `GET /docs-json` (OpenAPI JSON). Disable or protect `/docs` in production if desired (e.g. behind env flag or admin role).
- **Optional**: Generate client SDK from OpenAPI spec for the Next.js app (e.g. openapi-typescript + fetch client).

---

**Jira**: Add a **Jira Issue** widget for this story or **Jira Issues (Filter)** for sub-tasks (e.g. `labels = swagger-documentation`).
