const TurndownService = require('turndown');
const turnDown = new TurndownService();

function getDisqusComments(threads, comment) {
    const { author } = comment;
    const thread = threads.filter(thread => thread.$['dsq:id'] === comment.thread.$['dsq:id'])[0].id;
    const reply_to = comment.parent ? comment.parent.$['dsq:id'] : null;
    const message = turnDown.turndown(comment.message.trim());
    const timestamp = comment.createdAt;
    const approved = (comment.isDeleted === "true" || comment.isSpam === "true") ? 0 : 1;

    return {
        comment: [
            thread,
            message,
            reply_to,
            timestamp,
            approved
        ],
        id: comment.$['dsq:id'],
        author: [
            'disqus',
            author.username,
            author.name,
            author.username,
            0
        ]
    };
};

function parseDisqus(data) {
    const threads = data.disqus.thread;
    const posts = data.disqus.post.map(comment => getDisqusComments(threads, comment));
    
    return posts;
}

module.exports.parse = parseDisqus;
