function getWPAuthor(comment) {
    return [
        'wordpress',
        comment['wp:comment_author'],
        comment['wp:comment_author'],
        comment['wp:comment_author'],
        0                   
    ];
}

function getWPComment(thread, comment) {
    return [
        thread['wp:post_name'],                                    
        comment['wp:comment_content'],
        comment['wp:comment_parent'],
        comment['wp:comment_date'],
        comment['wp:comment_approved']
    ];
}

function formatWPComment(comment, thread) {
    return {
        author: getWPAuthor(comment),
        comment: getWPComment(thread, comment),
        id: comment['wp:comment_id']
    };
}

function parseWP(data) {
    const items = data.rss.channel.item;
    let threads;
    if (items.length) {
        threads = items;
    } else {
        threads = [ items ];
    }

    for (thread of threads) {
        const comments = thread['wp:comment'];
        if (comments) {
            if (comments.length) {
                const formatted = comments.map(comment => formatWPComment(comment, thread));
                return formatted;
            } else {
                const formatted = formatWPComment(comments, thread);
                return [formatted];
            }
        }
    }
}

module.exports.parse = parseWP;
