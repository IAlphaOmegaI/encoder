export const getDuration = (file: File): Promise<number> => {
    return new Promise((resolve) => {
        const audio = new Audio();
        audio.src = URL.createObjectURL(file);

        audio.addEventListener('loadedmetadata', () => {
            URL.revokeObjectURL(audio.src);
            resolve(audio.duration);
        });
    });
};