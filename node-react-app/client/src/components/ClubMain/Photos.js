import React, { useState, useEffect } from "react";
import { storage } from "../Firebase/firebase";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
  listAll,
  deleteObject,
} from "firebase/storage";
import ClubBoardHeader from './ClubBoardHeader';
import { useParams } from 'react-router-dom';
import { v4 } from "uuid"
import { Fab, Grid, ImageList, ImageListItem } from '@material-ui/core'

function ImageUploadAndDisplay() {

  const { clubID } = useParams()
  const [image, setImage] = useState(null);
  const [images, setImages] = useState([]);
  const [isUploading, setIsUploading] = useState(false);

  const getImageNameFromUrl = (url) => {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split("/");
    const encodedName = pathParts[pathParts.length - 1];
    return decodeURIComponent(encodedName);
  };

  const handleChange = (e) => {
    if (e.target.files[0]) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    setIsUploading(true);
    const storageRef = ref(storage, `images/${clubID}/clubboard/${image.name + v4()}`);
    const uploadTask = uploadBytesResumable(storageRef, image);

    uploadTask.on(
      "state_changed",
      () => { },
      (error) => {
        console.log(error);
        setIsUploading(false);
      },
      async () => {
        const url = await getDownloadURL(storageRef);
        setImages((prevState) => [...prevState, url]);
        setIsUploading(false);
      }
    );
  };

  const deleteImage = async (imageUrl) => {
    const imageName = getImageNameFromUrl(imageUrl);
    const imageRef = ref(storage, `${imageName}`);
    await deleteObject(imageRef);
    setImages((prevState) => prevState.filter((url) => url !== imageUrl));
  };

  useEffect(() => {
    const fetchImages = async () => {
      const listRef = ref(storage, `images/${clubID}`);
      const list = await listAll(listRef);
      const imageUrls = await Promise.all(list.items.map((item) => getDownloadURL(item)));
      setImages(imageUrls);
    };
    fetchImages();
  }, [clubID]);

  return (
    <div>
      <ClubBoardHeader active={"5"} />
      <Grid container style={{ border: "2px solid green" }}>
        <Grid item xs={8} style={{ border: "2px solid red" }}>
          <ImageList sx={{ width: 500, height: 450, border: "2px solid blue" }} cols={3} rowHeight={164}>
            {images.map((image, index) => (
              <ImageListItem key={index} style={{ position: "relative", display: "inline-block" }}>
                <img src={image} alt="Club" style={{ width: "200px" }} />
                {/* <button
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    background: "red",
                    color: "white",
                    borderRadius: "50%",
                    border: "none",
                    cursor: "pointer",
                  }}
                  onClick={() => deleteImage(image)}
                >
                  X
                </button> */}
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
        <Grid container item xs={4} style={{ width: 500, height: 450, border: "2px solid blue", alignItems: 'flex-end', justifyContent: 'flex-end' }}>
          <input type="file" onChange={handleChange} />
          <button onClick={handleUpload} disabled={!image || isUploading}>
            {isUploading ? "Uploading..." : "Upload"}
          </button>
        </Grid>
      </Grid>
    </div>
  );
}

export default ImageUploadAndDisplay;
