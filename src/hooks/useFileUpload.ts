import { uploadData, getUrl, remove } from 'aws-amplify/storage';
import { useState, useCallback } from 'react';

interface UploadProgress {
    loaded: number;
    total: number;
    percentage: number;
}

interface UploadedFile {
    key: string;
    url: string;
    name: string;
    size: number;
    contentType: string;
}

interface UseFileUploadReturn {
    upload: (file: File, path: string) => Promise<UploadedFile>;
    uploadMultiple: (files: File[], basePath: string) => Promise<UploadedFile[]>;
    getSignedUrl: (key: string) => Promise<string>;
    deleteFile: (key: string) => Promise<void>;
    progress: UploadProgress | null;
    isUploading: boolean;
    error: string | null;
}

export function useFileUpload(): UseFileUploadReturn {
    const [progress, setProgress] = useState<UploadProgress | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const upload = useCallback(async (file: File, path: string): Promise<UploadedFile> => {
        setIsUploading(true);
        setError(null);
        setProgress({ loaded: 0, total: file.size, percentage: 0 });

        try {
            const key = `${path}/${Date.now()}-${file.name}`;

            const result = await uploadData({
                key,
                data: file,
                options: {
                    contentType: file.type,
                    onProgress: ({ transferredBytes, totalBytes }) => {
                        const percentage = totalBytes ? Math.round((transferredBytes / totalBytes) * 100) : 0;
                        setProgress({ loaded: transferredBytes, total: totalBytes || file.size, percentage });
                    }
                }
            }).result;

            const urlResult = await getUrl({ key: result.key });

            return {
                key: result.key,
                url: urlResult.url.toString(),
                name: file.name,
                size: file.size,
                contentType: file.type
            };
        } catch (err) {
            const message = err instanceof Error ? err.message : 'Upload failed';
            setError(message);
            throw new Error(message);
        } finally {
            setIsUploading(false);
            setProgress(null);
        }
    }, []);

    const uploadMultiple = useCallback(async (files: File[], basePath: string): Promise<UploadedFile[]> => {
        const results: UploadedFile[] = [];
        for (const file of files) {
            const result = await upload(file, basePath);
            results.push(result);
        }
        return results;
    }, [upload]);

    const getSignedUrl = useCallback(async (key: string): Promise<string> => {
        const result = await getUrl({ key, options: { expiresIn: 3600 } });
        return result.url.toString();
    }, []);

    const deleteFile = useCallback(async (key: string): Promise<void> => {
        await remove({ key });
    }, []);

    return { upload, uploadMultiple, getSignedUrl, deleteFile, progress, isUploading, error };
}
