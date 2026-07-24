import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const API_URL = import.meta.env.VITE_API_BASE_URL;

export default function Recommendation() {
  const { title } = useParams();
  const navigate = useNavigate();

  const decodedTitle = decodeURIComponent(title);

  const [movie, setMovie] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendations();
  }, [title]);

  const fetchRecommendations = async () => {
    try {
      setLoading(true);

      const res = await axios.get(
        `${API_URL}/recommend/${decodedTitle}`
      );

      setMovie(res.data.query_movie);
      setRecommendations(res.data.recommendations);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-black text-white min-h-screen flex items-center justify-center text-2xl">
        Loading...
      </div>
    );
  }

  if (!movie) {
  return (
    <div className="bg-black text-white min-h-screen flex flex-col items-center justify-center gap-6">
      <h1 className="text-4xl font-bold">🎬 Movie Not Found</h1>

      <p className="text-gray-400">
        Try searching another movie
      </p>

      <button
        onClick={() => navigate("/")}
        className="px-6 py-3 rounded-full backdrop-blur-md bg-white/10 border border-white/20 hover:bg-white/20 transition"
      >
        ← Back To Home
      </button>
    </div>
  );
}

  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO SECTION */}
      <div
        className="relative h-[80vh] bg-cover bg-center"
        style={{
          backgroundImage: `url(${IMAGE_BASE + movie.backdrop_path})`,
        }}
      >

        {/* BACK BUTTON */}
  <button
    onClick={() => navigate(-1)}
    className="absolute top-6 right-6 cursor-pointer z-20 flex items-center gap-2 px-5 py-2 rounded-full bg-black/30 backdrop-blur-md border border-white/20 hover:bg-black/50 transition"
  >
    ← Back
  </button>


        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent" />

        <div className="absolute bottom-10 left-10 max-w-3xl z-10">
          <h1 className="text-6xl font-bold mb-4">
            {movie.title}
          </h1>

          <div className="flex gap-5 text-lg mb-4">
            <span>⭐ {movie.vote_average}</span>
            <span>🔥 {movie.popularity}</span>
          </div>

          <p className="text-gray-300 leading-relaxed">
            {movie.overview}
          </p>
        </div>
      </div>

      {/* RECOMMENDATIONS */}
      <div className="px-8 py-10">
        <h2 className="text-3xl font-bold mb-6">
          Recommended Movies
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
          {recommendations.map((item) => (
            <div
              key={item.id}
              onClick={() =>
                navigate(`/movie/${encodeURIComponent(item.title)}`)
              }
              className="bg-zinc-900 rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition duration-300"
            >
              <img
                src={IMAGE_BASE + item.poster_path}
                alt={item.title}
                className="w-full h-[320px] object-cover"
              />

              <div className="p-3">
                <h3 className="font-semibold truncate">
                  {item.title}
                </h3>

                <p className="text-sm text-gray-400 mt-1">
                  ⭐ {item.vote_average}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}