## Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/PDucTrung/migrate.git
cd migrate
yarn install
```

- Create csv file csv and paste data

```bash
touch data/vnphone.csv
```
```bash
touch data/d_<groupid>.csv
```

---

## 📅 Migrate Script

### 🟢 **Usage**
```bash
yarn import-phone <file-path>

```
- Ex import phone: yarn import-phone `./data/vnphone.csv`


```bash
yarn import-user <file-path>

```
- Ex import user: yarn import-user `./data/d_100001292170616.csv`
- Note: When importing users, the file name must be in the correct format `d_<groupId>.csv`

