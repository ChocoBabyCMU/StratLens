// Save this as api/news.js
export default async function handler(req, res) {
  const { q } = req.query;
  
  try {
    const API_KEY = process.env.NEWS_API_KEY;
    const response = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(q)}&sortBy=relevancy&language=en&apiKey=${API_KEY}`
    );
    
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch news' });
  }
}
