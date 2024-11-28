## Base: /fund

| **Endpoint**              | **Method** | **Description**                                                      | **Request Body**                            | **Response**                                          |
| ------------------------- | ---------- | -------------------------------------------------------------------- | ------------------------------------------- | ----------------------------------------------------- |
| `/funds`                  | `GET`      | Fetch all funds from the Fund table.                                 | None                                        | `200 OK` with list of funds in `data`                 |
| `/fundsLarger/:threshold` | `GET`      | Fetch funds where the balance is larger than the provided threshold. | `threshold` (in URL)                        | `200 OK` with list of funds above threshold in `data` |
| `/:fundID`                | `DELETE`   | Delete a fund by its ID.                                             | None                                        | `200 OK` if success, `500` if failure                 |
| `/initiate`               | `POST`     | Initialize the Fund table (drop and recreate).                       | None                                        | `200 OK` if success, `500` if failure                 |
| `/insert`                 | `POST`     | Insert a new fund into the Fund table.                               | `purpose`, `balance`, `verification` (body) | `200 OK` if success, `500` if failure                 |
| `/update`                 | `POST`     | Update a fund’s balance based on its ID.                             | `fundId`, `newBalance` (body)               | `200 OK` if success, `500` if failure                 |
| `/count`                  | `GET`      | Get the count of funds in the Fund table.                            | None                                        | `200 OK` with fund count in `count`, `500` if failure |

## Base: /indFund

| **Endpoint**  | **Method** | **Description**                                                                                                     | **Request Body**                                                             | **Response**                                                     |
| ------------- | ---------- | ------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------- | ---------------------------------------------------------------- |
| `/individual` | `GET`      | Fetch all individual funds from the IndividualFund table.                                                           | None                                                                         | `200 OK` with list of individual funds in `data`                 |
| `/initiate`   | `POST`     | Initialize the IndividualFund table (drop and recreate).                                                            | None                                                                         | `200 OK` if success, `500` if failure                            |
| `/insert`     | `POST`     | Insert a new individual fund into the IndividualFund table. Requires authentication.                                | `purpose`, `balance`, `verification`, `ssn` (body)                           | `200 OK` if success, `500` if failure                            |
| `/update`     | `POST`     | Update an individual fund’s details (purpose, balance, verification, SSN) based on its ID. Requires authentication. | `fundId`, `purpose`, `balance`, `verification`, `newSSN`, `userEmail` (body) | `200 OK` if success, `500` if failure                            |
| `/counts`     | `GET`      | Get the count of individual funds in the IndividualFund table.                                                      | None                                                                         | `200 OK` with individual fund count in `count`, `500` if failure |

## Base: /org

| **Endpoint**           | **Method** | **Description**                                                    | **Request Body**                                                       | **Response**                                                               |
| ---------------------- | ---------- | ------------------------------------------------------------------ | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| `/signup`              | `POST`     | Sign up a new organization.                                        | `email`, `password`, `name`, `field`, `address`, `verification` (body) | `200 OK` if success, `500` if failure                                      |
| `/login`               | `POST`     | Login an organization.                                             | `email`, `password` (body)                                             | `200 OK` with authentication token, `401` if failure                       |
| `/check-db-connection` | `GET`      | Check if the database connection is successful.                    | None                                                                   | `200 OK` if connected, `500` if unable to connect                          |
| `/projection`          | `GET`      | Fetch specific columns of organizations (projection).              | `columns` (array in body)                                              | `200 OK` with selected columns in `data`, `400` if no columns are provided |
| `/organizations`       | `GET`      | Fetch all organizations from the VolunteerOrganization table.      | None                                                                   | `200 OK` with list of organizations in `data`                              |
| `/initiate`            | `POST`     | Initialize the VolunteerOrganization table (drop and recreate).    | None                                                                   | `200 OK` if success, `500` if failure                                      |
| `/insert`              | `POST`     | Insert a new organization into the VolunteerOrganization table.    | `email`, `password`, `name`, `field`, `address`, `verification` (body) | `200 OK` if success, `500` if failure                                      |
| `/update`              | `POST`     | Update an organization's address based on their email.             | `email`, `newAddress`, `name`, `field` (body)                          | `200 OK` if success, `500` if failure                                      |
| `/counts`              | `GET`      | Get the count of organizations in the VolunteerOrganization table. | None                                                                   | `200 OK` with organization count in `count`, `500` if failure              |

## Base: /orgFund

