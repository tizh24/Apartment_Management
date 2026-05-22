# Requirement V2 Notes

This note maps the updated requirement document to the current backend base.
The goal is to keep the codebase aligned without building every module up front.

## What is already in the backend base

- NestJS app bootstrap
- Prisma + PostgreSQL integration
- environment validation
- internal auth for admin, staff, and sale
- health check endpoint
- base user lookup service

## Main V2 decisions for the backend

### 1. Keep internal users and guest portal separate

Current `User` + `AuthModule` should stay focused on:

- `ADMIN`
- `STAFF`
- `SALE`

The guest portal should be implemented later as a separate guest-facing flow.
Do not mix guest login into the internal user table too early.

### 2. Multi-apartment support stays first-class

The requirement clearly expects the system to support more than one apartment and to filter dashboard data by apartment.
Because of that:

- internal users may be scoped to one apartment or all apartments
- business modules should always think about apartment boundaries
- new entities should include apartment linkage where it matters

### 3. Room statuses should match the V2 list

The current requirement uses five room statuses:

- `VACANT`
- `OCCUPIED`
- `RESERVED`
- `CHECKOUT_SOON`
- `MAINTENANCE`

Any legacy status outside this list should be treated as old data, not as active product scope.

### 4. Partial payment is still required

Even though one line in the revenue section simplifies status wording to unpaid/paid, the requirement still explicitly says:

- one receivable can be paid in many installments
- remaining balance must be recalculated after partial payment

So the revenue design must still support:

- receivable total amount
- amount paid
- remaining amount
- payment history entries

### 5. Sale commission belongs to contracts

The updated contract requirement explicitly says a contract may carry:

- the sale that brought the contract
- the commission for that sale

So `sales` should be built after `contracts`, not before.

## Known ambiguity to resolve before guest login implementation

The requirement document contains one conflict:

- `GUEST-03` says the default password is based on `ddmmyyyy`
- the business note later still mentions `ddmm`

Do not implement guest default password until the team chooses one rule.

## Recommended module order

Build the backend in this order:

1. `apartments`
2. `rooms`
3. `customers`
4. `contracts`
5. `receivables`
6. `payments`
7. `sales`
8. `guest`
9. `support`
10. `reviews`

AI can stay out of the MVP backend base for now.

## Why not add everything now

The team already asked to grow the project gradually.
Because of that, this repo should only keep:

- the base infrastructure
- the current auth foundation
- the minimum domain alignment needed to avoid rework later

That means we should prefer:

- clean module boundaries
- simple Prisma models first
- small migrations per feature

Instead of:

- generating every future model now
- building guest, sales, AI, and reports before the core rental flow exists

## Current migration note

The Prisma migration history in this repo is not fully clean yet.
Before creating the next real schema migration, the team should first align the local migration folders with the database state and then continue from one clear baseline.
