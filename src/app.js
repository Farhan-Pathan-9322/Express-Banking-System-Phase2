const express = require('express');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json()); 

const port = 3000;

let accounts = [];
let accountCounter = 1;

const generateAccountId = () => (accountCounter++).toString();
const findAccount = (accountId) => accounts.find(account => account.accountId === accountId);


// Create an account
app.post('/create-account', (req, res) => {
    const { name, initialBalance } = req.body;

    if (!name || typeof initialBalance !== 'number' || initialBalance < 0) {
        return res.status(400).json({ error: 'Invalid account data' });
    }

    const accountId = generateAccountId();
    const newAccount = {
        accountId,
        name,
        balance: initialBalance,
        transactions: []
    };

    accounts.push(newAccount);
    res.status(201).json({ message: 'Account created successfully', accountId });
});

// View account balance
app.get('/account/:accountId/balance', (req, res) => {
    const { accountId } = req.params;

    const account = findAccount(accountId);
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }

    res.status(200).json({ accountId, balance: account.balance });
});

// Transfer money
app.post('/transfer', (req, res) => {
    const { fromAccountId, toAccountId, amount } = req.body;

    if (!fromAccountId || !toAccountId || typeof amount !== 'number' || amount <= 0) {
        return res.status(400).json({ error: 'Invalid transfer data' });
    }

    const fromAccount = findAccount(fromAccountId);
    const toAccount = findAccount(toAccountId);

    if (!fromAccount || !toAccount) {
        return res.status(404).json({ error: 'One or both accounts not found' });
    }

    if (fromAccount.balance < amount) {
        return res.status(400).json({ error: 'Insufficient balance in the sender account' });
    }

    fromAccount.balance -= amount;
    toAccount.balance += amount;

    
    const date = new Date();
    fromAccount.transactions.push({ type: 'Debit', amount, to: toAccountId, date });
    toAccount.transactions.push({ type: 'Credit', amount, from: fromAccountId, date });

    res.status(200).json({ message: 'Transfer successful', fromAccountBalance: fromAccount.balance });
});

// Transaction history of an account
app.get('/account/:accountId/transactions', (req, res) => {
    const { accountId } = req.params;

    const account = findAccount(accountId);
    if (!account) {
        return res.status(404).json({ error: 'Account not found' });
    }

    res.status(200).json({ accountId, transactions: account.transactions });
});

app.listen(port, () => {
    console.log(`Banking application server is running on port ${port}`);
});
