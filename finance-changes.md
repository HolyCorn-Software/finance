.

Activated feature to check user input, when updating payment data

Payment plugins are now supposed to pass URLs for their images, instead of Buffers

Improved layout of inline-payment-settle widget, and corrected minor bug related to censoring invalid user inputs

Improved error handling for cases where a provider fails to execute a payment

Introduced the concept of fatal errors, to allow providers prevent records from being refreshed if very serious errors come up

Improved how the inline-payment-settle widget handles retries:
    Minor retry bugs have been corrected
    It now gives the user the choice of how to retry