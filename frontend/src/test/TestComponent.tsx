import React, { useState } from 'react';
import axios from 'axios';

function TestComponent() {
    const [singleFile, setSingleFile] = useState<File | null>(null);
    const [multipleFiles, setMultipleFiles] = useState<FileList | null>(null);

    // Handle single file change
    const handleSingleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setSingleFile(e.target.files[0]);
        }
    };

    // Handle multiple files change
    const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setMultipleFiles(e.target.files);
        }
    };

    // Upload single file
    const uploadSingleFile = async () => {
        if (!singleFile) {
            alert('Please select a single file to upload.');
            return;
        }
        const formData = new FormData();
        formData.append('file', singleFile);

        try {
            const response = await axios.post('http://localhost:10007/api/v1/fileupload/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            // let data = await response.json();
            console.log(response.data);
            alert(response.data.message);
            if(response.status==200){
                console.log(response.data);
                alert(response.data.message);
            }
            else {
                console.log(response.data.detail.message || 'Invalid file type'); 
                alert('Invalid file type'); 
            }
        } catch (error) {
            console.error('Error uploading single file:', error);
            alert('Error uploading single file.');
           
        }
    };

    // Upload multiple files
    const uploadMultipleFiles = async () => {
        if (!multipleFiles || multipleFiles.length === 0) {
            alert("Please select multiple files to upload.");
            return;
        }
    
        const formData = new FormData();
        Array.from(multipleFiles).forEach((file) => {
            formData.append("files", file); // Key name must match backend
        });
    
        try {
            const response = await axios.post(
                "http://localhost:10007/api/v1/fileupload/upload",
                formData,
                {
                    headers: { "Content-Type": "multipart/form-data" },
                }
            );
            if (response.status === 200) {
                console.log(response.data);
                alert(response.data.message);
            }
            else {
                console.log(response.data.detail.message || "Invalid file type");
                alert("Invalid file type");
            }
        } catch (error) {
            console.error("Error uploading multiple files:", error);
            alert("Error uploading multiple files.");
        }
    };
    
    return (
        <div>
            <div>
                <h2>Upload Single File</h2>
                <input type="file" onChange={handleSingleFileChange} /><br /><br />
                <button onClick={uploadSingleFile} className="bg-gray-200 p-3 border border-black">Upload Single File</button>
            </div>
            <div>
                <h2>Upload Multiple Files</h2>
                <input type="file" multiple onChange={handleMultipleFilesChange} /><br /><br />
                <button onClick={uploadMultipleFiles} className="bg-gray-200 p-3 border border-black">Upload Multiple Files</button>
            </div>
        </div>
    );
}

export default TestComponent;
