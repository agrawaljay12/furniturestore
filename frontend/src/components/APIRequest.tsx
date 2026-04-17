import axios from "axios";

export function Json_File_Api_Post( url: string, jsonString: string, file: File | null ) {

    const formData = new FormData();
    formData.append("document", jsonString);
    if (file)
        formData.append("file", file);
    return axios.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function Json_Files_Api_Post(url: string, jsonString: string, files: FileList | null) {
    console.log("hello");
    const formData = new FormData();
    formData.append("document", jsonString);
    if (files) {
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });
    }

    console.log("hello");

    return axios.post(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}

export function Json_File_Api_Put( url: string, jsonString: string, file: File | null ) {
    const formData = new FormData();
    formData.append("document", jsonString);
    if (file)
        formData.append("file", file);
    return axios.put(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}


export function Json_Files_Api_Put( url: string, jsonString: string, files: FileList | null ) {

    const formData = new FormData();
    formData.append("document", jsonString);
    if (files) {
        Array.from(files).forEach((file) => {
            formData.append('files', file);
        });
    }

    console.log("hello");

    return axios.put(url, formData, {
        headers: {
            "Content-Type": "multipart/form-data",
        },
    });
}