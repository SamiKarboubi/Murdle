import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getEnigmeDetails } from "../api/enigmes";
import { createGame } from "../api/games";
import MurdleGrid from "../components/MurdleGrid";
import truthLogo from "../assets/truth-logo.png";
import lieLogo from "../assets/lie-logo.png";
import { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";


export default function EnigmePage() {
    const { id, code } = useParams();
    const [enigme, setEnigme] = useState(null);
    const navigate = useNavigate();

    const socket = useRef(null);
    const [gameCode, setGameCode] = useState(null);
    const [joinCode, setJoinCode] = useState("");
    const [gameState, setGameState] = useState(null);
    const [chat, setChat] = useState([]);
    const [message, setMessage] = useState("");
    const [startTime, setStartTime] = useState(null);
    

    useEffect(() => {

        if (code) {
            setGameCode(code);
            connectWebSocket(code);
        } else {
            createGame(id).then(data => {
                setGameCode(data.code);
                connectWebSocket(data.code);
            });
        }
    }, [id, code]);

    useEffect(() => {
        getEnigmeDetails(id).then(setEnigme);
    }, [id]);

    
    useEffect(() => {
        if (!enigme || !gameState) return;
        
        if (gameState.grid !== null && gameState.grid !== undefined) return;

        const totalCols = enigme.suspects.length + enigme.motives.length + enigme.locations.length;
        const totalRows = enigme.weapons.length + enigme.locations.length + enigme.motives.length;
        const initialGrid = Array(totalRows).fill(null).map(() => Array(totalCols).fill(0));

        updateGameState({ grid: initialGrid });
    }, [enigme, gameState]);

    function connectWebSocket(code) {
        const ws = new WebSocket(`wss://web-production-5392.up.railway.app/ws/game/${code}/`);

        ws.onmessage = e => {
            const data = JSON.parse(e.data);

            if (data.type === "init") {
                setGameState(data.state);
                setChat(data.chat);
                setStartTime(data.startTime * 1000);
            }

            if (data.type === "state") {
                setGameState(data.state);
            }

            if (data.type === "message") {
                setChat(prev => [...prev, data.message]);
            }
        };

        ws.onopen = () => {
            
        };

        socket.current = ws;
    }

    function joinGame() {
        if (!joinCode) return;

        navigate(`/enigme/${id}/game/${joinCode}`);
    }

    function onGridChange(newGrid) {
        updateGameState({
            grid: newGrid
        });
    }

    function onSaveGrid(savedGrid) {
        updateGameState({
            savedGrid: savedGrid
        });
    }

    function onRestoreGrid(restoredGrid) {
        updateGameState({
            grid: restoredGrid
        });
    }

    function updateGameState(partial) {
        if (!gameState) return;

        const newState = {
            ...gameState,
            ...partial
        };

        setGameState(newState);

        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(
                {
                    "type": "state",
                    "state": newState
                }));
        }
    }

    function sendMessage() {
        if (!message.trim()) return;
        setMessage("");
        if (socket.current && socket.current.readyState === WebSocket.OPEN) {
            socket.current.send(JSON.stringify(
                {
                    "type": "chat",
                    "chat": message
                }));
        }
    }

    function handleSubmit() {
        if (!gameState?.accusation || !startTime) return;

        const correct = enigme.solution.cases.find(
            c => c.id === enigme.solution.murder_id
        );

        const a = gameState.accusation;

        const ok =
            a.suspect === correct.suspect &&
            a.weapon === correct.weapon &&
            a.location === correct.location &&
            a.motive === correct.motive;


        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);

        const minutes = Math.floor(elapsedSeconds / 60);
        const seconds = elapsedSeconds % 60;

        updateGameState({ result: ok , solutionTime : { minutes, seconds}});

    }

    if (!enigme) return <p className="loading-text">Loading...</p>;

    return (
        <div className="enigme-page">
            <div className="enigme-page-content">
                <span className="homepage-link">
                    <span className="dot">•</span>
                    <Link to={`/`} className="homepage-link-text">Return to homepage</Link></span>

                {gameCode && (
                    <div className="game-code-container">
                        <p className="game-code-label">Share this code to play with your friends:</p>
                        <p className="game-code-value">{gameCode}</p>
                    </div>
                )}
                {!code && (
                    <div className="join-box">
                        <input
                            className="join-input"
                            placeholder="Enter game code"
                            value={joinCode}
                            onChange={e => setJoinCode(e.target.value.toUpperCase())}
                            maxLength={5}
                        />
                        <button className="join-button" onClick={joinGame}>
                            JOIN A GAME
                        </button>
                    </div>
                )}
                <div className="title-box"><h1 className="enigme-title">{enigme.title}</h1></div>
                <div className="story-box">
                    <p className="intro">{enigme.story}</p>
                </div>

                <Section title="SUSPECTS">
                    <div className="grid-4">
                        {enigme.suspects.map(s => (
                            <Card key={s.slug}>
                                <img src={s.icon} alt={s.name} className="card-icon" />
                                <h4 className="card-title">{s.name}</h4>
                                <p className="card-description">{s.description}</p>
                                <div className="card-details">{s.height} - {s.handedness} - {s.eye_color} - {s.hair_color} - {s.sign}</div>
                            </Card>
                        ))}
                    </div>
                </Section>

                <Section title="LOCATIONS">
                    <div className="grid-4">
                        {enigme.locations.map(l => (
                            <Card key={l.slug}>
                                <img src={l.icon} alt={l.name} className="card-icon" />
                                <h4 className="card-title">{l.name}</h4>
                                <p className="card-description">{l.description}</p>
                                <div className="card-details">{l.indoor}</div>
                            </Card>
                        ))}
                    </div>
                </Section>

                <Section title="WEAPONS">
                    <div className="grid-4">
                        {enigme.weapons.map(w => (
                            <Card key={w.slug}>
                                <img src={w.icon} alt={w.name} className="card-icon" />
                                <h4 className="card-title">{w.name}</h4>
                                <p className="card-description">{w.description}</p>
                                <div className="card-details">{w.weight} - {w.material}</div>
                            </Card>
                        ))}
                    </div>
                </Section>

                <Section title="MOTIVES">
                    <div className="grid-2">
                        {enigme.motives.map(m => (
                            <Card key={m.slug}>
                                <img src={m.icon} alt={m.name} className="card-icon" />
                                <h4 className="card-title">{m.name}</h4>
                            </Card>
                        ))}
                    </div>
                </Section>

                <Section title="CLUES & EVIDENCE ">

                    <div className="clues-box">
                        <ul className="clue-list">
                            {enigme.clues_and_evidence.map((c, i) => (
                                <li key={i}>
                                    <span className="bullet">•</span>
                                    <span key={i} onClick={() => {
                                        updateGameState({
                                            crossed: {
                                                ...gameState.crossed,
                                                [i]: !gameState.crossed?.[i]
                                            }
                                        })
                                    }} className={gameState?.crossed?.[i] ? "crossed" : ""}>{c}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>

                <Section title="STATEMENTS">
                    <span className="clues-story">(Remember: The murderer is lying. The others are telling the truth.) </span>
                    <div className="statements-box">
                        <ul className="statement-list">
                            {enigme.statements.map((s, i) => (
                                <li key={i}>
                                    <span className="speaker">{s.speaker}:</span>
                                    <span className="statement-text" onClick={() => {
                                        updateGameState({
                                            checkedTruth: {
                                                ...gameState.checkedTruth,
                                                [i]: ((gameState.checkedTruth?.[i] ?? 0) + 1) % 3
                                            }
                                        })
                                    }}>{s.text}</span>
                                    {gameState?.checkedTruth?.[i] === 1 && (
                                        <span className="checked">
                                            <img src={truthLogo} alt="true" />
                                        </span>
                                    )}

                                    {gameState?.checkedTruth?.[i] === 2 && (
                                        <span className="checked">
                                            <img src={lieLogo} alt="false" />
                                        </span>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>
                </Section>
                <div className="accusation-section">
                    <h2 className="accusation-title">Make Your Accusation</h2>
                    <div className="accusation-box">
                        <div className="select-group">
                            <label className="select-label">WHO?</label>
                            <select
                                className="accusation-select"
                                value={gameState?.accusation?.suspect ?? ""}
                                onChange={e => updateGameState({
                                    accusation: { ...gameState.accusation, suspect: e.target.value }
                                })}
                            >
                                <option value="">Select suspect...</option>
                                {enigme.suspects.map(s => (
                                    <option key={s.slug} value={s.slug}>{s.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-group">
                            <label className="select-label">HOW?</label>
                            <select
                                className="accusation-select"
                                value={gameState?.accusation?.weapon ?? ""}
                                onChange={e => updateGameState({
                                    accusation: { ...gameState.accusation, weapon: e.target.value }
                                })}
                            >
                                <option value="">Select weapon...</option>
                                {enigme.weapons.map(w => (
                                    <option key={w.slug} value={w.slug}>{w.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-group">
                            <label className="select-label">WHERE?</label>
                            <select
                                className="accusation-select"
                                value={gameState?.accusation?.location ?? ""}
                                onChange={e => updateGameState({
                                    accusation: { ...gameState.accusation, location: e.target.value }
                                })}
                            >
                                <option value="">Select location...</option>
                                {enigme.locations.map(l => (
                                    <option key={l.slug} value={l.slug}>{l.name}</option>
                                ))}
                            </select>
                        </div>

                        <div className="select-group">
                            <label className="select-label">WHY?</label>
                            <select
                                className="accusation-select"
                                value={gameState?.accusation?.motive ?? ""}
                                onChange={e => updateGameState({
                                    accusation: { ...gameState.accusation, motive: e.target.value }
                                })}
                            >
                                <option value="">Select motive...</option>
                                {enigme.motives.map(m => (
                                    <option key={m.slug} value={m.slug}>{m.name}</option>
                                ))}
                            </select>
                        </div>

                        <button disabled = {gameState?.result === true} className="accuse-button" onClick={handleSubmit}>
                            MAKE YOUR ACCUSATION
                        </button>

                        {gameState?.result === false && (
                            <div className="error-message result-message">
                                <span className="result-icon">✖</span>
                                <p>Wrong accusation. Try again.</p>
                            </div>
                        )}

                        {gameState?.result === true && (
                            <>
                                <div className="success-message result-message">
                                    <span className="result-icon">✔</span>
                                    <h3>You found the real solution!</h3>
                                </div>

                                <div className="solution-box">
                                    <h3 className="solution-title">SOLUTION</h3>
                                    <p className="solution-time">
                                        You found the solution in {gameState?.solutionTime.minutes} minute{gameState?.solutionTime.minutes !== 1 ? "s" : ""}
                                        {" "}and {gameState?.solutionTime.seconds} second{gameState?.solutionTime.seconds !== 1 ? "s" : ""}.
                                    </p>
                                    <p className="solution-story">{enigme.solution.story}</p>
                                    <p className="solution-description">{enigme.solution.description}</p>
                                    <div className="solution-grid">
                                        {enigme.solution.cases.map((c, idx) => {
                                            const suspect = enigme.suspects.find(
                                                s => s.slug === c.suspect
                                            );
                                            if (!suspect) return null;
                                            return (<div key={idx} className="solution-icon-container" title={suspect.name}>
                                                <img src={suspect.icon} alt={suspect.name} className="solution-icon"></img>
                                            </div>);
                                        })
                                        }
                                        {enigme.solution.cases.map((c, idx) => {
                                            const weapon = enigme.weapons.find(
                                                w => w.slug === c.weapon
                                            );
                                            if (!weapon) return null;
                                            return (<div key={idx} className="solution-icon-container" title={weapon.name}>
                                                <img src={weapon.icon} alt={weapon.name} className="solution-icon"></img>
                                            </div>);
                                        })
                                        }
                                        {enigme.solution.cases.map((c, idx) => {
                                            const location = enigme.locations.find(
                                                l => l.slug === c.location
                                            );
                                            if (!location) return null;
                                            return (<div key={idx} className="solution-icon-container" title={location.name}>
                                                <img src={location.icon} alt={location.name} className="solution-icon"></img>
                                            </div>);
                                        })
                                        }
                                        {enigme.solution.cases.map((c, idx) => {
                                            const motive = enigme.motives.find(
                                                m => m.slug === c.motive
                                            );
                                            if (!motive) return null;
                                            return (<div key={idx} className="solution-icon-container" title={motive.name}>
                                                <img src={motive.icon} alt={motive.name} className="solution-icon"></img>
                                            </div>);
                                        })
                                        }
                                    </div>
                                </div>

                            </>
                        )}
                    </div>
                </div>
                <div className="chat-section">
                    <h2 className="chat-title">Chat</h2>
                    <div className="chat-box">
                        <ul className="chat-history">
                            {chat.map((c, i) => (

                                <li key={i}>
                                    <span className="bullet">•</span>
                                    <span className="chat-message">{c}</span>
                                </li>
                            ))}
                        </ul>
                        <div className="chat-send">
                            <input
                                className="chat-input"
                                placeholder="Send a message"
                                value={message}
                                maxLength={100}
                                onChange={e => setMessage(e.target.value)}
                                onKeyDown={e => e.key === "Enter" && sendMessage()}>

                            </input>
                            <button className="chat-button" onClick={sendMessage}>Send</button>
                        </div>
                    </div>
                </div>
            </div>
            <MurdleGrid
                suspects={enigme.suspects}
                weapons={enigme.weapons}
                locations={enigme.locations}
                motives={enigme.motives}
                grid={gameState?.grid}
                savedGrid={gameState?.savedGrid}
                onGridChange={onGridChange}
                onSaveGrid={onSaveGrid}
                onRestoreGrid={onRestoreGrid}
            />
        </div>
    );
}

function Section({ title, children }) {
    return (
        <div className="section">
            <h2 className="section-title">{title}</h2>
            <div className="section-content">
                {children}
            </div>
        </div>
    );
}

function Card({ children }) {
    return <div className="murdle-card">{children}</div>;
}
