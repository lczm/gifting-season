# Gifting Season!

Give out more gifts, happiness for all

## Build and run

```bash
npm install
npm run serve
```

Example request:

```bash
curl -G -d 'staff_pass_id=MANAGER_3CX76CYYTIYK' http://localhost:3000/lookup | jq

```

## Test

```bash
npm run test
```

## Design and thoughts

```
- /lookup?staff_pass_id=abc
- /verify?staff_pass_id=abc
- /redeem?staff_pass_id=abc
```

- The services the receptionist desk are served as an API here, where the receptionist takes in the staff pass as verification
- Data is read and stored in a sqlite3 database, will be created automatically from the csv if it doesn't exist. It'll then use that from then on
- Access to the database is through an [ORM](https://github.com/sequelize/sequelize-typescript) backed by typescript with all it's typing goodness
- Past redemption data is stored in it's own table
- Success / Failures are indicated by their http status codes (200, 201, 404)

## Assumptions

- `created_at` stored as an `number`, for consistency as `redeemed_at` is specified to be stored as epoch milliseconds.
- When verifying, the staff shows their staff pass (`staff_pass_id`)
- Verification and redemption are to be implemented as two separate features, although redemption can function as both
- "Sending away the representative" is a 404 error
