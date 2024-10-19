import React from 'react';

function PlayerProfile({ player }) {
  return (
    <div className="player-profile">
      <h2>{player.name}</h2>
      <p>Points: {player.points}</p>
    </div>
  );
}

export default PlayerProfile;
