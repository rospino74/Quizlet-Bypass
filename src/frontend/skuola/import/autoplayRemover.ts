// Copyright 2021-2023 rospino74 and contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

function observerCallback(mutations: MutationRecord[], observer: MutationObserver) {
    mutations.forEach((mutation) => {
        const videoElement = mutation.addedNodes[0] as HTMLVideoElement;
        if (videoElement && videoElement.tagName === 'VIDEO') {
            setTimeout(() => {
                const playBtn = videoElement.parentElement?.querySelector<HTMLButtonElement>('.vjs-play-control.vjs-playing');
                playBtn?.click();

                // Close the mini player
                const closeMiniPlayerBtn = videoElement.parentElement?.parentElement?.parentElement?.parentElement?.querySelector<HTMLButtonElement>('.sknet-sticky-close-button');
                closeMiniPlayerBtn?.click();

                // Mute the video
                videoElement.muted = true;

                // Remove autoplay attribute
                videoElement.removeAttribute('autoplay');
                videoElement.autoplay = false;

                // Pause the video
                videoElement.pause();

                if (!import.meta.env.PROD) {
                    console.log(chrome.i18n.getMessage('foundVideoElement'), videoElement);
                }

                observer.disconnect();
            }, 500);
        }
    });
}

export default function manipulateVideoAds() {
    const videoContainers = document.querySelectorAll<HTMLDivElement>('#video_ads');

    if (!import.meta.env.PROD && videoContainers.length > 0) {
        console.log(chrome.i18n.getMessage('foundMultipleVideoElement'), videoContainers.length, videoContainers);
    }

    // Iterate over all video ads to add a ready event listener
    videoContainers.forEach(videoAd => {
        const observer = new MutationObserver(observerCallback);

        // Add the video element to the observer
        observer.observe(videoAd, { childList: true, subtree: true });
    });
}
