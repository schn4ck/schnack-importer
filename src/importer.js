const fs = require('fs');
const path = require('path');
const xml2js = require('xml2js');
const sqlite = require('sqlite');
const wordpressParser = require('./parser/wordpress');
const disqusParser = require('./parser/disqus');

const dbName = process.argv[3];
if (!dbName) {
    console.error('Pass the filepath to your SQLite file as second argument');
    process.exit(1);
}
const dbPromise = sqlite.open(dbName, { Promise });
let db;

const filename = process.argv[2];
if (!filename) {
    console.error('Pass the filepath to your XML file as first argument');
    process.exit(1);
}

// Promisify readFile
async function readFile(file) {
    const promise = await new Promise((resolve, reject) => {
        fs.readFile(file, (err, data) => {
            if (err) reject(err);
            else resolve(data.toString());
        });
    });
    return promise;
};

// Promisify parse XML
async function parse(file) {
    const promise = await new Promise((resolve, reject) => {
        const parser = new xml2js.Parser({explicitArray: false});
        
        parser.parseString(file, (error, result) => {
            if (error) reject(error);
            else resolve(result); 
        });
    });
    return promise;
};

async function saveComment(post) {
    db = await dbPromise;
    const { comment, author } = post;

    if (!author[1]) {
        author[1] = 'Anonymous Guest';
    }

    try {
        await db.run(`
            INSERT INTO user (provider, provider_id, display_name, name, created_at, trusted, blocked)
            VALUES (?, ?, ?, ?, datetime(), ?, 0)
        `, author);
    } catch (err) {
        console.error(`Error saving the user:`, author);
    }

    try {
        const newUser = await db.get(`
            SELECT id, name, display_name, provider, provider_id, trusted, blocked FROM user
            WHERE provider = ? AND provider_id = ?
        `, [author[0], author[1]]);
        if (newUser.id) comment.unshift(newUser.id); // push user_id to the front
        const res = await db.run(`INSERT INTO comment
        (user_id, slug, comment, reply_to, created_at, approved, rejected)
        VALUES (?,?,?,?,?,?,0)`, comment);
        return res.lastID;
    } catch (err) {
        console.error(`Error saving the comment for the slug ${comment[0]}:`, err);
    }
};

async function processComments(posts) {
    for (post of posts) {
        const newComment = await saveComment(post);
        post.new_id = newComment;
    }

    for (post of posts) {
        const replies = posts.filter(p => p.comment[3] === post.id); // replies to current post
        if (replies) {
            for (reply of replies) {
                const { id, new_id } = post;
                const res = await db.run(`UPDATE comment SET reply_to = ? WHERE reply_to = ?`, [new_id, id]);
            }
        }
    }
};

// Main
async function run() {
    try {
        const filePath = path.resolve(__dirname, '..', filename);
        const XMLContent = await readFile(filePath)
        const content = await parse(XMLContent);

        let result;
        if (content.disqus) {
            result = disqusParser.parse(content);
        } else if (content.rss) {
            result = wordpressParser.parse(content);
        }
        return processComments(result);
    } catch (error) {
        console.error('Error parsing the file:', filename);
        console.error(error);
    }
};

run();
