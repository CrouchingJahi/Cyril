# Cyril
A finance management desktop app created in JavaScript with Node, Electron, and React.
Tells you about, and hopefully doesn't lie about, your recent spending habits so that you can go about your day entirely self conscious about every dollar you spend.

This app saves all data locally and does NOT send it anywhere else. It doesn't connect to the internet, and currently depends on the user uploading their own .qfx/.csv files.

## To Run
`npm install` (once) _or_ `npm install --platform=win32` with windows or WSL development

`npm start`

That's it.

---

## Structure
This project uses electron-forge for scaffolding and Vite to handle the dev process.

---

## Issues
Most of the development is using a Windows machine, so I had some compatibility issues between WSL and various tools.

When electron-forge upgrades, the app will silently stop working. If it claims to start successfully but no Electron window appears, check the global install of create-electron-app and potentially run `npm update -g create-electron-app`

React DevTools issues - https://github.com/electron/electron/issues/41613

---

## To Do
* Create dedicated svg for bullet points, radio buttons, checkmarks
* Settings - Need to figure out best way to update new view of transactions after adding or deleting
* CategoryDisplay - Fancify and add animations
* Check D3 collapsible tree as interface for CategoryDisplay
* Initial Window settings - check screen aspect ratio for vertical screens, create max dimensions
* Default categories and potentially other settings - and options to reset to default or full clear
* Line chart as a default view for total account in/out
* Budgeting view, to create budgets per category
* Spending view, to see bubble chart of last week/variable time period
