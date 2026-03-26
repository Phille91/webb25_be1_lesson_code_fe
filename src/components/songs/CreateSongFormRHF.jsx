import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { createSongSchema } from "../../schemas/songSchema";
import { getArtists } from "../../api/artists";
import { getAlbums } from "../../api/albums";
import { createSong } from "../../api/songs";
import { useAuth } from "../../contexts/authContext";

export default function CreateSongFormRHF({ onCreated }) {

  const auth = useAuth()

  const [artists, setArtists] = useState([]);
  const [allAlbums, setAllAlbums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [serverError, setServerError] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(createSongSchema),
    defaultValues: {
      name: "",
      artistId: "",
      albumId: null,
    },
  });

  const selectedArtistId = watch("artistId");

  const filteredAlbums = useMemo(() => {
    if (!selectedArtistId) return [];
    return allAlbums.filter((al) => {
      const albumArtistId = typeof al.artist === "object" ? al.artist._id : al.artist;
      return albumArtistId === selectedArtistId;
    });
  }, [selectedArtistId, allAlbums]);

  useEffect(() => {
    async function loadData() {
      try {
        setServerError(null);
        setLoading(true);

        const [artistData, albumData] = await Promise.all([
          getArtists(),
          getAlbums(),
        ]);

        setArtists(artistData);
        setAllAlbums(albumData);

        
      } catch (err) {
        setServerError(err.message || "Kunde inte hämta data");
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [setValue]);

  useEffect(() => {
    setValue("albumId", null);
  }, [selectedArtistId, setValue]);

  async function onSubmit(values) {
    try {
      setServerError(null);

      await createSong({
        title: values.name,
        artist: values.artistId,
        album: values.albumId || null,
      });

      reset({ name: "", artistId: values.artistId, albumId: null });
      onCreated?.();
    } catch (err) {
      setServerError(err.message || "Kunde inte skapa song");
    }
  }
  
  if(auth.user?.role !== "admin"){
    return (
      <div>
        You need to be logged into a `Admin account` to see this
      </div>
    )
  }

  return (
    <div className="create-song-form">
      <h3>Skapa song</h3>

      {serverError && <p className="form-error">{serverError}</p>}

      {loading ? (
        <p className="form-status">Laddar...</p>
      ) : artists.length === 0 ? (
        <p className="form-status">Du behöver skapa en artist först.</p>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label htmlFor="rhf-name">Låtnamn</label>
            <input
              id="rhf-name"
              placeholder="t.ex. Creep"
              {...register("name")}
            />
            {errors.name && (
              <p className="field-error">{errors.name.message}</p>
            )}
          </div>

          <div className="form-group">
            <label htmlFor="rhf-artist">Artist</label>
            <select id="rhf-artist" {...register("artistId")}>
              <option value="">-- Välj artist --</option>
              {artists.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name}
                </option>
              ))}
            </select>
            {errors.artistId && (
              <p className="field-error">{errors.artistId.message}</p>
            )}
          </div>

          {selectedArtistId && (
            <div className="form-group">
              <label htmlFor="rhf-album">Album (valfritt)</label>
              <select id="rhf-album" {...register("albumId")}>
                <option value="">Ingen (singel)</option>
                {filteredAlbums.map((al) => (
                  <option key={al._id} value={al._id}>
                    {al.title}
                  </option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Skapar..." : "Skapa"}
          </button>
        </form>
      )}
    </div>
  );
}
