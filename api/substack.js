// Returns the latest 3 Substack posts as JSON. Substack's feed blocks browser
// requests (CORS), so the Margins page calls this instead of the feed directly.
const FEED_URL = 'https://sharinir.substack.com/feed';

function decode(str) {
  return str
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
    .replace(/&#39;|&#x27;/g, "'").replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .trim();
}

function tag(item, name) {
  const m = item.match(new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`));
  return m ? decode(m[1]) : '';
}

module.exports = async (req, res) => {
  try {
    const feed = await fetch(FEED_URL, { headers: { 'User-Agent': 'sharini.com' } });
    if (!feed.ok) throw new Error(`feed returned ${feed.status}`);
    const xml = await feed.text();
    const items = (xml.match(/<item>[\s\S]*?<\/item>/g) || []).slice(0, 3);
    const posts = items.map((item) => ({
      title: tag(item, 'title'),
      link: tag(item, 'link'),
      date: tag(item, 'pubDate'),
      excerpt: tag(item, 'description').replace(/<[^>]+>/g, '').slice(0, 180),
    }));
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate=86400');
    res.status(200).json({ posts });
  } catch (err) {
    res.status(502).json({ posts: [], error: 'feed unavailable' });
  }
};
