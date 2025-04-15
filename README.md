# Cyril
A finance management desktop app created in JavaScript with Node, Electron, and React.
Tells you about, and hopefully doesn't lie about, your recent spending habits so that you can go about your day entirely self conscious about every dollar you spend.

## To Run
`npm install` (once) _or_ `npm install --platform=win32` with windows or WSL development
`npm start`
That's it.

---

## Structure
This project uses electron-forge for scaffolding and Vite to handle the dev process.

---

## Issues
Most of the development is using a Windows machine, so I had some compatibility issues between WSL and various tools. Namely, Yarn
When electron-forge upgrades, the app will silently stop working. If it claims to start successfully but no Electron window appears, check the global install of create-electron-app and potantially run `npm update -g create-electron-app`

---

## To Do
* Data storage - uploading transactions
* Look into Recharts as a library for charts
* Line chart as a default view for total account in/out
* Budgeting view, to create budgets per category
* Spending view, to see bubble chart of last week/variable time period
* API access
