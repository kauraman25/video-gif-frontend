import { useState } from "react";
import "./App.css";
const App = () => {
  const [activeTab, setActiveTab] = useState("youtube");
  const [ytPrompt, setYtPrompt] = useState("");
  const [ytUrl, setYtUrl] = useState("");
  const [isDirectMp4, setIsDirectMp4] = useState(false);
  const [uploadPrompt, setUploadPrompt] = useState("");
  const [videoFile, setVideoFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [gifs, setGifs] = useState([]);
  const [jobId, setJobId] = useState(null);

  const showError = (message) => {
    setErrorMessage(message);
    setLoading(false);
  };

  const clearError = () => setErrorMessage("");

  const displayGifs = (gifList, id) => {
    setGifs(gifList);
    setJobId(id);
  };
  const API_BASE = "https://video-gif-backend.onrender.com";
  const handleYoutubeSubmit = async (e) => {
    e.preventDefault();
    if (!ytUrl || !ytPrompt) return showError("Please fill in all fields.");

    setLoading(true);
    clearError();
    setGifs([]);

    try {
      const response = await fetch(`${API_BASE}/process-youtube`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: ytUrl,
          prompt: ytPrompt,
          is_direct_mp4: isDirectMp4,
        }),
      });
      const data = await response.json();
      response.ok
        ? displayGifs(data.gifs, data.job_id)
        : showError(data.detail || "Unknown error");
    } catch (err) {
      showError("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!uploadPrompt || !videoFile)
      return showError("Please fill in all fields.");
    if (videoFile.size > 100 * 1024 * 1024)
      return showError("File too large. Maximum size is 100MB.");

    setLoading(true);
    clearError();
    setGifs([]);

    const formData = new FormData();
    formData.append("video", videoFile);
    formData.append("prompt", uploadPrompt);

    try {
      const response = await fetch(`${API_BASE}/process-upload`, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      response.ok
        ? displayGifs(data.gifs, data.job_id)
        : showError(data.detail || "Unknown error");
    } catch (err) {
      showError("An error occurred: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app">
      <div>
        <h1>AI-Powered Video to GIF Generator</h1>
      </div>

      <div className="head-btn">
        <button className="head-btn-del" onClick={() => setActiveTab("youtube")}>YouTube Video URL</button>
        <button className="head-btn-del" onClick={() => setActiveTab("upload")}>Upload Video</button>
      </div>

      {activeTab === "youtube" && (
        <div className="form-section">

        <form className="form" onSubmit={handleYoutubeSubmit}>
          <div>
            <label className="form-input-label">GIF Theme Prompt</label>
            <input
              type="text"
              value={ytPrompt}
              className="form-input"
              placeholder=" “funny moments,” “sad quotes,” “motivational clips”"
              onChange={(e) => setYtPrompt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-input-label">YouTube Video URL</label>
            <input
              type="url"
              value={ytUrl}
              className="form-input"
              placeholder="Paste YouTube URL here"
              onChange={(e) => setYtUrl(e.target.value)}
              required
            />
          </div>
          
          <button className="button-submit" type="submit">Generate GIFs</button>
        </form>
        </div>
      )}

      {activeTab === "upload" && (
        <div className="form-section">
        <form className="form" onSubmit={handleUploadSubmit}>
          <div>
            <label className="form-input-label">GIF Theme Prompt</label>
            <input
              type="text"
              className="form-input"
              placeholder=" “funny moments,” “sad quotes,” “motivational clips”"
              value={uploadPrompt}
              onChange={(e) => setUploadPrompt(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="form-input-label">Upload Video</label>
            <input
              type="file"
              className="form-input-file"
              accept="video/*"
              onChange={(e) => setVideoFile(e.target.files[0])}
              required
            />
          </div>
          <button className="button-submit" type="submit">Generate GIFs</button>
        </form>

        </div>
      )}

      {loading && (
        <div className="loader">
        </div>
      )}

      {errorMessage && <div>{errorMessage}</div>}

      {gifs.length > 0 && (
        <div className="result">
          {gifs.map((gifPath, index) => (
            <div key={index}>
              <img className="result-img" src={`${API_BASE}${gifPath}`} alt="Generated GIF" />
              <div className="result-img-opt-cont">
                <a
                className="result-img-opt"
                  href={`${API_BASE}/download/${jobId}/${index + 1}`}
                  download={`gif_${index}.gif`}
                >
                  Download GIF
                </a>{" "}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default App;
