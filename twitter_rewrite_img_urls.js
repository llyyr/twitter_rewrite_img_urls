// ==UserScript==
// @name         Twitter Rewrite Image URLs
// @namespace    https://github.com/llyyr/twitter_rewrite_img_urls
// @version      0.1
// @author       llyyr
// @description  Rewrite pbs.twimg.com urls and replace pbs.twimg.com urls on twitter.com to name=orig
// @include      https://twitter.com/*
// @include      https://pbs.twimg.com/media/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==


let url = window.location.href;


if (url.includes("https://pbs.twimg.com/media/") && !url.includes("name=orig")) {
    if (url.indexOf("?format=") > 0) {
        url = url.replace("?format=", ".");
    }

    if (url.match(/\&name=(\w+)/i)) {
        url = url.replace(/\&name=(\w+)/gi, "?name=orig");
    } else {
        url = `${url}?name=orig`;
    }

    window.location.replace(url);
}

if (url.includes("twitter.com")) {
    const root = document.evaluate("//div[@id=\"react-root\"]", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null);

    if (root.singleNodeValue) {
        let callback = function (mutations, observer) {

            for (let mutation of mutations) {
                if (mutation.target.className.includes("css-1dbjc4n")) {
                    let img_list = mutation.target.getElementsByTagName("img");

                    for (let i = 0; i < img_list.length; i++) {
                        const img_src = img_list[i].src;

                        if (img_src.includes("https://pbs.twimg.com/media/") && !img_src.includes("name=orig")) {
                            let tweet_id = ""
                            const tweet_url = img_list[i].closest("a[href*=\"/status/\"]");

                            if (tweet_url) {
                                tweet_id = "#" + tweet_url.href.match(/\/status\/(\d{5,})(?:\/|$)/i)[1];
                            } else {
                                const photo_url = url.match(/\/status\/(\d{5,})\/photo\//i);

                                if (photo_url) {
                                    tweet_id = "#" + photo_url[1];
                                }
                            }

                            img_list[i].src = img_src.replace("?format=",".").replace(/&name=(\w+)/gi,"?name=orig") + tweet_id;
                        }
                    }
                }
            }
        };

        const observer = new MutationObserver(callback);
        observer.observe(document.body, {childList: true, subtree: true});
    }
}
