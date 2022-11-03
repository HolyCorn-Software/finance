
    Removed unnecessary logging

    Corrected race condition bug, that led to "loss" of money, by serializing execution of payment records.
    The bug is simple: If the execute method is called twice, it is likely that two external transactions are created, and the client pays for the one which the system doesn't know about