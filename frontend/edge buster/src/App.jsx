import { useState } from "react";
import axios from "axios";

function App() {
    const [file, setFile] = useState(null);
    const [result, setResult] = useState("");

    const uploadResume = async (e) => {
        e.preventDefault();
        const formData = new FormData();
        formData.append("resume", file);

        const { data } = await axios.post("http://localhost:5000/analyze-resume", formData);
        setResult(data.analysis);
    };

    return (
        <div className="container">
            <h1 className="Header">AI Resume Analyzer</h1>
            <input className="fileselector" type="file" onChange={(e) => setFile(e.target.files[0])} />
            <button onClick={uploadResume}>Analyze Resume</button>
            <pre>{result}</pre>
        </div>
    );
}

export default App;

