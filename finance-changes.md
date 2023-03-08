.

Updated the logic that's responsible for checking if a payment is done, and made it to check if the settled amount is equal to, or more that the record's amount

Added more extensions to payment records, to support more payment methods

Improved the inline-payment-settle UX (for payment-failure, and payment-canceled)

Corrected minor bugs with the inline-payment-settle widget

Refractored code, to remove unnecessary use of the CurrencyController

Improved the working of payment plugins, by including payment method information to the validateUserInput() method.

Greatly Improved the logic of refreshing transactions

Greatly improved typing