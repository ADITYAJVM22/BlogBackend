import fs from 'fs';

export const deleteLocalFiles = (files) => {
    files.forEach((filePath) => {
        if (filePath && fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }
    });
};