| **Endpoint**          | **Method** | **Description**                                                                                                               | **Request Body**                                                  | **Response**                                                       |
| --------------------- | ---------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------- | ------------------------------------------------------------------ |
| `/organization-funds` | `GET`      | Fetch all organization funds from the OrganizationFund table.                                                                 | None                                                              | `200 OK` with list of organization funds in `data`                 |
| `/initiate`           | `POST`     | Initialize the OrganizationFund table (drop and recreate).                                                                    | None                                                              | `200 OK` if success, `500` if failure                              |
| `/insert`             | `POST`     | Insert a new organization fund into the OrganizationFund table. Requires authentication.                                      | `purpose`, `balance`, `verification`, `taxID` (body)              | `200 OK` if success, `500` if failure                              |
| `/update`             | `POST`     | Update an organization fund’s details (purpose, balance, verification, tax ID) based on its fund ID. Requires authentication. | `fundId`, `purpose`, `balance`, `verification`, `newTaxID` (body) | `200 OK` if success, `500` if failure                              |
| `/counts`             | `GET`      | Get the count of organization funds in the OrganizationFund table.                                                            | None                                                              | `200 OK` with organization fund count in `count`, `500` if failure |

## Base: /transactions

| **Endpoint**         | **Method** | **Description**                                                                                   | **Request Body**                                                                                | **Response**                                                 |
| -------------------- | ---------- | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------ |
| `/`                  | `GET`      | Fetch all transactions from the Transaction table.                                                | None                                                                                            | `200 OK` with list of transactions in `data`                 |
| `/:userEmail`        | `GET`      | Fetch all transactions for a specific user based on their email.                                  | `userEmail` (in URL)                                                                            | `200 OK` with user’s transactions in `data`                  |
| `/userDonatedAll`    | `GET`      | Fetch users who have donated to all available funds.                                              | None                                                                                            | `200 OK` with list of users who donated to all funds         |
| `/initiate`          | `POST`     | Initialize the Transaction table (drop and recreate).                                             | None                                                                                            | `200 OK` if success, `500` if failure                        |
| `/findFundsAboveAvg` | `GET`      | Find funds with transaction totals above the overall average.                                     | None                                                                                            | `200 OK` with list of funds in `data`                        |
| `/insert`            | `POST`     | Insert a new transaction into the Transaction table. Requires authentication.                     | `amount`, `transactionDate`, `content`, `userEmail`, `fundID`, `organizationEmail` (body)       | `200 OK` if success, `500` if failure                        |
| `/update`            | `POST`     | Update a transaction’s details (amount, date, content, user, fund, organization) based on its ID. | `id`, `amount`, `transactionDate`, `content`, `userEmail`, `fundID`, `organizationEmail` (body) | `200 OK` if success, `500` if failure                        |
| `/count`             | `GET`      | Get the count of transactions in the Transaction table.                                           | None                                                                                            | `200 OK` with transaction count in `count`, `500` if failure |

## Base: /users

| **Endpoint**           | **Method** | **Description**                                    | **Request Body**                                  | **Response**                                          |
| ---------------------- | ---------- | -------------------------------------------------- | ------------------------------------------------- | ----------------------------------------------------- |
| `/signup`              | `POST`     | Sign up a new user.                                | `email`, `password`, `name`, `phoneNumber` (body) | `200 OK` if success, `500` if failure                 |
| `/login`               | `POST`     | Login a user.                                      | `email`, `password` (body)                        | `200 OK` with authentication token, `401` if failure  |
| `/check-db-connection` | `GET`      | Check if the database connection is successful.    | None                                              | `200 OK` if connected, `500` if unable to connect     |
| `/users`               | `GET`      | Fetch all users from the Users table.              | None                                              | `200 OK` with list of users in `data`                 |
| `/initiates`           | `POST`     | Initialize the Users table (drop and recreate).    | None                                              | `200 OK` if success, `500` if failure                 |
| `/search-users`        | `POST`     | Search for users based on the provided conditions. | `conditions` (body)                               | `200 OK` with list of matching users in `data`        |
| `/insert-user`         | `POST`     | Insert a new user into the Users table.            | `email`, `password`, `name`, `phoneNumber` (body) | `200 OK` if success, `500` if failure                 |
| `/update-user-phone`   | `POST`     | Update a user's phone number based on their email. | `email`, `newPhoneNumber` (body)                  | `200 OK` if success, `500` if failure                 |
| `/counts`              | `GET`      | Get the count of users in the Users table.         | None                                              | `200 OK` with user count in `count`, `500` if failure |
