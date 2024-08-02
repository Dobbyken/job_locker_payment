# NestJS - Payment Module

> Please help with create APIs using `NestJS` with `TypeScript`

## Required Programming Language

- TypeScript

## Required Library & Tools

- NestJS
- @nestjs/mongoose
- MongoDB
- Stripe

## What I wanted

1. Purchase Products
2. Subscribe for services - Billed Monthly | Yearly (I need both as a option for clients)
3. A complete purchase work flow using Stripe `embedding payment form`
4. A UML of complete purchase work flow
5. This is for my website to checkout products
6. Also I need subscription base checkout and management
7. Create a frontend for testing purpose inside `./test` folder
8. Please create your own Stripe Account for development

## Additional Scenarios Needed

1. Refund Functions for purchase
2. Confirm payment
3. Manage Subscription

## Requirement

1. Complete tasks by using this template of `NestJS`
2. Create Swagger UI as Documentation
3. Put mandatory keys inside `.env.example`
4. Comment brief explanation on source code
5. Neat and maintainable code
6. Submit to review within 4 days
7. Complete this job within 6 days
8. Submit works via create pull request to [github]() and let me review the code before accepting your works

```zsh
# APIs
src/modules
└── payment
    ├── api.controller.ts
    ├── api.module.ts
    └── api.service.ts

# Schema
src/schema
├── base.schema.ts
└── *.schema.ts
```

---

## Entity

- Database name: `main`

### Examples to follow

`src/schema/examples/*.schema.ts`

---

### .env

| Key             | Value        |
| --------------- | ------------ |
| MongoDB_Url     | {{url}}      |
| MongoDB_Port    | {{port}}     |
| MongoDB_User    | {{user}}     |
| MongoDB_Pw      | {{password}} |
| MongoDB_DB_Name | main         |
| JWT_SECRET      | {{Secret}}   |
| EMAIL_USER      | {{User}}     |
| EMAIL_PASS      | {{Password}} |

** Add Stripe Keys

## Reminder

1. Create a new branch `dev` to do you development

## What you have to submit

1. Push the solution branch to github and create pull request to `main` branch
2. Swagger UI for API testing
