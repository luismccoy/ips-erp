import { useCallback, useRef, useState } from 'react';
import { Upload, File, CheckCircle, AlertCircle } from 'lucide-react';
import { useFileUpload } from '../hooks/useFileUpload';

interface FileUploadProps {
    onUploadComplete: (files: { key: string; url: string; name: string }[]) => void;
    basePath: string;
    accept?: string;
    multiple?: boolean;
    maxSizeMB?: number;
}

export function FileUpload({
    onUploadComplete,
    basePath,
    accept = '*/*',
    multiple = true,
    maxSizeMB = 10
}: FileUploadProps) {
    const { upload, progress, isUploading, error } = useFileUpload();
    const [uploadedFiles, setUploadedFiles] = useState<{ key: string; url: string; name: string }[]>([]);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFiles = useCallback(async (files: FileList | null) => {
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);
        const maxBytes = maxSizeMB * 1024 * 1024;

        const oversized = fileArray.filter(f => f.size > maxBytes);
        if (oversized.length > 0) {
            alert(`Archivos muy grandes: ${oversized.map(f => f.name).join(', ')}. Máximo ${maxSizeMB}MB.`);
            return;
        }

        const results: { key: string; url: string; name: string }[] = [];
        for (const file of fileArray) {
            try {
                const result = await upload(file, basePath);
                results.push({ key: result.key, url: result.url, name: result.name });
            } catch (e) {
                console.error(`Failed to upload ${file.name}:`, e);
            }
        }

        if (results.length > 0) {
            setUploadedFiles(prev => [...prev, ...results]);
            onUploadComplete(results);
        }
    }, [upload, basePath, maxSizeMB, onUploadComplete]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    return (
        <div className="space-y-4">
            <div
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
                onClick={() => inputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                    ${isUploading ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
                <input
                    ref={inputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={(e) => handleFiles(e.target.files)}
                    className="hidden"
                />
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <p className="text-gray-600">Arrastra archivos o haz clic para seleccionar</p>
                <p className="text-sm text-gray-400 mt-2">Máximo {maxSizeMB}MB por archivo</p>
            </div>

            {progress && (
                <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex justify-between text-sm mb-2">
                        <span>Subiendo...</span>
                        <span>{progress.percentage}%</span>
                    </div>
                    <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                        <div className="h-full bg-blue-500 transition-all" style={{ width: `${progress.percentage}%` }} />
                    </div>
                </div>
            )}

            {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 text-red-700 rounded-lg">
                    <AlertCircle size={18} />
                    <span>{error}</span>
                </div>
            )}

            {uploadedFiles.length > 0 && (
                <div className="space-y-2">
                    {uploadedFiles.map((file, i) => (
                        <div key={`${file.key}-${i}`} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                            <CheckCircle className="text-green-500" size={18} />
                            <File size={18} className="text-gray-500" />
                            <span className="flex-1 truncate">{file.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
