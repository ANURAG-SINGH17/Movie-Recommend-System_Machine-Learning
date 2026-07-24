import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const IMAGE_BASE = "https://image.tmdb.org/t/p/original";
const API_URL = import.meta.env.BACKEND_API;


export default function Home() {
  const [movies, setMovies] = useState([]);
  const [hero, setHero] = useState(null);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchPopular();
  }, []);

  const fetchPopular = async () => {
    try {
      const res = await axios.get(`${API_URL}/get-top-movies`);
      setMovies(res.data);

      // top movie for hero section
      setHero(res.data[0]);
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen">

      {/* HERO SECTION */}
      {hero && (
        <div
          className="h-[80vh] bg-cover bg-center flex flex-col justify-end p-10"
          style={{
            backgroundImage: `url(${IMAGE_BASE + hero.backdrop_path})`,
          }}
        >
          <div className="bg-gradient-to-t from-black via-black/60 to-transparent p-6 rounded-xl">
            <h1 className="text-5xl font-bold">{hero.title}</h1>
            <p className="mt-3 text-gray-300 max-w-xl line-clamp-3">
              {hero.overview}
            </p>

            <div className="mt-4 flex gap-3">
              <button className="bg-white text-black px-5 py-2 rounded-md font-semibold">
                 Play
              </button>
              <button className="bg-gray-700 px-5 py-2 rounded-md">
                More Info
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 SEARCH BAR */}
      <div className="p-6 flex justify-center">
        <input
          type="text"
          placeholder="Search movies..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-[60%] p-3 rounded-lg bg-gray-900 border border-gray-700 focus:outline-none focus:border-red-500"
        />
        <button
  onClick={() => {
    if (search.trim()) {
      navigate(`/movie/${search}`);
    }
  }}
  className="bg-red-600 px-5 py-3 rounded-lg ml-2"
>
  Search
</button>
      </div>

      {/* 🎬 MOVIE GRID */}
      <div className="px-6 pb-10">
        <h2 className="text-2xl font-bold mb-4">Popular Movies</h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {movies
            .filter((m) =>
              m.title.toLowerCase().includes(search.toLowerCase())
            )
            .map((movie) => (
              <div
  key={movie.id}
  onClick={() => navigate(`/movie/${encodeURIComponent(movie.title)}`)}
  className="bg-gray-900 rounded-lg overflow-hidden hover:scale-105 transition duration-300 cursor-pointer"
>
                <img
                  src={IMAGE_BASE + movie.poster_path}
                  alt={movie.title}
                  className="w-full h-[300px] object-cover"
                />
                <div className="p-2">
                  <h3 className="text-sm font-semibold truncate">
                    {movie.title}
                  </h3>
                  <p className="text-xs text-gray-400">
                    ⭐ {movie.vote_average}
                  </p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
}