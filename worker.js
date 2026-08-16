const TWITCH_GQL_URL = 'https://gql.twitch.tv/gql';
const TWITCH_CLIENT_ID = 'ue6666qo983tsx6so1t0vnawi233wa';
const SHARE_CLIP_RENDER_STATUS_HASH = '0a02bb974443b576f5579aab0fef1d4b7f44e58a8a256f0c5adfead0db70640f';
const SLUG_RE = /^[A-Za-z0-9_-]{1,200}$/;

function jsonResponse(status, payload) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store'
    }
  });
}

function qualityNumber(value) {
  const number = Number.parseInt(String(value ?? ''), 10);
  return Number.isFinite(number) ? number : 0;
}

function withAccessToken(sourceUrl, signature, token) {
  const url = new URL(sourceUrl);
  url.searchParams.set('sig', signature);
  url.searchParams.set('token', token);
  return url.toString();
}

function extractClipPayload(slug, gqlPayload) {
  const first = Array.isArray(gqlPayload) ? gqlPayload[0] : gqlPayload;
  const clip = first?.data?.clip;

  if (!clip || typeof clip !== 'object') {
    const error = new Error('This Twitch clip is no longer available.');
    error.status = 404;
    throw error;
  }

  const playback = clip.playbackAccessToken || {};
  const signature = String(playback.signature || '');
  const token = String(playback.value || '');
  if (!signature || !token) {
    const error = new Error('Twitch returned no playback token for this clip.');
    error.status = 404;
    throw error;
  }

  const assets = Array.isArray(clip.assets) ? clip.assets : [];
  const defaultAsset = assets[0] && typeof assets[0] === 'object' ? assets[0] : {};
  let playable = Array.isArray(defaultAsset.videoQualities)
    ? defaultAsset.videoQualities.filter((quality) => quality && typeof quality === 'object' && quality.sourceURL)
    : [];

  if (!playable.length) {
    playable = assets.slice(1).flatMap((asset) => {
      if (!asset || typeof asset !== 'object' || !Array.isArray(asset.videoQualities)) return [];
      return asset.videoQualities.filter((quality) => quality && typeof quality === 'object' && quality.sourceURL);
    });
  }

  if (!playable.length) {
    const error = new Error('Twitch returned no playable video quality for this clip.');
    error.status = 404;
    throw error;
  }

  const best = playable.reduce((winner, quality) => {
    if (!winner) return quality;
    const qualityDelta = qualityNumber(quality.quality) - qualityNumber(winner.quality);
    if (qualityDelta !== 0) return qualityDelta > 0 ? quality : winner;
    return Number(quality.frameRate || 0) > Number(winner.frameRate || 0) ? quality : winner;
  }, null);

  return {
    slug,
    id: clip.id || slug,
    title: clip.title || '',
    durationSeconds: clip.durationSeconds ?? null,
    thumbnailUrl: defaultAsset.thumbnailURL || clip.thumbnailURL || '',
    quality: best.quality ?? null,
    frameRate: best.frameRate ?? null,
    mediaUrl: withAccessToken(String(best.sourceURL), signature, token)
  };
}

async function resolveTwitchClip(slug) {
  const body = [{
    operationName: 'ShareClipRenderStatus',
    variables: { slug },
    extensions: {
      persistedQuery: {
        version: 1,
        sha256Hash: SHARE_CLIP_RENDER_STATUS_HASH
      }
    }
  }];

  let response;
  try {
    response = await fetch(TWITCH_GQL_URL, {
      method: 'POST',
      headers: {
        'Client-ID': TWITCH_CLIENT_ID,
        'Content-Type': 'text/plain;charset=UTF-8'
      },
      body: JSON.stringify(body)
    });
  } catch (error) {
    const wrapped = new Error(`Could not reach Twitch: ${error?.message || 'network error'}`);
    wrapped.status = 502;
    throw wrapped;
  }

  if (!response.ok) {
    const error = new Error(`Twitch clip lookup returned HTTP ${response.status}.`);
    error.status = 502;
    throw error;
  }

  let payload;
  try {
    payload = await response.json();
  } catch (_) {
    const error = new Error('Twitch returned an invalid clip response.');
    error.status = 502;
    throw error;
  }

  return extractClipPayload(slug, payload);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/twitch-clip') {
      if (request.method !== 'GET') {
        return jsonResponse(405, { error: 'Method not allowed.' });
      }

      const slug = String(url.searchParams.get('slug') || '').trim();
      if (!SLUG_RE.test(slug)) {
        return jsonResponse(400, { error: 'Invalid Twitch clip slug.' });
      }

      try {
        const clip = await resolveTwitchClip(slug);
        return jsonResponse(200, clip);
      } catch (error) {
        console.error(`Twitch resolver error for ${slug}:`, error);
        return jsonResponse(error?.status || 502, {
          error: error?.message || 'Unexpected Twitch clip resolver error.'
        });
      }
    }

    if (url.pathname.startsWith('/api/')) {
      return jsonResponse(404, { error: 'Not found.' });
    }

    return env.ASSETS.fetch(request);
  }
};
