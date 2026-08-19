// ==UserScript==
// @name         Twitter Rewrite Image URLs
// @namespace    https://github.com/llyyr/twitter_rewrite_img_urls
// @downloadURL  https://github.com/llyyr/twitter_rewrite_img_urls/raw/master/twitter_rewrite_img_urls.js
// @updateURL    https://github.com/llyyr/twitter_rewrite_img_urls/raw/master/twitter_rewrite_img_urls.js
// @version      0.2.0
// @author       llyyr
// @description  Rewrite pbs.twimg.com image URLs to their original size
// @include      https://x.com/*
// @include      https://twitter.com/*
// @include      https://pbs.twimg.com/media/*
// @run-at       document-end
// @grant        none
// @license      MIT
// ==/UserScript==

/*
0.2.0 - 19-08-2026:
    Rewrite

0.1.2 - 18-05-2024:
    Fix muskrat induced breakage.

0.1.1 - 29-11-2023:
    Fix script not working anymore due to Twitter changing class ids.

0.1 - 30-07-2022:
    Initial version
*/

(function() {
    'use strict';

    const MEDIA_RE = /pbs\.twimg\.com\/media\//;
    function rewrite_url(src) {
        if (!MEDIA_RE.test(src))
            return src;
        const url = new URL(src);
        url.searchParams.set('name', 'orig');
        return url.toString();
    }

    function get_tweet_id(img) {
        const link = img.closest('a[href*="/status/"]');
        const match = (link && link.href.match(/\/status\/(\d{5,})(?:\/|$)/i)) ||
            location.pathname.match(/\/status\/(\d{5,})(?:\/photo\/|\/video\/|$)/i);
        return match ? match[1] : null;
    }

    function rewrite_image(img) {
        if (img.__rewrite_done)
            return;
        img.__rewrite_done = true;
        const src = img.currentSrc || img.src;
        const url = rewrite_url(src);
        if (url === src)
            return;
        const tweet_id = get_tweet_id(img);
        img.src = tweet_id ? `${url}#${tweet_id}` : url;
    }

    function process_node(node) {
        if (node.nodeType !== Node.ELEMENT_NODE)
            return;
        if (node.tagName === 'IMG') {
            rewrite_image(node);
        } else {
            node.querySelectorAll('img').forEach(rewrite_image);
        }
    }

    if (/^(.+?\.)?(twitter|x)\.com$/.test(location.host)) {
        document.querySelectorAll('img').forEach(rewrite_image);
        new MutationObserver(mutations => {
            for (const { addedNodes, target } of mutations) {
                addedNodes.forEach(process_node);
                process_node(target);
            }
        }).observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['src']
        });
    } else if (location.host === 'pbs.twimg.com' && !location.href.includes(':orig')) {
        const url = rewrite_url(location.href);
        if (url !== location.href)
            location.replace(url);
    }
})();
