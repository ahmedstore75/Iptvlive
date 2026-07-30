const express = require('express');
const fetch = require('node-fetch');
const app = express();

// ==========================================
//  ১. একাধিক M3U প্লেলিস্ট সোর্সের তালিকা
// ==========================================
const REMOTE_M3U_URLS = [
  'https://iptv-proxy.ahmed-bd-org.workers.dev/', // আপনার Cloudflare Worker সোর্স
  'https://raw.githubusercontent.com/ahmedstore75/StreamBangla/refs/heads/main/BDIX-Playlist.m3u' // GitHub সোর্স
];

// সাধারণ ইউজার এজেন্ট ও হেডার
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*'
};

// ==========================================
//  ২. সকল সোর্স থেকে প্লেলিস্ট ফেচ ও পার্স করার ফাংশন
// ==========================================
async function fetchAndParseAllPlaylists() {
  const allChannels = [];
  const slugTracker = new Set(); // ডুপ্লিকেট Slug এড়ানোর জন্য

  for (const url of REMOTE_M3U_URLS) {
    try {
      const response = await fetch(url, { headers: DEFAULT_HEADERS });
      if (!response.ok) continue; // কোনো সোর্স ফেইল করলে তা স্কিপ করবে

      const text = await response.text();
      const lines = text.split('\n');
      let currentExtInf = '';

      for (let line of lines) {
        line = line.trim();
        if (line.startsWith('#EXTINF:')) {
          currentExtInf = line;
        } else if (line && !line.startsWith('#')) {
          if (currentExtInf) {
            // চ্যানেলের নাম বের করা
            let nameMatch = currentExtInf.match(/tvg-name="([^"]+)"/) || currentExtInf.match(/,(.+)$/);
            let channelName = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';

            // ইউনিক Slug তৈরি
            let baseSlug = channelName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
            if (!baseSlug) baseSlug = 'channel';

            let slug = baseSlug;
            let counter = 1;
            
            // একই নামের চ্যানেল ভিন্ন সোর্সে থাকলে নাম যেন কনফ্লিক্ট না করে (যেমন: btv, btv-1)
            while (slugTracker.has(slug)) {
              slug = `${baseSlug}-${counter}`;
              counter++;
            }
            slugTracker.add(slug);

            allChannels.push({
              slug: slug,
              name: channelName,
              extinf: currentExtInf,
              streamUrl: line
            });

            currentExtInf = '';
          }
        }
      }
    } catch (err) {
      console.error(`Error fetching playlist from ${url}:`, err.message);
    }
  }

  return allChannels;
}

// ==========================================
//  ৩. স্মার্ট প্রক্সি স্ট্রিম রাউট
// ==========================================
app.get('/:slug/index.m3u8', async (req, res) => {
  const { slug } = req.params;

  try {
    const channels = await fetchAndParseAllPlaylists();
    const channel = channels.find(c => c.slug === slug);

    if (!channel) {
      return res.status(404).send('Channel Not Found');
    }

    const response = await fetch(channel.streamUrl, { headers: DEFAULT_HEADERS });

    if (!response.ok) {
      return res.status(response.status).send('Source Stream Error');
    }

    let bodyText = await response.text();
    const baseUrl = channel.streamUrl;

    // .m3u8 ফাইলের সকল রিলেটিভ পাথকে Absolute URL-এ রূপান্তর
    bodyText = bodyText.replace(/^(?!#)(.+)$/gm, (line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return line;

      try {
        return new URL(trimmedLine, baseUrl).href;
      } catch (e) {
        return trimmedLine;
      }
    });

    res.setHeader('Content-Type', 'application/vnd.apple.mpegurl');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(bodyText);
  } catch (err) {
    console.error('Proxy Error:', err.message);
    res.status(500).send('Proxy Error');
  }
});

// ==========================================
//  ৪. অটোমেটিক মাস্টার M3U প্লে-লিস্ট প্রোভাইডার
// ==========================================
app.get('/', async (req, res) => {
  try {
    const channels = await fetchAndParseAllPlaylists();
    const host = `${req.protocol}://${req.get('host')}`;

    let playlist = '#EXTM3U\n\n';

    for (const channel of channels) {
      playlist += `${channel.extinf}\n${host}/${channel.slug}/index.m3u8\n\n`;
    }

    res.setHeader('Content-Type', 'audio/x-mpegurl; charset=utf-8');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.send(playlist);
  } catch (err) {
    console.error('Playlist Fetch Error:', err.message);
    res.status(500).send('Error generating dynamic playlist');
  }
});

module.exports = app;
