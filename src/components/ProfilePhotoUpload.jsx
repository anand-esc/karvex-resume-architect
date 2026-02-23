// src/components/ProfilePhotoUpload.jsx
import { useState, useRef } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import toast from "react-hot-toast";

const ProfilePhotoUpload = ({ currentPhotoUrl, onUploadComplete }) => {
  // States for the standard UI
  const [image, setImage] = useState(null); 
  const [isUploading, setIsUploading] = useState(false);
  
  // States for the Cropping Modal
  const [showCropper, setShowCropper] = useState(false);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const fileInputRef = useRef(null);

  // 1. User selects a file from their computer
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Convert the file to a temporary URL so the cropper can read it
      const imageDataUrl = URL.createObjectURL(file);
      setImage(imageDataUrl);
      setShowCropper(true); // Open the cropping modal
      
      // Reset the file input so they can select the same file again if needed
      e.target.value = ''; 
    }
  };

  // 2. Cropper updates the coordinates as the user drags/zooms
  const onCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  // 3. User clicks "Save Photo"
  const handleCropSave = async () => {
    try {
      setIsUploading(true);
      setShowCropper(false); // Hide the modal immediately
      
      const toastId = toast.loading("Processing & Uploading securely...");

      // Generate the physically cropped image file (Blob)
      const croppedImageBlob = await getCroppedImg(image, croppedAreaPixels);

      // --- YOUR CLOUDINARY UPLOAD LOGIC ---
      const formData = new FormData();
      formData.append("file", croppedImageBlob);
      formData.append("upload_preset", "karvex_preset"); 

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dxcfm9xdm/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error?.message || "Cloudinary upload failed");
      }
      
      // Pass the secure URL back to the parent component (Profile/Onboarding)
      onUploadComplete(data.secure_url);
      
      toast.success("Photo updated successfully!", { id: toastId });
    } catch (error) {
      console.error("Error uploading to Cloudinary:", error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      {/* THE MAIN AVATAR UI */}
      <div className="flex flex-col items-center gap-3">
        <div 
          onClick={() => !isUploading && fileInputRef.current.click()}
          className="relative w-28 h-28 rounded-full border-4 border-[#eff1ec] hover:border-[#556b2f] bg-gray-50 flex items-center justify-center cursor-pointer overflow-hidden transition-all group shadow-sm"
        >
          {currentPhotoUrl ? (
            <img src={currentPhotoUrl} alt="Profile" className="w-full h-full object-cover" />
          ) : (
            <span className="text-gray-400 font-medium text-xs uppercase tracking-widest">Upload</span>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <span className="text-white text-[10px] font-bold tracking-widest uppercase">
              {isUploading ? "..." : "Change"}
            </span>
          </div>
        </div>
        
        {/* Hidden File Input */}
        <input 
          type="file" 
          accept="image/*" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          className="hidden" 
        />
      </div>

      {/* THE CROPPING MODAL (Frosted Glass) */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl animate-in fade-in zoom-in duration-200">
            
            <div className="text-center mb-6">
              <h3 className="text-xl font-extrabold text-[#556b2f] tracking-tight">Frame Your Photo</h3>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-widest mt-1">Drag to reposition</p>
            </div>

            {/* Cropper Area */}
            <div className="relative w-full h-64 bg-gray-900 rounded-2xl overflow-hidden mb-6">
              <Cropper
                image={image}
                crop={crop}
                zoom={zoom}
                aspect={1} // Forces a perfect square ratio
                cropShape="round" // Draws a circle guide over the image
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            {/* Zoom Slider */}
            <div className="mb-8 px-2">
              <label className="text-[10px] font-bold uppercase text-gray-400 tracking-wider block mb-2">Zoom</label>
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-labelledby="Zoom"
                onChange={(e) => setZoom(e.target.value)}
                className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-[#556b2f]"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button 
                onClick={() => setShowCropper(false)}
                className="flex-1 py-3 bg-white border border-gray-200 hover:bg-gray-50 text-gray-600 rounded-xl font-bold transition-all text-sm"
              >
                Cancel
              </button>
              <button 
                onClick={handleCropSave}
                className="flex-1 py-3 bg-[#556b2f] hover:bg-[#3e4f22] text-white rounded-xl font-bold shadow-lg shadow-[#556b2f]/20 transition-all text-sm transform active:scale-95"
              >
                Save Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfilePhotoUpload;