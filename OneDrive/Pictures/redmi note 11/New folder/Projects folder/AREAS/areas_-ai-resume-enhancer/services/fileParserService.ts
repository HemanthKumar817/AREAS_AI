const getTextFromFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            resolve(e.target?.result as string);
        };
        reader.onerror = () => {
            reject(new Error("Failed to read the file."));
        };
        reader.readAsText(file);
    });
};

export const parseFile = async (file: File): Promise<string> => {
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.txt') || fileName.endsWith('.md')) {
        return getTextFromFile(file);
    } else {
        throw new Error("Unsupported file type. Please upload a .txt or .md file.");
    }
};
