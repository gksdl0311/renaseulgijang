#!/usr/bin/env python3
"""Refresh the official channel's public /videos uploads tab; never download videos.

Run from any directory with: python3 scripts/sync-youtube-videos.py
Requires verified HTTPS access to www.youtube.com. The output is replaced only
after every uploads-tab continuation has been fetched and validated. Shorts and
live-stream tabs are outside this catalogue's scope.
"""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import re
import sys
import tempfile
from urllib.error import HTTPError, URLError
from urllib.parse import urlencode, urlsplit
from urllib.request import Request, urlopen

CHANNEL_URL = "https://www.youtube.com/@SopranoRena/videos"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/132.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
}


def fetch(url, body=None, headers=None):
    request = Request(url, data=body, headers={**HEADERS, **(headers or {})})
    # urlopen uses Python's default verified TLS context and configured proxy.
    with urlopen(request, timeout=45) as response:
        return response.read().decode("utf-8")


def assigned_json_maps(html, expression):
    decoder = json.JSONDecoder()
    maps = []
    for match in re.finditer(expression, html):
        try:
            value, _ = decoder.raw_decode(html[match.end():].lstrip())
            if isinstance(value, dict):
                maps.append(value)
        except json.JSONDecodeError:
            continue
    if not maps:
        raise ValueError("The official channel page did not contain the expected public metadata.")
    return maps


def text(value):
    if not isinstance(value, dict):
        raise ValueError("An upload has a malformed canonical title.")
    if "simpleText" in value:
        if not isinstance(value["simpleText"], str):
            raise ValueError("An upload has a malformed canonical title.")
        return value["simpleText"]
    runs = value.get("runs", [])
    if not isinstance(runs, list) or any(not isinstance(run, dict) or not isinstance(run.get("text", ""), str) for run in runs):
        raise ValueError("An upload has malformed canonical title text runs.")
    return "".join(run.get("text", "") for run in runs)


def parse_page(items):
    if not isinstance(items, list) or not items:
        raise ValueError("An uploads page was empty or malformed; completeness could not be established.")
    videos = []
    continuations = []
    for item in items:
        if not isinstance(item, dict):
            raise ValueError("An uploads item was malformed; no partial catalogue was saved.")
        node = item
        if "richItemRenderer" in item:
            wrapper = item["richItemRenderer"]
            wrappers = {key for key in item if key.endswith(("Renderer", "ViewModel"))}
            if wrappers != {"richItemRenderer"} or not isinstance(wrapper, dict):
                raise ValueError("An uploads item has an ambiguous or malformed wrapper.")
            node = wrapper.get("content", {})
        if not isinstance(node, dict):
            raise ValueError("An uploads item has malformed renderer content.")
        # Inspect each uploads-grid entry rather than recursively finding only
        # known videos: new lockupViewModel/gridVideoRenderer formats must fail
        # closed, so they can never be silently omitted from a complete list.
        renderer_keys = {key for key in node if key.endswith(("Renderer", "ViewModel"))}
        if renderer_keys not in ({"videoRenderer"}, {"continuationItemRenderer"}):
            raise ValueError(f"Unsupported uploads renderer {', '.join(sorted(renderer_keys)) or 'unknown'}; no partial catalogue was saved.")
        if "videoRenderer" in node:
            renderer = node["videoRenderer"]
            if not isinstance(renderer, dict):
                raise ValueError("An upload has a malformed video renderer.")
            video_id = renderer.get("videoId", "")
            title = text(renderer.get("title", {})).strip()
            if not isinstance(video_id, str) or not re.fullmatch(r"[A-Za-z0-9_-]{11}", video_id) or not title:
                raise ValueError("An upload has an invalid video ID or missing canonical title.")
            videos.append({"id": video_id, "title": title})
        if "continuationItemRenderer" in node:
            continuation = node["continuationItemRenderer"]
            if not isinstance(continuation, dict):
                raise ValueError("An uploads continuation was malformed.")
            token = continuation.get("continuationEndpoint", {}).get("continuationCommand", {}).get("token")
            if not isinstance(token, str) or not token.strip():
                raise ValueError("An uploads continuation was present but its token could not be read.")
            continuations.append(token)
    if not videos:
        raise ValueError("An uploads page contained no supported videos; completeness could not be established.")
    continuations = list(dict.fromkeys(continuations))
    if len(continuations) > 1:
        raise ValueError("The uploads grid returned multiple unexpected continuation branches.")
    return videos, continuations[0] if continuations else None


