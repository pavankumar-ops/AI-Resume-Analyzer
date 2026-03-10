import { useState } from 'react';

export default function App() {
  const [fileName, setFileName] = useState('');
  const [jobDesc, setJobDesc] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const extractTextFromPDF = async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await (window as any).pdfjsLib.getDocument({
      data: arrayBuffer,
    }).promise;
    let fullText = '';
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const pageText = content.items.map((item: any) => item.str).join(' ');
      fullText += pageText + '\n';
    }
    return fullText;
  };

  const handleAnalyze = async () => {
    const fileInput = document.getElementById(
      'resumeUpload'
    ) as HTMLInputElement;
    const file = fileInput?.files?.[0];

    if (!file) {
      alert('Please upload your resume first!');
      return;
    }
    if (!jobDesc) {
      alert('Please paste a job description!');
      return;
    }

    setLoading(true);
    setResult('');

    try {
      const resumeText = await extractTextFromPDF(file);
      const apiKey = 'AIzaSyDqMlABjzCA3v7zTuzXVt6HlPtrZnwreQw';

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are an expert HR consultant and resume analyzer.
Analyze this resume against the job description and provide:
1. 📊 Match Score (out of 100)
2. ✅ Strong Points (what matches well)
3. ❌ Missing Skills (what's lacking)
4. 💡 Improvement Suggestions (specific advice)
5. 🎯 Overall Verdict (should they apply?)

Resume:
${resumeText}

Job Description:
${jobDesc}

Give clear, honest, helpful feedback in a friendly tone.`,
                  },
                ],
              },
            ],
          }),
        }
      );

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (text) {
        setResult(text);
      } else {
        setResult(JSON.stringify(data));
      }
    } catch (error: any) {
      setResult('Error: ' + error.message);
    }

    setLoading(false);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: '20px',
      }}
    >
      {/* Floating background circles */}
      <div
        style={{
          position: 'fixed',
          top: '10%',
          left: '5%',
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          background: 'rgba(102, 126, 234, 0.15)',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <div
        style={{
          position: 'fixed',
          bottom: '10%',
          right: '5%',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: 'rgba(118, 75, 162, 0.15)',
          filter: 'blur(80px)',
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          background: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(20px)',
          borderRadius: '24px',
          padding: '40px',
          width: '90%',
          maxWidth: '640px',
          boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.1)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <div style={{ fontSize: '48px', marginBottom: '10px' }}>🧠</div>
          <h1
            style={{
              color: 'white',
              fontSize: '28px',
              fontWeight: '800',
              margin: '0 0 8px 0',
              background: 'linear-gradient(135deg, #667eea, #a78bfa)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            AI Resume Analyzer
          </h1>
          <p
            style={{
              color: 'rgba(255,255,255,0.5)',
              margin: 0,
              fontSize: '14px',
            }}
          >
            Upload your resume and get instant AI-powered feedback
          </p>
        </div>

        {/* Upload Box */}
        <div style={{ marginBottom: '20px' }}>
          <label
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            📄 Resume (PDF)
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const file = e.dataTransfer.files[0];
              if (file) setFileName(file.name);
            }}
            style={{
              border: `2px dashed ${
                fileName
                  ? '#4ade80'
                  : dragOver
                  ? '#a78bfa'
                  : 'rgba(255,255,255,0.2)'
              }`,
              borderRadius: '12px',
              padding: '28px',
              textAlign: 'center',
              marginTop: '8px',
              cursor: 'pointer',
              background: fileName
                ? 'rgba(74,222,128,0.1)'
                : dragOver
                ? 'rgba(167,139,250,0.1)'
                : 'rgba(255,255,255,0.03)',
              transition: 'all 0.3s ease',
            }}
          >
            <input
              type="file"
              accept=".pdf"
              style={{ display: 'none' }}
              id="resumeUpload"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || '')}
            />
            <label htmlFor="resumeUpload" style={{ cursor: 'pointer' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                {fileName ? '✅' : '📁'}
              </div>
              <div
                style={{
                  color: fileName ? '#4ade80' : 'rgba(255,255,255,0.5)',
                  fontSize: '14px',
                }}
              >
                {fileName ? fileName : 'Click or drag & drop your PDF here'}
              </div>
            </label>
          </div>
        </div>

        {/* Job Description */}
        <div style={{ marginBottom: '25px' }}>
          <label
            style={{
              color: 'rgba(255,255,255,0.8)',
              fontWeight: '600',
              fontSize: '14px',
            }}
          >
            💼 Job Description
          </label>
          <textarea
            placeholder="Paste the job description here..."
            value={jobDesc}
            onChange={(e) => setJobDesc(e.target.value)}
            style={{
              width: '100%',
              height: '130px',
              marginTop: '8px',
              padding: '14px',
              borderRadius: '12px',
              border: '2px solid rgba(255,255,255,0.1)',
              background: 'rgba(255,255,255,0.05)',
              color: 'white',
              fontSize: '14px',
              resize: 'none',
              boxSizing: 'border-box',
              outline: 'none',
            }}
          />
          <p
            style={{
              color: 'rgba(255,255,255,0.3)',
              fontSize: '12px',
              marginTop: '4px',
            }}
          >
            {jobDesc.length} characters
          </p>
        </div>

        {/* Analyze Button */}
        <button
          onClick={handleAnalyze}
          disabled={loading}
          style={{
            width: '100%',
            padding: '16px',
            background: loading
              ? 'rgba(255,255,255,0.1)'
              : 'linear-gradient(135deg, #667eea, #a78bfa)',
            color: 'white',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '700',
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'all 0.3s ease',
            letterSpacing: '0.5px',
          }}
        >
          {loading ? '🔄 Analyzing your resume...' : '🚀 Analyze My Resume'}
        </button>

        {/* Loading dots */}
        {loading && (
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.4)',
              fontSize: '13px',
              marginTop: '12px',
            }}
          >
            ✨ AI is reading your resume, this takes 10-15 seconds...
          </p>
        )}

        {/* Result */}
        {result && (
          <div
            style={{
              marginTop: '30px',
              padding: '24px',
              background: 'rgba(255,255,255,0.05)',
              borderRadius: '16px',
              border: '1px solid rgba(102,126,234,0.3)',
              whiteSpace: 'pre-wrap',
              lineHeight: '1.8',
              color: 'rgba(255,255,255,0.85)',
              fontSize: '14px',
            }}
          >
            <h3 style={{ color: '#a78bfa', marginTop: 0, fontSize: '16px' }}>
              📋 Analysis Result
            </h3>
            {result}
          </div>
        )}
      </div>
    </div>
  );
}
