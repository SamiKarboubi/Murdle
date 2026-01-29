import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getEnigmes } from "../api/enigmes";


export default function EnigmeListPage() {
    const [enigmes, setEnigmes] = useState([]);
    const [loading, setLoading] = useState(true);
    

    useEffect(() => {
        getEnigmes()
            .then(data => setEnigmes(data))
            .finally(() => setLoading(false));
    }, []);

    

    if (loading) return <p className="loading-text">Chargement...</p>;

    return (
        <div className="enigme-list-page">
            <h1 className="enigme-list-title">Choose a Case</h1>
            <ul className="enigme-list">
                {enigmes.map(e => (
                    <li key={e.id} className="enigme-item">
                        <span className="dot">•</span>
                        <Link to={`/enigme/${e.id}`}>{e.title}</Link>
                    </li>
                ))}
            </ul>
        </div>
    );
}