def fetch_uploads():
    html = fetch(CHANNEL_URL + "?hl=en&gl=US")
    initial = assigned_json_maps(html, r"(?:var\s+ytInitialData\s*=|window\[['\"]ytInitialData['\"]\]\s*=)\s*")[0]
    config = {}
    for fragment in assigned_json_maps(html, r"ytcfg\.set\(\s*"):
        for key in ("INNERTUBE_API_KEY", "INNERTUBE_CONTEXT", "INNERTUBE_CONTEXT_CLIENT_NAME"):
            if key in fragment:
                config[key] = fragment[key]
    tabs = initial.get("contents", {}).get("twoColumnBrowseResultsRenderer", {}).get("tabs", [])
    selected_tab = next((tab.get("tabRenderer", {}) for tab in tabs if tab.get("tabRenderer", {}).get("selected")), None)
    if not selected_tab or "content" not in selected_tab:
        raise ValueError("The public uploads tab is unavailable; existing website metadata was preserved.")
    tab_url = selected_tab.get("endpoint", {}).get("commandMetadata", {}).get("webCommandMetadata", {}).get("url", "")
    if not isinstance(tab_url, str) or not urlsplit(tab_url).path.rstrip("/").endswith("/videos"):
        raise ValueError("The selected tab could not be confirmed as /videos uploads; Shorts and live tabs are excluded.")

    context = config.get("INNERTUBE_CONTEXT")
    if not isinstance(context, dict) or not isinstance(context.get("client"), dict) or not context["client"].get("clientVersion"):
        raise ValueError("The public channel page has no continuation client context.")
    context["client"]["hl"] = "en"
    context["client"]["gl"] = "US"
    api_key = config.get("INNERTUBE_API_KEY")
    endpoint = "https://www.youtube.com/youtubei/v1/browse"
    if api_key:
        endpoint += "?" + urlencode({"key": api_key})

    grid = selected_tab["content"].get("richGridRenderer")
    if not isinstance(grid, dict):
        raise ValueError("The uploads tab did not contain a supported rich grid.")
    if any(key.lower().startswith("continuation") for key in grid):
        raise ValueError("The uploads grid used an unsupported continuation format; no partial catalogue was saved.")
    content = grid.get("contents")
    videos = []
    seen_ids = set()
    seen_tokens = set()
    pages = 0
    while True:
        pages += 1
        page_videos, continuation = parse_page(content)
        for video in page_videos:
            if video["id"] not in seen_ids:
                videos.append(video)
                seen_ids.add(video["id"])
        if not continuation:
            break
        if continuation in seen_tokens or pages >= 1000:
            raise ValueError("The uploads pagination did not terminate; no partial catalogue was saved.")
        seen_tokens.add(continuation)
        response = json.loads(fetch(endpoint, json.dumps({"context": context, "continuation": continuation}).encode("utf-8"), {
            "Content-Type": "application/json",
            "Origin": "https://www.youtube.com",
            "X-Youtube-Client-Name": str(config.get("INNERTUBE_CONTEXT_CLIENT_NAME", 1)),
            "X-Youtube-Client-Version": context["client"]["clientVersion"],
        }))
        if not isinstance(response, dict) or response.get("error"):
            raise ValueError("YouTube rejected a continuation request; no partial catalogue was saved.")
        actions = response.get("onResponseReceivedActions") or response.get("onResponseReceivedEndpoints") or []
        grids = [
            action[key]["continuationItems"]
            for action in actions
            for key in ("appendContinuationItemsAction", "reloadContinuationItemsCommand")
            if key in action and "continuationItems" in action[key]
        ]
        if len(grids) != 1 or not isinstance(grids[0], list) or not grids[0]:
            raise ValueError("A continuation response had no unambiguous nonempty uploads grid.")
        content = grids[0]
    if not videos:
        raise ValueError("No public uploads were returned; existing website metadata was preserved.")
    metadata = initial.get("metadata", {}).get("channelMetadataRenderer", {})
    return {
        "source": CHANNEL_URL,
        "channelHandle": "@SopranoRena",
        "provenance": "Canonical titles and video IDs fetched from the official public channel uploads tab.",
        "scope": "Public /videos uploads tab; Shorts and live-stream tabs are excluded.",
        "channelId": metadata.get("externalId"),
        "fetchedAt": datetime.now(timezone.utc).isoformat(),
        "complete": True,
        "pagesFetched": pages,
        "videos": videos,
    }


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--output", type=Path, default=Path(__file__).resolve().parents[1] / "src/data/videos.json")
    args = parser.parse_args()
    try:
        catalogue = fetch_uploads()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode="w", encoding="utf-8", dir=args.output.parent, delete=False) as output:
            json.dump(catalogue, output, ensure_ascii=False, indent=2)
            output.write("\n")
            temporary = Path(output.name)
        temporary.replace(args.output)
        print(f"Saved {len(catalogue['videos'])} verified public uploads from {catalogue['pagesFetched']} complete page(s).")
        print(f"Source: {CHANNEL_URL}")
    except (HTTPError, URLError, ValueError, KeyError) as error:
        print(f"Could not refresh public channel metadata: {error}", file=sys.stderr)
        print("The existing video catalogue was preserved. Resolve the reported access or metadata-format error before retrying.", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
