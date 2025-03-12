// This script gets injected into any opened page
// whose URL matches the pattern defined in the manifest
// (see "content_script" key).
// Several foreground scripts can be declared
// and injected into the same or different pages.

function renderHTMLAsDiv(html) {
    const div = document.createElement("div");
    div.innerHTML = DOMPurify.sanitize(html);
    return div;
}

function renderComment(md, comment) {
    // TODO: detect when a comment is edited and re-render markdown
    const attribute = "data-ytcmd-converted";
    if (comment.hasAttribute(attribute)) return;
    comment.setAttribute(attribute, "true");
    const commentText = comment.querySelector("#content-text");
    if (commentText === null) {
        console.log("Didn't find #content-text. Early return");
        return;
    }

    const result = md.render(commentText.innerText);
    const div = renderHTMLAsDiv(result);
    commentText.replaceWith(div);
    div.style.lineHeight = "1.7em";
    div.style.fontSize = "1.4rem";

    for (const element of div.querySelectorAll("*")) {
        if (element.tagName.toLowerCase() === "a") {
            element.style.color = '#3ea6ff';
        } else {
            element.style.color = "var(--yt-spec-text-primary)";
        }
    }
    for (const link of div.querySelectorAll("a")) {
        link.classList.add("yt-core-attributed-string__link");
        link.classList.add("yt-core-attributed-string__link--call-to-action-color");
    }
    for (const code of div.querySelectorAll("pre code")) {
        hljs.highlightElement(code);
    }
}

// https://www.youtube.com/redirect?event=comments&redir_token=QUFFLUhqblhjcVljbldYX19wSUMtWDRzZ0tBbXZ5M2hKZ3xBQ3Jtc0tubWpKUDNMcnBwbEx2UnNfLUFESFNocEFld3ZDNm5udWtyUTdQNWFIeTllbG12czBBajJWamw1VFM0SFBuYk5OckhnNGZ0M2J1VkxLTXV1VzhpYWtxY2tvV01mN3Rrc0t3WS1yOXM3dmkzMUZGNjdINA&q=https%3A%2F%2Fraw.githubusercontent.com%2Fangelcaru%2Fyoutube-comments-markdown%2Frefs%2Fheads%2Fmaster%2Fscreenshot.png
// https://www.youtube.com/redirect?event=comments&q=https%3A%2F%2Fraw.githubusercontent.com%2Fangelcaru%2Fyoutube-comments-markdown%2Frefs%2Fheads%2Fmaster%2Fscreenshot.png
function intoYoutubeRedirectURL(url) {
    return `https://www.youtube.com/redirect?event=comments&q=${encodeURI(url)}`;
}

const UNLOADED_DELAY = 500;
const LOADED_DELAY = 50;

function main() {
    const md = markdownit({
        html: true,
        breaks: true,
    });

    const commentsContainer = document.querySelector(".ytd-comments > #contents");
    if (commentsContainer === null) {
        setTimeout(() => main(), UNLOADED_DELAY);
        return;
    }

    const comments = Array.from(commentsContainer.querySelectorAll("ytd-comment-thread-renderer"));
    for (const comment of comments) {
        renderComment(md, comment);
        for (const reply of comment.parentElement.querySelectorAll("ytd-comment-view-model")) {
            renderComment(md, reply);
        }
    }

    setTimeout(() => main(), LOADED_DELAY);
}

window.addEventListener("load", () => main());
