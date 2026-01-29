import resetLogo from "../assets/reset-logo.png";
import saveLogo from "../assets/save-logo.png";
import restoreLogo from "../assets/restore-logo.png";
const CYCLE = ["", "✖", "✔", "?"];

function makeGrid(rows, cols) {
    return Array(rows).fill(null).map(() => Array(cols).fill(0));
}


export default function MurdleGrid({ suspects, weapons, locations, motives, grid, savedGrid, onGridChange, onSaveGrid, onRestoreGrid }) {
    // Calculer les dimensions totales
    const totalCols = suspects.length + motives.length + locations.length;
    const totalRows = weapons.length + locations.length + motives.length;

    // Une seule grille pour toute la matrice
    // Return early if grid is not initialized yet
    if (!grid) {
        return <div className="murdle-grid-container"><p>Initializing grid...</p></div>;
    }

    function resetGrid() {
        onGridChange(makeGrid(totalRows, totalCols));
    }
    function saveGrid() {
        if (!grid) return;
        const copy = grid.map(row => [...row]);
        onSaveGrid(copy);
    }
    function restoreGrid() {
        if (!savedGrid) return;
        const copy = savedGrid.map(row => [...row]);
        onRestoreGrid(copy);
    }
    // Déterminer la section d'une cellule
    function getCellSection(r, c) {
        const weaponsRows = weapons.length;
        const locationsRows = locations.length;
        const suspectsCol = suspects.length;
        const motivesCol = motives.length;

        if (r < weaponsRows) {
            // Section WEAPONS
            if (c < suspectsCol) return 'weapons-suspects';
            if (c < suspectsCol + motivesCol) return 'weapons-motives';
            return 'weapons-locations';
        }

        if (r < weaponsRows + locationsRows) {
            // Section LOCATIONS
            if (c < suspectsCol) return 'locations-suspects';
            if (c < suspectsCol + motivesCol) return 'locations-motives';
            return null; // Ne devrait pas arriver
        }

        // Section MOTIVES
        if (c < suspectsCol) return 'motives-suspects';
        return null; // Ne devrait pas arriver
    }

    // Obtenir les limites d'une section
    function getSectionBounds(section) {
        const weaponsRows = weapons.length;
        const locationsRows = locations.length;
        const suspectsCol = suspects.length;
        const motivesCol = motives.length;

        switch (section) {
            case 'weapons-suspects':
                return { rowStart: 0, rowEnd: weaponsRows, colStart: 0, colEnd: suspectsCol };
            case 'weapons-motives':
                return { rowStart: 0, rowEnd: weaponsRows, colStart: suspectsCol, colEnd: suspectsCol + motivesCol };
            case 'weapons-locations':
                return { rowStart: 0, rowEnd: weaponsRows, colStart: suspectsCol + motivesCol, colEnd: totalCols };
            case 'locations-suspects':
                return { rowStart: weaponsRows, rowEnd: weaponsRows + locationsRows, colStart: 0, colEnd: suspectsCol };
            case 'locations-motives':
                return { rowStart: weaponsRows, rowEnd: weaponsRows + locationsRows, colStart: suspectsCol, colEnd: suspectsCol + motivesCol };
            case 'motives-suspects':
                return { rowStart: weaponsRows + locationsRows, rowEnd: totalRows, colStart: 0, colEnd: suspectsCol };
            default:
                return null;
        }
    }

    function toggle(r, c) {
        const copy = grid.map(row => [...row]);

        const currentValue = copy[r][c];
        const section = getCellSection(r, c);
        if (!section) return;

        const bounds = getSectionBounds(section);
        if (!bounds) return;

        // Vérifier si la cellule est verrouillée (dans la même section seulement)
        const rowHasCheck = copy[r].some((val, idx) =>
            val === 2 && idx !== c && idx >= bounds.colStart && idx < bounds.colEnd
        );
        const colHasCheck = copy.some((row, idx) =>
            row[c] === 2 && idx !== r && idx >= bounds.rowStart && idx < bounds.rowEnd
        );

        if ((rowHasCheck || colHasCheck) && currentValue === 1) {
            return;
        }

        const newValue = (currentValue + 1) % 4;

        // Si on passe de ✔ (2) à ? (3) ou à vide (0), supprimer les X
        if (currentValue === 2) {
            // Supprimer les X de la ligne dans la section
            for (let i = bounds.colStart; i < bounds.colEnd; i++) {
                if (i !== c && copy[r][i] === 1) {
                    copy[r][i] = 0;
                }
            }
            // Supprimer les X de la colonne dans la section
            for (let i = bounds.rowStart; i < bounds.rowEnd; i++) {
                if (i !== r && copy[i][c] === 1) {
                    copy[i][c] = 0;
                }
            }
        }

        copy[r][c] = newValue;

        // Auto-remplir avec des X seulement dans la section concernée quand on met ✔
        if (newValue === 2) {
            // Mettre des X sur la ligne dans la section
            for (let i = bounds.colStart; i < bounds.colEnd; i++) {
                if (i !== c && copy[r][i] === 0 && isCellVisible(r, i)) {
                    copy[r][i] = 1;
                }
            }
            // Mettre des X sur la colonne dans la section
            for (let i = bounds.rowStart; i < bounds.rowEnd; i++) {
                if (i !== r && copy[i][c] === 0 && isCellVisible(i, c)) {
                    copy[i][c] = 1;
                }
            }
        }
        onGridChange(copy);
        return copy;
    };


// Construire les arrays d'icônes
const colIcons = [
    ...suspects.map(s => s.icon),
    ...motives.map(m => m.icon),
    ...locations.map(l => l.icon)
];

const colLabels = [
    ...suspects.map(s => s.name),
    ...motives.map(m => m.name),
    ...locations.map(l => l.name)
];

const rowIcons = [
    ...weapons.map(w => w.icon),
    ...locations.map(l => l.icon),
    ...motives.map(m => m.icon)
];

const rowLabels = [
    ...weapons.map(w => w.name),
    ...locations.map(l => l.name),
    ...motives.map(m => m.name)
];

// Déterminer quelles cellules doivent être visibles (forme en L)
function isCellVisible(r, c) {
    const weaponsRows = weapons.length;
    const locationsRows = locations.length;
    const suspectsCol = suspects.length;
    const motivesCol = motives.length;

    // Section Weapons (toutes les colonnes)
    if (r < weaponsRows) {
        return true;
    }

    // Section Locations (seulement suspects + motives)
    if (r < weaponsRows + locationsRows) {
        return c < suspectsCol + motivesCol;
    }

    // Section Motives (seulement suspects)
    return c < suspectsCol;
}

return (
    <div className="murdle-grid-container">
        <div className="grid-wrapper">
            {/* En-têtes de colonnes */}
            <div className="grid-header-row">
                <div className="grid-corner"></div>

                <div className="header-section suspects-header">
                    <div className="header-label">SUSPECTS</div>
                    <div className="header-icons">
                        {suspects.map((s, idx) => (
                            <div key={idx} className="header-icon-cell" title={s.name}>
                                <img src={s.icon} alt={s.name} className="header-icon suspect-icon" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="header-section motives-header">
                    <div className="header-label">MOTIVES</div>
                    <div className="header-icons">
                        {motives.map((m, idx) => (
                            <div key={idx} className="header-icon-cell" title={m.name}>
                                <img src={m.icon} alt={m.name} className="header-icon" />
                            </div>
                        ))}
                    </div>
                </div>

                <div className="header-section locations-header">
                    <div className="header-label">LOCATIONS</div>
                    <div className="header-icons">
                        {locations.map((l, idx) => (
                            <div key={idx} className="header-icon-cell" title={l.name}>
                                <img src={l.icon} alt={l.name} className="header-icon" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grille principale */}
            <div className="grid-body">
                {/* Section WEAPONS */}
                <div className="grid-section">
                    <div className="row-header-group">
                        <div className="row-label-header">
                            <div className="row-label">WEAPONS</div>
                            <div className="row-icons">
                                {weapons.map((w, idx) => (
                                    <div key={idx} className="row-icon-cell" title={w.name}>
                                        <img src={w.icon} alt={w.name} className="row-icon" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid-cells-group">
                        {weapons.map((_, r) => (
                            <div key={r} className="grid-row">
                                {colIcons.map((icon, c) => {
                                    if (!isCellVisible(r, c)) {
                                        return <div key={c} className="grid-cell-hidden"></div>;
                                    }

                                    const value = grid[r][c];
                                    const rowHasCheck = grid[r].some((val, idx) => val === 2 && idx !== c && isCellVisible(r, idx));
                                    const colHasCheck = grid.some((row, idx) => row[c] === 2 && idx !== r && isCellVisible(idx, c));
                                    const isLocked = (rowHasCheck || colHasCheck) && value === 1;

                                    return (
                                        <div
                                            key={c}
                                            className={`grid-cell ${isLocked ? 'locked' : ''} ${value === 2 ? 'checked' : ''} ${(c% weapons.length )===3 && (c!== suspects.length * 3 - 1) ? 'border': ''}`}
                                            onClick={() => toggle(r, c)}
                                        >
                                            {CYCLE[value]}
                                        </div>
                                    );
                                })}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Section LOCATIONS */}
                <div className="grid-section">
                    <div className="row-header-group">
                        <div className="row-label-header">
                            <div className="row-label">LOCATIONS</div>
                            <div className="row-icons">
                                {locations.map((l, idx) => (
                                    <div key={idx} className="row-icon-cell" title={l.name}>
                                        <img src={l.icon} alt={l.name} className="row-icon" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid-cells-group">
                        {locations.map((_, lr) => {
                            const r = weapons.length + lr;
                            return (
                                <div key={r} className="grid-row">
                                    {colIcons.map((icon, c) => {
                                        if (!isCellVisible(r, c)) {
                                            return <div key={c} className="grid-cell-hidden"></div>;
                                        }

                                        const value = grid[r][c];
                                        const rowHasCheck = grid[r].some((val, idx) => val === 2 && idx !== c && isCellVisible(r, idx));
                                        const colHasCheck = grid.some((row, idx) => row[c] === 2 && idx !== r && isCellVisible(idx, c));
                                        const isLocked = (rowHasCheck || colHasCheck) && value === 1;

                                        return (
                                            <div
                                                key={c}
                                                className={`grid-cell ${isLocked ? 'locked' : ''} ${value === 2 ? 'checked' : ''} ${(c % locations.length)===3 ? 'border': ''}`}
                                                onClick={() => toggle(r, c)}
                                            >
                                                {CYCLE[value]}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Section MOTIVES */}
                <div className="grid-section">
                    <div className="row-header-group">
                        <div className="row-label-header">
                            <div className="row-label">MOTIVES</div>
                            <div className="row-icons">
                                {motives.map((m, idx) => (
                                    <div key={idx} className="row-icon-cell" title={m.name}>
                                        <img src={m.icon} alt={m.name} className="row-icon" />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                    <div className="grid-cells-group">
                        {motives.map((_, mr) => {
                            const r = weapons.length + locations.length + mr;
                            return (
                                <div key={r} className="grid-row">
                                    {colIcons.map((icon, c) => {
                                        if (!isCellVisible(r, c)) {
                                            return <div key={c} className="grid-cell-hidden"></div>;
                                        }

                                        const value = grid[r][c];
                                        const rowHasCheck = grid[r].some((val, idx) => val === 2 && idx !== c && isCellVisible(r, idx));
                                        const colHasCheck = grid.some((row, idx) => row[c] === 2 && idx !== r && isCellVisible(idx, c));
                                        const isLocked = (rowHasCheck || colHasCheck) && value === 1;

                                        return (
                                            <div
                                                key={c}
                                                className={`grid-cell ${isLocked ? 'locked' : ''} ${value === 2 ? 'checked' : ''} ${(c % motives.length)===3 ? 'border': ''}`}
                                                onClick={() => toggle(r, c)}
                                            >
                                                {CYCLE[value]}
                                            </div>
                                        );
                                    })}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
        <div className="grid-buttons">
            <button className="reset-btn" onClick={resetGrid}><img src={resetLogo} className="reset-btn-logo"></img></button>
            <button className="save-btn" onClick={saveGrid}><img src={saveLogo} className="save-btn-logo"></img></button>
            <button className="restore-btn" onClick={restoreGrid}><img src={restoreLogo} className="restore-btn-logo"></img></button>
        </div>
    </div>
);
}