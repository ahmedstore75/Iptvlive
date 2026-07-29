const express = require('express');
const fetch = require('node-fetch');
const app = express();

// চ্যানেলগুলোর তালিকা
const CHANNELS = {
  // ==========================================
  //  বাংলাদেশি সরকারি ও বিনোদন চ্যানেল
  // ==========================================
  "btv": "https://playztv-apps.pages.dev/btv/index.m3u8",
  "btv-world": "https://playztv-apps.pages.dev/btv-world/index.m3u8",
  "btv-chittagong": "https://playztv-apps.pages.dev/btv-chittagong/index.m3u8",
  "sangsad-tv": "https://playztv-apps.pages.dev/sangsad-tv/index.m3u8",
  "atn-bangla": "https://playztv-apps.pages.dev/atn-bangla/index.m3u8",
  "channel-i": "https://playztv-apps.pages.dev/channel-i/index.m3u8",
  "ntv": "https://playztv-apps.pages.dev/ntv/index.m3u8",
  "rtv": "https://playztv-apps.pages.dev/rtv/index.m3u8",
  "ekushey-tv": "https://playztv-apps.pages.dev/ekushey-tv/index.m3u8",
  "banglavision": "https://playztv-apps.pages.dev/banglavision/index.m3u8",
  "boishakhi-tv": "https://playztv-apps.pages.dev/boishakhi-tv/index.m3u8",
  "desh-tv": "https://playztv-apps.pages.dev/desh-tv/index.m3u8",
  "my-tv": "https://playztv-apps.pages.dev/my-tv/index.m3u8",
  "asian-tv": "https://playztv-apps.pages.dev/asian-tv/index.m3u8",
  "maasranga-tv": "https://playztv-apps.pages.dev/maasranga-tv/index.m3u8",
  "channel-9": "https://playztv-apps.pages.dev/channel-9/index.m3u8",
  "gazi-tv": "https://playztv-apps.pages.dev/gazi_tv/index.m3u8",
  "mohona-tv": "https://playztv-apps.pages.dev/mohona-tv/index.m3u8",
  "bijoy-tv": "https://playztv-apps.pages.dev/bijoy-tv/index.m3u8",
  "saamtv": "https://playztv-apps.pages.dev/saamtv/index.m3u8",
  "ananda-tv": "https://playztv-apps.pages.dev/ananda-tv/index.m3u8",
  "nagorik-tv": "https://playztv-apps.pages.dev/nagorik-tv/index.m3u8",
  "deepto-tv": "https://playztv-apps.pages.dev/deepto-tv/index.m3u8",
  "gan-bangla": "https://playztv-apps.pages.dev/gan-bangla/index.m3u8",
  "duronto-tv": "https://playztv-apps.pages.dev/duronto-tv/index.m3u8",
  "green-tv": "https://playztv-apps.pages.dev/green-tv/index.m3u8",
  "global-tv": "https://playztv-apps.pages.dev/global-tv/index.m3u8",
  "eepl-news": "https://playztv-apps.pages.dev/eepl-news/index.m3u8",

  // ==========================================
  //  বাংলাদেশি সংবাদ চ্যানেল
  // ==========================================
  "somoy-tv": "https://playztv-apps.pages.dev/somoy-tv/index.m3u8",
  "independent-tv": "https://playztv-apps.pages.dev/independent-tv/index.m3u8",
  "channel-24": "https://playztv-apps.pages.dev/channel-24/index.m3u8",
  "ekattor-tv": "https://playztv-apps.pages.dev/ekattor-tv/index.m3u8",
  "jamuna-tv": "https://playztv-apps.pages.dev/jamuna-tv/index.m3u8",
  "dbc-news": "https://playztv-apps.pages.dev/dbc-news/index.m3u8",
  "atn-news": "https://playztv-apps.pages.dev/atn-news/index.m3u8",
  "news-24": "https://playztv-apps.pages.dev/news-24/index.m3u8",
  "ekhon-tv": "https://playztv-apps.pages.dev/ekhon-tv/index.m3u8",
  "nexus-tv": "https://playztv-apps.pages.dev/nexus-tv/index.m3u8",

  // ==========================================
  //  স্পোর্টস চ্যানেল
  // ==========================================
  "tsports": "https://playztv-apps.pages.dev/tsports/index.m3u8",
  "asports": "https://playztv-apps.pages.dev/asports/index.m3u8",
  "star-sports-1": "https://playztv-apps.pages.dev/star-sports-1/index.m3u8",
  "star-sports-2": "https://playztv-apps.pages.dev/star-sports-2/index.m3u8",
  "star-sports-select-1": "https://playztv-apps.pages.dev/star-sports-select-1/index.m3u8",
  "star-sports-select-2": "https://playztv-apps.pages.dev/star-sports-select-2/index.m3u8",
  "sony-sports-ten-1": "https://playztv-apps.pages.dev/sony-sports-ten-1/index.m3u8",
  "sony-sports-ten-2": "https://playztv-apps.pages.dev/sony-sports-ten-2/index.m3u8",
  "sony-sports-ten-3": "https://playztv-apps.pages.dev/sony-sports-ten-3/index.m3u8",
  "sony-sports-ten-5": "https://playztv-apps.pages.dev/sony-sports-ten-5/index.m3u8",
  "willow": "https://playztv-apps.pages.dev/willow/index.m3u8",
  "willow-extra": "https://playztv-apps.pages.dev/willow-extra/index.m3u8",
  "sports-18-1": "https://playztv-apps.pages.dev/sports-18-1/index.m3u8",

  // ==========================================
  //  ভারতীয় বিনোদন ও সিরিয়াল
  // ==========================================
  "star-jalsha": "https://playztv-apps.pages.dev/star-jalsha/index.m3u8",
  "zee-bangla": "https://playztv-apps.pages.dev/zee-bangla/index.m3u8",
  "colors-bangla": "https://playztv-apps.pages.dev/colors-bangla/index.m3u8",
  "star-plus": "https://playztv-apps.pages.dev/star-plus/index.m3u8",
  "sony-sab": "https://playztv-apps.pages.dev/sony-sab/index.m3u8",
  "zee-tv": "https://playztv-apps.pages.dev/zee-tv/index.m3u8",
  "colors-tv": "https://playztv-apps.pages.dev/colors-tv/index.m3u8",
  "sony-entertainment": "https://playztv-apps.pages.dev/sony-entertainment/index.m3u8",

  // ==========================================
  //  ইন্ডিয়ান মুভি চ্যানেল
  // ==========================================
  "jalsha-movies": "https://playztv-apps.pages.dev/jalsha-movies/index.m3u8",
  "zee-bangla-cinema": "https://d1g8wgjurz8via.cloudfront.net/bpk-tv/ColorsHD/default/Zeebanglahd.m3u8",
  "zee-cinema": "https://playztv-apps.pages.dev/zee-cinema/index.m3u8",
  "star-gold": "https://playztv-apps.pages.dev/star-gold/index.m3u8",
  "star-gold-select": "https://playztv-apps.pages.dev/star-gold-select/index.m3u8",
  "sony-max": "https://playztv-apps.pages.dev/sony-max/index.m3u8",
  "sony-max-2": "https://playztv-apps.pages.dev/sony-max-2/index.m3u8",
  "and-pictures": "https://playztv-apps.pages.dev/and-pictures/index.m3u8",
  "colors-cineplex": "https://playztv-apps.pages.dev/colors-cineplex/index.m3u8"
};

// ১. স্মার্ট প্রক্সি স্ট্রিম রাউট (Cloudfront সহ সকল স্ট্রিম ফিক্স করার জন্য)
app.get('/:slug/index.m3u8', async (req, res) => {
  const { slug } = req.params;
  const targetUrl = CHANNELS[slug];

  if (!targetUrl) {
    return res.status(404).send('Channel Not Found');
  }

  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': '*/*'
      }
    });

    if (!response.ok) {
      return res.status(response.status).send('Source Stream Error');
    }

    let bodyText = await response.text();
    const baseUrl = targetUrl.substring(0, targetUrl.lastIndexOf('/') + 1);

    // .m3u8 ফাইলের ভেতরের ভিডিও সেগমেন্ট বা প্লেলিস্ট পাথগুলোকে ফুল ইউআরএল-এ কনভার্ট করা
    bodyText = bodyText.replace(/^(?!#)(.+)$/gm, (line) => {
      const trimmedLine = line.trim();
      if (trimmedLine.startsWith('http://') || trimmedLine.startsWith('https://')) {
        return trimmedLine;
      }
      return `${baseUrl}${trimmedLine}`;
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(bodyText);
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
