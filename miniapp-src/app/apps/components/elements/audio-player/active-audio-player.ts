export interface ActiveAudioPlayer {
    pause(): void;
}

let activePlayer: ActiveAudioPlayer | null = null;

export function activateAudioPlayer(player: ActiveAudioPlayer): void {
    if (activePlayer !== player) {
        activePlayer?.pause();
        activePlayer = player;
    }
}

export function clearActiveAudioPlayer(player: ActiveAudioPlayer): void {
    if (activePlayer === player) {
        activePlayer = null;
    }
}

export function pauseActiveAudioPlayer(): void {
    activePlayer?.pause();
}
