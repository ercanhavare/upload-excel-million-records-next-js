import React, { useEffect, useRef, useState } from "react";
import Layouts from "./components/Layouts";

export default function Upload(){
    const fileRef = useRef();
    const API_URL = 'http://localhost:8000/api';
    const [batchId, setBatchId] = useState();
    const [isLoading, setIsLoading] = useState(false);

    function handleForm(e){
        e.preventDefault();

        if(isLoading) return;

        const inputFile = fileRef.current;
        const file = inputFile.files[0];

        if(!file) return;

        const formData = new FormData();
        formData.append('mycsv',file);

        setIsLoading(true);
        fetch(`${API_URL}/upload`,{method:"post",body:formData})
        .then((res) => res.json())
        .then((data) => {
            setBatchId(data.id)
            setIsLoading(false);
        });
    }

    const [batchDetail, setBatchDetail] = useState({});

    function batchDetails(id=null){
      
        const currentBatchId = id ?? batchId;

        fetch(`${API_URL}/batch?id=${currentBatchId}`)
        .then((res) => res.json())
        .then((data) => {
            if(data.progress > 100){
                clearInterval(progressInterval.current)
            }
            setBatchDetail(data)
        });
    }

    const progressInterval = useRef("");
    
    function updateProgress(){

        if(progressInterval.current !== '') return;

       progressInterval.current = setInterval(() => {
            batchDetails();
        },2000)
       
    }

    useEffect(() => {
        if(batchId != null){
            updateProgress();
        }
    }, [batchId])

    useEffect(() => {
      
            fetch(`${API_URL}/batch/in-progress`)
            .then((res) => res.json())
            .then((data) => {
                setBatchId(data.id)
            });
    
    }, [])

    return(
        <Layouts>
            {batchDetail.progress != undefined &&
                <section>
                   <p>Upload is in progress ({batchDetail.progress} %)</p>
                   <div className="w-full h-4 rounded-lg shadow-innet border">
                    <div 
                    className="bg-blue-700 w-full h-4 rounded-lg" 
                    style={{ width: `${batchDetail.progress}%`}}
                    ></div>
                   </div>
                </section>
            }

            {batchDetail.progress == undefined && 
                <section>
                    <h1 className="text-xl text-gray-800 text-center mb-5">Choose a file to Upload</h1>
                        <form className="border rounded p-4" onSubmit={handleForm}>
                            <input type="file" ref={fileRef} />
                            <input type="submit" value="Upload" className={`px-4 py-2 rounded text-white ${
                                isLoading ? "bg-gray-400 outline-none" : "bg-gray-700"
                                }`}/>
                        </form>
                </section>
             }
        </Layouts>
    )
}