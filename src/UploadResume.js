import React, { useState } from "react";
import axios from "axios";
import './UploadResume.css';

const UploadResume = () => {
    const [files, setFiles] = useState([]);
    const [msg, setMsg] = useState(null);
    const [respon, setRespon] = useState([]);
    const [uploadProgress, setUploadProgress] = useState({});
    const [uploading, setUploading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 50;

    const handleFileChange = (e) => {
        const selectedFiles = Array.from(e.target.files).filter(file => {
            const fileType = file.type.split("/")[1];
            const fileExtension = file.name.split(".").pop();
            return ["pdf", "doc", "docx", "xls", "xlsx"].includes(fileType) || ["pdf", "doc", "docx", "xls", "xlsx"].includes(fileExtension);
        });
        setFiles(selectedFiles);
        setUploading(true);
    };

    const handleDrop = (event) => {
        event.preventDefault();
        const draggedFiles = Array.from(event.dataTransfer.files).filter(file => {
            const fileType = file.type.split("/")[1];
            const fileExtension = file.name.split(".").pop();
            return ["pdf", "doc", "docx", "xls", "xlsx"].includes(fileType) || ["pdf", "doc", "docx", "xls", "xlsx"].includes(fileExtension);
        });
        setFiles(prevFiles => [...prevFiles, ...draggedFiles]);
        setUploading(true);
    };

    const handleDragOver = (event) => {
        event.preventDefault();
    };

    const handleRemoveFile = (indexToRemove) => {
        const updatedFiles = files.filter((file, index) => index !== indexToRemove);
        setFiles(updatedFiles);
        const updatedProgress = { ...uploadProgress };
        delete updatedProgress[files[indexToRemove].name];
        setUploadProgress(updatedProgress);
    };

    const handleUpload = () => {
        if (files.length === 0) {
            setMsg("No file selected");
            setTimeout(() => {
                setMsg(null);
            }, 3000);
            return;
        }

        setUploading(false);

        files.forEach((file, index) => {
            const fd = new FormData();
            fd.append('resumes', file);

            axios.post('https://clg-api.mobileprogramming.net/resumeParsers', fd, {
                onUploadProgress: (progressEvent) => {
                    const progress = Math.round((progressEvent.loaded / progressEvent.total) * 100);
                    setUploadProgress(prevProgress => ({
                        ...prevProgress,
                        [file.name]: progress
                    }));
                }
            })
            .then((response) => {
                setMsg("Upload successful");
                setTimeout(() => {
                    setMsg(null);
                }, 3000);
                setRespon(prevRespon => [...prevRespon, ...response.data]);
                setFiles([]);
                setUploading(true);
                setCurrentPage(1);
            })
            .catch((error) => {
                setMsg("Upload failed");
                setTimeout(() => {
                    setMsg(null);
                }, 3000);
                console.error(error);
                setUploading(true);
            });
        });
    };

    const handlePageChange = (pageNumber) => {
        setCurrentPage(pageNumber);
    };

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentItems = respon.slice(indexOfFirstItem, indexOfLastItem);

    return (
        <div className="upload-resume">
            <div className="upload-area" onDrop={handleDrop} onDragOver={handleDragOver}>
                <label htmlFor="file" className="custom-file-upload">
                    Upload Resumes
                </label>
                <input accept=".pdf,.doc,.docx,.xls,.xlsx" onChange={handleFileChange} name="resumes" id="file" type="file" multiple />
                <div className="file-list">
                    {files.map((file, index) => (
                        <div key={index} className="file-item">
                            <div className="file-details">
                                <span className="file-name">{file.name}</span>
                                {uploading && <button onClick={() => handleRemoveFile(index)}>Remove</button>}
                            </div>
                            {uploadProgress[file.name] !== undefined && (
                                <div className="progress-bar-container">
                                    <div className="progress-bar" style={{ width: `${uploadProgress[file.name]}%` }}></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
            {files.length > 0 && <button onClick={handleUpload} className="upload-btn">Upload File</button>}
            {msg && <div className="msg">{msg}</div>}
            {respon.length > 0 ? (
                <>
                    <div className="table-container">
                        <div className="styled-table-wrapper">
                            <table className="styled-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Phone No</th>
                                        <th>Email</th>
                                        <th>Document Name</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentItems.map((item, index) => (
                                        <tr key={index}>
                                            <td>{item.Name}</td>
                                            <td>{item.Contact_Number}</td>
                                            <td>{item.Email_ID}</td>
                                            <td>{item.Document_Name || item.fileName}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="pagination-container">
                        <div className="pagination">
                            {[...Array(Math.ceil(respon.length / itemsPerPage)).keys()].map(number => (
                                <button
                                    key={number}
                                    onClick={() => handlePageChange(number + 1)}
                                    className={currentPage === number + 1 ? 'active' : ''}
                                >
                                    {number + 1}
                                </button>
                            ))}
                        </div>
                        <div className="pagination-info">
                            Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, respon.length)} of {respon.length} entities
                        </div>
                    </div>
                </>
            ) : <div className="no-data-msg">No data</div>}
        </div>
    );
};

export default UploadResume;
