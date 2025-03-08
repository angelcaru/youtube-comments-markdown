// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

const UNLOADED_DELAY = 500;
const LOADED_DELAY = 50;

function main() {
    const md = markdownit();

    const commentsContainer = document.querySelector(".ytd-comments > #contents");
    if (commentsContainer === null) {
        setTimeout(() => main(), UNLOADED_DELAY);
        return;
    }

    const comments = Array.from(commentsContainer.querySelectorAll("ytd-comment-thread-renderer"));
    for (const comment of comments) {
        console.log(comment);

        // TODO: detect when a comment is edited and re-render markdown
        const attribute = "data-ytcmd-converted";
        if (comment.hasAttribute(attribute)) continue;
        comment.setAttribute(attribute, "true");
        const commentText = comment.querySelector("#content-text");

        console.log(commentText.innerText);
        const result = md.render(commentText.innerText);
        console.log(result);
        commentText.innerHTML = result;
        commentText.style.lineHeight = "2em";

        for (const code of commentText.querySelectorAll("pre code")) {
            hljs.highlightElement(code);
        }
    }

    setTimeout(() => main(), LOADED_DELAY);
}

window.addEventListener("load", () => main());
