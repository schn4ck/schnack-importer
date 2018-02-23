# schnack importer

Import comments from Disqus and Wordpress XML dumps to [schnack](https://schnack.cool)!

## Installation

### Using Node.js >= v9:

Install the module locally or globally (`-g`):

```
npm install @schnack/importer
```

### Using npx (npm >= 5.2)

It is possible to use [npx](https://www.npmjs.com/package/npx) and [node-bin](https://www.npmjs.com/package/node-bin) to **directly** run the *schnack-importer* **without installation**:

```
npx -p node-bin@9 npx @schnack/importer dump.xml comments.db
```

## Usage

Prerequisites:
- An SQLite database file should be already be created running *schnack*. This script will not create the database and the necessary tables.
- *schnack* should not be running. SQLite accepts one connection at time.

Run:
```
schnack-importer dump.xml comments.db
```
