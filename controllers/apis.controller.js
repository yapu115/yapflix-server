import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

// api keys
const TMDB_API_KEY = process.env.TMDB_API_KEY;
const GOOGLE_BOOKS_API_KEY = process.env.GOOGLE_BOOKS_API_KEY;

const IGDB_CLIENT_ID = process.env.IGDB_CLIENT_ID;
const IGDB_API_CLIENT_SECRET = process.env.IGDB_API_CLIENT_SECRET;

export class ApisController {
  // Call all movies and tv shows from query
  callMovies = async (req, res) => {
    try {
      const { query } = req.query;

      const apiUrlMovie = `https://api.themoviedb.org/3/search/movie`;
      const apiUrlSeries = `https://api.themoviedb.org/3/search/tv`;

      const [moviesResponse, seriesResponse] = await Promise.all([
        axios.get(apiUrlMovie, { params: { api_key: TMDB_API_KEY, query } }),
        axios.get(apiUrlSeries, { params: { api_key: TMDB_API_KEY, query } }),
      ]);

      // Combine results (movies and tv shows)
      const combinedResults = [
        ...moviesResponse.data.results
          .filter((movie) => movie.poster_path)
          .map((movie) => ({
            type: "movie",
            id: movie.id,
            title: movie.title,
            releaseDate: movie.release_date,
            image: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          })),
        ...seriesResponse.data.results
          .filter((series) => series.poster_path)
          .map((series) => ({
            type: "series",
            id: series.id,
            title: series.name,
            releaseDate: series.first_air_date,
            image: `https://image.tmdb.org/t/p/w500${series.poster_path}`,
          })),
      ];

      // Sort by popularity
      combinedResults.sort((a, b) => b.popularity - a.popularity);

      res.json(combinedResults);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  };

  // Call all videogames from query
  callVideogames = async (req, res) => {
    try {
      const { query } = req.query;

      const token = await getTwitchToken(
        IGDB_CLIENT_ID,
        IGDB_API_CLIENT_SECRET
      );

      const apiUrl = "https://api.igdb.com/v4/games";

      const response = await axios.post(
        apiUrl,
        `search "${query}"; fields name,cover.url,first_release_date;`,
        {
          headers: {
            "Client-ID": IGDB_CLIENT_ID,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const transformedData = response.data.map((game) => ({
        name: game.name,
        releaseDate: transformReleaseDate(game.first_release_date),
        image: game.cover ? transformImageUrl(game.cover.url) : null,
      }));

      res.json(transformedData);
    } catch (error) {
      console.error("Error fetching data from IGDB:", error);
      res.status(500).json({ error: "Failed to fetch data" });
    }
  };

  // Call all books from query
  callBooks = async (req, res) => {
    try {
      const { query } = req.query;

      const apiUrl = `https://www.googleapis.com/books/v1/volumes?`;

      const response = await axios.get(apiUrl, {
        params: { q: query, key: GOOGLE_BOOKS_API_KEY },
      });

      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  };

  // Call all songs and albums from query
  callMusic = async (req, res) => {
    try {
      const { query } = req.query;

      const apiUrl = `https://api.deezer.com/search?`;

      const response = await axios.get(apiUrl, {
        params: { q: query },
      });
      res.json(response.data);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch data" });
    }
  };
}

// Call twitch token for videogames search
async function getTwitchToken(clientId, clientSecret) {
  const tokenUrl = "https://id.twitch.tv/oauth2/token";

  try {
    const response = await axios.post(tokenUrl, null, {
      params: {
        client_id: clientId,
        client_secret: clientSecret,
        grant_type: "client_credentials",
      },
    });

    return response.data.access_token;
  } catch (error) {
    console.error("Error fetching Twitch token:", error);
    throw new Error("Failed to fetch Twitch token");
  }
}

// Get image url
const transformImageUrl = (url) => {
  return url.replace(
    "//images.igdb.com/igdb/image/upload/t_thumb",
    "https://images.igdb.com/igdb/image/upload/t_cover_big"
  );
};

// Get formated release date
const transformReleaseDate = (timestamp) => {
  if (!timestamp) return null;
  return new Date(timestamp * 1000).toISOString().split("T")[0];
};
