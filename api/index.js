const express = require('express');
const fetch = require('node-fetch');
const app = express();

// GitHub-এর M3U ফাইল ইউআরএল (যার মাধ্যমে অটো-আপডেট হবে)
const REMOTE_M3U_URL = 'https://d3qs3d2rkhfqrt.cloudfront.net';

// সাধারণ ইউজার এজেন্ট ও হেডার (স্ট্রিমিং ব্লক আটকানোর জন্য)
const DEFAULT_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': '*/*'
};

// ১. রিমোট M3U ফাইল ফেচ এবং পার্স (Parse) করার ফাংশন
async function fetchAndParsePlaylist() {
  const response = await fetch(REMOTE_M3U_URL, { headers: DEFAULT_HEADERS });
  if (!response.ok) throw new Error('Failed to fetch master M3U playlist');
  
  const text = await response.text();
  const lines = text.split('\n');
  const channels = [];

  let currentExtInf = '';

  for (let line of lines) {
    line = line.trim();
    if (line.startsWith('#EXTINF:')) {
      currentExtInf = line;
    } else if (line && !line.startsWith('#')) {
      if (currentExtInf) {
        // tvg-name অথবা কমা (,) এর পরের অংশ থেকে চ্যানেলের নাম বের করা
        let nameMatch = currentExtInf.match(/tvg-name="([^"]+)"/) || currentExtInf.match(/,(.+)$/);
        let channelName = nameMatch ? nameMatch[1].trim() : 'Unknown Channel';
        
        // চ্যানেলের জন্য নিরাপদ slug তৈরি
        let slug = channelName.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
        if (!slug) slug = `channel-${channels.length + 1}`;

        channels.push({
          slug: slug,
          name: channelName,
          extinf: currentExtInf,
          streamUrl: line
        });
        currentExtInf = '';
      }
    }
  }

  return channels;
}

// ২. স্মার্ট প্রক্সি স্ট্রিম রাউট (প্রক্সি ফিক্স সহ)
app.get('/:slug/index.m3u8', async (req, res) => {
  const { slug } = req.params;

  try {
    const channels = await fetchAndParsePlaylist();
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

    // .m3u8 ফাইলের সকল রিলেটিভ পাথকে (Relative Path) সঠিক Absolute URL-এ রূপান্তর
    bodyText = bodyText.replace(/^(?!#)(.+)$/gm, (line) => {
      const trimmedLine = line.trim();
      if (!trimmedLine) return line;

      try {
        // Standard Javascript URL object দিয়ে Absolute Path তৈরি
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

// ৩. অটোমেটিক মাস্টার M3U প্লে-লিস্ট প্রোভাইডার
app.get('/', async (req, res) => {
  try {
    const channels = await fetchAndParsePlaylist();
    const host = `${req.protocol}://${req.get('host')}`;
    
    let playlist = '#EXTM3U\n\n';

    for (const channel of channels) {
      // মূল প্লেলিস্টের হ্যাশট্যাগ ও মেটাডাটা বজায় রেখে নতুন Proxy URL বসানো
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
