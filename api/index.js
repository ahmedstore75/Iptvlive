const express = require('express');
const fetch = require('node-fetch');
const app = express();

// আপনার চ্যানেলগুলোর লিস্ট
const CHANNELS = {
  "ananda-tv": "https://playztv-apps.pages.dev/ananda-tv/index.m3u8",
  "asian-tv": "https://playztv-apps.pages.dev/asian-tv/index.m3u8",
  "atn-bangla": "https://playztv-apps.pages.dev/atn-bangla/index.m3u8",
  "bijoy-tv": "https://playztv-apps.pages.dev/bijoy-tv/index.m3u8",
  "boishakhi-tv": "https://playztv-apps.pages.dev/boishakhi-tv/index.m3u8",
  "btv": "https://playztv-apps.pages.dev/btv/index.m3u8",
  "btv-world": "https://playztv-apps.pages.dev/btv-world/index.m3u8",
  "channel-9": "https://playztv-apps.pages.dev/channel-9/index.m3u8",
  "channel-i": "https://playztv-apps.pages.dev/channel-i/index.m3u8",
  "desh-tv": "https://playztv-apps.pages.dev/desh-tv/index.m3u8",
  "duronto-tv": "https://playztv-apps.pages.dev/duronto-tv/index.m3u8",
  "maasranga-tv": "https://playztv-apps.pages.dev/maasranga-tv/index.m3u8",
  "my-tv": "https://playztv-apps.pages.dev/my-tv/index.m3u8",
  "ntv": "https://playztv-apps.pages.dev/ntv/index.m3u8",
  "nagorik-tv": "https://playztv-apps.pages.dev/nagorik-tv/index.m3u8",
  "saamtv": "https://playztv-apps.pages.dev/saamtv/index.m3u8",
  "somoy-tv": "https://playztv-apps.pages.dev/somoy-tv/index.m3u8",
  "independent-tv": "https://playztv-apps.pages.dev/independent-tv/index.m3u8",
  "channel-24": "https://playztv-apps.pages.dev/channel-24/index.m3u8",
  "ekattor-tv": "https://playztv-apps.pages.dev/ekattor-tv/index.m3u8",
  "jamuna-tv": "https://playztv-apps.pages.dev/jamuna-tv/index.m3u8",
  "dbc-news": "https://playztv-apps.pages.dev/dbc-news/index.m3u8",
  "atn-news": "https://playztv-apps.pages.dev/atn-news/index.m3u8",
  "news-24": "https://playztv-apps.pages.dev/news-24/index.m3u8",
  "tsports": "https://playztv-apps.pages.dev/tsports/index.m3u8",
  "gazi_tv": "https://playztv-apps.pages.dev/gazi_tv/index.m3u8",
  "asports": "https://playztv-apps.pages.dev/asports/index.m3u8",
  "star-sports-1": "https://playztv-apps.pages.dev/star-sports-1/index.m3u8",
  "star-sports-select-1": "https://playztv-apps.pages.dev/star-sports-select-1/index.m3u8",
  "sony-sports-ten-1": "https://playztv-apps.pages.dev/sony-sports-ten-1/index.m3u8",
  "sony-sports-ten-2": "https://playztv-apps.pages.dev/sony-sports-ten-2/index.m3u8",
  "willow": "https://playztv-apps.pages.dev/willow/index.m3u8",
  "star-jalsha": "https://playztv-apps.pages.dev/star-jalsha/index.m3u8",
  "zee-bangla": "https://playztv-apps.pages.dev/zee-bangla/index.m3u8",
  "colors-bangla": "https://playztv-apps.pages.dev/colors-bangla/index.m3u8",
  "zee-cinema": "https://playztv-apps.pages.dev/zee-cinema/index.m3u8",
  "star-gold": "https://playztv-apps.pages.dev/star-gold/index.m3u8"
};

// ১. প্রক্সি স্ট্রিম রাউট
app.get('/:slug/index.m3u8', async (req, res) => {
  const { slug } = req.params;
  const targetUrl = CHANNELS[slug];

  if (!targetUrl) {
    return res.status(404).send('Channel Not Found');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': '*/*'
      }
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    response.body.pipe(res);
  } catch (err) {
    res.status(500).send('Proxy Error');
  }
});

// ২. অটোমেটিক M3U প্লে-লিস্ট প্রোভাইডার
app.get('/', (req, res) => {
  const host = `${req.protocol}://${req.get('host')}`;
  let playlist = '#EXTM3U\n\n';

  for (const [slug] of Object.entries(CHANNELS)) {
    const channelName = slug.replace(/-/g, ' ').toUpperCase();
    playlist += `#EXTINF:-1 tvg-id="${slug}" tvg-name="${channelName}", ${channelName}\n${host}/${slug}/index.m3u8\n\n`;
  }

  res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.send(playlist);
});

module.exports = app;
