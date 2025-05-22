## Setup Instructions

### Clone the Repository
```bash
git clone https://github.com/PDucTrung/migrate.git
cd migrate
yarn install
```

- Create csv file csv and paste data ex:

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

```bash
yarn import-page ./data/page.csv

```

```bash
yarn import-page-meta ./data/page_meta.csv

```

```bash
yarn import-page-config-brandfits ./data/page_config_brandfits.csv

```

```bash
yarn import-comment ./data/comment.csv

```

```bash
yarn import-comment-meta ./data/comment_meta.csv

```

```bash
yarn import-post ./data/post.csv

```

```bash
yarn import-post-meta ./data/post_menta.csv

```

```bash
yarn import-post-crawl-daily ./data/post_crawl_daily.csv

```

```bash
yarn import-posts-id-crawl-daily ./data/posts_id_crawl_daily.csv

```